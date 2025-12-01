"""
Carlitos v3 - Tennis Coaching Platform
FastAPI Backend Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Carlitos v3 Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # TODO: Initialize MinIO bucket
    # TODO: Initialize database connection
    
    yield
    
    # Shutdown
    logger.info("Shutting down Carlitos v3 Backend...")


# Create FastAPI application
app = FastAPI(
    title="Carlitos v3 API",
    description="Tennis Coaching Platform with AI-powered analysis",
    version="3.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Carlitos v3 API",
        "version": "3.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


# Include routers
from routes import videos, knowledge_base, auth, users, chat

app.include_router(videos.router, prefix="/api/v1/videos", tags=["videos"])
app.include_router(knowledge_base.router, prefix="/api/v1/knowledge-base", tags=["knowledge-base"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
