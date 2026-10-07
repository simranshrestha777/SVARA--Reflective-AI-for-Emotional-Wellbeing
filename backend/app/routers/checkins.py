from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user_id
from .. import models


router = APIRouter(
    prefix="/checkins",
    tags=["check-ins"],
)


class CheckInRequest(BaseModel):
    mood: str
    intensity: int | None = None
    note: str | None = None

@router.post("")
def create_checkin(
    payload: CheckInRequest,
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

    allowed_moods = {
        "struggling",
        "anxious",
        "frustrated",
        "okay",
        "happy",
    }

    if payload.mood not in allowed_moods:
        raise HTTPException(
            status_code=400,
            detail="Invalid mood",
        )

    checkin = models.MoodCheckIn(
    user_id=user_id_int,
    mood=payload.mood,
    intensity=payload.intensity,
    note=payload.note,
    )

    if payload.intensity is not None:
     if payload.intensity < 1 or payload.intensity > 5:
        raise HTTPException(
            status_code=400,
            detail="Intensity must be between 1 and 5",
        )

    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    return {
        "id": checkin.id,
        "mood": checkin.mood,
        "intensity": checkin.intensity,
        "note": checkin.note,
        "created_at": checkin.created_at,
    }

@router.get("")
def get_checkins(
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

    checkins = (
        db.query(models.MoodCheckIn)
        .filter(
            models.MoodCheckIn.user_id == user_id_int
        )
        .order_by(
            models.MoodCheckIn.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": checkin.id,
            "mood": checkin.mood,
            "intensity": checkin.intensity,
            "note": checkin.note,
            "created_at": checkin.created_at,
        }
        for checkin in checkins
    ]