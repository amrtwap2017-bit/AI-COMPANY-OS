from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.webhook_service import WebhookService
from domain.models import WebhookConfig
from infrastructure.repositories.webhook_repository import get_webhook_repo

router = APIRouter()

@router.post('/webhooks', response_model=WebhookConfig)
async def register_webhook(config: WebhookConfig, webhook_repo: WebhookRepository = Depends(get_webhook_repo)):
    await webhook_repo.create(config)
    return config

@router.get('/webhooks', response_model=List[WebhookConfig])
async def list_webhooks(webhook_repo: WebhookRepository = Depends(get_webhook_repo)):
    return await webhook_repo.list()