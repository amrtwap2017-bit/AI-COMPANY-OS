"""
app/api/v1/routes/messages.py
Agent-to-agent messaging endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.agents.message_bus import AgentMessageBus

router = APIRouter()


def get_bus(db: Session = Depends(get_db)) -> AgentMessageBus:
    return AgentMessageBus(db)


class SendMessageRequest(BaseModel):
    from_agent:   str
    to_agent:     str
    subject:      str
    body:         str
    message_type: str             = "request"
    payload:      dict | None     = None
    reply_to_id:  int | None      = None
    priority:     int             = 3


class BroadcastRequest(BaseModel):
    from_agent:  str
    subject:     str
    body:        str
    department:  str | None  = None
    payload:     dict | None = None
    priority:    int         = 3


class ReplyRequest(BaseModel):
    from_agent: str
    body:       str
    payload:    dict | None = None


def _msg_to_dict(m) -> dict:
    return {
        "id":           m.id,
        "from":         m.from_agent,
        "to":           m.to_agent,
        "type":         m.message_type,
        "subject":      m.subject,
        "body":         m.body,
        "payload":      m.payload,
        "thread_id":    m.thread_id,
        "reply_to_id":  m.reply_to_id,
        "priority":     m.priority,
        "read":         m.read,
        "processed":    m.processed,
        "created_at":   m.created_at,
    }


@router.post("/messages/send")
def send_message(
    req: SendMessageRequest,
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Send a message from one agent to another."""
    msg = bus.send(
        from_agent=req.from_agent,
        to_agent=req.to_agent,
        subject=req.subject,
        body=req.body,
        message_type=req.message_type,
        payload=req.payload,
        reply_to_id=req.reply_to_id,
        priority=req.priority,
    )
    return {"message_id": msg.id, "status": "sent"}


@router.get("/messages/inbox/{agent_name}")
def get_inbox(
    agent_name:  str,
    unread_only: bool = Query(default=True),
    limit:       int  = Query(default=20, ge=1, le=100),
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Get messages for an agent."""
    messages = bus.inbox(agent_name, unread_only=unread_only, limit=limit)
    return {
        "agent":    agent_name,
        "count":    len(messages),
        "messages": [_msg_to_dict(m) for m in messages],
    }


@router.post("/messages/{message_id}/reply")
def reply_to_message(
    message_id: int,
    req: ReplyRequest,
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Reply to a specific message."""
    msg = bus.reply(
        from_agent=req.from_agent,
        reply_to_id=message_id,
        body=req.body,
        payload=req.payload,
    )
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message_id": msg.id, "status": "sent"}


@router.post("/messages/broadcast")
def broadcast_message(
    req: BroadcastRequest,
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Broadcast a message to all agents or a department."""
    messages = bus.broadcast(
        from_agent=req.from_agent,
        subject=req.subject,
        body=req.body,
        department=req.department,
        payload=req.payload,
        priority=req.priority,
    )
    return {"sent_count": len(messages), "status": "broadcast"}


@router.post("/messages/{message_id}/read")
def mark_read(
    message_id: int,
    agent_name: str = Query(...),
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Mark a message as read."""
    updated = bus.mark_read([message_id], agent_name)
    return {"updated": updated}


@router.post("/messages/{message_id}/processed")
def mark_processed(
    message_id: int,
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Mark a message as processed."""
    ok = bus.mark_processed(message_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"processed": True}


@router.get("/messages/thread/{thread_id}")
def get_thread(
    thread_id: int,
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Get all messages in a conversation thread."""
    messages = bus.get_thread(thread_id)
    return {"thread_id": thread_id, "count": len(messages), "messages": [_msg_to_dict(m) for m in messages]}


@router.get("/messages/stats/{agent_name}")
def agent_stats(
    agent_name: str,
    bus: AgentMessageBus = Depends(get_bus),
) -> dict:
    """Message statistics for an agent."""
    return bus.stats(agent_name)
