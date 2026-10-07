from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user_id
from .. import models

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)


@router.get("")
def get_conversations(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    conversations = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.user_id == int(user_id)
        )
        .order_by(
            models.Conversation.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
        }
        for conversation in conversations
    ]

@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
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
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    messages = (
        db.query(models.Message)
        .filter(
            models.Message.conversation_id == conversation.id
        )
        .order_by(
            models.Message.created_at
        )
        .all()
    )

    return {
        "id": conversation.id,
        "title": conversation.title,
        "messages": [
            {
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at,
            }
            for message in messages
        ],
    }

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
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
            detail="Conversation not found",
        )

    db.delete(conversation)
    db.commit()

    return {"message": "Conversation deleted successfully"}