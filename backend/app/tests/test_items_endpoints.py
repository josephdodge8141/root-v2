def get_auth_header_for_user(client, username, email, password):
    client.post("/users/", json={"username": username, "email": email, "password": password})
    resp = client.post("/token", data={"username": username, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_item(client):
    auth = get_auth_header_for_user(client, "bob", "bob@example.com", "secret")
    resp = client.post("/items/", json={"title": "Book", "description": "A mystery novel"}, headers=auth)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["title"] == "Book"
    assert data["description"] == "A mystery novel"
    assert data["owner_id"]

def test_list_items(client):
    auth = get_auth_header_for_user(client, "carol", "carol@example.com", "password123")
    resp = client.get("/items/", headers=auth)
    assert resp.status_code == 200
    assert resp.json() == []
    client.post("/items/", json={"title": "Camera", "description": "DSLR"}, headers=auth)
    client.post("/items/", json={"title": "Tripod", "description": None}, headers=auth)
    resp2 = client.get("/items/", headers=auth)
    items = resp2.json()
    titles = {item["title"] for item in items}
    assert "Camera" in titles and "Tripod" in titles
    for item in items:
        assert item["owner_id"] is not None
    assert len(items) == 2

def test_items_auth_required(client):
    resp = client.post("/items/", json={"title": "Unauthorized", "description": "No token"})
    assert resp.status_code == 401
    resp2 = client.get("/items/")
    assert resp2.status_code == 401

def test_read_single_item(client):
    auth_bob = get_auth_header_for_user(client, "bob2", "bob2@example.com", "pass")
    resp = client.post("/items/", json={"title": "Phone", "description": "Smartphone"}, headers=auth_bob)
    item_id = resp.json()["id"]
    res = client.get(f"/items/{item_id}", headers=auth_bob)
    assert res.status_code == 200
    assert res.json()["title"] == "Phone"
    auth_carol = get_auth_header_for_user(client, "carol2", "carol2@example.com", "pass")
    res2 = client.get(f"/items/{item_id}", headers=auth_carol)
    assert res2.status_code == 403
    res3 = client.get("/items/999999", headers=auth_bob)
    assert res3.status_code == 404 