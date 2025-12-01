# Backend API

FastAPI backend for Carlitos v3 Tennis Coaching Platform.

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database Migration

```bash
# Run migrations
alembic upgrade head

# Create new migration (after model changes)
alembic revision --autogenerate -m "description"
```

## Running

### Development

```bash
uvicorn main:app --reload
```

API will be available at: http://localhost:8000

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### With Docker

```bash
cd ..
docker-compose up backend
```

## API Endpoints

### Videos
- `POST /api/v1/videos/upload` - Upload video
- `GET /api/v1/videos/{id}` - Get video with signed URL
- `GET /api/v1/videos/{id}/thumbnail` - Get thumbnail
- `DELETE /api/v1/videos/{id}` - Soft delete
- `GET /api/v1/videos/quota/usage` - Storage usage

### Knowledge Base - Drills
- `POST /api/v1/knowledge-base/drills` - Create drill
- `GET /api/v1/knowledge-base/drills` - List drills
- `GET /api/v1/knowledge-base/drills/{id}` - Get drill
- `PUT /api/v1/knowledge-base/drills/{id}` - Update drill
- `DELETE /api/v1/knowledge-base/drills/{id}` - Delete drill
- `POST /api/v1/knowledge-base/drills/{id}/videos` - Attach video

### Search
- `GET /api/v1/knowledge-base/search` - Search all content

## Project Structure

```
backend/
├── main.py              # FastAPI app
├── config.py            # Settings
├── database.py          # SQLAlchemy setup
├── models/              # Database models
│   ├── drill.py
│   ├── exercise.py
│   ├── tip.py
│   ├── training_program.py
│   └── video.py
├── routes/              # API routes
│   ├── videos.py
│   └── knowledge_base.py
├── services/            # Business logic
│   └── storage_service.py
├── alembic/             # Database migrations
│   └── versions/
└── tests/               # Tests
```

## Testing

```bash
pytest
```

## Dependencies

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **MinIO** - Object storage
- **FFmpeg** - Video processing (system dependency)
- **PostgreSQL** - Database
