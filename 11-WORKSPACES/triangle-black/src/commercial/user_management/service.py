"""
User Invitation Service
Allows admin/manager to invite additional users without developer DB access.
Critical for V15: engineering team needs >1 login per organization.
"""
from __future__ import annotations
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text


class UserInvitationService:
    """Manages user invitations for hotel organizations."""

    TOKEN_EXPIRY_HOURS = 48

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id
        self._ensure_table()

    def _ensure_table(self):
        """Create invitations table if not exists."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS user_invitations (
                    id VARCHAR(36) PRIMARY KEY,
                    hotel_id VARCHAR(100) NOT NULL,
                    email VARCHAR(200) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'engineer',
                    name VARCHAR(200),
                    token VARCHAR(200) UNIQUE NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending',
                    created_by VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW(),
                    expires_at TIMESTAMP NOT NULL,
                    accepted_at TIMESTAMP,
                    accepted_user_id VARCHAR(36)
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_invitations_token
                ON user_invitations(token)
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_invitations_hotel
                ON user_invitations(hotel_id, status)
            """))
            self.db.commit()
        except Exception:
            self.db.rollback()

    def send_invitation(
        self,
        email: str,
        role: str = "engineer",
        name: Optional[str] = None,
        created_by: str = "admin",
    ) -> Dict[str, Any]:
        """Create an invitation token for a new user."""
        import uuid

        # Check if email already has a pending invitation for this hotel
        existing = self.db.execute(text("""
            SELECT id, token, expires_at, status FROM user_invitations
            WHERE hotel_id = :h AND email = :email AND status = 'pending'
            AND expires_at > NOW()
            LIMIT 1
        """), {"h": self.hotel_id, "email": email.lower()}).fetchone()

        if existing:
            d = dict(existing._mapping)
            return {
                "success": True,
                "invitation_id": d["id"],
                "token": d["token"],
                "email": email,
                "role": role,
                "expires_at": str(d["expires_at"]),
                "status": "pending",
                "note": "Existing valid invitation returned",
            }

        # Generate secure token
        token = secrets.token_urlsafe(32)
        invitation_id = str(uuid.uuid4())
        now = datetime.utcnow()
        expires_at = now + timedelta(hours=self.TOKEN_EXPIRY_HOURS)

        try:
            self.db.execute(text("""
                INSERT INTO user_invitations
                (id, hotel_id, email, role, name, token, status, created_by, created_at, expires_at)
                VALUES (:id, :h, :email, :role, :name, :token, 'pending', :created_by, :now, :expires)
            """), {
                "id": invitation_id,
                "h": self.hotel_id,
                "email": email.lower(),
                "role": role,
                "name": name or email.split("@")[0].title(),
                "token": token,
                "created_by": created_by,
                "now": now,
                "expires": expires_at,
            })
            self.db.commit()
            return {
                "success": True,
                "invitation_id": invitation_id,
                "token": token,
                "email": email.lower(),
                "role": role,
                "expires_at": expires_at.isoformat(),
                "accept_url": f"/accept-invitation/{token}",
                "expires_in_hours": self.TOKEN_EXPIRY_HOURS,
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:200]}

    def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate an invitation token and return details."""
        row = self.db.execute(text("""
            SELECT id, hotel_id, email, role, name, status, expires_at, created_at
            FROM user_invitations
            WHERE token = :token
            LIMIT 1
        """), {"token": token}).fetchone()

        if not row:
            return {"valid": False, "error": "Invalid invitation token"}

        d = dict(row._mapping)
        if d["status"] != "pending":
            return {"valid": False, "error": f"Invitation already {d['status']}"}
        if d["expires_at"] < datetime.utcnow():
            return {"valid": False, "error": "Invitation has expired"}

        return {
            "valid": True,
            "invitation_id": d["id"],
            "email": d["email"],
            "role": d["role"],
            "name": d["name"],
            "hotel_id": d["hotel_id"],
            "expires_at": str(d["expires_at"]),
        }

    def accept_invitation(
        self,
        token: str,
        password: str,
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Accept an invitation — creates user account, returns JWT."""
        validation = self.validate_token(token)
        if not validation.get("valid"):
            return {"success": False, "error": validation.get("error", "Invalid token")}

        import uuid
        from src.core.auth import create_access_token, hash_password

        email = validation["email"]
        role = validation["role"]
        user_name = name or validation.get("name") or email.split("@")[0].title()
        hotel_id = validation["hotel_id"]
        user_id = str(uuid.uuid4())
        now = datetime.utcnow()

        try:
            # Hash password using bcrypt (same as onboarding/service.py)
            hashed_pw = hash_password(password)

            # Check if user already exists
            existing_user = self.db.execute(text(
                "SELECT id FROM users WHERE email = :email LIMIT 1"
            ), {"email": email}).fetchone()

            if existing_user:
                user_id = dict(existing_user._mapping)["id"]
            else:
                # EXACT same pattern as onboarding/service.py line 62-71
                self.db.execute(text(
                    "INSERT INTO users "
                    "(id, hotel_id, email, hashed_password, name, role, is_active, created_at, updated_at) "
                    "VALUES (:id, :hid, :email, :pw, :name, :role, true, NOW(), NOW())"
                ), {
                    "id": user_id,
                    "hid": hotel_id,
                    "email": email,
                    "pw": hashed_pw,
                    "name": user_name,
                    "role": role,
                })

            # Mark invitation as accepted
            self.db.execute(text(
                "UPDATE user_invitations "
                "SET status = 'accepted', accepted_at = :now, accepted_user_id = :uid "
                "WHERE token = :token"
            ), {"now": now, "uid": user_id, "token": token})

            self.db.commit()

            access_token = create_access_token(
                user_id=user_id,
                email=email,
                role=role,
                hotel_id=hotel_id
            )

            return {
                "success": True,
                "user_id": user_id,
                "email": email,
                "name": user_name,
                "role": role,
                "hotel_id": hotel_id,
                "access_token": access_token,
                "token_type": "bearer",
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:300]}

    def list_invitations(self, include_expired: bool = False) -> list:
        """List invitations for this hotel."""
        where = "WHERE hotel_id = :h"
        if not include_expired:
            where += " AND (status = 'pending' AND expires_at > NOW() OR status = 'accepted')"

        rows = self.db.execute(text(f"""
            SELECT id, email, role, name, status, created_by, created_at, expires_at, accepted_at
            FROM user_invitations
            {where}
            ORDER BY created_at DESC
            LIMIT 50
        """), {"h": self.hotel_id}).fetchall()

        return [dict(r._mapping) for r in rows]
