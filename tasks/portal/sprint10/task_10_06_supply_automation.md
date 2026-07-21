To design the supply chain automation for Triangle Black hotel engineering company in Egypt, we will create Python functions and FastAPI endpoints that handle each step of the business cycle. Below is a detailed implementation:

### Step 1: Auto-PR trigger

When an inventory check fails, we need to automatically create a Purchase Request (PR) with relevant data pre-populated.

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import uuid

router = APIRouter()

# Dummy database simulation
purchase_requests_db = []
inventory_vendors_db = []

def get_inventory_vendor_by_category(category: str) -> List[Dict]:
    return [vendor for vendor in inventory_vendors_db if vendor['category'] == category]

@router.post("/api/v1/ai/supply/auto-pr")
async def create_purchase_request(work_order_id: int, db: Session = Depends(get_db)):
    # Simulate work order data
    work_order_data = {
        "id": work_order_id,
        "parts_needed": [
            {"part_name": "Part A", "category": "Electronics"},
            {"part_name": "Part B", "category": "Tools"}
        ]
    }

    for part in work_order_data["parts_needed"]:
        vendor_list = get_inventory_vendor_by_category(part["category"])
        if not vendor_list:
            raise HTTPException(status_code=400, detail="No vendors found for the category")

        pr_data = {
            "id": str(uuid.uuid4()),
            "work_order_id": work_order_id,
            "part_name": part["part_name"],
            "quantity_needed": 1,  # Assuming quantity needed is always 1
            "vendor_ids": [vendor['id'] for vendor in vendor_list]
        }

        purchase_requests_db.append(pr_data)

    return {"message": "Purchase Request created successfully"}
```

### Step 2: Auto-RFQ

When a Purchase Request (PR) is approved, we need to automatically send an RFQ to relevant vendors by category.

```python
@router.post("/api/v1/ai/supply/auto-rfq/{pr_id}")
async def send_rfq(pr_id: str, db: Session = Depends(get_db)):
    pr = next((pr for pr in purchase_requests_db if pr['id'] == pr_id), None)
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase Request not found")

    rfq_data = {
        "id": str(uuid.uuid4()),
        "purchase_request_id": pr_id,
        "part_name": pr["part_name"],
        "quantity_needed": pr["quantity_needed"],
        "vendor_ids": pr["vendor_ids"]
    }

    # Simulate sending RFQ to vendors
    print(f"Sending RFQ for {pr['part_name']} to vendors: {', '.join(pr['vendor_ids'])}")

    rfqs_db.append(rfq_data)

    return {"message": "RFQ sent successfully"}
```

### Step 3: Auto-PO

When all quotes are received, we need to score and automatically generate a Purchase Order (PO) draft.

```python
@router.get("/api/v1/ai/supply/quote-comparison/{rfq_id}")
async def compare_quotes(rfq_id: str, db: Session = Depends(get_db)):
    rfq = next((rfq for rfq in rfqs_db if rfq['id'] == rfq_id), None)
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    # Simulate receiving quotes
    quotes = [
        {"id": str(uuid.uuid4()), "rfq_id": rfq_id, "vendor_id": vendor_id, "price": 100}
        for vendor_id in rfq["vendor_ids"]
    ]

    # Score and select the best quote
    best_quote = min(quotes, key=lambda q: q['price'])

    po_data = {
        "id": str(uuid.uuid4()),
        "rfq_id": rfq_id,
        "part_name": rfq["part_name"],
        "quantity_needed": rfq["quantity_needed"],
        "vendor_id": best_quote["vendor_id"],
        "price": best_quote["price"]
    }

    # Simulate creating PO
    print(f"Creating PO for {rfq['part_name']} from vendor: {best_quote['vendor_id']}")

    purchase_orders_db.append(po_data)

    return {"message": "Purchase Order created successfully"}
```

### Step 4: Mobile receiving

When the technician receives goods, they need to confirm delivery on the phone. We will simulate this with a simple function.

```python
@router.post("/api/v1/ai/supply/mobile-receiving")
async def mobile_receiving(po_id: str, db: Session = Depends(get_db)):
    po = next((po for po in purchase_orders_db if po['id'] == po_id), None)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    # Simulate receiving goods
    print(f"Receiving goods for PO: {po_id}")

    return {"message": "Goods received successfully"}
```

### Summary

The above code provides a basic implementation of the supply chain automation using FastAPI. Each function handles a specific step in the business cycle, and the endpoints allow for interaction with the system. The database simulation is done using Python lists, but in a real-world scenario, you would use a proper database like PostgreSQL or MySQL.

This setup ensures that each step in the supply chain is automated, reducing manual intervention and improving efficiency.