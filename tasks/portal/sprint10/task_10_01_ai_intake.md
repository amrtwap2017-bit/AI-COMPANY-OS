### AI Request Intake Pipeline Design

#### 1. Input: Raw Text in Arabic/English
The input will be a raw string containing the maintenance request.

#### 2. Extraction: What Fields to Extract
We need to extract the following fields:
- `type`: The type of asset or issue (e.g., HVAC, AC).
- `priority`: The urgency level of the request.
- `location`: The location where the issue occurred.
- `asset_type`: The specific type of asset involved.

#### 3. Matching: How to Match to Existing Assets in Database
We will use a combination of natural language processing (NLP) and keyword matching to identify the relevant assets from the database.

#### 4. Output: Structured JSON for Work Order Creation
The output should be a structured JSON object that can be used to create a work order in the `work_orders` table.

#### 5. API Endpoint Design
We will design an API endpoint using FastAPI to handle incoming requests and process them through our AI pipeline.

### Sample Python Code for Ollama Call

```python
import requests
import json

def call_ollama(prompt):
    url = "http://localhost:8001/api/v1/ai/intake/request"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "prompt": prompt
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to call Ollama: {response.status_code} - {response.text}")

# Example usage
prompt = "HVAC unit in room 412 not cooling"
result = call_ollama(prompt)
print(result)
```

### Prompt Template for Structured Extraction

```json
{
    "prompt": "Please extract the following information from the request: type, priority, location, and asset_type. The request is: {request}",
    "response_format": {
        "type": "string",
        "priority": "string",
        "location": "string",
        "asset_type": "string"
    }
}
```

### FastAPI Endpoint Signature

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI()

class RequestInput(BaseModel):
    request: str

@app.post("/api/v1/ai/intake/request", response_model=dict)
async def ai_intake_request(request_input: RequestInput):
    prompt = f"Please extract the following information from the request: type, priority, location, and asset_type. The request is: {request_input.request}"
    
    try:
        response = requests.post("http://localhost:8001/api/v1/ai/intake/request", json={"prompt": prompt})
        response.raise_for_status()
        result = response.json()
        
        # Validate the extracted information
        if not all(key in result for key in ["type", "priority", "location", "asset_type"]):
            raise HTTPException(status_code=400, detail="Invalid response from Ollama")
        
        return result
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to call Ollama: {e}")
```

### Handling Arabic Text

To handle Arabic text effectively, ensure that the NLP model used by Ollama is trained on a diverse dataset that includes Arabic. Additionally, preprocess the input text to normalize it (e.g., remove diacritical marks) before passing it to the model.

By following this pipeline design, Triangle Black can automate the intake of maintenance requests and create structured work orders efficiently.