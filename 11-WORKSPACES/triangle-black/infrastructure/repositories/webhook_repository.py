from sqlalchemy.ext.asyncio import AsyncSession
from domain.models import WebhookConfig

class WebhookRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, config: WebhookConfig) -> None:
        # Implement database creation logic here
        pass

    async def list(self) -> List[WebhookConfig]:
        # Implement database listing logic here
        pass