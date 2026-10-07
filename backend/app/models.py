from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    country = Column(String(100),nullable=True)
    region = Column(String(100),nullable=True)

    is_admin = Column(
    Boolean,
    nullable=False,
    default=False,
    )
    

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    reflections = relationship(
    "Reflection",
    back_populates="user",
    cascade="all, delete-orphan",
    )

    mood_checkins = relationship(
    "MoodCheckIn",
    back_populates="user",
    cascade="all, delete-orphan",
)

    journal_entries = relationship(
    "JournalEntry",
    back_populates="user",
    cascade="all, delete-orphan",
)

    safety_events = relationship(
    "SafetyEvent",
    back_populates="user",
    cascade="all, delete-orphan",
)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="conversations",
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False,
        index=True,
    )

    role = Column(
        String(20),
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )

class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    topic = Column(
        String(100),
        nullable=False,
    )

    situation = Column(
        Text,
        nullable=False,
    )

    feelings = Column(
        Text,
        nullable=False,
    )

    needs = Column(
        Text,
        nullable=False,
    )

    reflection = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="reflections",
    )

class MoodCheckIn(Base):
    __tablename__ = "mood_checkins"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    mood = Column(
        String(50),
        nullable=False,
    )

    intensity = Column(
    Integer,
    nullable=True,
    )

    note = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="mood_checkins",
    )

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="journal_entries",
    )

class SafetyEvent(Base):
    __tablename__ = "safety_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    risk_level = Column(
        String(20),
        nullable=False,
    )

    category = Column(
        String(100),
        nullable=True,
    )

    matched_phrase = Column(
        String(255),
        nullable=True,
    )

    country = Column(
        String(100),
        nullable=True,
    )

    region = Column(
        String(100),
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="new",
    )

    admin_note = Column(
        Text,
        nullable=True,
    )

    reviewed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="safety_events",
    )

class SafetyEscalation(Base):
    __tablename__ = "safety_escalations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    safety_event_id = Column(
        Integer,
        ForeignKey("safety_events.id"),
        nullable=False,
        index=True,
    )

    admin_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    country = Column(
        String(100),
        nullable=True,
    )

    region = Column(
        String(100),
        nullable=True,
    )

    resource_name = Column(
        String(255),
        nullable=True,
    )

    resource_type = Column(
        String(100),
        nullable=True,
    )

    contact = Column(
        String(255),
        nullable=True,
    )

    communication_status = Column(
        String(30),
        nullable=False,
        default="prepared",
    )

    admin_note = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )