from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from domain.models import SearchRequest, FilterRequest, ExportResponse
from infrastructure.repositories import ItemRepository
from application.services import ItemService
from dependencies import get_db

router = APIRouter()

@router.get('/search', response_model=List[Item])
def search_items(request: SearchRequest, repository: ItemRepository = Depends()):
    return repository.search(request.query)

@router.post('/filter', response_model=List[Item])
def filter_items(request: FilterRequest, repository: ItemRepository = Depends()):
    return repository.filter(request.criteria)

@router.get('/export', response_model=ExportResponse)
def export_items(repository: ItemRepository = Depends()):
    items = repository.get_all()
    file_path = 'items_export.csv'
    with open(file_path, 'w') as f:
        f.write('id,name,description\n')
        for item in items:
            f.write(f'{item.id},{item.name},{item.description}\n')
    return ExportResponse(file_path=file_path)