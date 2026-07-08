"""
Triangle Black — Seed Data
Realistic hotel engineering leads, agents, quotes for demo
"""
import uuid
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from src.core.database import SessionLocal
from src.core.base import Base
from src.commercial.lead_management.models import Lead
from src.commercial.agent_management.models import Agent
from src.commercial.quotation.models import Quote
from src.commercial.activity_tracking.models import Activity
from src.commercial.auth.models import User
from src.commercial.reporting.models import Report


def _id():
    return str(uuid.uuid4())


def _hash(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def _now():
    return datetime.utcnow()


def _ago(days):
    return datetime.utcnow() - timedelta(days=days)


def seed():
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 1:
        print("Already seeded. Skipping.")
        db.close()
        return

    print("Seeding Triangle Black demo data...")

    # ═══════════════════════════════════════════════════════════
    # USERS
    # ═══════════════════════════════════════════════════════════
    users = {
        "admin": User(id=_id(), name="Amr Mostafa", email="amr@triangleblack.com",
                       hashed_password=_hash("Admin123!"), role="admin", is_active=True,
                       created_at=_ago(90), updated_at=_now()),
        "manager": User(id=_id(), name="Sara Ahmed", email="sara@triangleblack.com",
                         hashed_password=_hash("Manager123!"), role="manager", is_active=True,
                         created_at=_ago(60), updated_at=_now()),
        "agent1": User(id=_id(), name="Hassan Ali", email="hassan@triangleblack.com",
                        hashed_password=_hash("Agent123!"), role="agent", is_active=True,
                        created_at=_ago(45), updated_at=_now()),
        "agent2": User(id=_id(), name="Mona Khalil", email="mona@triangleblack.com",
                        hashed_password=_hash("Agent123!"), role="agent", is_active=True,
                        created_at=_ago(30), updated_at=_now()),
    }
    for u in users.values():
        db.add(u)
    print(f"  ✓ {len(users)} users")

    # ═══════════════════════════════════════════════════════════
    # AGENTS
    # ═══════════════════════════════════════════════════════════
    agents = {
        "hassan": Agent(id=_id(), name="Hassan Ali", email="hassan@triangleblack.com",
                        phone="+20100123456", max_leads=15, current_leads=4,
                        is_active=True, created_at=_ago(45), updated_at=_now()),
        "mona": Agent(id=_id(), name="Mona Khalil", email="mona@triangleblack.com",
                      phone="+20111234567", max_leads=12, current_leads=3,
                      is_active=True, created_at=_ago(30), updated_at=_now()),
        "karim": Agent(id=_id(), name="Karim Youssef", email="karim@triangleblack.com",
                       phone="+20122345678", max_leads=10, current_leads=2,
                       is_active=True, created_at=_ago(20), updated_at=_now()),
    }
    for a in agents.values():
        db.add(a)
    print(f"  ✓ {len(agents)} agents")

    # ═══════════════════════════════════════════════════════════
    # LEADS — 15 realistic hotel leads
    # ═══════════════════════════════════════════════════════════
    leads_data = [
        # Converted (won)
        {"name": "Marriott Sharm El Sheikh", "email": "eng@marriott-sharm.com", "company": "Marriott Hotels",
         "phone": "+20693601000", "source": "referral", "priority": "high",
         "notes": "Need HVAC and electrical maintenance for 450 room resort. 5-star property.",
         "status": "converted", "score": 95, "days_ago": 45},

        {"name": "Hilton Hurghada Resort", "email": "facilities@hilton-hurghada.com", "company": "Hilton Hotels",
         "phone": "+20653400000", "source": "direct", "priority": "high",
         "notes": "Full engineering services. HVAC, plumbing, fire systems. 380 rooms.",
         "status": "converted", "score": 90, "days_ago": 30},

        {"name": "Four Seasons Cairo", "email": "engineering@fourseasons-cairo.com", "company": "Four Seasons",
         "phone": "+20227917000", "source": "referral", "priority": "high",
         "notes": "Premium HVAC maintenance contract. Kitchen and laundry equipment also needed.",
         "status": "converted", "score": 100, "days_ago": 60},

        # Assigned (in progress)
        {"name": "Steigenberger El Gouna", "email": "tech@steigenberger-gouna.com", "company": "Steigenberger",
         "phone": "+20653580000", "source": "web", "priority": "high",
         "notes": "Electrical systems upgrade. 280 rooms. Pool systems maintenance needed.",
         "status": "assigned", "score": 85, "days_ago": 10},

        {"name": "Sofitel Winter Palace Luxor", "email": "facilities@sofitel-luxor.com", "company": "Sofitel/Accor",
         "phone": "+20952380422", "source": "referral", "priority": "high",
         "notes": "Heritage property. HVAC modernization. Careful approach required.",
         "status": "assigned", "score": 80, "days_ago": 7},

        {"name": "Rixos Alamein", "email": "engineering@rixos-alamein.com", "company": "Rixos Hotels",
         "phone": "+20463500000", "source": "direct", "priority": "medium",
         "notes": "General engineering maintenance. 350 rooms. Water systems focus.",
         "status": "assigned", "score": 70, "days_ago": 5},

        {"name": "Kempinski Soma Bay", "email": "tech@kempinski-soma.com", "company": "Kempinski",
         "phone": "+20653250000", "source": "web", "priority": "medium",
         "notes": "Procurement services for kitchen equipment. Energy audit requested.",
         "status": "assigned", "score": 65, "days_ago": 3},

        # Qualified (scored, not yet assigned)
        {"name": "JW Marriott Cairo", "email": "eng@jwmarriott-cairo.com", "company": "Marriott",
         "phone": "+20227283000", "source": "referral", "priority": "high",
         "notes": "HVAC preventive maintenance. Fire fighting system inspection.",
         "status": "qualified", "score": 90, "days_ago": 4},

        {"name": "Hyatt Regency Cairo", "email": "facilities@hyatt-cairo.com", "company": "Hyatt Hotels",
         "phone": "+20227401234", "source": "direct", "priority": "medium",
         "notes": "Plumbing overhaul needed. Guest room renovation support.",
         "status": "qualified", "score": 75, "days_ago": 2},

        {"name": "Oberoi Sahl Hasheesh", "email": "eng@oberoi-sahl.com", "company": "Oberoi Hotels",
         "phone": "+20653400500", "source": "referral", "priority": "high",
         "notes": "Full engineering assessment. Luxury resort, 140 rooms.",
         "status": "qualified", "score": 85, "days_ago": 1},

        # New (just captured)
        {"name": "Sheraton Soma Bay", "email": "info@sheraton-soma.com", "company": "Sheraton",
         "phone": None, "source": "web", "priority": "medium",
         "notes": "Inquiry about HVAC maintenance pricing.", "status": "new", "score": 0, "days_ago": 1},

        {"name": "InterContinental Citystars", "email": "eng@ic-citystars.com", "company": "IHG",
         "phone": "+20224800000", "source": "web", "priority": "low",
         "notes": None, "status": "new", "score": 0, "days_ago": 0},

        {"name": "Savoy Sharm", "email": "maintenance@savoy-sharm.com", "company": "Savoy Group",
         "phone": "+20693602800", "source": "direct", "priority": "medium",
         "notes": "Electrical audit request for 500 room property.", "status": "new", "score": 0, "days_ago": 0},

        # Lost
        {"name": "Sunrise Royal Makadi", "email": "tech@sunrise-makadi.com", "company": "Sunrise Hotels",
         "phone": "+20653590000", "source": "web", "priority": "low",
         "notes": "Budget was too low. Went with competitor.", "status": "lost", "score": 35, "days_ago": 20},

        {"name": "Albatros Palace Hurghada", "email": "eng@albatros-palace.com", "company": "Pickalbatros",
         "phone": None, "source": "web", "priority": "low",
         "notes": "No response after initial contact.", "status": "lost", "score": 20, "days_ago": 15},
    ]

    lead_objs = {}
    for ld in leads_data:
        days = ld.pop("days_ago")
        lead = Lead(
            id=_id(), created_at=_ago(days), updated_at=_now(), **ld,
        )
        db.add(lead)
        lead_objs[ld["name"]] = lead
    print(f"  ✓ {len(leads_data)} leads")

    # ═══════════════════════════════════════════════════════════
    # QUOTES — linked to converted/assigned leads
    # ═══════════════════════════════════════════════════════════
    db.flush()  # ensure lead IDs exist

    quotes_data = [
        {"lead_name": "Marriott Sharm El Sheikh", "title": "HVAC + Electrical — Marriott Sharm",
         "total": 126000.0, "status": "approved",
         "items": [
             {"service": "HVAC Maintenance", "qty": 12, "unit_price": 4200, "total": 50400},
             {"service": "Electrical Systems", "qty": 12, "unit_price": 3360, "total": 40320},
             {"service": "General Engineering", "qty": 12, "unit_price": 2940, "total": 35280},
         ]},
        {"lead_name": "Hilton Hurghada Resort", "title": "Full Engineering — Hilton Hurghada",
         "total": 180000.0, "status": "approved",
         "items": [
             {"service": "HVAC Maintenance", "qty": 12, "unit_price": 4500, "total": 54000},
             {"service": "Plumbing Systems", "qty": 12, "unit_price": 3000, "total": 36000},
             {"service": "Fire Fighting", "qty": 12, "unit_price": 2500, "total": 30000},
             {"service": "General Engineering", "qty": 12, "unit_price": 5000, "total": 60000},
         ]},
        {"lead_name": "Four Seasons Cairo", "title": "Premium Engineering — Four Seasons",
         "total": 252000.0, "status": "approved",
         "items": [
             {"service": "HVAC Maintenance", "qty": 12, "unit_price": 6000, "total": 72000},
             {"service": "Kitchen Equipment", "qty": 12, "unit_price": 5000, "total": 60000},
             {"service": "Laundry Systems", "qty": 12, "unit_price": 4000, "total": 48000},
             {"service": "General Engineering", "qty": 12, "unit_price": 6000, "total": 72000},
         ]},
        {"lead_name": "Steigenberger El Gouna", "title": "Electrical + Pool — Steigenberger",
         "total": 78000.0, "status": "sent",
         "items": [
             {"service": "Electrical Systems", "qty": 12, "unit_price": 3500, "total": 42000},
             {"service": "Pool Systems", "qty": 12, "unit_price": 3000, "total": 36000},
         ]},
        {"lead_name": "Sofitel Winter Palace Luxor", "title": "HVAC Modernization — Sofitel Luxor",
         "total": 96000.0, "status": "review",
         "items": [
             {"service": "HVAC Modernization", "qty": 12, "unit_price": 5000, "total": 60000},
             {"service": "General Engineering", "qty": 12, "unit_price": 3000, "total": 36000},
         ]},
        {"lead_name": "Rixos Alamein", "title": "General + Water — Rixos Alamein",
         "total": 66000.0, "status": "draft",
         "items": [
             {"service": "Water Systems", "qty": 12, "unit_price": 2500, "total": 30000},
             {"service": "General Engineering", "qty": 12, "unit_price": 3000, "total": 36000},
         ]},
    ]

    for qd in quotes_data:
        lead = lead_objs.get(qd["lead_name"])
        quote = Quote(
            id=_id(), lead_id=lead.id if lead else None,
            title=qd["title"], description=f"Annual contract for {qd['lead_name']}",
            items=qd["items"], total=qd["total"], status=qd["status"],
            validity_date=_now() + timedelta(days=30),
            created_at=_ago(10), updated_at=_now(),
        )
        db.add(quote)
    print(f"  ✓ {len(quotes_data)} quotes")

    # ═══════════════════════════════════════════════════════════
    # ACTIVITIES — timeline for key leads
    # ═══════════════════════════════════════════════════════════
    activity_templates = [
        ("Marriott Sharm El Sheikh", [
            ("qualification", "Lead qualified. Score: 95/100. Grade: qualified.", 44),
            ("assignment", "Lead assigned to Hassan Ali. Capacity: 1/15", 43),
            ("quote_generated", "Quote generated: HVAC + Electrical — Marriott Sharm. EGP 126,000", 40),
            ("quote_submitted", "Quote submitted for review by Sara Ahmed", 38),
            ("quote_sent", "Quote sent to client Marriott Hotels", 35),
            ("quote_approved", "Quote APPROVED. Contract: EGP 126,000. Lead converted.", 30),
        ]),
        ("Hilton Hurghada Resort", [
            ("qualification", "Lead qualified. Score: 90/100. Grade: qualified.", 29),
            ("assignment", "Lead assigned to Mona Khalil. Capacity: 1/12", 28),
            ("quote_generated", "Quote generated: Full Engineering — Hilton Hurghada. EGP 180,000", 25),
            ("quote_submitted", "Quote submitted for review", 23),
            ("quote_sent", "Quote sent to client Hilton Hotels", 20),
            ("quote_approved", "Quote APPROVED. Contract: EGP 180,000. Lead converted.", 15),
        ]),
        ("Steigenberger El Gouna", [
            ("qualification", "Lead qualified. Score: 85/100. Grade: qualified.", 9),
            ("assignment", "Lead assigned to Karim Youssef. Capacity: 1/10", 8),
            ("quote_generated", "Quote generated: Electrical + Pool — Steigenberger. EGP 78,000", 5),
            ("quote_submitted", "Quote submitted for review", 3),
            ("quote_sent", "Quote sent to client Steigenberger", 2),
        ]),
    ]

    act_count = 0
    for lead_name, acts in activity_templates:
        lead = lead_objs.get(lead_name)
        if not lead:
            continue
        for act_type, desc, days in acts:
            db.add(Activity(
                id=_id(), lead_id=lead.id, type=act_type,
                description=desc, actor="system",
                created_at=_ago(days), updated_at=_ago(days),
            ))
            act_count += 1
    print(f"  ✓ {act_count} activities")

    db.commit()
    db.close()

    print("")
    print("═══════════════════════════════════════")
    print(" SEED COMPLETE")
    print("═══════════════════════════════════════")
    print("")
    print(" Users:    4 (admin, manager, 2 agents)")
    print(" Agents:   3")
    print(" Leads:    15 (3 converted, 4 assigned, 3 qualified, 3 new, 2 lost)")
    print(" Quotes:   6 (3 approved, 1 sent, 1 review, 1 draft)")
    print(" Activities: timeline for key leads")
    print("")
    print(" Credentials:")
    print("   admin:   amr@triangleblack.com     / Admin123!")
    print("   manager: sara@triangleblack.com    / Manager123!")
    print("   agent:   hassan@triangleblack.com  / Agent123!")
    print("   agent:   mona@triangleblack.com    / Agent123!")
    print("")
    print(" Revenue Pipeline:")
    print("   Approved:  EGP 558,000")
    print("   Sent:      EGP 78,000")
    print("   Review:    EGP 96,000")
    print("   Draft:     EGP 66,000")
    print("   Total:     EGP 798,000")


if __name__ == "__main__":
    seed()
