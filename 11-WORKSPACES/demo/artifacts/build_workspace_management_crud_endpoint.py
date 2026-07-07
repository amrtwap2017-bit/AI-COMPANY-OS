```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List

# Initialize the database connection
SQLALCHEMY_DATABASE_URL = "sqlite:///workspaces.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Workspace(Base):
    __tablename__ = 'workspaces'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)

# Initialize the FastAPI app
app = FastAPI()

# Create the database tables
Base.metadata.create_all(engine)


@app.post("/api/v1/workspaces")
async def create_workspace(workspace: Workspace):
    """Create a new workspace."""
    db = SessionLocal()
    try:
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        return JSONResponse(content={"message": "Workspace created successfully"}, status_code=201)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.get("/api/v1/workspaces")
async def read_workspaces():
    """Get all workspaces."""
    db = SessionLocal()
    try:
        workspaces = db.query(Workspace).all()
        return JSONResponse(content={"workspaces": [workspace.dict() for workspace in workspaces]}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.delete("/api/v1/workspaces/{workspace_id}")
async def delete_workspace(workspace_id: int):
    """Delete a workspace."""
    db = SessionLocal()
    try:
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        db.delete(workspace)
        db.commit()
        return JSONResponse(content={"message": "Workspace deleted successfully"}, status_code=200)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```