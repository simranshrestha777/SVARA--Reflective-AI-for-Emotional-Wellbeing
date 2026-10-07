from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user_id
from .. import models
from ..ai_service import get_personalized_insight


router = APIRouter(
    prefix="/insights",
    tags=["Insights"],
)


@router.get("/personalized")
def get_personalized_insight_route(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):

    user_id = int(user_id)

    # Get recent mood check-ins
    checkins = (
        db.query(models.MoodCheckIn)
        .filter(models.MoodCheckIn.user_id == user_id)
        .order_by(models.MoodCheckIn.created_at.desc())
        .limit(10)
        .all()
    )

    # Get recent journal entries
    journals = (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user_id)
        .order_by(models.JournalEntry.created_at.desc())
        .limit(5)
        .all()
    )

    # Get recent reflections
    reflections = (
        db.query(models.Reflection)
        .filter(models.Reflection.user_id == user_id)
        .order_by(models.Reflection.created_at.desc())
        .limit(5)
        .all()
    )

    # Don't call AI if the user has no data yet
    if not checkins and not journals and not reflections:
        raise HTTPException(
            status_code=400,
            detail="Not enough personal data yet to generate an insight."
        )

    # Prepare data for Svara AI
    context = {
        "checkins": [
            {
                "mood": checkin.mood,
                "note": checkin.note,
            }
            for checkin in checkins
        ],

        "journals": [
            {
                "title": journal.title,
                "content": journal.content,
            }
            for journal in journals
        ],

        "reflections": [
            {
                "topic": reflection.topic,
                "situation": reflection.situation,
                "feelings": reflection.feelings,
                "needs": reflection.needs,
                "reflection": reflection.reflection,
            }
            for reflection in reflections
        ],
    }

    try:
        insight = get_personalized_insight(context)

        return {
            "insight": insight,
        }

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate personalized insight: {str(e)}"
        )