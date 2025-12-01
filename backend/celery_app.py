"""
Celery Application Configuration
For asynchronous video processing tasks
"""
from celery import Celery
from config import settings

# Create Celery app
celery_app = Celery(
    'carlitos',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Explicitly include task modules
celery_app.conf.imports = ['tasks.video_analysis']

@celery_app.task
def test_task():
    """Test task to verify Celery is working"""
    return "Celery is working!"
