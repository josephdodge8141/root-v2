from datetime import timedelta
from app.core import security

def test_password_hash_and_verify():
    pwd = "TestPass123!"
    hashed = security.hash_password(pwd)
    assert hashed != pwd
    assert security.verify_password(pwd, hashed) is True
    assert security.verify_password("wrongpass", hashed) is False

def test_create_access_token():
    data = {"sub": "someuser"}
    token = security.create_access_token(data, expires_delta=timedelta(minutes=1))
    decoded = security.decode_access_token(token)
    assert decoded["sub"] == "someuser"
    assert "exp" in decoded

def test_decode_invalid_token():
    invalid_token = "invalid.token.here"
    result = security.decode_access_token(invalid_token)
    assert result is None 