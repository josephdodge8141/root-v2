from typing import Generator

from app.core.database import get_db
from fastapi import Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session


def get_database() -> Generator[Session, None, None]:
    """
    FastAPI dependency to get database session.
    This is a wrapper around get_db for cleaner imports.
    """
    yield from get_db()


def get_repository_session(db: Session = Depends(get_database)) -> Session:
    """
    FastAPI dependency to get database session for repository pattern.
    Returns the session directly for use in repository constructors.
    """
    return db


class DatabaseHealthCheck:
    """Database health check utility"""
    
    def __init__(self, db: Session = Depends(get_database)):
        self.db = db
    
    def check_connection(self) -> bool:
        """Check if database connection is healthy"""
        try:
            # Simple query to test connection
            self.db.execute(text("SELECT 1"))
            return True
        except Exception:
            return False
    
    def get_status(self) -> dict:
        """Get detailed database status"""
        try:
            self.db.execute(text("SELECT 1"))
            return {
                "status": "healthy",
                "database": "connected",
                "message": "Database connection is working"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "message": f"Database connection failed: {str(e)}"
            }