from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    brand: str
    price: float
    oldPrice: Optional[float] = None
    image: str
    images: List[str] = []
    inStock: bool = True
    stock: int = 0
    isNew: bool = False
    discount: int = 0
    featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    oldPrice: Optional[float] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    inStock: Optional[bool] = None
    stock: Optional[int] = None
    isNew: Optional[bool] = None
    discount: Optional[int] = None

class Product(ProductBase):
    id: str = Field(alias="_id")
    rating: float = 0.0
    reviews: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
