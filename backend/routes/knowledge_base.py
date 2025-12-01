"""
Knowledge Base API Routes
Handles CRUD operations for drills, exercises, tips, and training programs
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

from database import get_db
from models.drill import Drill, DifficultyLevel, FocusArea
from models.exercise import Exercise
from models.tip import Tip
from models.training_program import TrainingProgram
from models.video import Video

router = APIRouter()


# Pydantic schemas for request/response
class DrillCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    difficulty: DifficultyLevel
    focus_area: FocusArea
    equipment: Optional[List[str]] = None
    extra_metadata: Optional[dict] = None


class DrillUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    focus_area: Optional[FocusArea] = None
    equipment: Optional[List[str]] = None
    extra_metadata: Optional[dict] = None


class VideoAttachment(BaseModel):
    video_id: str
    order: int = 0


# ==================== DRILLS ====================

@router.post("/drills", status_code=status.HTTP_201_CREATED)
async def create_drill(
    drill_data: DrillCreate,
    db: Session = Depends(get_db)
):
    """Create a new drill (admin only)"""
    drill = Drill(**drill_data.dict())
    db.add(drill)
    db.commit()
    db.refresh(drill)
    
    return {
        "id": str(drill.id),
        "title": drill.title,
        "description": drill.description,
        "difficulty": drill.difficulty.value,
        "focus_area": drill.focus_area.value,
        "equipment": drill.equipment,
        "extra_metadata": drill.extra_metadata,
        "created_at": drill.created_at.isoformat()
    }


@router.get("/drills")
async def list_drills(
    difficulty: Optional[DifficultyLevel] = None,
    focus_area: Optional[FocusArea] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List drills with optional filters"""
    query = db.query(Drill).filter(Drill.deleted_at.is_(None))
    
    if difficulty:
        query = query.filter(Drill.difficulty == difficulty)
    if focus_area:
        query = query.filter(Drill.focus_area == focus_area)
    
    total = query.count()
    drills = query.order_by(Drill.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [
            {
                "id": str(d.id),
                "title": d.title,
                "description": d.description,
                "difficulty": d.difficulty.value,
                "focus_area": d.focus_area.value,
                "equipment": d.equipment,
                "video_count": len(d.videos),
                "created_at": d.created_at.isoformat()
            }
            for d in drills
        ]
    }


from services.storage_service import storage_service

@router.get("/drills/{drill_id}")
async def get_drill(
    drill_id: str,
    db: Session = Depends(get_db)
):
    """Get drill details with videos"""
    try:
        drill = db.query(Drill).filter(
            Drill.id == uuid.UUID(drill_id),
            Drill.deleted_at.is_(None)
        ).first()
        
        if not drill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drill not found"
            )
        
        # Process videos to generate fresh signed URLs for thumbnails
        videos_data = []
        for v in drill.videos:
            if v.deleted_at is None:
                # Generate fresh signed URL for thumbnail
                # We assume the convention thumbnails/{video_id}.jpg
                thumb_path = f"thumbnails/{v.id}.jpg"
                try:
                    thumbnail_url = storage_service.get_signed_url(thumb_path)
                except Exception:
                    # Fallback if generation fails
                    thumbnail_url = None
                    
                videos_data.append({
                    "id": str(v.id),
                    "filename": v.filename,
                    "thumbnail_url": thumbnail_url
                })
        
        return {
            "id": str(drill.id),
            "title": drill.title,
            "description": drill.description,
            "difficulty": drill.difficulty.value,
            "focus_area": drill.focus_area.value,
            "equipment": drill.equipment,
            "extra_metadata": drill.extra_metadata,
            "videos": videos_data,
            "created_at": drill.created_at.isoformat(),
            "updated_at": drill.updated_at.isoformat()
        }
    except Exception as e:
        print(f"Error in get_drill: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e


@router.put("/drills/{drill_id}")
async def update_drill(
    drill_id: str,
    drill_data: DrillUpdate,
    db: Session = Depends(get_db)
):
    """Update drill (admin only)"""
    drill = db.query(Drill).filter(
        Drill.id == uuid.UUID(drill_id),
        Drill.deleted_at.is_(None)
    ).first()
    
    if not drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found"
        )
    
    # Update fields
    update_data = drill_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(drill, field, value)
    
    drill.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(drill)
    
    return {
        "id": str(drill.id),
        "title": drill.title,
        "updated_at": drill.updated_at.isoformat()
    }


@router.delete("/drills/{drill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_drill(
    drill_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete drill (admin only)"""
    drill = db.query(Drill).filter(
        Drill.id == uuid.UUID(drill_id),
        Drill.deleted_at.is_(None)
    ).first()
    
    if not drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found"
        )
    
    drill.deleted_at = datetime.utcnow()
    db.commit()
    return None


@router.post("/drills/{drill_id}/videos", status_code=status.HTTP_201_CREATED)
async def attach_video_to_drill(
    drill_id: str,
    video_data: VideoAttachment,
    db: Session = Depends(get_db)
):
    """Attach a video to a drill"""
    drill = db.query(Drill).filter(
        Drill.id == uuid.UUID(drill_id),
        Drill.deleted_at.is_(None)
    ).first()
    
    if not drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found"
        )
    
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_data.video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Add video to drill
    if video not in drill.videos:
        drill.videos.append(video)
        db.commit()
    
    return {"message": "Video attached successfully"}




# ==================== EXERCISES ====================

class ExerciseCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    difficulty: DifficultyLevel
    focus_area: FocusArea
    equipment: Optional[List[str]] = None
    extra_metadata: Optional[dict] = None


class ExerciseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    focus_area: Optional[FocusArea] = None
    equipment: Optional[List[str]] = None
    extra_metadata: Optional[dict] = None


@router.post("/exercises", status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db)
):
    """Create a new exercise (admin only)"""
    exercise = Exercise(**exercise_data.dict())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    
    return {
        "id": str(exercise.id),
        "title": exercise.title,
        "description": exercise.description,
        "difficulty": exercise.difficulty.value,
        "focus_area": exercise.focus_area.value,
        "equipment": exercise.equipment,
        "created_at": exercise.created_at.isoformat()
    }


@router.get("/exercises")
async def list_exercises(
    difficulty: Optional[DifficultyLevel] = None,
    focus_area: Optional[FocusArea] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List exercises with optional filters"""
    query = db.query(Exercise).filter(Exercise.deleted_at.is_(None))
    
    if difficulty:
        query = query.filter(Exercise.difficulty == difficulty)
    if focus_area:
        query = query.filter(Exercise.focus_area == focus_area)
    
    total = query.count()
    exercises = query.order_by(Exercise.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [
            {
                "id": str(e.id),
                "title": e.title,
                "description": e.description,
                "difficulty": e.difficulty.value,
                "focus_area": e.focus_area.value,
                "equipment": e.equipment,
                "video_count": len(e.videos),
                "created_at": e.created_at.isoformat()
            }
            for e in exercises
        ]
    }


@router.get("/exercises/{exercise_id}")
async def get_exercise(
    exercise_id: str,
    db: Session = Depends(get_db)
):
    """Get exercise details with videos"""
    exercise = db.query(Exercise).filter(
        Exercise.id == uuid.UUID(exercise_id),
        Exercise.deleted_at.is_(None)
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Process videos to generate fresh signed URLs for thumbnails
    videos_data = []
    for v in exercise.videos:
        if v.deleted_at is None:
            thumb_path = f"thumbnails/{v.id}.jpg"
            try:
                thumbnail_url = storage_service.get_signed_url(thumb_path)
            except Exception:
                thumbnail_url = None
                
            videos_data.append({
                "id": str(v.id),
                "filename": v.filename,
                "thumbnail_url": thumbnail_url
            })

    return {
        "id": str(exercise.id),
        "title": exercise.title,
        "description": exercise.description,
        "difficulty": exercise.difficulty.value,
        "focus_area": exercise.focus_area.value,
        "equipment": exercise.equipment,
        "videos": videos_data,
        "created_at": exercise.created_at.isoformat(),
        "updated_at": exercise.updated_at.isoformat()
    }


@router.put("/exercises/{exercise_id}")
async def update_exercise(
    exercise_id: str,
    exercise_data: ExerciseUpdate,
    db: Session = Depends(get_db)
):
    """Update exercise (admin only)"""
    exercise = db.query(Exercise).filter(
        Exercise.id == uuid.UUID(exercise_id),
        Exercise.deleted_at.is_(None)
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    update_data = exercise_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    exercise.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(exercise)
    
    return {
        "id": str(exercise.id),
        "title": exercise.title,
        "updated_at": exercise.updated_at.isoformat()
    }


@router.delete("/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete exercise (admin only)"""
    exercise = db.query(Exercise).filter(
        Exercise.id == uuid.UUID(exercise_id),
        Exercise.deleted_at.is_(None)
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    exercise.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ==================== TIPS ====================

class TipCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    category: Optional[str] = Field(None, max_length=100)
    focus_area: FocusArea


class TipUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    focus_area: Optional[FocusArea] = None


@router.post("/tips", status_code=status.HTTP_201_CREATED)
async def create_tip(
    tip_data: TipCreate,
    db: Session = Depends(get_db)
):
    """Create a new tip (admin only)"""
    tip = Tip(**tip_data.dict())
    db.add(tip)
    db.commit()
    db.refresh(tip)
    
    return {
        "id": str(tip.id),
        "title": tip.title,
        "content": tip.content,
        "category": tip.category,
        "focus_area": tip.focus_area.value,
        "created_at": tip.created_at.isoformat()
    }


@router.get("/tips")
async def list_tips(
    focus_area: Optional[FocusArea] = None,
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List tips with optional filters"""
    query = db.query(Tip).filter(Tip.deleted_at.is_(None))
    
    if focus_area:
        query = query.filter(Tip.focus_area == focus_area)
    if category:
        query = query.filter(Tip.category == category)
    
    total = query.count()
    tips = query.order_by(Tip.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [
            {
                "id": str(t.id),
                "title": t.title,
                "content": t.content[:200] + "..." if len(t.content) > 200 else t.content,
                "category": t.category,
                "focus_area": t.focus_area.value,
                "video_count": len(t.videos),
                "created_at": t.created_at.isoformat()
            }
            for t in tips
        ]
    }


@router.get("/tips/{tip_id}")
async def get_tip(
    tip_id: str,
    db: Session = Depends(get_db)
):
    """Get tip details with videos"""
    tip = db.query(Tip).filter(
        Tip.id == uuid.UUID(tip_id),
        Tip.deleted_at.is_(None)
    ).first()
    
    if not tip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tip not found"
        )
    
    # Process videos to generate fresh signed URLs for thumbnails
    videos_data = []
    for v in tip.videos:
        if v.deleted_at is None:
            thumb_path = f"thumbnails/{v.id}.jpg"
            try:
                thumbnail_url = storage_service.get_signed_url(thumb_path)
            except Exception:
                thumbnail_url = None
                
            videos_data.append({
                "id": str(v.id),
                "filename": v.filename,
                "thumbnail_url": thumbnail_url
            })

    return {
        "id": str(tip.id),
        "title": tip.title,
        "content": tip.content,
        "category": tip.category,
        "focus_area": tip.focus_area.value,
        "videos": videos_data,
        "created_at": tip.created_at.isoformat(),
        "updated_at": tip.updated_at.isoformat()
    }


@router.put("/tips/{tip_id}")
async def update_tip(
    tip_id: str,
    tip_data: TipUpdate,
    db: Session = Depends(get_db)
):
    """Update tip (admin only)"""
    tip = db.query(Tip).filter(
        Tip.id == uuid.UUID(tip_id),
        Tip.deleted_at.is_(None)
    ).first()
    
    if not tip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tip not found"
        )
    
    update_data = tip_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tip, field, value)
    
    tip.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tip)
    
    return {
        "id": str(tip.id),
        "title": tip.title,
        "updated_at": tip.updated_at.isoformat()
    }


@router.delete("/tips/{tip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tip(
    tip_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete tip (admin only)"""
    tip = db.query(Tip).filter(
        Tip.id == uuid.UUID(tip_id),
        Tip.deleted_at.is_(None)
    ).first()
    
    if not tip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tip not found"
        )
    
    tip.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ==================== TRAINING PROGRAMS ====================

class ProgramCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    duration_weeks: int = Field(..., gt=0)
    difficulty: DifficultyLevel
    program_data: dict


class ProgramUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    duration_weeks: Optional[int] = Field(None, gt=0)
    difficulty: Optional[DifficultyLevel] = None
    program_data: Optional[dict] = None


@router.post("/programs", status_code=status.HTTP_201_CREATED)
async def create_program(
    program_data: ProgramCreate,
    db: Session = Depends(get_db)
):
    """Create a new training program (admin only)"""
    program = TrainingProgram(**program_data.dict())
    db.add(program)
    db.commit()
    db.refresh(program)
    
    return {
        "id": str(program.id),
        "title": program.title,
        "description": program.description,
        "duration_weeks": program.duration_weeks,
        "difficulty": program.difficulty.value,
        "created_at": program.created_at.isoformat()
    }


@router.get("/programs")
async def list_programs(
    difficulty: Optional[DifficultyLevel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List training programs with optional filters"""
    query = db.query(TrainingProgram).filter(TrainingProgram.deleted_at.is_(None))
    
    if difficulty:
        query = query.filter(TrainingProgram.difficulty == difficulty)
    
    total = query.count()
    programs = query.order_by(TrainingProgram.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [
            {
                "id": str(p.id),
                "title": p.title,
                "description": p.description,
                "duration_weeks": p.duration_weeks,
                "difficulty": p.difficulty.value,
                "video_count": len(p.videos),
                "created_at": p.created_at.isoformat()
            }
            for p in programs
        ]
    }


@router.get("/programs/{program_id}")
async def get_program(
    program_id: str,
    db: Session = Depends(get_db)
):
    """Get training program details with videos"""
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == uuid.UUID(program_id),
        TrainingProgram.deleted_at.is_(None)
    ).first()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )
    
    # Process videos to generate fresh signed URLs for thumbnails
    videos_data = []
    for v in program.videos:
        if v.deleted_at is None:
            thumb_path = f"thumbnails/{v.id}.jpg"
            try:
                thumbnail_url = storage_service.get_signed_url(thumb_path)
            except Exception:
                thumbnail_url = None
                
            videos_data.append({
                "id": str(v.id),
                "filename": v.filename,
                "thumbnail_url": thumbnail_url
            })

    return {
        "id": str(program.id),
        "title": program.title,
        "description": program.description,
        "duration_weeks": program.duration_weeks,
        "difficulty": program.difficulty.value,
        "program_data": program.program_data,
        "videos": videos_data,
        "created_at": program.created_at.isoformat(),
        "updated_at": program.updated_at.isoformat()
    }


@router.put("/programs/{program_id}")
async def update_program(
    program_id: str,
    program_data: ProgramUpdate,
    db: Session = Depends(get_db)
):
    """Update training program (admin only)"""
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == uuid.UUID(program_id),
        TrainingProgram.deleted_at.is_(None)
    ).first()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )
    
    update_data = program_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(program, field, value)
    
    program.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(program)
    
    return {
        "id": str(program.id),
        "title": program.title,
        "updated_at": program.updated_at.isoformat()
    }


@router.delete("/programs/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(
    program_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete training program (admin only)"""
    program = db.query(TrainingProgram).filter(
        TrainingProgram.id == uuid.UUID(program_id),
        TrainingProgram.deleted_at.is_(None)
    ).first()
    
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )
    
    program.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ==================== REFERENCES ====================

@router.get("/references")
async def list_references(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List reference videos"""
    query = db.query(Video).filter(
        Video.is_reference == True,
        Video.deleted_at.is_(None)
    )
    
    total = query.count()
    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    
    # Process videos to generate fresh signed URLs
    items = []
    for v in videos:
        thumb_path = f"thumbnails/{v.id}.jpg"
        try:
            thumbnail_url = storage_service.get_signed_url(thumb_path)
        except Exception:
            thumbnail_url = None
            
        items.append({
            "id": str(v.id),
            "title": v.filename, # Fallback to filename if no metadata
            "description": "Vidéo de référence",
            "type": "reference",
            "thumbnail_url": thumbnail_url,
            "created_at": v.created_at.isoformat(),
            "extra_metadata": v.extra_metadata
        })
        
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }


# ==================== SEARCH ====================

@router.get("/search")
async def search_knowledge_base(
    q: Optional[str] = Query(None, min_length=1),
    type: Optional[str] = Query(None, regex="^(drill|exercise|tip|program|reference)$"),
    focus_area: Optional[FocusArea] = None,
    difficulty: Optional[DifficultyLevel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search across all knowledge base content
    Uses PostgreSQL full-text search with pg_trgm for fuzzy matching
    """
    results = []
    
    # Search drills
    if not type or type == "drill":
        query = db.query(Drill).filter(Drill.deleted_at.is_(None))
        
        if q:
            query = query.filter(
                or_(
                    Drill.title.ilike(f"%{q}%"),
                    Drill.description.ilike(f"%{q}%")
                )
            )
        if focus_area:
            query = query.filter(Drill.focus_area == focus_area)
        if difficulty:
            query = query.filter(Drill.difficulty == difficulty)
        
        drills = query.limit(limit).all()
        results.extend([
            {
                "type": "drill",
                "id": str(d.id),
                "title": d.title,
                "description": d.description[:200] + "..." if len(d.description) > 200 else d.description,
                "difficulty": d.difficulty.value,
                "focus_area": d.focus_area.value
            }
            for d in drills
        ])
    
    # Search exercises
    if not type or type == "exercise":
        query = db.query(Exercise).filter(Exercise.deleted_at.is_(None))
        
        if q:
            query = query.filter(
                or_(
                    Exercise.title.ilike(f"%{q}%"),
                    Exercise.description.ilike(f"%{q}%")
                )
            )
        if focus_area:
            query = query.filter(Exercise.focus_area == focus_area)
        if difficulty:
            query = query.filter(Exercise.difficulty == difficulty)
        
        exercises = query.limit(limit).all()
        results.extend([
            {
                "type": "exercise",
                "id": str(e.id),
                "title": e.title,
                "description": e.description[:200] + "..." if len(e.description) > 200 else e.description,
                "difficulty": e.difficulty.value,
                "focus_area": e.focus_area.value
            }
            for e in exercises
        ])
    
    # Search tips
    if not type or type == "tip":
        query = db.query(Tip).filter(Tip.deleted_at.is_(None))
        
        if q:
            query = query.filter(
                or_(
                    Tip.title.ilike(f"%{q}%"),
                    Tip.content.ilike(f"%{q}%")
                )
            )
        if focus_area:
            query = query.filter(Tip.focus_area == focus_area)
        
        tips = query.limit(limit).all()
        results.extend([
            {
                "type": "tip",
                "id": str(t.id),
                "title": t.title,
                "content": t.content[:200] + "..." if len(t.content) > 200 else t.content,
                "focus_area": t.focus_area.value
            }
            for t in tips
        ])
    
    # Search training programs
    if not type or type == "program":
        query = db.query(TrainingProgram).filter(TrainingProgram.deleted_at.is_(None))
        
        if q:
            query = query.filter(
                or_(
                    TrainingProgram.title.ilike(f"%{q}%"),
                    TrainingProgram.description.ilike(f"%{q}%")
                )
            )
        if difficulty:
            query = query.filter(TrainingProgram.difficulty == difficulty)
        
        programs = query.limit(limit).all()
        results.extend([
            {
                "type": "program",
                "id": str(p.id),
                "title": p.title,
                "description": p.description[:200] + "..." if len(p.description) > 200 else p.description,
                "difficulty": p.difficulty.value,
                "duration_weeks": p.duration_weeks
            }
            for p in programs
        ])

    # Search reference videos
    if not type or type == "reference":
        # Only search references if no specific difficulty/focus_area filters are applied
        # as videos don't have these fields directly mapped yet
        if not difficulty and not focus_area:
            query = db.query(Video).filter(
                Video.is_reference == True,
                Video.deleted_at.is_(None)
            )
            
            if q:
                # Search in filename or extra_metadata
                # Note: JSONB search is more complex, for now simple filename match
                query = query.filter(Video.filename.ilike(f"%{q}%"))
            
            videos = query.limit(limit).all()
            
            # Generate signed URLs for thumbnails
            for v in videos:
                thumb_path = f"thumbnails/{v.id}.jpg"
                try:
                    thumbnail_url = storage_service.get_signed_url(thumb_path)
                except Exception:
                    thumbnail_url = None
                    
                results.append({
                    "type": "reference",
                    "id": str(v.id),
                    "title": v.filename,
                    "description": "Vidéo de référence",
                    "thumbnail_url": thumbnail_url,
                    "extra_metadata": v.extra_metadata
                })
    
    return {
        "total": len(results),
        "query": q,
        "filters": {
            "type": type,
            "focus_area": focus_area.value if focus_area else None,
            "difficulty": difficulty.value if difficulty else None
        },
        "results": results[:limit]
    }

