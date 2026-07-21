To design a smart technician dispatch system for hotel engineering, we need to create an API endpoint that recommends a technician based on the given rules. We will also implement a scoring algorithm to determine the best technician for each work order.

Here's the complete implementation in Python using FastAPI:

### Step 1: Define the Data Models

First, let's define the data models for technicians, work orders, and assets.

```python
from pydantic import BaseModel
from typing import List, Optional

class Technician(BaseModel):
    id: int
    name: str
    specializations: List[str]
    max_work_orders: int
    current_work_orders: int
    hotel_id: int
    is_active: bool

class WorkOrder(BaseModel):
    type: str
    priority: int
    hotel_id: int
    asset_id: Optional[int] = None

class Asset(BaseModel):
    category: str
    location_description: str
    hotel_id: int
```

### Step 2: Define the Scoring Algorithm

Next, we'll define the scoring algorithm to determine the best technician for each work order.

```python
def calculate_score(technician: Technician, work_order_type: str, priority: int, hotel_id: int) -> float:
    specialization_match = 1 if work_order_type in technician.specializations else 0
    capacity_score = (technician.max_work_orders - technician.current_work_orders) / technician.max_work_orders
    hotel_match = 1 if technician.hotel_id == hotel_id else 0
    
    score = specialization_match * 0.4 + capacity_score * 0.3 + hotel_match * 0.3
    
    # For critical priority, always pick the most experienced in that type
    if priority == 'critical':
        experience_factor = sum(1 for tech in technicians if work_order_type in tech.specializations)
        score += experience_factor / len(technicians) * 0.2
    
    return score
```

### Step 3: Implement the FastAPI Endpoint

Now, let's implement the FastAPI endpoint to recommend a technician.

```python
from fastapi import FastAPI, HTTPException
from typing import List

app = FastAPI()

# Sample data for demonstration purposes
technicians = [
    Technician(id=1, name="Tech1", specializations=["hvac"], max_work_orders=10, current_work_orders=5, hotel_id=1, is_active=True),
    Technician(id=2, name="Tech2", specializations=["electrical"], max_work_orders=10, current_work_orders=3, hotel_id=1, is_active=True),
    Technician(id=3, name="Tech3", specializations=["plumbing"], max_work_orders=10, current_work_orders=7, hotel_id=2, is_active=True),
]

work_orders = [
    WorkOrder(type="hvac", priority="normal", hotel_id=1),
    WorkOrder(type="electrical", priority="critical", hotel_id=1),
    WorkOrder(type="plumbing", priority="emergency", hotel_id=2),
]

assets = [
    Asset(category="room", location_description="Room 101", hotel_id=1),
    Asset(category="hall", location_description="Hall A", hotel_id=2),
]

@app.post("/api/v1/ai/dispatch/recommend")
async def recommend_technician(work_order: WorkOrder):
    if work_order.priority == "emergency":
        available_techs = [tech for tech in technicians if tech.is_active]
        if not available_techs:
            raise HTTPException(status_code=404, detail="No available technician for emergency")
        return {
            "recommended_technician_id": available_techs[0].id,
            "reason": "Emergency work order",
            "alternatives": []
        }
    
    matching_techs = [tech for tech in technicians if tech.is_active and work_order.type in tech.specializations]
    if not matching_techs:
        raise HTTPException(status_code=404, detail="No technician with matching specialization")
    
    scores = [(tech, calculate_score(tech, work_order.type, work_order.priority, work_order.hotel_id)) for tech in matching_techs]
    recommended_technician, _ = max(scores, key=lambda x: x[1])
    
    return {
        "recommended_technician_id": recommended_technician.id,
        "reason": f"Best match based on score {calculate_score(recommended_technician, work_order.type, work_order.priority, work_order.hotel_id)}",
        "alternatives": [tech.id for tech, _ in scores if tech != recommended_technician]
    }
```

### Step 4: Run the FastAPI Application

To run the FastAPI application, you can use the following command:

```bash
uvicorn main:app --reload
```

This will start a development server that you can interact with using tools like Postman or curl.

### Summary

The above code provides a complete implementation of a smart technician dispatch system for hotel engineering. It includes an API endpoint to recommend a technician based on the given rules and a scoring algorithm to determine the best technician for each work order. The sample data is used for demonstration purposes, and you can replace it with actual data from your database.