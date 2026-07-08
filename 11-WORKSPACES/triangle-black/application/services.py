from domain.models import SearchRequest, FilterRequest
from infrastructure.repositories import ItemRepository

class ItemService:
    def __init__(self, repository: ItemRepository):
        self.repository = repository

    def search(self, request: SearchRequest):
        return self.repository.search(request.query)

    def filter(self, request: FilterRequest):
        return self.repository.filter(request.criteria)