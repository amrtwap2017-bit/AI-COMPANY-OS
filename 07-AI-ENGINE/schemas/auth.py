from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=8)
    full_name: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str | None
    role: str
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    permissions: str = Field(default="read,write")


class APIKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    permissions: str
    is_active: bool
    created_at: str


class APIKeyCreated(BaseModel):
    id: int
    name: str
    key: str
    key_prefix: str
    permissions: str
    message: str = "Store this key securely. It will not be shown again."
