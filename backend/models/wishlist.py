from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class WishlistAdd(BaseModel):
    productId: str

class Wishlist(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    products: List[str] = []
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
