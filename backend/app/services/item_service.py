from sqlalchemy.orm import Session
from app.models import item as item_model
from app.schemas import item as item_schema

def create_item(db: Session, item_in: item_schema.ItemCreate, owner_id: int) -> item_model.Item:
    new_item = item_model.Item(
        title=item_in.title,
        description=item_in.description,
        owner_id=owner_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

def get_items_by_owner(db: Session, owner_id: int) -> list[item_model.Item]:
    return db.query(item_model.Item).filter(item_model.Item.owner_id == owner_id).all()

def get_item(db: Session, item_id: int) -> item_model.Item | None:
    return db.query(item_model.Item).filter(item_model.Item.id == item_id).first() 