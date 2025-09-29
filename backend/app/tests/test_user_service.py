import pytest
from app.services import user_service
from app.schemas.user import UserCreate

def test_create_user_success(db_session):
    uc = UserCreate(username="newuser", email="new@user.com", password="pass")
    user = user_service.create_user(db_session, uc)
    assert user.id is not None
    assert user.username == "newuser"
    user2 = user_service.get_user_by_username(db_session, "newuser")
    assert user2 is not None and user2.email == "new@user.com"

def test_create_user_duplicate(db_session):
    uc = UserCreate(username="dupuser", email="dup@user.com", password="pass")
    user_service.create_user(db_session, uc)
    user = user_service.create_user(db_session, uc)
    assert user is None

def test_authenticate_user(db_session):
    uc = UserCreate(username="authuser", email="auth@user.com", password="secret")
    user = user_service.create_user(db_session, uc)
    authu = user_service.authenticate_user(db_session, "authuser", "secret")
    assert authu is not None and authu.username == "authuser"
    authu2 = user_service.authenticate_user(db_session, "authuser", "wrong")
    assert authu2 is None
    authu3 = user_service.authenticate_user(db_session, "nope", "secret")
    assert authu3 is None 