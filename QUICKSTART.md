# Carlitos v3 - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Start All Services

```bash
# Clone and navigate to project
cd Carlitos-coach-app

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

**Services will be available at:**
- Frontend: http://localhost:2000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

---

## 🧪 Testing the Backend API

### 1. Check API Health

```bash
curl http://localhost:8000/health
```

### 2. Upload a Video

```bash
curl -X POST http://localhost:8000/api/v1/videos/upload \
  -F "file=@your-video.mp4"
```

Response:
```json
{
  "id": "uuid",
  "filename": "your-video.mp4",
  "size_bytes": 12345678,
  "format": "mp4",
  "thumbnail_url": "http://...",
  "created_at": "2025-11-27T14:00:00"
}
```

### 3. Create a Drill

```bash
curl -X POST http://localhost:8000/api/v1/knowledge-base/drills \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Forehand Cross-Court",
    "description": "Practice hitting forehands cross-court with topspin",
    "difficulty": "intermediate",
    "focus_area": "technique",
    "equipment": ["racket", "balls", "court"]
  }'
```

### 4. List Drills

```bash
curl "http://localhost:8000/api/v1/knowledge-base/drills?difficulty=intermediate"
```

### 5. Search

```bash
curl "http://localhost:8000/api/v1/knowledge-base/search?q=forehand"
```

---

## 🛠️ Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 📚 API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Main Endpoints

**Videos:**
- `POST /api/v1/videos/upload` - Upload video
- `GET /api/v1/videos/{id}` - Get video with signed URL
- `DELETE /api/v1/videos/{id}` - Delete video

**Knowledge Base:**
- `POST /api/v1/knowledge-base/drills` - Create drill
- `GET /api/v1/knowledge-base/drills` - List drills
- `GET /api/v1/knowledge-base/drills/{id}` - Get drill details
- `PUT /api/v1/knowledge-base/drills/{id}` - Update drill
- `POST /api/v1/knowledge-base/drills/{id}/videos` - Attach video

**Search:**
- `GET /api/v1/knowledge-base/search` - Search all content

---

## 🗄️ Database

### Run Migrations

```bash
cd backend
alembic upgrade head
```

### Create New Migration

```bash
alembic revision --autogenerate -m "description"
```

### Access PostgreSQL

```bash
docker exec -it carlitos-postgres psql -U carlitos -d carlitos_db
```

---

## 📦 MinIO Storage

Access MinIO Console at http://localhost:9001

**Credentials:** minioadmin / minioadmin

**Bucket:** carlitos-videos

---

## 🐛 Troubleshooting

### Services won't start

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### MinIO connection errors

```bash
# Check MinIO is running
docker-compose ps minio

# View logs
docker-compose logs minio
```

---

## 📖 Documentation

- [Backend README](backend/README.md) - Backend API details
- [OpenSpec Proposal](openspec/changes/add-knowledge-base-video-upload/proposal.md) - Feature specification
- [Project Context](openspec/project.md) - Tech stack and conventions

---

## ✅ What's Implemented

- ✅ Complete backend API (FastAPI)
- ✅ Database models and migrations
- ✅ Video upload with validation
- ✅ MinIO storage integration
- ✅ Thumbnail generation (FFmpeg)
- ✅ Knowledge base CRUD (drills)
- ✅ Search functionality
- ✅ Docker Compose setup

## 🚧 What's Next

- Frontend admin dashboard
- Frontend knowledge base browser
- Authentication (TinyAuth)
- Tests (pytest, E2E)
- Additional content types (exercises, tips, programs)
