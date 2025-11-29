from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItem(BaseModel):
    productId: str
    name: str
    price: float
    quantity: int
    image: str

class ShippingAddress(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    county: str
    postalCode: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    paymentMethod: str = "cash"
    notes: Optional[str] = None
    subtotal: Optional[float] = None
    shipping: Optional[float] = None
    total: Optional[float] = None
    status: Optional[str] = "pending"

class Order(BaseModel):
    id: str = Field(alias="_id")
    orderId: str
    userId: str
    items: List[OrderItem]
    subtotal: float
    shipping: float
    total: float
    status: OrderStatus = OrderStatus.PENDING
    paymentMethod: str = "cash"
    notes: Optional[str] = None
    shippingAddress: ShippingAddress
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
