from typing import Generator

from app.core.database import get_db
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session


def get_database() -> Generator[Session, None, None]:
    """
    Database dependency for FastAPI routes.
    This is a wrapper around the core get_db function for API routes.
    """
    yield from get_db()


# Additional dependencies will be added here as we implement authentication
# For now, we'll keep it simple with just the database dependency