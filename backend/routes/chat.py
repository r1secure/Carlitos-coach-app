"""
Chat API Routes
Handles chat interactions with the Virtual Coach
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

from database import get_db
from models.user import User
from models.chat import ChatSession, ChatMessage
from core.deps import get_current_active_user
from services.llm_service import llm_service


router = APIRouter()

class ChatMessageCreate(BaseModel):
    session_id: Optional[str] = None
    message: str

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

class ChatSessionResponse(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime
    messages: List[ChatMessageResponse] = []

@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    chat_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a message to the Virtual Coach
    """
    # Get or create session
    if chat_data.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == uuid.UUID(chat_data.session_id),
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        session = ChatSession(user_id=current_user.id, title="New Chat")
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=chat_data.message
    )
    db.add(user_msg)
    db.commit()

    # Generate AI response
    # We need to fetch history for context
    history_msgs = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at).all()

    # Convert to format expected by LLMService
    history = [{"role": msg.role, "content": msg.content} for msg in history_msgs]

    ai_content = await llm_service.generate_chat_response(chat_data.message, history)

    # Save AI message
    ai_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_content
    )
    db.add(ai_msg)
    
    # Update session title if it's the first exchange
    if len(history) <= 2:
        # Simple title generation: first few words of user message
        session.title = chat_data.message[:30] + "..."
        
    db.commit()
    db.refresh(ai_msg)

    return {
        "id": str(ai_msg.id),
        "role": ai_msg.role,
        "content": ai_msg.content,
        "created_at": ai_msg.created_at
    }

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user chat sessions"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()
    
    return [
        {
            "id": str(s.id),
            "title": s.title,
            "created_at": s.created_at,
            "messages": [] # Don't load messages for list view
        }
        for s in sessions
    ]

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific chat session with messages"""
    session = db.query(ChatSession).filter(
        ChatSession.id == uuid.UUID(session_id),
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at).all()
    
    return {
        "id": str(session.id),
        "title": session.title,
        "created_at": session.created_at,
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at
            }
            for m in messages
        ]
    }
