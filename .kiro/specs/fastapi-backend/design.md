# Design Document

## Overview

The FastAPI backend will be built using a modern Python stack with FastAPI for the web framework, SQLAlchemy for ORM, PostgreSQL for the database, Celery for background tasks, Redis for caching and message brokering, and WebSockets for real-time communication. The architecture follows a multi-tenant SaaS pattern with strict data isolation and supports asynchronous processing for AI operations.

## Architecture

### Technology Stack

- **Web Framework**: FastAPI with Pydantic for request/response validation
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Background Tasks**: Celery with Redis as broker and result backend
- **Real-time Communication**: FastAPI WebSockets with Redis pub/sub
- **Authentication**: JWT tokens with passlib for password hashing
- **Containerization**: Docker with docker-compose for development
- **Testing**: pytest with async support and test database isolation

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   ├── security.py         # JWT and password utilities
│   │   └── database.py         # Database connection and session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py             # Base model with common fields
│   │   ├── user.py             # User and Organization models
│   │   ├── document.py         # Document and Summary models
│   │   ├── template.py         # Template model
│   │   ├── integration.py      # Integration model
│   │   └── job.py              # Job/Task model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py             # Pydantic schemas for users
│   │   ├── document.py         # Document request/response schemas
│   │   ├── template.py         # Template schemas
│   │   ├── integration.py      # Integration schemas
│   │   └── job.py              # Job schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection utilities
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── documents.py    # Document CRUD endpoints
│   │       ├── templates.py    # Template management
│   │       ├── integrations.py # Integration endpoints
│   │       ├── jobs.py         # Job status endpoints
│   │       └── websocket.py    # WebSocket endpoint
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Authentication business logic
│   │   ├── document_service.py # Document operations
│   │   ├── llm_service.py      # LLM integration
│   │   ├── integration_service.py # External integrations
│   │   └── websocket_service.py # WebSocket management
│   ├── workers/
│   │   ├── __init__.py
│   │   ├── celery_app.py       # Celery configuration
│   │   └── tasks.py            # Background task definitions
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py         # Test configuration and fixtures
│       ├── test_auth.py        # Authentication tests
│       ├── test_documents.py   # Document operation tests
│       ├── test_templates.py   # Template tests
│       ├── test_integrations.py # Integration tests
│       └── test_tasks.py       # Background task tests
├── alembic/                    # Database migrations
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## Components and Interfaces

### Database Models

#### Base Model

```python
class BaseModel:
    id: UUID (Primary Key)
    created_at: DateTime
    updated_at: DateTime

    # Common methods for all models
    def save()
    def delete()
```

#### Organization Model

```python
class Organization(BaseModel):
    name: String
    plan_type: String (enum: free, enterprise)

    # Relationships
    users: List[User]
    documents: List[Document]
```

#### User Model

```python
class User(BaseModel):
    org_id: UUID (Foreign Key -> Organization)
    email: String (unique per org)
    password_hash: String
    name: String
    role: String (enum: admin, member)
    auth_provider: String (enum: local, google)
    is_active: Boolean
```

#### Document Model

```python
class Document(BaseModel):
    org_id: UUID (Foreign Key -> Organization)
    user_id: UUID (Foreign Key -> User)
    title: String
    content: Text (UTF-8 encoded)
    source_type: String (enum: upload, notion, guru, etc.)
    source_url: String (nullable)
    external_id: String (nullable)
    external_last_updated: DateTime (nullable)
    status: String (enum: active, updating, error)

    # Relationships
    summaries: List[Summary]
```

#### Summary Model

```python
class Summary(BaseModel):
    doc_id: UUID (Foreign Key -> Document)
    org_id: UUID (Foreign Key -> Organization)
    created_by: UUID (Foreign Key -> User)
    template_id: UUID (Foreign Key -> Template, nullable)
    summary_text: Text
    format: String
    tokens_used: Integer (nullable)
    model_used: String (nullable)
    status: String (enum: pending, complete, failed)
```

#### Template Model

```python
class Template(BaseModel):
    org_id: UUID (Foreign Key -> Organization, nullable for global)
    name: String
    prompt_template: Text
    description: String
    created_by: UUID (Foreign Key -> User)
    is_default: Boolean
    template_type: String (default: summary)
```

#### Integration Model

```python
class Integration(BaseModel):
    org_id: UUID (Foreign Key -> Organization)
    integration_type: String (enum: notion, guru, confluence, etc.)
    auth_type: String (enum: oauth2, api_token)
    access_token: String (encrypted)
    refresh_token: String (encrypted, nullable)
    token_expires_at: DateTime (nullable)
    config: JSON
    status: String (enum: connected, error, revoked)
    last_sync: DateTime (nullable)
```

#### Job Model

```python
class Job(BaseModel):
    org_id: UUID (Foreign Key -> Organization)
    user_id: UUID (Foreign Key -> User, nullable)
    job_type: String (enum: summarize_document, publish_summary, etc.)
    related_id: UUID (generic reference)
    status: String (enum: pending, in_progress, completed, failed)
    result: JSON (nullable)
    error_message: String (nullable)
    queued_at: DateTime
    started_at: DateTime (nullable)
    finished_at: DateTime (nullable)
    celery_task_id: String
```

### API Layer Architecture

#### Authentication Flow

1. **Registration/Login**: POST /auth/register, POST /auth/login
2. **JWT Token Generation**: Include user_id, org_id, and expiration
3. **Token Validation**: Dependency injection for protected routes
4. **Multi-tenant Filtering**: Automatic org_id filtering in all queries

#### Request/Response Flow

```
Client Request → FastAPI Router → Dependency Injection → Service Layer → Database → Response
                                      ↓
                              JWT Validation & Org Context
```

#### WebSocket Architecture

- **Connection Management**: Authenticated connections stored in Redis
- **Channel Subscription**: Users subscribe to org-specific channels
- **Event Broadcasting**: Background tasks publish events to Redis pub/sub
- **Message Routing**: WebSocket manager routes messages to appropriate connections

### Background Task Processing

#### Celery Configuration

```python
# Celery app with Redis broker
celery_app = Celery(
    "llm_docs_app",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

# Task routing
task_routes = {
    'app.workers.tasks.summarize_document': {'queue': 'llm_tasks'},
    'app.workers.tasks.sync_integration': {'queue': 'integration_tasks'},
}
```

#### Task Types

1. **Document Summarization**: Process document content with LLM
2. **Integration Sync**: Import/export data from external systems
3. **Bulk Operations**: Handle multiple documents or summaries
4. **Cleanup Tasks**: Periodic maintenance and data cleanup

## Data Models

### Database Schema Design

#### Multi-Tenant Isolation

- Every tenant-specific table includes `org_id` column
- Database indexes on `(org_id, id)` for efficient queries
- Application-level filtering ensures no cross-tenant data access
- Foreign key constraints maintain referential integrity within tenants

#### Unicode Support

- All text fields use UTF-8 encoding (PostgreSQL default)
- Supports international characters, symbols, and emojis
- Content preservation for documents in any language

#### Indexing Strategy

```sql
-- Primary indexes
CREATE INDEX idx_documents_org_id ON documents(org_id);
CREATE INDEX idx_summaries_doc_org ON summaries(doc_id, org_id);
CREATE INDEX idx_jobs_org_status ON jobs(org_id, status);

-- Composite indexes for common queries
CREATE INDEX idx_documents_org_title ON documents(org_id, title);
CREATE INDEX idx_integrations_org_type ON integrations(org_id, integration_type);
```

### Data Access Patterns

#### Repository Pattern

```python
class BaseRepository:
    def __init__(self, db: Session, org_id: UUID):
        self.db = db
        self.org_id = org_id

    def get_by_id(self, id: UUID) -> Optional[Model]:
        return self.db.query(Model).filter(
            Model.id == id,
            Model.org_id == self.org_id
        ).first()

    def list_all(self, skip: int = 0, limit: int = 100) -> List[Model]:
        return self.db.query(Model).filter(
            Model.org_id == self.org_id
        ).offset(skip).limit(limit).all()
```

#### Service Layer Pattern

```python
class DocumentService:
    def __init__(self, db: Session, current_user: User):
        self.db = db
        self.current_user = current_user
        self.repo = DocumentRepository(db, current_user.org_id)

    async def create_document(self, doc_data: DocumentCreate) -> Document:
        # Business logic with automatic org_id injection
        document = Document(**doc_data.dict(), org_id=self.current_user.org_id)
        return self.repo.create(document)
```

## Error Handling

### Exception Hierarchy

```python
class AppException(Exception):
    """Base application exception"""
    pass

class AuthenticationError(AppException):
    """Authentication related errors"""
    pass

class AuthorizationError(AppException):
    """Authorization/permission errors"""
    pass

class ValidationError(AppException):
    """Data validation errors"""
    pass

class IntegrationError(AppException):
    """External integration errors"""
    pass

class LLMError(AppException):
    """LLM service errors"""
    pass
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Document title is required",
    "details": {
      "field": "title",
      "constraint": "not_null"
    }
  }
}
```

### Retry Logic

- **LLM API Calls**: Exponential backoff with 3 retries
- **Integration APIs**: Circuit breaker pattern for external services
- **Database Operations**: Automatic retry for transient connection issues
- **Background Tasks**: Celery retry configuration with max attempts

## Testing Strategy

### Test Categories

#### Unit Tests

- **Models**: Test model validation, relationships, and methods
- **Services**: Test business logic with mocked dependencies
- **Utilities**: Test helper functions and utilities
- **Schemas**: Test Pydantic model validation

#### Integration Tests

- **API Endpoints**: Test complete request/response cycles
- **Database Operations**: Test with real database transactions
- **Authentication**: Test JWT token generation and validation
- **Multi-tenancy**: Verify data isolation between organizations

#### Background Task Tests

- **Celery Tasks**: Test task execution with test broker
- **LLM Integration**: Mock external LLM API calls
- **WebSocket Events**: Test real-time notification delivery
- **Error Handling**: Test failure scenarios and recovery

### Test Infrastructure

#### Test Database

```python
# Separate test database with automatic cleanup
@pytest.fixture
def test_db():
    engine = create_engine("postgresql://test:test@localhost/test_db")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
```

#### Test Data Factories

```python
class UserFactory:
    @staticmethod
    def create(org_id: UUID, **kwargs) -> User:
        return User(
            org_id=org_id,
            email=kwargs.get('email', 'test@example.com'),
            name=kwargs.get('name', 'Test User'),
            password_hash=get_password_hash('password'),
            **kwargs
        )
```

#### Docker Test Environment

```yaml
# docker-compose.test.yml
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"

  test-redis:
    image: redis:7
    ports:
      - "6380:6379"
```

### Performance Considerations

#### Database Optimization

- Connection pooling with SQLAlchemy
- Query optimization with proper indexes
- Lazy loading for relationships
- Pagination for large result sets

#### Caching Strategy

- Redis caching for frequently accessed data
- Template caching to avoid repeated database queries
- Session caching for user authentication state
- Integration token caching with expiration

#### Async Processing

- FastAPI async/await for I/O operations
- Celery for CPU-intensive tasks
- Connection pooling for external APIs
- Batch processing for bulk operations

This design provides a solid foundation for building a scalable, maintainable FastAPI backend that meets all the requirements while following modern Python development best practices.
