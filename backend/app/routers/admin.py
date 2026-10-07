from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..auth import get_current_user_id
from .. import models
from datetime import datetime, timezone
from ..helpline_service import get_crisis_resources

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)


def get_current_admin(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    current_user = (
        db.query(models.User)
        .filter(
            models.User.id == int(user_id)
        )
        .first()
    )

    if not current_user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )

    return current_user


@router.get("/safety-events")
def get_safety_events(
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    events = (
        db.query(models.SafetyEvent)
        .order_by(
            models.SafetyEvent.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": event.id,
            "user_id": event.user_id,
            "risk_level": event.risk_level,
            "category": event.category,
            "matched_phrase": event.matched_phrase,
            "country": event.country,
            "region": event.region,
            "status": event.status,
            "admin_note": event.admin_note,
            "reviewed_at": event.reviewed_at,
            "created_at": event.created_at,
        }
        for event in events
    ]


@router.get("/safety-events/high-risk")
def get_high_risk_events(
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    events = (
        db.query(models.SafetyEvent)
        .filter(
            models.SafetyEvent.risk_level == "high"
        )
        .order_by(
            models.SafetyEvent.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": event.id,
            "user_id": event.user_id,
            "risk_level": event.risk_level,
            "category": event.category,
            "matched_phrase": event.matched_phrase,
            "country": event.country,
            "region": event.region,
            "status": event.status,
            "admin_note": event.admin_note,
            "reviewed_at": event.reviewed_at,
            "created_at": event.created_at,
        }
        for event in events
    ]

@router.get("/analytics/overview")
def get_analytics_overview(
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(
        func.count(models.User.id)
    ).scalar()

    total_safety_events = db.query(
        func.count(models.SafetyEvent.id)
    ).scalar()

    high_risk_events = (
        db.query(
            func.count(models.SafetyEvent.id)
        )
        .filter(
            models.SafetyEvent.risk_level == "high"
        )
        .scalar()
    )

    medium_risk_events = (
        db.query(
            func.count(models.SafetyEvent.id)
        )
        .filter(
            models.SafetyEvent.risk_level == "medium"
        )
        .scalar()
    )

    return {
        "total_users": total_users,
        "total_safety_events": total_safety_events,
        "high_risk_events": high_risk_events,
        "medium_risk_events": medium_risk_events,
    }


@router.get("/analytics/countries")
def get_country_analytics(
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            models.SafetyEvent.country,
            func.count(models.SafetyEvent.id).label(
                "event_count"
            ),
        )
        .group_by(
            models.SafetyEvent.country
        )
        .order_by(
            func.count(models.SafetyEvent.id).desc()
        )
        .all()
    )

    return [
        {
            "country": country or "Unknown",
            "event_count": event_count,
        }
        for country, event_count in results
    ]


@router.get("/analytics/regions")
def get_region_analytics(
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            models.SafetyEvent.country,
            models.SafetyEvent.region,
            func.count(models.SafetyEvent.id).label(
                "event_count"
            ),
        )
        .group_by(
            models.SafetyEvent.country,
            models.SafetyEvent.region,
        )
        .order_by(
            func.count(models.SafetyEvent.id).desc()
        )
        .all()
    )

    return [
        {
            "country": country or "Unknown",
            "region": region or "Unknown",
            "event_count": event_count,
        }
        for country, region, event_count in results
    ]


@router.get("/analytics/risk-levels")
def get_risk_level_analytics(
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            models.SafetyEvent.risk_level,
            func.count(models.SafetyEvent.id).label(
                "event_count"
            ),
        )
        .group_by(
            models.SafetyEvent.risk_level
        )
        .order_by(
            func.count(models.SafetyEvent.id).desc()
        )
        .all()
    )

    return [
        {
            "risk_level": risk_level,
            "event_count": event_count,
        }
        for risk_level, event_count in results
    ]

@router.post("/safety-events/{event_id}/escalate")
def escalate_safety_event(
    event_id: int,
    admin_note: str | None = None,
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    event = (
        db.query(models.SafetyEvent)
        .filter(models.SafetyEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Safety event not found.",
        )

    if event.risk_level != "high":
        raise HTTPException(
            status_code=400,
            detail="Only high-risk events can be escalated.",
        )

    # Get country-specific crisis resources
    resources = get_crisis_resources(event.country)

    helplines = resources.get("helplines", [])

    resource_name = None
    resource_type = None
    contact = None

    if helplines:
        first_resource = helplines[0]

        resource_name = first_resource.get("name")
        resource_type = first_resource.get("type")
        contact = first_resource.get("number")

    escalation = models.SafetyEscalation(
        safety_event_id=event.id,
        admin_id=admin_user.id,
        country=event.country,
        region=event.region,
        resource_name=resource_name,
        resource_type=resource_type,
        contact=contact,
        communication_status="prepared",
        admin_note=admin_note,
    )

    db.add(escalation)

    # Update the original safety event
    event.status = "escalated"
    event.admin_note = admin_note
    event.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(escalation)

    return {
        "id": escalation.id,
        "safety_event_id": escalation.safety_event_id,
        "country": escalation.country,
        "region": escalation.region,
        "resource_name": escalation.resource_name,
        "resource_type": escalation.resource_type,
        "contact": escalation.contact,
        "communication_status": escalation.communication_status,
        "admin_note": escalation.admin_note,
    }


@router.patch("/safety-events/{event_id}")
def update_safety_event(
    event_id: int,
    status: str,
    admin_note: str | None = None,
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    event = (
        db.query(models.SafetyEvent)
        .filter(models.SafetyEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Safety event not found.",
        )

    event.status = status

    if admin_note is not None:
        event.admin_note = admin_note

    event.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(event)

    return {
        "id": event.id,
        "status": event.status,
        "admin_note": event.admin_note,
        "reviewed_at": event.reviewed_at,
    }
