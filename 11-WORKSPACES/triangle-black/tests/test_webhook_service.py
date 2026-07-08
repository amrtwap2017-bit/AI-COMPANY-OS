import pytest
from application.services.webhook_service import WebhookService
from infrastructure.repositories.webhook_repository import MockWebhookRepository

@pytest.mark.asyncio
async def test_register_webhook():
    webhook_repo = MockWebhookRepository()
    service = WebhookService(webhook_repo)
    config = WebhookConfig(id=1, url='http://example.com', events=['created'], is_active=True)
    await service.register_webhook(config)
    assert len(webhook_repo.created_configs) == 1

@pytest.mark.asyncio
async def test_list_webhooks():
    webhook_repo = MockWebhookRepository()
    service = WebhookService(webhook_repo)
    config = WebhookConfig(id=1, url='http://example.com', events=['created'], is_active=True)
    await service.register_webhook(config)
    result = await service.list_webhooks()
    assert len(result) == 1