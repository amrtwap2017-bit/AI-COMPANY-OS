"""
Triangle Black coding conventions injected into every prompt.
Forces the model to use the correct TB file structure and patterns.
"""

TB_CONVENTIONS = """
TRIANGLE BLACK FILE STRUCTURE — MANDATORY:
Every new feature MUST follow this exact structure:
  src/commercial/{module_name}/
    __init__.py       (empty)
    models.py         (SQLAlchemy model with Column(), Base from src.core.base)
    schemas.py        (Pydantic: {Entity}Create, {Entity}Update, {Entity}Response)
    repository.py     ({Entity}Repository class with create/get/list/update/delete)
    router.py         (FastAPI APIRouter, SYNC def, Depends(get_db), Depends(get_hotel_id))
  tests/commercial/
    test_{module_name}.py

NEVER use these paths:
  ❌ src/{module_name}/              (wrong — missing commercial/)
  ❌ src/domain/models/{name}.py    (wrong — not TB structure)
  ❌ src/orchestrator/{name}.py     (wrong — not TB structure)
  ❌ src/infrastructure/...         (wrong — not TB structure)

ALWAYS use:
  ✅ src/commercial/{module_name}/models.py
  ✅ src/commercial/{module_name}/schemas.py
  ✅ src/commercial/{module_name}/repository.py
  ✅ src/commercial/{module_name}/router.py
  ✅ tests/commercial/test_{module_name}.py

CRITICAL IMPORTS (copy exactly):
  from src.core.base import Base          # SQLAlchemy base
  from src.core.database import get_db   # DB session
  from src.core.tenant import get_hotel_id  # Multi-tenant
  from src.core.auth import require_agent, require_manager  # Auth

CRITICAL PATTERNS:
  # Model — use Column() NOT mapped_column()
  class Payment(Base):
      __tablename__ = "payments"
      id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
      hotel_id   = Column(String(36), nullable=False)
      invoice_id = Column(String(36), nullable=False)
      amount     = Column(Float, nullable=False)
      created_at = Column(DateTime, default=datetime.utcnow)

  # Router — SYNC def, never async
  @router.post("/", response_model=PaymentResponse, status_code=201)
  def create_payment(
      payload: PaymentCreate,
      db: Session = Depends(get_db),
      _: User = Depends(require_agent),
      hotel_id: str = Depends(get_hotel_id),
  ):
      ...
"""
