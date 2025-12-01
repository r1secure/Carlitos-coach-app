"""
Video API Routes
Handles video upload, retrieval, and deletion
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy import func
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional
import tempfile
import os
import uuid
from datetime import datetime

from database import get_db
from models.video import Video
from services.storage_service import storage_service
from config import settings
from models.user import User, UserRole
from pydantic import BaseModel
from core.deps import get_current_active_user
from models.analysis import Analysis, AnalysisStatus
from tasks.video_analysis import analyze_video_task

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a video file
    
    Validates format, size, and resolution before uploading to MinIO
    Generates thumbnail automatically
    """
    # Validate file format
    is_valid, mime_type = storage_service.validate_video_format(file.file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video format. Allowed: MP4, MOV, AVI. Got: {mime_type}"
        )
    
    # Check file size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Video exceeds maximum size of {settings.MAX_VIDEO_SIZE_MB}MB"
        )

    # Check user quota
    current_usage = db.query(Video).filter(
        Video.uploaded_by == current_user.id,
        Video.deleted_at.is_(None)
    ).with_entities(
        func.sum(Video.size_bytes)
    ).scalar() or 0
    
    if current_usage + file_size > settings.USER_STORAGE_QUOTA_BYTES:
        raise HTTPException(
            status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
            detail="Storage quota exceeded"
        )
    
    # Save to temporary file for validation
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
        tmp_path = tmp_file.name
        content = await file.read()
        tmp_file.write(content)
    
    try:
        # Validate resolution
        resolution = storage_service.get_video_resolution(tmp_path)
        if not resolution:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract video resolution"
            )
        
        width, height = resolution
        min_width, min_height = settings.MIN_VIDEO_RESOLUTION
        
        # Accept both landscape (1280x720) and portrait (720x1280) orientations
        # Check if video meets minimum 720p requirement in either orientation
        is_landscape_valid = width >= min_width and height >= min_height
        is_portrait_valid = width >= min_height and height >= min_width
        
        if not (is_landscape_valid or is_portrait_valid):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Video resolution must be at least {min_width}x{min_height} (landscape) or {min_height}x{min_width} (portrait). Got: {width}x{height}"
            )
        
        # Upload to MinIO
        file.file.seek(0)
        storage_path, file_size = storage_service.upload_video(
            file.file,
            file.filename,
            mime_type
        )
        
        # Generate thumbnail
        video_id = str(uuid.uuid4())
        thumbnail_path = f"/tmp/thumbnail_{video_id}.jpg"
        
        generated_thumb = storage_service.generate_thumbnail(tmp_path, thumbnail_path)
        thumbnail_url = None
        
        if generated_thumb:
            thumbnail_storage_path = storage_service.upload_thumbnail(thumbnail_path, video_id)
            thumbnail_url = storage_service.get_signed_url(thumbnail_storage_path)
            os.remove(thumbnail_path)
        
        # Save to database
        video = Video(
            id=uuid.UUID(video_id),
            filename=file.filename,
            storage_path=storage_path,
            thumbnail_url=thumbnail_url,
            size_bytes=file_size,
            format=os.path.splitext(file.filename)[1][1:],  # Remove leading dot
            extra_metadata={
                "resolution": {"width": width, "height": height},
                "mime_type": mime_type
            },
            uploaded_by=current_user.id
        )
        
        db.add(video)
        db.commit()
        db.refresh(video)
        
        # Create Analysis record
        analysis = Analysis(
            video_id=video.id,
            status=AnalysisStatus.PENDING
        )
        db.add(analysis)
        db.commit()
        
        # Trigger analysis task
        try:
            analyze_video_task.delay(str(video.id))
        except Exception as e:
            # Log error but don't fail upload
            print(f"Failed to trigger analysis task: {e}")

        return {
            "id": str(video.id),
            "filename": video.filename,
            "size_bytes": video.size_bytes,
            "format": video.format,
            "thumbnail_url": video.thumbnail_url,
            "created_at": video.created_at.isoformat(),
            "analysis_status": analysis.status
        }
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.get("/my-videos")
async def get_my_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List videos uploaded by current user"""
    videos = db.query(Video).filter(
        Video.uploaded_by == current_user.id,
        Video.deleted_at.is_(None)
    ).order_by(Video.created_at.desc()).all()
    
    # Process videos to generate fresh signed URLs for thumbnails
    videos_data = []
    for v in videos:
        thumb_path = f"thumbnails/{v.id}.jpg"
        try:
            thumbnail_url = storage_service.get_signed_url(thumb_path)
        except Exception:
            thumbnail_url = None
            
        videos_data.append({
            "id": str(v.id),
            "filename": v.filename,
            "thumbnail_url": thumbnail_url,
            "duration": v.duration,
            "size_bytes": v.size_bytes,
            "format": v.format,
            "created_at": v.created_at.isoformat()
        })
    
    return videos_data


@router.get("/{video_id}")
async def get_video(
    video_id: str,
    db: Session = Depends(get_db)
):
    """Get video metadata and signed URL"""
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Generate signed URL for video
    signed_url = storage_service.get_signed_url(video.storage_path)
    
    # Generate signed URL for thumbnail
    thumb_path = f"thumbnails/{video.id}.jpg"
    try:
        thumbnail_url = storage_service.get_signed_url(thumb_path)
    except Exception:
        thumbnail_url = None
    
    return {
        "id": str(video.id),
        "filename": video.filename,
        "url": signed_url,
        "thumbnail_url": thumbnail_url,
        "duration": video.duration,
        "size_bytes": video.size_bytes,
        "format": video.format,
        "extra_metadata": video.extra_metadata,
        "created_at": video.created_at.isoformat()
    }


@router.get("/{video_id}/thumbnail")
async def get_video_thumbnail(
    video_id: str,
    db: Session = Depends(get_db)
):
    """Get video thumbnail URL"""
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Generate signed URL for thumbnail
    thumb_path = f"thumbnails/{video.id}.jpg"
    try:
        thumbnail_url = storage_service.get_signed_url(thumb_path)
    except Exception:
        thumbnail_url = None
        
    return {
        "thumbnail_url": thumbnail_url
    }


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete video (admin only)"""
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Soft delete
    video.deleted_at = datetime.utcnow()
    db.commit()
    
    # Note: Physical file remains in MinIO for potential recovery
    return None


@router.get("/quota/usage")
async def get_storage_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current storage usage for user"""
    total_size = db.query(Video).filter(
        Video.uploaded_by == current_user.id,
        Video.deleted_at.is_(None)
    ).with_entities(
        func.sum(Video.size_bytes)
    ).scalar() or 0
    
    quota_bytes = settings.USER_STORAGE_QUOTA_BYTES
    usage_percent = (total_size / quota_bytes) * 100 if quota_bytes > 0 else 0
    
    return {
        "used_bytes": total_size,
        "quota_bytes": quota_bytes,
        "usage_percent": round(usage_percent, 2),
        "remaining_bytes": max(0, quota_bytes - total_size)
    }


@router.get("/{video_id}/analysis")
async def get_video_analysis(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get video analysis results"""
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    analysis = db.query(Analysis).filter(Analysis.video_id == video.id).first()
    if not analysis:
        # Return empty/pending status instead of 404 if video exists?
        # Or just 404. 404 is fine.
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return {
        "id": str(analysis.id),
        "video_id": str(analysis.video_id),
        "status": analysis.status,
        "data": analysis.data,
        "ai_feedback": analysis.ai_feedback,
        "error_message": analysis.error_message,
        "created_at": analysis.created_at,
        "updated_at": analysis.updated_at
    }


@router.post("/{video_id}/analyze")
async def trigger_video_analysis(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Manually trigger video analysis"""
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    analysis = db.query(Analysis).filter(Analysis.video_id == video.id).first()
    if not analysis:
        analysis = Analysis(video_id=video.id)
        db.add(analysis)
    
    analysis.status = AnalysisStatus.PENDING
    analysis.error_message = None
    db.commit()
    
    analyze_video_task.delay(str(video.id))
    
    return {"status": "analysis_triggered"}


@router.get("/references/list")
async def get_reference_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List reference (pro) videos"""
    videos = db.query(Video).filter(
        Video.is_reference == True,
        Video.deleted_at.is_(None)
    ).order_by(Video.created_at.desc()).all()
    
    # Process videos to generate fresh signed URLs for thumbnails
    videos_data = []
    for v in videos:
        thumb_path = f"thumbnails/{v.id}.jpg"
        try:
            thumbnail_url = storage_service.get_signed_url(thumb_path)
        except Exception:
            thumbnail_url = None

        try:
            video_url = storage_service.get_signed_url(v.storage_path)
        except Exception:
            video_url = None
            
        videos_data.append({
            "id": str(v.id),
            "filename": v.filename,
            "thumbnail_url": thumbnail_url,
            "url": video_url,
            "duration": v.duration,
            "size_bytes": v.size_bytes,
            "format": v.format,
            "created_at": v.created_at.isoformat()
        })
    
    return videos_data


class ReferenceUpdate(BaseModel):
    is_reference: bool
    extra_metadata: Optional[dict] = None


@router.put("/{video_id}/reference")
async def update_video_reference(
    video_id: str,
    update_data: ReferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update video reference status and metadata (Admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
        
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
        
    video.is_reference = update_data.is_reference
    if update_data.extra_metadata is not None:
        # Merge or replace metadata? Let's replace for now or merge if needed.
        # Usually for admin updates, we might want full control.
        # But let's assume we pass the full metadata object we want.
        # If existing metadata exists, we should probably merge or overwrite.
        # Let's overwrite for simplicity as the UI will send the full state.
        video.extra_metadata = update_data.extra_metadata
        
    db.commit()
    db.refresh(video)
    
    return {
        "id": str(video.id),
        "is_reference": video.is_reference,
        "extra_metadata": video.extra_metadata
    }


@router.get("/admin/all")
async def list_all_videos(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all videos (Admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
        
    query = db.query(Video).filter(Video.deleted_at.is_(None))
    total = query.count()
    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    
    videos_data = []
    for v in videos:
        thumb_path = f"thumbnails/{v.id}.jpg"
        try:
            thumbnail_url = storage_service.get_signed_url(thumb_path)
        except Exception:
            thumbnail_url = None
            
        videos_data.append({
            "id": str(v.id),
            "filename": v.filename,
            "thumbnail_url": thumbnail_url,
            "is_reference": v.is_reference,
            "extra_metadata": v.extra_metadata,
            "created_at": v.created_at.isoformat()
        })
        
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": videos_data
    }


@router.post("/{video_id}/feedback")
async def generate_video_feedback(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate AI feedback for a video analysis
    """
    from services.llm_service import llm_service
    
    video = db.query(Video).filter(
        Video.id == uuid.UUID(video_id),
        Video.deleted_at.is_(None)
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    if video.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    analysis = db.query(Analysis).filter(Analysis.video_id == video.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if analysis.status != AnalysisStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Analysis not completed yet")
        
    # If feedback already exists, return it (cache)
    # Unless we want to force regeneration? Let's assume force=False for now.
    # We can add a query param later.
    if analysis.ai_feedback:
        return analysis.ai_feedback
        
    # Prepare data for LLM
    # We need to extract relevant metrics from analysis.data
    # analysis.data is a list of frames. We should probably aggregate or pick key frames.
    # For MVP, let's pass a summary if possible, or just the raw data if it's small enough.
    # But raw data is huge (30fps * 33 landmarks).
    # We need to calculate summary metrics first if they aren't already there.
    # The `analysis_service.py` calculates metrics. Let's check what's in `analysis.data`.
    # It has `metrics` per frame.
    
    # Let's extract a summary of metrics (e.g., average angles, or key phases).
    # For now, let's just pass the stroke type (from metadata?) and maybe some sample metrics.
    # We don't have stroke type in metadata yet?
    # Let's assume we pass the first valid frame's metrics for now as a placeholder.
    
    analysis_data = {
        "stroke_type": video.extra_metadata.get("stroke_type", "Unknown") if video.extra_metadata else "Unknown",
        "metrics": _extract_summary_metrics(analysis.data)
    }
    
    # Fetch available drills
    from models.drill import Drill
    drills = db.query(Drill).filter(Drill.deleted_at.is_(None)).all()
    available_drills = [
        {"id": str(d.id), "title": d.title, "focus_area": d.focus_area} 
        for d in drills
    ]
    
    feedback = await llm_service.generate_feedback(analysis_data, available_drills)
    
    # Save feedback
    analysis.ai_feedback = feedback
    db.commit()
    
    return feedback

def _extract_summary_metrics(data: list) -> dict:
    """Helper to extract summary metrics from frame data"""
    if not data:
        return {}
        
    # Simple aggregation: Average of non-null metrics
    # This is a placeholder. Real implementation needs phase detection.
    summary = {}
    count = 0
    
    for frame in data:
        if frame.get("metrics"):
            for key, value in frame["metrics"].items():
                if value is not None:
                    summary[key] = summary.get(key, 0) + value
            count += 1
            
    if count > 0:
        for key in summary:
            summary[key] /= count
            
    return summary
