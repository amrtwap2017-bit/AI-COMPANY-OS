### 1. Missing Security Headers

To enhance your security, you should implement the following three security headers:

- **Strict-Transport-Security (HSTS)**: This header tells browsers to only communicate with your site over HTTPS.
  
  ```http
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```

- **X-Content-Type-Options**: This header prevents MIME type sniffing attacks by ensuring that the browser uses the content type specified in the Content-Type header.

  ```http
  X-Content-Type-Options: nosniff
  ```

- **Referrer-Policy**: This header controls how much information the browser includes with requests it sends to other sites. It can help prevent leaking sensitive data through referrer headers.

  ```http
  Referrer-Policy: same-origin
  ```

### 2. Implementing Login Rate Limiting in FastAPI

You can use `fastapi-limiter` or `fastapi-rate-limiting` to implement rate limiting on login attempts. Here’s an example using `fastapi-limiter`:

1. Install the package:
   ```bash
   pip install fastapi-limiter
   ```

2. Configure and use it in your FastAPI app:

   ```python
   from fastapi import FastAPI, Depends, HTTPException, status
   from fastapi_limiter import FastAPILimiter
   from fastapi_limiter.depends import RateLimiter
   from pydantic import BaseModel

   app = FastAPI()

   # Configure rate limiting
   @app.on_event("startup")
   async def startup():
       await FastAPILimiter.init("redis://localhost:6379")

   class LoginRequest(BaseModel):
       username: str
       password: str

   @app.post("/login", dependencies=[Depends(RateLimiter(times=5, seconds=60))])
   async def login(request: LoginRequest):
       # Your authentication logic here
       if request.username == "admin" and request.password == "password":
           return {"message": "Login successful"}
       else:
           raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
   ```

### 3. Critical Input Validation for Work Order Creation

When creating a work order, critical input validation includes:

- **Title**: Ensure it is not empty and does not exceed a reasonable length.
- **Description**: Validate that it contains valid text and does not contain malicious content.
- **Assignee**: Verify that the assignee exists in your system.
- **Due Date**: Ensure it is a valid date in the future.

Example validation using Pydantic:

```python
from pydantic import BaseModel, validator

class WorkOrder(BaseModel):
    title: str
    description: str
    assignee_id: int
    due_date: datetime.datetime

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v:
            raise ValueError('Title cannot be empty')
        return v

    @validator('description')
    def description_must_not_be_empty(cls, v):
        if not v:
            raise ValueError('Description cannot be empty')
        return v

    @validator('assignee_id')
    def assignee_id_must_exist(cls, v, values, **kwargs):
        # Check if the assignee exists in your database
        if not Assignee.exists(v):
            raise ValueError('Assignee does not exist')
        return v

    @validator('due_date')
    def due_date_must_be_in_future(cls, v):
        if v < datetime.datetime.now():
            raise ValueError('Due date must be in the future')
        return v
```

### 4. Rotating JWT Secret Without Logging Out All Users

To rotate the JWT secret
