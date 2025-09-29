from app.services import item_service, user_service
from app.schemas.item import ItemCreate
from app.schemas.user import UserCreate

def test_create_and_get_items(db_session):
    user = user_service.create_user(db_session, UserCreate(username="owner", email="owner@test.com", password="pass"))
    item1 = item_service.create_item(db_session, ItemCreate(title="Item1", description="Desc1"), owner_id=user.id)
    item2 = item_service.create_item(db_session, ItemCreate(title="Item2", description=None), owner_id=user.id)
    assert item1.id is not None and item2.id is not None
    items = item_service.get_items_by_owner(db_session, owner_id=user.id)
    titles = {item.title for item in items}
    assert "Item1" in titles and "Item2" in titles
    got = item_service.get_item(db_session, item1.id)
    assert got.title == "Item1" 