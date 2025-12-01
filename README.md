# Carlitos v3 - Tennis Coaching Platform

## Project Structure

```
carlitos-coach-app/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── openspec/         # OpenSpec specifications
├── docker-compose.yml
└── README.md
```

## Environment Variables

### Backend (.env)
Create `backend/.env` from `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```

### Frontend (.env.local)
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Quick Start

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:2
- Frontend: http://localhost:2000
- Backend API: http://localhost:8000
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
- PostgreSQL: localhost:5432

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, Alembic
- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Storage**: MinIO (S3-compatible)
- **Cache/Queue**: Redis, Celery
- **LLM**: Ollama (local)
- **Video Processing**: FFmpeg, MediaPipe

## Documentation

See `openspec/project.md` for full project context and conventions.
