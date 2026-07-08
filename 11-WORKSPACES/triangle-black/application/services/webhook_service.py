from typing import List
from domain.models import WebhookConfig
from infrastructure.repositories.webhook_repository import WebhookRepository

class WebhookService:
    def __init__(self, webhook_repo: WebhookRepository):
        self.webhook_repo = webhook_repo

    async def register_webhook(self, config: WebhookConfig) -> None:
        await self.webhook_repo.create(config)

    async def list_webhooks(self) -> List[WebhookConfig]:
        return await self.webhook_repo.list()
