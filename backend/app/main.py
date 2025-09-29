from app.core.config import settings
from app.core.database import engine
from app.models import base  # Import all models to ensure they're registered
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create database tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LLM-powered documentation backend API",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "LLM Documentation API", "version": settings.VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}