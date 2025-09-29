from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import item as item_schema
from app.services import item_service
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/items", tags=["Items"])

@router.post("/", response_model=item_schema.ItemRead, status_code=201)
def create_item(
    item_in: item_schema.ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = item_service.create_item(db, item_in, owner_id=current_user.id)
    return new_item

@router.get("/", response_model=list[item_schema.ItemRead])
def list_my_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = item_service.get_items_by_owner(db, owner_id=current_user.id)
    return items

@router.get("/{item_id}", response_model=item_schema.ItemRead)
def read_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = item_service.get_item(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this item")
    return item 