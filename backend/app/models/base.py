import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict

from sqlalchemy import Column, DateTime, inspect
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

Base = declarative_base()


class BaseModel(Base):
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary"""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
    
    def update(self, **kwargs) -> None:
        """Update model instance with provided kwargs"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
    
    def save(self, db: "Session") -> "BaseModel":
        """Save model instance to database"""
        db.add(self)
        db.commit()
        db.refresh(self)
        return self
    
    def delete(self, db: "Session") -> None:
        """Delete model instance from database"""
        db.delete(self)
        db.commit()