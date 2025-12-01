from celery_app import celery_app
from database import SessionLocal
from models.video import Video
from models.analysis import Analysis, AnalysisStatus
from services.analysis_service import analysis_service
import logging
import traceback

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def analyze_video_task(self, video_id: str):
    """
    Analyze video to extract pose landmarks
    """
    logger.info(f"Starting analysis for video {video_id}")
    db = SessionLocal()
    try:
        # Get video
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            logger.error(f"Video {video_id} not found")
            return {"status": "failed", "error": "Video not found"}

        # Get or create analysis record
        analysis = db.query(Analysis).filter(Analysis.video_id == video_id).first()
        if not analysis:
            analysis = Analysis(video_id=video_id)
            db.add(analysis)
            db.commit()
            db.refresh(analysis)

        # Update status to PROCESSING
        analysis.status = AnalysisStatus.PROCESSING
        db.commit()

        # Process video
        try:
            frames_data = analysis_service.process_video(video.storage_path)
            
            # Update analysis with results
            analysis.data = frames_data
            analysis.status = AnalysisStatus.COMPLETED
            db.commit()
            logger.info(f"Analysis completed for video {video_id}")
            return {"status": "completed", "video_id": video_id}
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = str(e)
            db.commit()
            # Retry if appropriate
            raise self.retry(exc=e, countdown=60)

    except Exception as e:
        logger.error(f"Task error: {e}")
        traceback.print_exc()
        raise
    finally:
        db.close()
