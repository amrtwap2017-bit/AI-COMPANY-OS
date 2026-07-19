"""
app/agents/message_bus.py
────────────────────────────────────────────────────────────────
Agent-to-Agent Message Bus.

Provides:
  send()      → send a message from one agent to another
  inbox()     → get unread messages for an agent
  reply()     → reply to a specific message
  broadcast() → send to all agents of a department
  mark_read() → mark messages as read
  process()   → mark as processed after action taken

Messages are persisted in PostgreSQL — they survive restarts.
Agents can check their inbox before every task execution.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from sqlalchemy.orm import Session

from app.models.db.agent_message import AgentMessage

log = logging.getLogger(__name__)


@dataclass
class MessageSummary:
    id:           int
    from_agent:   str
    to_agent:     str
    message_type: str
    subject:      str
    body:         str
    payload:      dict | None
    thread_id:    int | None
    reply_to_id:  int | None
    priority:     int
    read:         bool
    processed:    bool
    created_at:   str


class AgentMessageBus:

    def __init__(self, db: Session) -> None:
        self._db = db

    def send(
        self,
        from_agent:   str,
        to_agent:     str,
        subject:      str,
        body:         str,
        message_type: str             = "request",
        payload:      dict | None     = None,
        reply_to_id:  int | None      = None,
        priority:     int             = 3,
    ) -> AgentMessage:
        """Send a message from one agent to another."""
        thread_id = None
        if reply_to_id:
            parent = self._db.query(AgentMessage).filter(
                AgentMessage.id == reply_to_id
            ).first()
            thread_id = parent.thread_id or reply_to_id if parent else None

        msg = AgentMessage(
            from_agent=from_agent,
            to_agent=to_agent,
            message_type=message_type,
            subject=subject,
            body=body,
            payload=payload,
            reply_to_id=reply_to_id,
            thread_id=thread_id,
            priority=priority,
        )
        self._db.add(msg)
        self._db.commit()
        self._db.refresh(msg)

        log.info(
            "Message sent: %s → %s [%s] %r",
            from_agent, to_agent, message_type, subject,
        )
        return msg

    def inbox(
        self,
        agent_name:    str,
        unread_only:   bool = True,
        limit:         int  = 20,
    ) -> list[MessageSummary]:
        """Get messages for an agent."""
        q = self._db.query(AgentMessage).filter(
            AgentMessage.to_agent.in_([agent_name, "all"])
        )
        if unread_only:
            q = q.filter(AgentMessage.read == False)  # noqa: E712

        messages = (
            q.order_by(
                AgentMessage.priority.asc(),
                AgentMessage.created_at.asc(),
            )
            .limit(limit)
            .all()
        )

        return [self._to_summary(m) for m in messages]

    def reply(
        self,
        from_agent:   str,
        reply_to_id:  int,
        body:         str,
        payload:      dict | None = None,
    ) -> AgentMessage | None:
        """Reply to a specific message."""
        original = self._db.query(AgentMessage).filter(
            AgentMessage.id == reply_to_id
        ).first()

        if not original:
            return None

        return self.send(
            from_agent=from_agent,
            to_agent=original.from_agent,
            subject=f"Re: {original.subject}",
            body=body,
            message_type="response",
            payload=payload,
            reply_to_id=reply_to_id,
            priority=original.priority,
        )

    def broadcast(
        self,
        from_agent:   str,
        subject:      str,
        body:         str,
        department:   str | None   = None,
        payload:      dict | None  = None,
        priority:     int          = 3,
    ) -> list[AgentMessage]:
        """
        Broadcast to all agents, or all agents in a department.
        """
        if department:
            from app.agents.registry import AGENTS
            targets = [
                name for name, cfg in AGENTS.items()
                if cfg.get("department") == department
                and name != from_agent
            ]
        else:
            targets = ["all"]   # special broadcast address

        if targets == ["all"]:
            msg = self.send(
                from_agent=from_agent,
                to_agent="all",
                subject=subject,
                body=body,
                message_type="broadcast",
                payload=payload,
                priority=priority,
            )
            return [msg]

        messages = []
        for target in targets:
            msg = self.send(
                from_agent=from_agent,
                to_agent=target,
                subject=subject,
                body=body,
                message_type="broadcast",
                payload=payload,
                priority=priority,
            )
            messages.append(msg)

        return messages

    def mark_read(self, message_ids: list[int], agent_name: str) -> int:
        """Mark messages as read. Returns count updated."""
        updated = (
            self._db.query(AgentMessage)
            .filter(
                AgentMessage.id.in_(message_ids),
                AgentMessage.to_agent.in_([agent_name, "all"]),
            )
            .update({"read": True}, synchronize_session=False)
        )
        self._db.commit()
        return updated

    def mark_processed(self, message_id: int) -> bool:
        """Mark a message as processed after action taken."""
        msg = self._db.query(AgentMessage).filter(
            AgentMessage.id == message_id
        ).first()
        if not msg:
            return False
        msg.read      = True
        msg.processed = True
        self._db.commit()
        return True

    def get_thread(self, thread_id: int) -> list[MessageSummary]:
        """Get all messages in a conversation thread."""
        messages = (
            self._db.query(AgentMessage)
            .filter(AgentMessage.thread_id == thread_id)
            .order_by(AgentMessage.created_at.asc())
            .all()
        )
        return [self._to_summary(m) for m in messages]

    def stats(self, agent_name: str) -> dict:
        """Message statistics for an agent."""
        from sqlalchemy import func
        total = (
            self._db.query(func.count(AgentMessage.id))
            .filter(AgentMessage.to_agent.in_([agent_name, "all"]))
            .scalar() or 0
        )
        unread = (
            self._db.query(func.count(AgentMessage.id))
            .filter(
                AgentMessage.to_agent.in_([agent_name, "all"]),
                AgentMessage.read == False,  # noqa: E712
            )
            .scalar() or 0
        )
        sent = (
            self._db.query(func.count(AgentMessage.id))
            .filter(AgentMessage.from_agent == agent_name)
            .scalar() or 0
        )
        return {
            "agent":       agent_name,
            "total":       total,
            "unread":      unread,
            "sent":        sent,
            "processed":   total - unread,
        }

    def _to_summary(self, msg: AgentMessage) -> MessageSummary:
        return MessageSummary(
            id=msg.id,
            from_agent=msg.from_agent,
            to_agent=msg.to_agent,
            message_type=msg.message_type,
            subject=msg.subject,
            body=msg.body,
            payload=msg.payload,
            thread_id=msg.thread_id,
            reply_to_id=msg.reply_to_id,
            priority=msg.priority,
            read=msg.read,
            processed=msg.processed,
            created_at=msg.created_at.isoformat(),
        )
