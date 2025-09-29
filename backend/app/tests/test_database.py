import pytest
from app.core.database import Base, check_database_connection, get_db
from app.models.base import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_database_connection():
    """Test database connection utility"""
    # This will test against the actual configured database
    # In a real test environment, you'd want to use a test database
    result = check_database_connection()
    assert isinstance(result, bool)


def test_get_db_dependency():
    """Test the get_db dependency function"""
    db_generator = get_db()
    db = next(db_generator)
    
    # Should return a database session
    assert db is not None
    
    # Clean up
    try:
        next(db_generator)
    except StopIteration:
        pass  # Expected behavior


class TestModel(BaseModel):
    """Test model for testing BaseModel functionality"""
    __tablename__ = "test_models"


def test_base_model_creation(db_session):
    """Test BaseModel creation and basic functionality"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test instance
    test_obj = TestModel()
    db_session.add(test_obj)
    db_session.commit()
    
    # Test that ID was generated
    assert test_obj.id is not None
    assert test_obj.created_at is not None
    assert test_obj.updated_at is not None


def test_base_model_to_dict(db_session):
    """Test BaseModel to_dict method"""
    Base.metadata.create_all(bind=engine)
    
    test_obj = TestModel()
    db_session.add(test_obj)
    db_session.commit()
    
    # Test to_dict conversion
    obj_dict = test_obj.to_dict()
    
    assert isinstance(obj_dict, dict)
    assert "id" in obj_dict
    assert "created_at" in obj_dict
    assert "updated_at" in obj_dict


def test_base_model_update(db_session):
    """Test BaseModel update method"""
    Base.metadata.create_all(bind=engine)
    
    test_obj = TestModel()
    db_session.add(test_obj)
    db_session.commit()
    
    original_updated_at = test_obj.updated_at
    
    # Update the object
    test_obj.update()
    
    # updated_at should have changed
    assert test_obj.updated_at > original_updated_at