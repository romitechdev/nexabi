from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str = Field(..., min_length=4, max_length=50)
    password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str

class CustomerCreate(BaseModel):
    customer_id: str
    customer_name: str
    segment: str
    recency: int = Field(..., ge=0)
    frequency: int = Field(..., ge=0)
    monetary: float = Field(..., ge=0.0)
    recency_scaled: float
    frequency_scaled: float
    monetary_scaled: float
    cluster: int