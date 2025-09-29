from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import user as user_schema
from app.services import user_service
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=user_schema.UserRead, status_code=201)
def register_user(
    user_in: user_schema.UserCreate,
    db: Session = Depends(get_db)
):
    new_user = user_service.create_user(db, user_in)
    if new_user is None:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    return new_user

@router.get("/me", response_model=user_schema.UserRead)
def read_current_user(current_user: user_schema.UserRead = Depends(get_current_user)):
    return current_user 