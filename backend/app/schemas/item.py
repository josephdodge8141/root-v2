from pydantic import BaseModel

class ItemCreate(BaseModel):
    title: str
    description: str | None = None

class ItemRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    owner_id: int

    model_config = {"from_attributes": True} 