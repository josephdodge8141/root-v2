def test_register_user(client):
    response = client.post("/users/", json={
        "username": "alice", "email": "alice@example.com", "password": "wonderland"
    })
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "id" in data
    assert "hashed_password" not in data

def test_register_user_duplicate(client):
    resp = client.post("/users/", json={
        "username": "alice", "email": "alice@example.com", "password": "test"
    })
    assert resp.status_code == 400
    data = resp.json()
    assert data["detail"] == "Username or email already registered"

ACCESS_TOKEN = None

def test_login_success(client):
    resp = client.post("/token", data={"username": "alice", "password": "wonderland"})
    assert resp.status_code == 200, resp.text
    token_data = resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    global ACCESS_TOKEN
    ACCESS_TOKEN = token_data["access_token"]
    assert ACCESS_TOKEN

def test_login_bad_credentials(client):
    resp = client.post("/token", data={"username": "alice", "password": "wrongpass"})
    assert resp.status_code == 401
    data = resp.json()
    assert data["detail"] == "Incorrect username or password"

def test_get_current_user_profile(client):
    global ACCESS_TOKEN
    if ACCESS_TOKEN is None:
        resp = client.post("/token", data={"username": "alice", "password": "wonderland"})
        ACCESS_TOKEN = resp.json()["access_token"]
    resp = client.get("/users/me", headers={"Authorization": f"Bearer {ACCESS_TOKEN}"})
    assert resp.status_code == 200
    user_data = resp.json()
    assert user_data["username"] == "alice"
    assert user_data["email"] == "alice@example.com"
    assert "hashed_password" not in user_data

def test_get_current_user_unauthorized(client):
    resp = client.get("/users/me")
    assert resp.status_code == 401
    data = resp.json()
    assert "detail" in data 