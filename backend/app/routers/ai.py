from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user_id
from ..ai_service import (
    get_ai_response,
    generate_conversation_title,
)
from .. import models
from ..safety_service import analyze_safety
from ..helpline_service import get_crisis_resources


router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)


class ChatRequest(BaseModel):
    conversation_id: int
    message: str


@router.post("/chat")
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user_id_int = int(user_id)

    # -----------------------------------
    # 1. FIND CONVERSATION
    # -----------------------------------

    conversation = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.id == payload.conversation_id,
            models.Conversation.user_id == user_id_int,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    # -----------------------------------
    # 2. GET CURRENT USER
    # -----------------------------------

    current_user = (
        db.query(models.User)
        .filter(
            models.User.id == user_id_int
        )
        .first()
    )

    if not current_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # -----------------------------------
    # 3. ANALYZE MESSAGE FOR SAFETY
    # -----------------------------------

    safety_result = analyze_safety(
        payload.message
    )

    # -----------------------------------
    # 4. GET COUNTRY-BASED RESOURCES
    # -----------------------------------

    crisis_resources = None

    if (
        safety_result["risk_level"] == "high"
        and safety_result["category"] == "self_harm"
    ):
        crisis_resources = get_crisis_resources(
            current_user.country
        )

    # -----------------------------------
    # 5. SAVE USER MESSAGE
    # -----------------------------------

    user_msg = models.Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
    )

    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # -----------------------------------
    # 6. CREATE SAFETY EVENT
    # -----------------------------------

    if safety_result["risk_level"] in [
        "medium",
        "high",
    ]:
        safety_event = models.SafetyEvent(
            user_id=user_id_int,
            risk_level=safety_result["risk_level"],
            category=safety_result["category"],
            matched_phrase=safety_result["matched_phrase"],
            country=current_user.country,
            region=current_user.region,
        )

        db.add(safety_event)
        db.commit()
        db.refresh(safety_event)

        print(
            "SAFETY EVENT CREATED:",
            safety_event.id,
            safety_event.risk_level,
            safety_event.category,
            safety_event.country,
            safety_event.region,
        )

    # -----------------------------------
    # 7. BUILD CONVERSATION HISTORY
    # -----------------------------------

    past_messages = (
        db.query(models.Message)
        .filter(
            models.Message.conversation_id
            == conversation.id
        )
        .order_by(
            models.Message.created_at
        )
        .all()
    )

    history = [
        {
            "role": m.role,
            "content": m.content,
        }
        for m in past_messages[:-1]
    ]

    # -----------------------------------
    # 8. GET AI RESPONSE
    # -----------------------------------

    try:
        ai_reply = get_ai_response(
            payload.message,
            history=history,
        )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {str(e)}",
        )

    # -----------------------------------
    # 9. SAVE AI RESPONSE
    # -----------------------------------

    ai_msg = models.Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_reply,
    )

    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    # -----------------------------------
    # 10. GENERATE CONVERSATION TITLE
    # -----------------------------------

    if conversation.title == "New conversation":

        try:
            generated_title = (
                generate_conversation_title(
                    payload.message
                )
            )

            if generated_title:
                conversation.title = generated_title

                db.add(conversation)
                db.commit()
                db.refresh(conversation)

                print(
                    "SAVED TITLE:",
                    conversation.id,
                    conversation.title,
                )

        except Exception as e:
            print(
                "TITLE GENERATION ERROR:",
                e,
            )

    # -----------------------------------
    # 11. RETURN RESPONSE
    # -----------------------------------

    return {
        "reply": ai_reply,
        "title": conversation.title,
        "safety": {
            "risk_level": safety_result["risk_level"],
            "category": safety_result["category"],
        },
        "crisis_resources": crisis_resources,
    }