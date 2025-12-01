# Database Check
docker-compose exec backend python scripts/check_database.py

# Celery Check
docker-compose exec backend python scripts/check_celery_tasks.py

# MinIO Check
docker-compose exec backend python scripts/check_minio.py