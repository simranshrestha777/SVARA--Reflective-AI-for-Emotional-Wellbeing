from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user_id
from ..ai_service import get_reflection_response
from .. import models


router = APIRouter(
    prefix="/reflections",
    tags=["reflections"],
)


class ReflectionRequest(BaseModel):
    topic: str
    situation: str
    feelings: str
    needs: str


@router.post("")
def create_reflection(
    payload: ReflectionRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid user"
        )

    try:
        reflection_text = get_reflection_response(
            topic=payload.topic,
            situation=payload.situation,
            feelings=payload.feelings,
            needs=payload.needs,
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {str(e)}",
        )

    reflection = models.Reflection(
        user_id=user_id_int,
        topic=payload.topic,
        situation=payload.situation,
        feelings=payload.feelings,
        needs=payload.needs,
        reflection=reflection_text,
    )

    db.add(reflection)
    db.commit()
    db.refresh(reflection)

    return {
        "id": reflection.id,
        "topic": reflection.topic,
        "reflection": reflection.reflection,
        "created_at": reflection.created_at,
    }

@router.get("")
def get_reflections(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    reflections = (
        db.query(models.Reflection)
        .filter(models.Reflection.user_id == int(user_id))
        .order_by(models.Reflection.created_at.desc())
        .all()
    )

    return reflections