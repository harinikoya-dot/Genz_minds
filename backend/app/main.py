from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
import app.models  # load all models
from app.services.doctor_service import doctor_service

# Import Routers
from app.api.routes import (
    auth,
    documents,
    prescriptions,
    reports,
    rag,
    medicines,
    adherence,
    doctors,
    voice,
    notifications,
    dashboard,
)

# Ensure tables created
Base.metadata.create_all(bind=engine)

# Seed demo doctors on startup
with SessionLocal() as db:
    doctor_service.ensure_demo_doctors(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MEDINOVA-AI: Clinical Personal Health Copilot, OCR, Document Analyzer, and RAG Vector Retrieval System.",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1 and /api for compatibility
api_prefixes = [settings.API_V1_STR, "/api"]
for prefix in api_prefixes:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(documents.router, prefix=prefix)
    app.include_router(prescriptions.router, prefix=prefix)
    app.include_router(reports.router, prefix=prefix)
    app.include_router(rag.router, prefix=prefix)
    app.include_router(medicines.router, prefix=prefix)
    app.include_router(adherence.router, prefix=prefix)
    app.include_router(doctors.router, prefix=prefix)
    app.include_router(voice.router, prefix=prefix)
    app.include_router(notifications.router, prefix=prefix)
    app.include_router(dashboard.router, prefix=prefix)

@app.get("/")
def root():
    return {
        "app": "MEDINOVA-AI",
        "title": "AI-Powered Personal Health Copilot",
        "tagline": "Smarter Healthcare. Clearer Understanding.",
        "status": "online",
        "docs_url": "/docs",
        "api_v1": api_v1_prefix,
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "rag_embeddings": "ready",
        "ai_engine": "operational",
    }
