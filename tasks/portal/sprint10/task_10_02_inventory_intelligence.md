To implement the inventory intelligence system for a hotel engineering company using FastAPI, we need to follow these steps:

1. Define the database models.
2. Create the API endpoint.
3. Implement the matching logic.
4. Implement the vendor recommendation logic.
5. Implement the auto PR creation logic.

Here's the complete code for the FastAPI endpoint:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

# Database setup
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    item_code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    unit_of_measure = Column(String, index=True)
    min_stock = Column(Float, index=True)
    max_stock = Column(Float, index=True)
    reorder_qty = Column(Float, index=True)

class StockBalance(Base):
    __tablename__ = "stock_balances"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    quantity = Column(Float, index=True)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    name = Column(String, index=True)
    location = Column(String, index=True)

class InventoryVendor(Base):
    __tablename__ = "inventory_vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    contact_person = Column(String, index=True)
    phone = Column(String, index=True)
    email = Column(String, index=True)
    payment_terms = Column(String, index=True)

# Create tables
Base.metadata.create_all(bind=engine)

class WorkOrderCheckRequest(BaseModel):
    work_order_type: str
    asset_category: str
    description: str

class WorkOrderCheckResponse(BaseModel):
    items_available: list
    items_missing: list
    vendors_suggested: list

@app.post("/api/v1/ai/inventory/check", response_model=WorkOrderCheckResponse)
def check_inventory(request: WorkOrderCheckRequest):
    db = SessionLocal()
    
    # Matching logic: map work_order_type to inventory categories
    category_mapping = {
        "hvac": ["HVAC Parts", "Refrigerant", "Filters"]
    }
    
    if request.work_order_type not in category_mapping:
        raise HTTPException(status_code=400, detail="Invalid work order type")
    
    required_categories = category_mapping[request.work_order_type]
    
    # Check stock and suggest vendors
    items_available = []
    items_missing = []
    vendors_suggested = []
    
    for category in required_categories:
        available_items = db.query(InventoryItem).filter_by(category=category).all()
        
        for item in available_items:
            balance = db.query(StockBalance).filter_by(item_id=item.id, warehouse_id=1).first()  # Assuming warehouse ID 1
            if balance and balance.quantity > item.reorder_qty:
                items_available.append({
                    "item_code": item.item_code,
                    "name": item.name,
                    "quantity": balance.quantity
                })
            else:
                items_missing.append({
                    "item_code": item.item_code,
                    "name": item.name
                })
        
        if not items_missing:
            continue
        
        # Suggest vendors based on category and rating (assuming a simple scoring system)
        suggested_vendors = db.query(InventoryVendor).filter_by(category=category).all()
        for vendor in suggested_vendors:
            score = 0.5 * len(vendor.name) + 0.3 * vendor.rating + 0.2 * vendor.lead_time
            vendors_suggested.append({
                "vendor_id": vendor.id,
                "name": vendor.name,
                "score": score
            })
    
    # Sort suggested vendors by score (descending)
    vendors_suggested.sort(key=lambda x: x["score"], reverse=True)
    
    return WorkOrderCheckResponse(
        items_available=items_available,
        items_missing=items_missing,
        vendors_suggested=vendors_suggested
    )

# Example data for testing
def init_db():
    db = SessionLocal()
    # Add sample data here
    db.close()

init_db()
```

### Explanation:

1. **Database Models**: We define the necessary database models using SQLAlchemy ORM.
2. **API Endpoint**: The `/api/v1/ai/inventory/check` endpoint takes a `WorkOrderCheckRequest` and returns a `WorkOrderCheckResponse`.
3. **Matching Logic**: We map the `work_order_type` to specific inventory categories.
4. **Vendor Recommendation**: We suggest vendors based on category, rating, and lead time.
5. **Auto PR Creation**: This logic is not implemented in the provided code but can be added as needed.

### Notes:
- The database setup assumes SQLite for simplicity. You can replace it with any other database system.
- The vendor recommendation scoring system is a simple example. In a real-world scenario