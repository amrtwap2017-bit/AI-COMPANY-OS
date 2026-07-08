from fastapi import FastAPI
from api.lead_router import router
from infrastructure.database import engine, Base

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(router)
