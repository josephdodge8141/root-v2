from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import database
from app.api import users, auth, items

app = FastAPI(
    title="Backend API",
    version="1.0.0",
    description="API for the backend service",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.auth_router)
app.include_router(items.router)

@app.get("/")
def root():
    return {"message": "Backend API", "version": "1.0.0"}