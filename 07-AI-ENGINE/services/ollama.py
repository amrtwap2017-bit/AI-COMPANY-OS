from ollama import Client
from core.config import settings

# 10 minute timeout for long reasoning tasks
_client = Client(
    host=settings.OLLAMA_HOST,
    timeout=600,
)


class OllamaService:

    def __init__(self):
        self.client = _client
        self.host = settings.OLLAMA_HOST

    def generate(self, model: str, prompt: str, system: str = "") -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat(
            model=model,
            messages=messages,
        )
        return response["message"]["content"]

    def list_models(self) -> list[str]:
        response = self.client.list()
        models = response.get("models", [])
        result = []
        for m in models:
            if isinstance(m, dict):
                name = m.get("name") or m.get("model", "")
            else:
                name = getattr(m, "model", None) or getattr(m, "name", "")
            if name:
                result.append(name)
        return result

    def embed(self, model: str, text: str) -> list[float]:
        response = self.client.embeddings(
            model=model,
            prompt=text,
        )
        return response["embedding"]

    def health(self) -> bool:
        try:
            self.client.list()
            return True
        except Exception:
            return False


ollama_service = OllamaService()
