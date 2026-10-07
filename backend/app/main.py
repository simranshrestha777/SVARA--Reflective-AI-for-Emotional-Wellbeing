from .schemas import UserCreate, UserLogin, UserResponse, Token
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from . import models
from .database import Base, engine, get_db
from .ai_service import get_ai_response
from .routers import ai
from .routers import reflections
from .routers import checkins
from .routers import journal
from .routers import admin
from .schemas import (
    ConversationCreate,
    MessageCreate,
    ConversationResponse,
)
from .auth import (
    create_access_token,
    decode_access_token,
    get_current_user_id,
    hash_password,
    verify_password,
)
from .routers import conversations
from .routers import insights

# 1. Create the app first
app = FastAPI(title="Svara API")

# 2. Add middleware
import os

# Allowed frontend origins. Set CORS_ORIGINS on the host, comma-separated,
# e.g. https://svara-demo.vercel.app
_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174"
)
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Create DB tables
Base.metadata.create_all(bind=engine)

# 4. Include routers
app.include_router(ai.router)
app.include_router(conversations.router)
app.include_router(reflections.router)
app.include_router(checkins.router)
app.include_router(journal.router)
app.include_router(insights.router)
app.include_router(admin.router)

# 5. Now define your routes (@app.get, @app.post, etc.)

@app.get("/")
def root():
    return {
        "message": "Svara API is running"
    }


@app.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        country=user.country,
        region=user.region,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post(
    "/auth/login",
    response_model=Token,
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        user.password,
        existing_user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    access_token = create_access_token({
        "sub": str(existing_user.id),
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@app.get(
    "/auth/me",
    response_model=UserResponse,
)
def get_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    current_user = (
        db.query(models.User)
        .filter(models.User.id == int(user_id))
        .first()
    )

    if not current_user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return current_user

@app.post(
    "/conversations",
    response_model=ConversationResponse,
)
def create_conversation(
    conversation: ConversationCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    new_conversation = models.Conversation(
        user_id=int(user_id),
        title=conversation.title,
    )

    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    return new_conversation

@app.post(
    "/conversations/{conversation_id}/messages",
)
def send_message(
    conversation_id: int,
    message: MessageCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.id == conversation_id,
            models.Conversation.user_id == int(user_id),
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    new_message = models.Message(
        conversation_id=conversation_id,
        role="user",
        content=message.content,
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message

@app.post("/ai/test")
def test_ai(message: MessageCreate):
    response = get_ai_response(message.content)
    return {"response": response}