from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user_id
from .. import models

router = APIRouter(
    prefix="/journal",
    tags=["journal"],
)

class JournalRequest(BaseModel):
    title: str | None = None
    content: str


@router.post("")
def create_journal_entry(
    payload: JournalRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid user",
        )

    if not payload.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Journal entry cannot be empty",
        )

    entry = models.JournalEntry(
        user_id=user_id_int,
        title=payload.title,
        content=payload.content,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "created_at": entry.created_at,
    }

@router.get("")
def get_journal_entries(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid user",
        )

    entries = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.user_id == user_id_int
        )
        .order_by(
            models.JournalEntry.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": entry.id,
            "title": entry.title,
            "content": entry.content,
            "created_at": entry.created_at,
        }
        for entry in entries
    ]

@router.delete("/{entry_id}")
def delete_journal_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid user",
        )

    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == user_id_int,
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found",
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Journal entry deleted"
    }