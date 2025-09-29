Comprehensive Backend Development Tickets

Below is a detailed series of development tickets covering every backend action needed to build a fully functional FastAPI application with SQLAlchemy, Alembic (for migrations), PostgreSQL, and JWT-based OAuth2 authentication. Each ticket is broken down into clear steps. Following them in order will guide an engineering intern to implement the backend from scratch, with a complete API and database integration. Testing tasks are included for each feature where business logic is introduced.

Ticket 1: Project Setup and Structure

Goal: Initialize the project repository and create the baseline directory structure for the backend code. Install all required dependencies.

Steps:

Initialize Repository: Create a new project directory (e.g., project/) and initialize a Git repository if needed. Within this directory, create a top-level folder named backend/.

Create Core App Structure: Under backend/, create a package directory app/ with the following subdirectories (each containing an __init__.py file):

api/ – for API route definitions (e.g., FastAPI routers for various endpoints).

core/ – for core utilities (configuration, database setup, security, migrations, etc.).

models/ – for SQLAlchemy database models.

schema/ – for Pydantic data schemas (request/response models).

services/ – for service layer functions (business logic, CRUD operations).

workers/ – for background tasks or worker processes (e.g., Celery tasks or any asynchronous jobs).

Create Entry Point: Inside app/, create an empty main.py file. This will be the entry point for the FastAPI application.

Dependency Installation: Set up a Python virtual environment and create a requirements.txt (or pyproject.toml if using Poetry) including all necessary packages:

FastAPI (the web framework)

Uvicorn (ASGI server for running FastAPI)

SQLAlchemy (ORM for database) and psycopg2-binary (PostgreSQL driver)

Alembic (database migrations)

Pydantic (for data schemas; note FastAPI includes it)

PyJWT (or python-jose) for JWT token encoding/decoding

passlib[bcrypt] (for password hashing)

python-dotenv (for loading environment variables from a .env file)
(You can refer to an example list of dependencies which includes FastAPI, SQLAlchemy, psycopg2, PyJWT, passlib, etc.
neon.com
.)

Verify Structure: The resulting structure should resemble:

backend/
└── app/
    ├── api/
    ├── core/
    ├── models/
    ├── schema/
    ├── services/
    ├── workers/
    ├── main.py
    └── __init__.py


Ensure each directory has an __init__.py so they are treated as Python packages. This structure follows best practices for FastAPI projects
dev.to
 and will support a clean separation of concerns.

Environment Configuration: In the project root (e.g., backend/), create a .env file. This will store environment-specific settings such as the database URL and secrets. For now, add at least:

DATABASE_URL= (e.g., postgresql://<user>:<password>@localhost:5432/<dbname> for local Postgres)

SECRET_KEY= (a random secret for JWT signing, you can use OpenSSL or another method to generate a secure key)

ALGORITHM=HS256 (JWT signing algorithm)

ACCESS_TOKEN_EXPIRE_MINUTES=30 (token expiry duration)

These values will be loaded into our app configuration later.

No tests for this ticket (this is just project setup). Once completed, commit the initial structure and requirements file.

Ticket 2: FastAPI Application Initialization

Goal: Create the FastAPI app instance and application settings. Configure the main entry point to launch the API (without any routes yet) and ensure the OpenAPI docs are accessible.

Steps:

Instantiate FastAPI: In backend/app/main.py, import FastAPI and create an app instance. Give it a descriptive title and enable docs:

from fastapi import FastAPI

app = FastAPI(
    title="Backend API",
    version="1.0.0",
    description="API for the backend service",
    docs_url="/docs"
)


This sets up the application object. The docs_url="/docs" will serve the OpenAPI documentation at the default /docs path (Swagger UI), which is useful for testing and inspection.

Include Routers Placeholder: Although we have no routes yet, set up the structure to include routers later. For example:

# (Later you will import API routers and include them here)
# from app.api import users, auth, items
# app.include_router(users.router)
# app.include_router(auth.router)
# app.include_router(items.router)


Leave these as comments or placeholders. We will fill them in once we implement the routes in subsequent tickets.

Run Server (Development): Verify that the app can start. Install Uvicorn (pip install uvicorn) if not already in requirements. Run:

uvicorn app.main:app --reload


This should start the FastAPI development server. Visit http://localhost:8000/docs to see the interactive API docs. At this point it will be mostly empty (just the automatic root 404 handler) but confirms that the app runs and the docs are reachable.

Testing: This ticket doesn’t introduce business logic, so no automated tests are required. Just manually confirm the server runs and the docs endpoint loads (you should see the app title and version in the Swagger UI). This sets the stage for adding actual functionality.

Ticket 3: Database Configuration (SQLAlchemy + Postgres)

Goal: Set up database connectivity using SQLAlchemy and prepare the session management. This will allow us to interact with the PostgreSQL database throughout the app.

Steps:

Configure Database Module: Create a file backend/app/core/database.py. This will handle connecting to the PostgreSQL database using SQLAlchemy. In this file:

Import necessary SQLAlchemy components and load environment variables:

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()  # load variables from .env


Read the database URL from the environment:

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in environment")


Create the SQLAlchemy engine and session maker:

engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True  # optional: checks connection health
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


This configures a synchronous SQLAlchemy engine for Postgres (psycopg2). We disable autocommit and autoflush to manage transactions manually.

Define the declarative base and a session dependency:

Base = declarative_base()

def get_db():
    """Yield a database session for use in API dependencies."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Here, Base will be the base class for our ORM models. The get_db() function provides a FastAPI dependency that creates a new Session for a request and ensures it’s closed after
neon.com
. This pattern is standard: it prevents session leaks by closing sessions after each request.

Integrate in Main (Import): Open backend/app/main.py and import the get_db dependency to ensure it’s loaded. Also, import the engine and Base in case we want to use them (for example, with migrations). For now, just ensure this module is imported so that environment variables load and the engine is initialized:

from app.core import database


(No need to call anything here yet; just import so that load_dotenv() runs and any startup logic in database.py executes.)

Verify Connection: It’s a good idea to test that the database connection works. You can do this by attempting a simple engine connection in an interactive session or catching errors on app startup. For example, in database.py after creating the engine, you might add:

try:
    with engine.connect() as conn:
        conn.execute("SELECT 1")
except Exception as e:
    raise RuntimeError(f"Database connection failed: {e}")


This will immediately alert if the DATABASE_URL is invalid or the database is unreachable.

Testing: No direct business logic to test here, but you can write a quick integration sanity check:

Run the app and ensure no errors on startup related to DB.

If you have a running PostgreSQL, you can create a temporary route to fetch something from the database or simply rely on Alembic (next ticket) to test the connection.

No Pytest tests are required for this configuration step (since it primarily sets up an external connection), but this module will be used by other components which we will test later.

Ticket 4: Alembic Migration Setup

Goal: Initialize Alembic for database migrations and configure it to work with our project structure and models. This will allow us to track database schema changes in versioned migration scripts.

Steps:

Initialize Alembic: From the project root (where alembic will be initialized), run the Alembic init command. We want the migrations to live under our app/core directory as specified. Run:

alembic init backend/app/core/migrations


This creates an Alembic environment. You should see a new migrations/ folder under backend/app/core/ containing an env.py file and versions/ subfolder, and an alembic.ini in the project root. If alembic.ini was created at the root, keep it there (it includes configuration that Alembic uses).

Configure Alembic (env.py): Open backend/app/core/migrations/env.py. We need to modify it to use our project’s database and models:

Import our SQLAlchemy Base and models at the top of env.py:

import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Import the Base and models
from dotenv import load_dotenv
load_dotenv()
from app.core.database import Base
import app.models.user  # import all models so Alembic can detect them
import app.models.item  # (item model will be added later, but include now or update when added)


Set the SQLAlchemy URL for migrations. Since we load the .env, we can fetch DATABASE_URL:

config = context.config
# Override the database URL from .env
config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL'))
fileConfig(config.config_file_name)
target_metadata = Base.metadata


This ensures Alembic knows which database to connect to and what the target schema is (our Base.metadata). We load our models so that Base.metadata includes all tables. The above approach is recommended for integrating Alembic with an app’s models
medium.com
.

Configure Alembic (alembic.ini): Open alembic.ini in the project root. Ensure the script_location points to backend/app/core/migrations (it should reflect the path we initialized). Also, in alembic.ini, you can set timezone = utc under [alembic] for timestamped migrations. We already set the database URL via env.py, so no need to hardcode it in the .ini.

Version Control Migrations: The env.py is now set to use our project’s database settings. At this point, we haven’t created any model or migration yet, so Alembic’s versions/ folder is empty. We will generate our first migration in the next ticket after defining the User model. To verify Alembic is configured correctly, you can run alembic revision --autogenerate -m "Initial commit" (this will likely create an empty migration since no tables exist yet, which you can discard or keep as baseline). The real test will be in Ticket 5 when we create the user model and generate a migration.

Testing: This is a setup ticket. No application logic to test yet. However, you can test the Alembic configuration by running a migration command:

Run alembic revision --autogenerate -m "test" and see if it runs without errors (and generates a revision file). If it does, the env is set correctly (you can delete that revision file afterward if it's just a test).

No automated tests; just ensure Alembic commands work. We will use Alembic in the next ticket to actually create a migration.

(If errors occur (e.g., module import issues), double-check the import paths in env.py and that backend is in your PYTHONPATH when running Alembic. You might need to run Alembic from the project root so that app is in the import path, or modify env.py to add the project path.)

Ticket 5: User Model and Initial Migration

Goal: Define the User database model in SQLAlchemy and create a database migration for the initial users table. This includes fields for authentication (username, email, hashed password, etc.).

Steps:

Define User Model: In backend/app/models/user.py, define the SQLAlchemy model for users:

from app.core.database import Base
from sqlalchemy import Column, Integer, String, Boolean

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


Explanation:

We import Base from our database module to ensure this class is added to the Base metadata.

id is the primary key.

username and email are unique and indexed for quick lookups
neon.com
. We mark them non-nullable as they are required for login/identification.

hashed_password will store the password hash (we do not store plain passwords).

is_active is a boolean flag we can use to deactivate users (defaulting to True for convenience).

(We can later extend this model with more fields like full_name, created_at etc., but for now these basics suffice.)

Create Migration for User: Now that the User model is defined and Alembic is configured, generate a new migration revision:

alembic revision --autogenerate -m "Create users table"


Alembic will scan the Base.metadata (which now includes User) and create a migration script under backend/app/core/migrations/versions/. Open the generated file and verify it has a users table with the columns defined (id, username, email, hashed_password, is_active). Alembic’s autogenerate should pick up the model definition and produce the appropriate CREATE TABLE statements
medium.com
.

Apply Migration: Run the migration to apply the schema to the database:

alembic upgrade head


This will execute the new migration script against your Postgres database, creating the users table
medium.com
. If successful, you now have a users table in the database.

Model repr (Optional): You might add a __repr__ or __str__ to the model for debugging, but it's optional. For example:

def __repr__(self):
    return f"<User(id={self.id}, username={self.username}, email={self.email})>"


Commit Migration: Check the app/core/migrations/versions folder for the migration file. Commit this file to version control along with the model code, so the schema history is tracked.

Testing: No unit tests are needed specifically for the model definition. We rely on Alembic to ensure the schema is correct. However, you can do a quick check:

Connect to the database (using psql or a DB client) and run \d users to see the table schema, ensuring columns and constraints match the model (unique indexes on username and email, etc.).

We will test the user model indirectly via the API in later tickets (e.g., creating a user through the API and verifying it’s saved). We do not write tests just to check if the ORM model and migration align; that’s handled by Alembic/SQLAlchemy.

Ticket 6: User Pydantic Schemas

Goal: Create Pydantic models (schemata) for user data. We need schemas for input (creating a new user, logging in) and output (what we return in API responses) to ensure data validation and to shape the API responses. We'll also define a schema for the authentication token.

Steps:

Create User Schema Module: In backend/app/schema/user.py, define Pydantic models for users:

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool

    class Config:
        orm_mode = True


Explanation:

UserCreate: for user registration inputs. We use EmailStr (a Pydantic type) for email to automatically validate proper email format. The password here is plain text (will be hashed later). We expect the client to provide these fields when creating a new user.

UserRead (or simply User as an output schema): for API responses. This includes the id, username, email, and is_active status. Notice it does not include the password or hashed_password – we never expose passwords via API. We set orm_mode = True in Config to allow converting from SQLAlchemy ORM objects to Pydantic automatically
neon.com
.

Create Token Schema: In backend/app/schema/token.py (or you can include it in the same module if you prefer), define a schema for the JWT token response:

from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str


This will be used to shape the response when a user logs in (we'll return a JWT and its type).

Schema for Token Data (Optional): Often, we also define a TokenData schema for the content inside the JWT (for example, username or user id and expiration). For instance:

class TokenData(BaseModel):
    username: str | None = None


This can be used internally to validate the token payload (though not strictly necessary – we can handle it directly in code).

Verify Schemas: These Pydantic models will be used by FastAPI to parse request bodies and serialize responses. For example:

When a client sends JSON to create a user, FastAPI will parse it into UserCreate and validate types (ensuring email is valid, etc.).

When we return a UserRead object (or a User SQLAlchemy object with orm_mode), FastAPI will use the schema to filter out fields like hashed_password.

Module __init__.py updates: To make imports easier, you can update backend/app/schema/__init__.py to import these schemas (e.g., from app.schema.user import UserCreate, UserRead etc.), but that's optional.

Testing: We don’t write dedicated tests for Pydantic models themselves, as they’ll be exercised via API tests. However, you can do quick interactive checks:

Create a UserCreate with an invalid email to ensure validation triggers (e.g., UserCreate(username="u", email="not-an-email", password="p") should raise a validation error).

Ensure that converting a SQLAlchemy User to UserRead works. For example, if you have a user = User(id=1, username="a", email="x", hashed_password="...", is_active=True), then UserRead.from_orm(user) should produce a Pydantic object with id, username, email, is_active, and no password (this relies on orm_mode)
neon.com
.

These schemas lay the groundwork for request/response validation and serialization.

Ticket 7: Authentication Utilities (Password Hashing & JWT Token)

Goal: Implement core authentication logic: password hashing, verification, and JWT token creation. These will live in the core module (like a utils library) and be used by the authentication service and routes.

Steps:

Set Up Security Config: In backend/app/core/security.py (create this file), configure password hashing and JWT settings:

Password Hashing: Use Passlib’s CryptContext to hash passwords. At the top of the file:

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


This sets up a bcrypt hasher for passwords (bcrypt is a strong hashing algorithm)
neon.com
.

JWT Settings: Import PyJWT and datetime:

import jwt
from datetime import datetime, timedelta


Also load environment variables to get the secret key and algorithm:

from dotenv import load_dotenv
import os
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


The defaults (in case env is missing) ensure the code won’t break, but in real usage, these should be set in the .env.

Define Utility Functions:

def hash_password(password: str) -> str: uses pwd_context.hash(password) to get a secure hash
neon.com
.

def verify_password(plain_password: str, hashed_password: str) -> bool: uses pwd_context.verify(plain_password, hashed_password) to check a password
neon.com
.

def create_access_token(data: dict, expires_delta: int = None) -> str: generates a JWT. For example:

def create_access_token(data: dict, expires_delta: int = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


Here, data will typically include an identifier for the user (e.g., username or user ID). We add an expiration claim (exp) and encode with our SECRET_KEY. This returns the JWT as a string
neon.com
.

(Optional) def decode_access_token(token: str) -> dict: – You might implement a helper to decode a JWT (using jwt.decode) if needed for verification. But we will handle token verification in the dependency (raising errors if invalid), so this is optional. For example:

from jwt import PyJWTError
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # could further validate contents if needed
    except PyJWTError:
        return None


The FastAPI official example returns the username (subject) or None
neon.com
; you can adapt as needed.

Usage of Functions: These functions will be used as follows in our app:

hash_password() when creating a new user (to store a hashed password in DB).

verify_password() during login (to compare provided password with stored hash).

create_access_token() during login (to issue JWT containing user identity).

decode_access_token or equivalent logic when protecting endpoints (to get user info from token).

Security Dependency Placeholder: We will soon create a dependency get_current_user that uses these utilities, but for now just ensure the core functions are ready.

Testing: Write unit tests for the utility functions to ensure they work correctly:

Password Hashing Tests: In backend/tests/test_security.py, test that:

hash_password("mysecret") returns a string that is not the original password.

verify_password("mysecret", hashed) returns True for the hashed version and False for a wrong password.

The hashing context is working (e.g., hashed passwords start with $2b$ indicating bcrypt).
Example:

from app.core import security
def test_password_hash_and_verify():
    pwd = "TestPass123!"
    hashed = security.hash_password(pwd)
    assert hashed != pwd
    assert security.verify_password(pwd, hashed) is True
    assert security.verify_password("wrongpass", hashed) is False


JWT Token Tests: It’s tricky to fully test JWT content without duplicating logic, but you can:

Use security.create_access_token({"sub": "testuser"}) and then decode it with jwt.decode to verify the payload contains sub: "testuser" and an exp within expected range.

Check that an expired token (by manipulating expires_delta to a past time) indeed is detected as invalid by decode_access_token (returns None or raises as expected).
Example:

import jwt as pyjwt
def test_create_access_token():
    data = {"sub": "someuser"}
    token = security.create_access_token(data, expires_delta=timedelta(minutes=1))
    decoded = pyjwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
    assert decoded["sub"] == "someuser"
    assert "exp" in decoded


Note: In tests, use the same SECRET_KEY/ALGORITHM from security module.

Run these tests with pytest. They ensure our hashing and token generation are working as expected. These functions are critical for security, so we include direct tests for them. (We rely on the underlying libraries, but testing our integration and usage of them is good practice.)

Ticket 8: User Services (CRUD Logic)

Goal: Implement service-layer functions for user management: creating a new user and retrieving users from the database. These functions abstract the database operations and will be used by the API routes. We’ll also include an authentication helper to verify user credentials.

Steps:

User Service Module: Create backend/app/services/user_service.py. This module will contain functions that interact with the DB through SQLAlchemy session for user-related operations:

Create User:

from sqlalchemy.orm import Session
from app import models, schema, core

def create_user(db: Session, user_in: schema.user.UserCreate) -> models.user.User:
    # Check if username or email already exists
    existing_user = db.query(models.user.User).filter(
        (models.user.User.username == user_in.username) | 
        (models.user.User.email == user_in.email)
    ).first()
    if existing_user:
        return None  # indicate user already exists (could also raise exception here)
    # Hash the password
    hashed_pw = core.security.hash_password(user_in.password)
    # Create User instance
    new_user = models.user.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


This function takes a DB session and a UserCreate Pydantic object. It checks for uniqueness of username/email (so we don’t create duplicates). If a conflict is found, it returns None (the API layer will handle sending an error). Otherwise, it hashes the plaintext password, creates a User ORM instance, saves it, and returns the new User
neon.com
.

Get User by Username:

def get_user_by_username(db: Session, username: str) -> models.user.User | None:
    return db.query(models.user.User).filter(models.user.User.username == username).first()


This helper will be useful for authentication (login) and retrieving user info.

Authenticate User:

def authenticate_user(db: Session, username: str, password: str) -> models.user.User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not core.security.verify_password(password, user.hashed_password):
        return None
    return user


This function verifies a user's credentials. It returns the User if authentication succeeds, or None if it fails (username not found or password mismatch). This will be used in the login flow.

(Optional) Get User by ID: We might also define:

def get_user(db: Session, user_id: int) -> models.user.User | None:
    return db.query(models.user.User).get(user_id)


This can be used to fetch a user by primary key (for example, when decoding a token if we use user_id in token).

Other user-related operations (update, delete) are not needed now, but this structure allows adding them later.

Verify relationships (if any): Right now, our User model doesn’t have relationships to other models (we will add one to Item later). But if we had a relationship (like User.items), the service functions might need to use db.expire(new_user) or similar to get lazy relations. For now, not applicable.

Return values: We chose to return None on failure for create_user (if user exists) and authenticate_user (if credentials invalid). Alternatively, we could raise exceptions in the service, but it’s often cleaner to return a status and let the API layer decide how to respond (HTTP 400/401, etc.). We'll handle that in the route logic.

Import in Service __init__.py: Optionally, update backend/app/services/__init__.py for easier imports (e.g., from app.services.user_service import create_user, authenticate_user).

Testing: We will test these service functions indirectly through the API endpoints in subsequent tickets. However, you can add some unit tests for them now:

In backend/tests/test_user_service.py, set up a temporary database (you can use an in-memory SQLite or a test transaction) and use a session to call create_user:

import pytest
from app.services import user_service
from app.schema.user import UserCreate
def test_create_user_success(db_session):  # assuming db_session is a pytest fixture yielding Session
    uc = UserCreate(username="newuser", email="new@user.com", password="pass")
    user = user_service.create_user(db_session, uc)
    assert user.id is not None
    assert user.username == "newuser"
    # Fetch directly to confirm
    user2 = user_service.get_user_by_username(db_session, "newuser")
    assert user2 is not None and user2.email == "new@user.com"
def test_create_user_duplicate(db_session):
    uc = UserCreate(username="dupuser", email="dup@user.com", password="pass")
    user_service.create_user(db_session, uc)
    # Second attempt with same username/email
    user = user_service.create_user(db_session, uc)
    assert user is None
def test_authenticate_user(db_session):
    uc = UserCreate(username="authuser", email="auth@user.com", password="secret")
    user = user_service.create_user(db_session, uc)
    # Correct password
    authu = user_service.authenticate_user(db_session, "authuser", "secret")
    assert authu is not None and authu.username == "authuser"
    # Wrong password
    authu2 = user_service.authenticate_user(db_session, "authuser", "wrong")
    assert authu2 is None
    # Nonexistent user
    authu3 = user_service.authenticate_user(db_session, "nope", "secret")
    assert authu3 is None


Fixture note: You need a db_session fixture that provides a SQLAlchemy session connected to a test database (see Ticket 10 testing section for how to set that up with override). The above tests assume such a fixture.

Ensure tests run and pass. These tests directly validate our business logic for user creation and authentication, independent of the API layer.

Ticket 9: OAuth2 Bearer Authentication Dependency

Goal: Implement the authentication dependency that will be used to secure protected endpoints. This includes setting up FastAPI’s OAuth2 password flow and a get_current_user function that extracts the user from the JWT token.

Steps:

OAuth2 Scheme: In FastAPI, to handle bearer tokens, we use OAuth2PasswordBearer. Usually, we configure this in a central place. We can put it in backend/app/core/security.py (since that already has security logic) or in a dedicated auth module. For clarity, let’s do it in core/security.py (or alternatively create core/auth.py):

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


This sets up an OAuth2 scheme that FastAPI will use to parse the Authorization: Bearer <token> header. We pass tokenUrl="token" which is the relative URL where clients will obtain tokens (our login endpoint). This will make the Swagger UI know about an OAuth2 bearer token for authentication flows.

get_current_user Dependency: Define a function that FastAPI can use as a dependency in routes to enforce authentication:

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import models, services

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # Decode and verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Extract user identifier - we put 'sub' in token with username (or could use user_id)
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Get user from DB
    user = services.user_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


Explanation:

We use Depends(get_db) to get a database session and Depends(oauth2_scheme) to get the token string from the Authorization header. FastAPI will automatically return a 401 if no token is provided or if the scheme is incorrect.

We decode the JWT using our SECRET_KEY and ALGORITHM. If decoding fails (token invalid or expired), we raise HTTP 401 Unauthorized
neon.com
.

We expect the token payload to contain the username in the "sub" claim (subject). We retrieve it; if missing, we consider the token invalid.

We then fetch the user from the database. If not found, raise 404 (this could happen if the user was deleted but a token was still around).

If all is well, return the User object. This object will be used in the path operation function. (FastAPI will automatically document that this dependency requires a Bearer token).

Attach to FastAPI app: We should ensure get_current_user is imported in routes where needed (we will do that in the next ticket when implementing protected endpoints).

Alternate implementation: Instead of manually decoding, one could use the verify_token function we wrote in Ticket 7. For example:

username = core.security.decode_access_token(token)
if username is None: ...  # invalid token


The Neon example did something similar by calling auth.verify_token(token) which returned the username
neon.com
. Our approach above manually decodes for clarity, but either is fine. The key is to raise an HTTPException if the token is invalid or user missing.

Security in Docs: Because we've set up oauth2_scheme with tokenUrl="token", the OpenAPI docs will include an "Authorize" button. The /token endpoint (login) will be marked as the token URL. For any route that uses get_current_user, the docs will show a padlock icon indicating authentication is required. This means our API will have an OpenAPI-compatible OAuth2 security scheme automatically documented
neon.com
.

Testing: We will test this dependency via the protected endpoints in the next ticket. Directly testing a dependency can be done by simulating a request with a token:

However, a quick unit test for get_current_user could instantiate a temp DB, create a user, generate a token for that user, then call get_current_user by manually supplying a token and session. But it’s easier to test in the context of an API call.

We will cover scenarios in endpoint tests:

Access protected route with no token -> expect 401.

Access with invalid token -> 401.

Access with valid token -> success and returns user data.

If you still want a quick check:

def test_get_current_user_valid(db_session):
    # Create user and token
    user = user_service.create_user(db_session, UserCreate(username="u", email="e@e.com", password="p"))
    token = security.create_access_token({"sub": user.username})
    # Simulate dependency call
    current_user = security.get_current_user(db_session, token=token)
    assert current_user.username == "u"


This bypasses FastAPI and directly calls the function (hence we pass db_session and token). Ensure exceptions on invalid token yield correct status codes by capturing the HTTPException.

This dependency will be used in our upcoming route implementations for any endpoint that requires the user to be logged in.

Ticket 10: User API Endpoints (Registration, Login, Profile)

Goal: Create FastAPI routes for user registration, user login (to get JWT token), and a current user profile endpoint. These will utilize the schemas, services, and security components we've built. After implementing, we'll test these endpoints thoroughly.

Steps:

Create API Router for Users: In backend/app/api/users.py, set up an APIRouter for user-related endpoints:

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schema import user as user_schema, token as token_schema
from app.services import user_service
from app.core.database import get_db
from app.core.security import oauth2_scheme, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


We use prefix /users for user endpoints and tag them as "Users" for documentation grouping.

Registration Endpoint: Add a route to register a new user:

@router.post("/", response_model=user_schema.UserRead, status_code=201)
def register_user(
    user_in: user_schema.UserCreate,
    db: Session = Depends(get_db)
):
    # Call service to create user
    new_user = user_service.create_user(db, user_in)
    if new_user is None:
        # User with same username or email exists
        raise HTTPException(status_code=400, detail="Username or email already registered")
    return new_user


Details:

Path: POST /users/ (with prefix, this is /users/). We choose to accept a JSON body with username, email, password fields and create a user.

We depend on get_db for a session.

We call create_user service. If it returns None, it means duplicate found – we respond with HTTP 400 Bad Request indicating the user already exists
neon.com
.

On success, we return the new user object. FastAPI will automatically serialize this via the UserRead schema, omitting the hashed password.

We set status_code=201 (Created) as it’s resource creation.

Login (Token) Endpoint: We’ll create a separate router for auth or handle it here. To keep things organized, let's create backend/app/api/auth.py for auth-related endpoints (token issuance). However, it's minimal, so you could also include it in users router. We will do a separate router without prefix:

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schema import token as token_schema
from app.services import user_service
from app.core.database import get_db
from app.core import security

auth_router = APIRouter(tags=["Authentication"])

@auth_router.post("/token", response_model=token_schema.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # The OAuth2PasswordRequestForm dependency will retrieve form fields "username" and "password"
    user = user_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Create JWT token
    access_token = security.create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


Details:

This endpoint is at POST /token. It expects form data (not JSON) for username and password. FastAPI's OAuth2PasswordRequestForm provides username and password attributes by reading form fields
neon.com
.

We use authenticate_user to verify credentials. If it returns None, we raise 401 Unauthorized with the WWW-Authenticate: Bearer header (which FastAPI uses to indicate auth failure)
neon.com
.

On success, we create a JWT with the user's username as the subject. We return it as {"access_token": "...", "token_type": "bearer"} which matches our Token schema. The token_type is always "bearer" for OAuth2.

The response_model=Token ensures the output matches schema (it will include exactly those two fields).

Note: We could include an expiration in the token creation (the create_access_token already adds exp claim). The client is expected to manage expiration (and re-login if needed).

Current User Endpoint: Add an endpoint to get the details of the currently authenticated user:

@router.get("/me", response_model=user_schema.UserRead)
def read_current_user(current_user: user_schema.UserRead = Depends(get_current_user)):
    # current_user is the User model instance of the logged-in user, injected by get_current_user
    return current_user


Details:

Path: GET /users/me.

We use Depends(get_current_user), which will ensure the request has a valid token and will set current_user to the authenticated User object.

We annotate current_user: user_schema.UserRead for the dependency to help FastAPI know what type to output (though FastAPI can also infer from response_model). Here, we directly return the SQLAlchemy User object. Because our UserRead schema has orm_mode, FastAPI will serialize the returned ORM object into the desired fields
neon.com
.

If the user is not authenticated, get_current_user will have already raised a 401, so this route only runs if token was valid.

Include Routers in Main: Now we have two routers: users.router and auth_router. Edit backend/app/main.py to include them:

from app.api import users, auth
app.include_router(users.router)
app.include_router(auth.auth_router)


Ensure these imports come after you have imported database (so that get_db etc. are defined). Also, import any other needed module (e.g., if get_current_user is in security and used in users router, importing users will indirectly import it as long as references are correct).

Re-run App: Start the server (uvicorn app.main:app --reload). Check the interactive docs:

You should see a Users section with POST /users/ and GET /users/me.

You should see an Authentication (or whatever tag we gave) section with POST /token.

The /token endpoint in docs will be marked as requiring form fields (username, password). The docs should also show a green "Authorize" button now (due to OAuth2PasswordBearer). If you click it, you can enter a token to authorize requests in the UI.

Testing (Manual): Before writing automated tests, manually verify these endpoints:

Register User: POST /users/ with JSON {"username": "testuser", "email": "test@example.com", "password": "secret"} should return 201 and JSON of the new user (with id, username, email, is_active). Check that hashed_password is not in the response.

Login: POST /token with form data (username=testuser&password=secret). In Swagger UI, you can try it out or use curl/httpie:

http -f POST http://localhost:8000/token username=testuser password=secret


This should return 200 and a JSON with access_token and token_type. If credentials are wrong, it should return 401.

Current User: GET /users/me with the Authorization: Bearer <token> header (you can use the token from login). In Swagger, you can click "Authorize" and paste the token, then call /users/me. It should return the user’s details. Without a token or with an invalid token, it should return 401.

Testing (Automated): Now create tests for these endpoints in backend/tests/test_auth_endpoints.py (for register/login/me):

Use the TestClient to simulate API calls. We will override the database with a test DB to avoid hitting the real database (see Test Configuration below). The typical pattern (as shown in FastAPI docs) is to override get_db dependency to use a SQLite in-memory database for tests
fastapi.xiniushu.com
.

Test Setup (Fixture): In tests/conftest.py, configure a test database:

import pytest, os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app

# Use SQLite in-memory for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
# Create all tables in the test database
Base.metadata.create_all(bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
# Now any request that depends on get_db will get a session to the SQLite test DB

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


This Pytest configuration:

Creates a SQLite memory database and a session factory
fastapi.xiniushu.com
.

Creates tables (using our Base metadata) in the SQLite DB
fastapi.xiniushu.com
.

Overrides the get_db dependency in our FastAPI app to use this SQLite session
fastapi.xiniushu.com
. This means all endpoints will operate on the in-memory database for tests.

Provides a client fixture that yields a TestClient for making requests.

Now in tests, we can use this client to call API endpoints without touching the real Postgres.

Test cases:

User Registration Success:

def test_register_user(client):
    # register a new user
    response = client.post("/users/", json={
        "username": "alice", "email": "alice@example.com", "password": "wonderland"
    })
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "id" in data
    assert "hashed_password" not in data  # password should not be exposed


Duplicate Registration:

def test_register_user_duplicate(client):
    # Attempt to register with same username/email as before
    resp = client.post("/users/", json={
        "username": "alice", "email": "alice@example.com", "password": "test"
    })
    assert resp.status_code == 400
    data = resp.json()
    assert data["detail"] == "Username or email already registered"


Login Success and Token:

def test_login_success(client):
    resp = client.post("/token", data={"username": "alice", "password": "wonderland"})
    assert resp.status_code == 200, resp.text
    token_data = resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    # Save the token for use in subsequent tests
    global ACCESS_TOKEN
    ACCESS_TOKEN = token_data["access_token"]
    assert ACCESS_TOKEN  # token is not empty


Here we use form-encoded data (as required by OAuth2PasswordRequestForm). We store the token in a global var for reuse (alternatively, use fixture to get token).

Login Failure (bad credentials):

def test_login_bad_credentials(client):
    resp = client.post("/token", data={"username": "alice", "password": "wrongpass"})
    assert resp.status_code == 401
    data = resp.json()
    assert data["detail"] == "Incorrect username or password"


Access Protected Endpoint:

def test_get_current_user_profile(client):
    # Use the token from successful login
    global ACCESS_TOKEN
    resp = client.get("/users/me", headers={"Authorization": f"Bearer {ACCESS_TOKEN}"})
    assert resp.status_code == 200
    user_data = resp.json()
    assert user_data["username"] == "alice"
    assert user_data["email"] == "alice@example.com"
    assert "hashed_password" not in user_data


Protected Endpoint without Token:

def test_get_current_user_unauthorized(client):
    resp = client.get("/users/me")  # no auth header
    assert resp.status_code == 401
    data = resp.json()
    # FastAPI returns a generic authentication error detail
    assert data["detail"] in ("Not authenticated", "Unauthorized")


(Depending on FastAPI version, the detail might be "Not authenticated" for missing credentials.)

Run these tests with pytest -q. All should pass:

The first test creates a user in the test DB.

Second test ensures duplicate returns 400.

Third logs in and gets a token.

Fourth ensures wrong password is unauthorized.

Fifth uses the token to get /users/me successfully.

Sixth checks that no token yields 401.

These tests cover the main user flows. They use the dependency override to ensure an isolated test database
fastapi.xiniushu.com
fastapi.xiniushu.com
, so tests won’t interfere with real data or with each other (the in-memory DB is fresh per test session). The intern should ensure that the override and Base.metadata.create_all are executed before any tests run (that’s why we do it in the fixture setup).

Ticket 11: Item Model and Migration

Goal: Expand the backend with another resource – an Item that belongs to a user (to demonstrate relationships and additional CRUD). We will create an Item model and a migration for the items table.

Steps:

Define Item Model: In backend/app/models/item.py, create the SQLAlchemy model:

from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="items")


Details:

id: primary key.

title: a short name for the item (required, indexed).

description: longer text field, optional.

owner_id: foreign key referencing users.id. We add ondelete="CASCADE" so if a user is deleted, their items are too (integrity rule). Make sure to import ForeignKey from SQLAlchemy.

owner: relationship to the User model. We use back_populates="items" to tie it to the User’s items relationship.

Add Relationship in User Model: Open backend/app/models/user.py and import relationship from sqlalchemy.orm. Add to the User class:

    items = relationship("Item", back_populates="owner")


This establishes the two-way relationship: User.items will be a list of Item instances owned by the user
dev.to
. Now the User model references Item, and Item references User.

Generate Migration: Since we updated models, run Alembic to create a new migration:

alembic revision --autogenerate -m "Create items table"


This should detect the new items table. The autogenerate will create a migration adding the items table with columns and the foreign key. It might also detect the items relationship on User, but that typically doesn’t create a DB change (only the ForeignKey on Item matters, which it will include).

Apply Migration: Run:

alembic upgrade head


This executes the new migration, creating the items table in the database.

Verify Schema: Connect to DB and ensure items table exists with the columns, and that foreign key constraint to users is present. The Alembic migration script will have something like:

op.create_table('items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
    ...
)


which matches our model.

Model repr (Optional): Add a repr to Item for debugging:

def __repr__(self):
    return f"<Item(id={self.id}, title={self.title}, owner_id={self.owner_id})>"


Testing: At this stage, the new model is introduced but not yet exposed via API. There’s no direct logic to test except the migration:

Run pytest quickly to ensure nothing broke (the tests for user might fail if the test database didn’t have the new table). We need to update the test setup to include the Item model:
In tests/conftest.py, after Base.metadata.create_all(bind=engine), ensure that Base includes the Item model (since we imported it, it should). Alternatively, explicitly import app.models.item in the test setup before create_all to register the model with Base. For example:

import app.models.item  # ensure Item is imported so Base.metadata has it
Base.metadata.create_all(bind=engine)


This way our SQLite test DB also has the items table.

No direct unit tests for the model. The upcoming service and endpoint will be tested. For now, commit the migration and model changes.

Ticket 12: Item Pydantic Schemas

Goal: Create Pydantic schemas for the Item resource, similar to how we did for User. We need schemas for item creation and item output.

Steps:

Item Schema Module: In backend/app/schema/item.py, define the Pydantic models:

from pydantic import BaseModel

class ItemCreate(BaseModel):
    title: str
    description: str | None = None

class ItemRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    owner_id: int

    class Config:
        orm_mode = True


Explanation:

ItemCreate: for creating a new item, the client must provide a title and optionally a description. The owner_id is not included here because the owner will be derived from the authenticated user (we don’t allow arbitrarily assigning items to different owners via the API).

ItemRead: what we return to the client. It includes the id, title, description, and owner_id of the item. We include owner_id so the client knows which user owns it (this is useful if, say, an admin was viewing all items, but in our case users will only see their own items, so it's somewhat redundant except for identification). We enable orm_mode so we can directly return ORM Item objects.

We might eventually nest the owner details, but that would require a recursive Pydantic model (User inside Item). To keep it simple, we'll just provide owner_id. If needed, the client can use owner_id to fetch user info or we can expand later.

Update schema/__init__.py: Optionally, import these in the package init for convenience (not required, but can do from app.schema.item import ItemCreate, ItemRead there).

No Token Schema needed (we already have that).

Double-check types: Pydantic will ensure title is a string (and not empty, unless we want to add a length constraint via validator). We can rely on basic validation for now.

Relationships in Schema (Optional): If we wanted each ItemRead to include the user data, we could do:

class ItemRead(BaseModel):
    ... 
    owner: UserRead  # from schema.user
    class Config:
        orm_mode = True


and not include owner_id. Then if we return item from the API with the relationship loaded, FastAPI would embed the user. However, that requires the relationship to be loaded or using .from_orm. This is advanced and not asked, so we skip it for now to avoid confusion.

Testing: Similar to user schemas, we typically don't write tests just for Pydantic models. They will be tested via API usage. If one wanted, they could test that ItemCreate requires title, etc., but it's minor:

For example, ItemCreate(title="Test", description=None) should be valid, whereas ItemCreate() missing title should raise a validation error.

We rely on FastAPI to handle that (it will return 422 on invalid input automatically).

This completes the schema setup for items.

Ticket 13: Item Service Functions

Goal: Implement service-layer functions for items: creating an item and retrieving items (by owner or by id). These will be analogous to user_service but for Item, and will handle the database interactions for item operations.

Steps:

Item Service Module: Create backend/app/services/item_service.py. Add the following functions:

create_item:

from sqlalchemy.orm import Session
from app import models, schema

def create_item(db: Session, item_in: schema.item.ItemCreate, owner_id: int) -> models.item.Item:
    # Create a new Item associated with owner_id
    new_item = models.item.Item(
        title=item_in.title,
        description=item_in.description,
        owner_id=owner_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


This takes the database session, an ItemCreate Pydantic object, and the owner_id (the user ID of the item’s owner). It constructs an Item, saves it, and returns it.
We assume the owner_id provided is valid (we will get it from a logged-in user context).

get_items_by_owner:

def get_items_by_owner(db: Session, owner_id: int) -> list[models.item.Item]:
    return db.query(models.item.Item).filter(models.item.Item.owner_id == owner_id).all()


Returns all Item records that belong to the given owner. This will be used for listing a user's items.

get_item: (optional, if we want to retrieve a single item by id)

def get_item(db: Session, item_id: int) -> models.item.Item | None:
    return db.query(models.item.Item).filter(models.item.Item.id == item_id).first()


If we plan to have an endpoint for fetching a specific item (maybe not necessary in our case, but could add).

We are not implementing update/delete here, but that could be added similarly if needed (with proper permission checks).

Using relationships: Because we have relationships set, if we query items by owner, we can also access the owner property if needed. But our use-case doesn't require lazy loading the owner because we just output owner_id or the user info from context.

Potential exceptions: If needed, these functions could check existence of owner (but since owner_id comes from a logged in user, it's assumed valid). We won’t do duplicate checks for items (two items can have same title etc., no uniqueness needed aside from id).

Import in services __init__.py: Add item_service if needed.

Testing: We'll test these via the API endpoints next. For completeness, quick unit tests can be written (similar style to user_service tests):

In tests/test_item_service.py (if desired), using a session fixture:

from app.services import item_service
from app.schema.item import ItemCreate

def test_create_and_get_items(db_session):
    # Create two items for owner 1
    item1 = item_service.create_item(db_session, ItemCreate(title="Item1", description="Desc1"), owner_id=1)
    item2 = item_service.create_item(db_session, ItemCreate(title="Item2", description=None), owner_id=1)
    assert item1.id is not None and item2.id is not None
    # Retrieve items for owner 1
    items = item_service.get_items_by_owner(db_session, owner_id=1)
    titles = {item.title for item in items}
    assert "Item1" in titles and "Item2" in titles
    # get_item by id
    got = item_service.get_item(db_session, item1.id)
    assert got.title == "Item1"


Use a fresh db_session fixture for these tests (with SQLite test DB). They ensure items are created and can be fetched. If using the same test DB as user tests, ensure owner_id=1 actually exists (e.g., create a user first or use user_id that exists). We might need to create a dummy user in test or use user_service to create one since foreign key requires a valid user. Alternatively, disable foreign key constraint in SQLite for test or use db_session.begin() context and manually assign.

For simplicity, in tests, one could do:

user = user_service.create_user(db_session, UserCreate(...))
item = item_service.create_item(db_session, ItemCreate(title="X"), owner_id=user.id)
...


to ensure a valid owner.

However, given time, we might rely on integration tests instead of writing separate item_service unit tests.

Now, on to exposing these via the API.

Ticket 14: Item API Endpoints

Goal: Create API routes for items: allow an authenticated user to create a new item and to list their items. We will protect these endpoints so only logged-in users can access them. Then, we’ll test these endpoints.

Steps:

Create API Router for Items: In backend/app/api/items.py, set up an APIRouter:

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schema import item as item_schema
from app.services import item_service
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/items", tags=["Items"])


We will use prefix /items for these routes.

Create Item Endpoint: Add a route to create a new item:

@router.post("/", response_model=item_schema.ItemRead, status_code=201)
def create_item(
    item_in: item_schema.ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # current_user is the ORM User of the logged-in user
    new_item = item_service.create_item(db, item_in, owner_id=current_user.id)
    return new_item


Details:

Method: POST /items/.

The request body is parsed as ItemCreate.

Dependency current_user ensures the user is authenticated. If not, FastAPI will return 401 before entering the function.

We call item_service.create_item with owner_id=current_user.id. This ties the item to the logged-in user.

We return the created item. FastAPI will serialize it with ItemRead schema (showing id, title, desc, owner_id).

If any error occurs (like DB issues), it would raise an exception. For example, if the user is not active or something, we might check, but we assume any logged in user can create items.

List Items Endpoint: Add a route to list items for the current user:

@router.get("/", response_model=list[item_schema.ItemRead])
def list_my_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = item_service.get_items_by_owner(db, owner_id=current_user.id)
    return items


Details:

Method: GET /items/.

It uses the same prefix, so this endpoint and the POST share /items/ but different HTTP methods (this is fine).

Requires authentication (get_current_user).

Fetches all items for that user from the DB.

Returns the list. FastAPI will serialize the list of ORM objects into a list of ItemRead schemas. The response_model=list[ItemRead] tells FastAPI what each item should look like.

Note: If the user has no items, this will return an empty list.

(Optional) Get Single Item Endpoint: If desired, add:

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


This would allow a user to fetch a specific item by ID, but with a check that the item belongs to them (to enforce privacy). We included a 403 Forbidden if a user tries to access someone else’s item.
This endpoint is optional but demonstrates how to handle path parameters and authorization.

Include Router: In backend/app/main.py, include the items router:

from app.api import items
app.include_router(items.router)


Now our main app knows about the item endpoints.

Re-run App: Start the server and open docs. There should be a Items section with:

POST /items/ (create item)

GET /items/ (list items)

(and GET /items/{item_id} if added)
All requiring authorization (they should show the lock icon in docs because they depend on get_current_user).

Testing (Manual):

First, register a user and get a token (via /users/ and /token as before).

Create Item: Do POST /items/ with JSON like {"title": "Sample Item", "description": "This is a test item"} and header Authorization: Bearer <token>. Should return 201 and the item data with an id and owner_id matching your user
neon.com
.

List Items: Do GET /items/ with auth header. Should return a list containing the item just created.

Auth checks: Try calling these endpoints without a token -> should get 401. Try calling GET /items/{id} (if implemented) with someone else’s item ID or with no auth -> should enforce correct status codes.

Testing (Automated): Add tests in backend/tests/test_items_endpoints.py:

We can use the same client fixture from before (which still has the test DB with items table now). We should ensure in tests that the client is authorized with a token from a user, and that user exists in test DB. We might reuse the global token from the auth tests, but since tests may not share state, better to register a user and login within this test sequence or use fixtures to get token.

Maybe we create a fixture user_token that registers a user and logs in, returning the token. But simpler: just do it in the test steps.

Assume tests run sequentially in a fresh test DB (due to our fixture scope=module possibly). Our conftest created the DB and did Base.metadata.create_all, including items now.

If the earlier auth tests ran in same session, they might have created a user "alice". If so, we can reuse that user for items tests.

But to be safe, let's do within item tests:

Create a new user, login to get token, then test item operations with that token.

Or rely on user 'alice' and global ACCESS_TOKEN from previous tests. But global in tests is hacky; better generate here.

Let's do separate to not rely on ordering:

def get_auth_header_for_user(client, username, email, password):
    # helper to register and login, returning auth header
    client.post("/users/", json={"username": username, "email": email, "password": password})
    resp = client.post("/token", data={"username": username, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


Then tests:

Create Item:

def test_create_item(client):
    auth = get_auth_header_for_user(client, "bob", "bob@example.com", "secret")
    # Bob creates an item
    resp = client.post("/items/", json={"title": "Book", "description": "A mystery novel"}, headers=auth)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["title"] == "Book"
    assert data["description"] == "A mystery novel"
    assert data["owner_id"]  # should equal Bob's user id (which is 1 if Bob was first user in test DB)


Save item id for next test (maybe store in global or retrieve via list).

List Items:

def test_list_items(client):
    auth = get_auth_header_for_user(client, "carol", "carol@example.com", "password123")
    # Carol has no items initially
    resp = client.get("/items/", headers=auth)
    assert resp.status_code == 200
    assert resp.json() == []  # no items yet
    # Create an item for Carol
    client.post("/items/", json={"title": "Camera", "description": "DSLR"}, headers=auth)
    client.post("/items/", json={"title": "Tripod", "description": None}, headers=auth)
    # Now list again
    resp2 = client.get("/items/", headers=auth)
    items = resp2.json()
    titles = {item["title"] for item in items}
    assert "Camera" in titles and "Tripod" in titles
    # Each item should have owner_id equal to Carol's id
    for item in items:
        assert item["owner_id"] is not None
    assert len(items) == 2


Auth Required:

def test_items_auth_required(client):
    # No token - should get 401
    resp = client.post("/items/", json={"title": "Unauthorized", "description": "No token"})
    assert resp.status_code == 401
    resp2 = client.get("/items/")
    assert resp2.status_code == 401


Single Item Access (if implemented):

def test_read_single_item(client):
    # Use Bob from previous
    auth_bob = get_auth_header_for_user(client, "bob2", "bob2@example.com", "pass")
    # Create an item for bob2
    resp = client.post("/items/", json={"title": "Phone", "description": "Smartphone"}, headers=auth_bob)
    item_id = resp.json()["id"]
    # Bob2 can get his item
    res = client.get(f"/items/{item_id}", headers=auth_bob)
    assert res.status_code == 200
    assert res.json()["title"] == "Phone"
    # Another user (Carol) should not access Bob2's item
    auth_carol = get_auth_header_for_user(client, "carol2", "carol2@example.com", "pass")
    res2 = client.get(f"/items/{item_id}", headers=auth_carol)
    assert res2.status_code == 403
    # Nonexistent item
    res3 = client.get("/items/999999", headers=auth_bob)
    assert res3.status_code == 404


(This test registers new users bob2 and carol2 separately to ensure isolation and tests the authorization logic.)

Run tests. All should pass:

Test create: returns correct item.

Test list: initially empty, after creating items, returns them.

Auth required: no token yields 401.

Single item: correct user can access, others cannot, 404 on missing.

Note on tests isolation: Our tests created multiple users (bob, carol, etc.) with separate calls to get_auth_header_for_user. Since our TestClient uses an in-memory DB reset at module scope, and each call to get_auth_header registers a new user, those users stay in the same DB unless we refresh it. Because our fixture made the engine at module scope and did Base.metadata.create_all once, the DB persists across all tests in the module. That’s fine as long as we design tests carefully. Each get_auth_header_for_user call uses a new username, so no conflict. The DB is not reset between tests (since we didn't tear down the engine). This is okay for now, but if needed we could drop tables after module or use a function-scope fixture to recreate DB each test. Given our usage, module scope with careful user naming is okay.

By the end of this ticket, we have a full set of item endpoints integrated with auth.

Ticket 15: Final Review and API Documentation

Goal: Verify the completeness of the backend, ensure all pieces are integrated, and that the API documentation (OpenAPI/Swagger UI) correctly reflects the available endpoints and security. Make any final adjustments or fixes discovered in review or testing.

Steps:

Run the Full Application: Start the FastAPI server (e.g., uvicorn app.main:app --reload) and do a final manual test of all endpoints:

Create a new user via /users/ and ensure you get a 201 and correct response.

Log in via /token, get a token.

Access /users/me with token to get profile.

Create an item via /items/ and list items via /items/ (GET).

If implemented, test /items/{id} for an item (with correct and incorrect user).

Try some edge cases: duplicate user registration, wrong password login, accessing protected routes without token, etc. Verify error responses (400, 401, 403, 404, 422) are appropriate.

Check OpenAPI Docs: Open the interactive docs at http://localhost:8000/docs. Confirm:

Organization: There should be sections for Users, Authentication, and Items (as we tagged them).

Schemas: In the docs schema section, UserCreate, UserRead, ItemCreate, ItemRead, Token should be defined with correct fields.

OAuth2 flow: There should be a Authorize button. Clicking it should prompt for a Bearer token. This is wired to our OAuth2PasswordBearer(tokenUrl="token"). Also, the /token endpoint is marked as the token URL (in the OpenAPI JSON, the security scheme references it). This means the Swagger UI knows how to get tokens if it were fully automated (though it doesn’t auto-fetch, but it's documented).

Each protected endpoint (those with get_current_user) should have a padlock icon and the docs should indicate they require a Bearer token. The Swagger UI will allow you to "Authorize" and then try them out.

Verify that the request/response models are correctly documented (no password fields in responses, etc.).

Performance and Clean-up:

Consider enabling CORS (if this API is to be accessed from a frontend on a different domain). You can add FastAPI’s CORSMiddleware in app.main if needed.

Ensure that no secrets (like SECRET_KEY) are hardcoded in code for production. We used .env for SECRET_KEY, etc. In production, load those via environment variables and keep .env out of version control.

Remove any debug print statements or test routes (we didn't have any extra).

Migrations in Repo: Ensure that backend/app/core/migrations/versions/ contains the two migration files (for users and items). These should be checked in so others can run alembic upgrade head to get the schema.

Caveats for Deployment: Document that to run in a new environment, one must:

Set up Postgres and update DATABASE_URL.

Run alembic upgrade head to apply migrations (initial tables).

Possibly create an initial user or get an admin token if needed (not in scope here).

The API is self-documented at /docs (Swagger) and also /openapi.json if needed to generate client code.

Testing: No new automated tests here, this is a sanity check. However, you might write an integration test to simulate a full flow:

Register, login, create item, get item all in one function to mimic a user story. But since we have tests for each part, it's covered.

Finally, congratulate the intern (and ourselves) on completing a fully functional FastAPI backend! The service now supports user registration & login with JWT auth, and a protected items management API, all with proper database integration and testing.