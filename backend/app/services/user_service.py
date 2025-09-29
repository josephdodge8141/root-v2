from sqlalchemy.orm import Session
from app.models import user as user_model
from app.schemas import user as user_schema
from app.core import security

def create_user(db: Session, user_in: user_schema.UserCreate) -> user_model.User:
    existing_user = db.query(user_model.User).filter(
        (user_model.User.username == user_in.username) | 
        (user_model.User.email == user_in.email)
    ).first()
    if existing_user:
        return None
    
    hashed_pw = security.hash_password(user_in.password)
    new_user = user_model.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_username(db: Session, username: str) -> user_model.User | None:
    return db.query(user_model.User).filter(user_model.User.username == username).first()

def authenticate_user(db: Session, username: str, password: str) -> user_model.User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user

def get_user(db: Session, user_id: int) -> user_model.User | None:
    return db.query(user_model.User).get(user_id) 