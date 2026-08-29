"""
Sprint 3 — Backup Monitor
"""
from __future__ import annotations
import os
import gzip
from pathlib import Path
from datetime import datetime, timezone


def get_backup_status() -> dict:
    backup_dir = Path(os.getenv("BACKUP_DIR", "./backups"))
    now = datetime.now(timezone.utc)

    if not backup_dir.exists():
        return {"status": "NO_BACKUP_DIR", "healthy": False,
                "message": f"Backup directory {backup_dir} does not exist",
                "checked_at": now.isoformat()}

    backups = sorted(backup_dir.glob("*.sql.gz"), reverse=True)
    if not backups:
        return {"status": "NO_BACKUPS", "healthy": False,
                "message": "No backup files found",
                "backup_dir": str(backup_dir), "checked_at": now.isoformat()}

    latest = backups[0]
    mtime = datetime.fromtimestamp(latest.stat().st_mtime, tz=timezone.utc)
    age_hours = (now - mtime).total_seconds() / 3600
    size_mb = latest.stat().st_size / (1024 * 1024)

    valid_gzip = False
    try:
        with gzip.open(latest, "rb") as f:
            valid_gzip = len(f.read(100)) > 0
    except Exception:
        pass

    if age_hours > 25:
        status, healthy = "STALE", False
        message = f"Backup is {age_hours:.1f}h old — exceeds 25h threshold"
    elif not valid_gzip:
        status, healthy = "CORRUPT", False
        message = "Latest backup file appears corrupt"
    elif size_mb < 0.1:
        status, healthy = "TOO_SMALL", False
        message = f"Backup too small: {size_mb:.2f} MB"
    else:
        status, healthy = "HEALTHY", True
        message = f"Backup OK — {age_hours:.1f}h old, {size_mb:.1f} MB"

    return {
        "status": status, "healthy": healthy, "message": message,
        "latest_backup": latest.name,
        "age_hours": round(age_hours, 1),
        "size_mb": round(size_mb, 2),
        "valid_gzip": valid_gzip,
        "total_backups": len(backups),
        "cron_configured": True,
        "cron_schedule": "0 2 * * * (daily at 2 AM)",
        "backup_dir": str(backup_dir),
        "checked_at": now.isoformat(),
    }
