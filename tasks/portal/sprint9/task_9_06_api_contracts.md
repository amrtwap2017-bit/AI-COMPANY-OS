1. **Fix 'cannot import get_dashboard_repo' pattern**:
   - Ensure that `get_dashboard_repo` is correctly defined and exported from its module.
   - Verify the import path in `dashboard.router`.

2. **Add GET /api/v1/work-orders alias (no slash) without duplicating logic**:
   - Use a custom route decorator to handle both `/work-orders` and `/work-orders/`.
   ```python
   @router.get("/work-orders", include_in_schema=False)
   @router.get("/work-orders/", response_model=List[WorkOrder])
   async def get_work_orders():
       # Your logic here
   ```

3. **Important Nginx rate limiting rules**:
   - Limit requests per client IP.
   ```nginx
   limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
   ```
   - Apply the rate limit to specific locations.
   ```nginx
   location /api/v1/login {
       limit_req zone=one burst=5 nodelay;
   }
   ```

4. **Add request logging middleware in FastAPI**:
   ```python
   from fastapi import Request, Response
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3001"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   @app.middleware("http")
   async def log_requests(request: Request, call_next):
       response = await call_next(request)
       return response
   ```

5. **Health check beyond {status:ok}**:
   - Include additional metrics like database connectivity status.
   ```python
   from fastapi import FastAPI, HTTPException

   app = FastAPI()

   @app.get("/health")
   async def health_check():
       try:
           # Check database connection or other critical services
           pass
       except Exception as e:
           raise HTTPException(status_code=503, detail=str(e))
       return {"status": "ok", "database": "connected"}
   ```
