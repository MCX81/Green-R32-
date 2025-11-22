from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class CartItem(BaseModel):
    productId: str
    quantity: int = 1
    price: float

class CartItemAdd(BaseModel):
    productId: str
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class Cart(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    items: List[CartItem] = []
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
