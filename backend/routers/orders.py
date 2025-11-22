from fastapi import APIRouter, HTTPException, status, Depends
from models.order import Order, OrderCreate, OrderStatusUpdate
from utils.dependencies import db, get_current_user, get_current_admin_user
from bson import ObjectId
from datetime import datetime
from typing import List
import uuid

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("", response_model=List[Order])
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get user's orders"""
    orders = await db.orders.find(
        {"userId": str(current_user["_id"])}
    ).sort("createdAt", -1).to_list(length=100)
    
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return orders

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get order by ID"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if order belongs to user
    if order["userId"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    order["_id"] = str(order["_id"])
    return order

@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new order"""
    # Calculate totals
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    shipping = 0 if subtotal > 300 else 30
    total = subtotal + shipping
    
    # Generate order ID
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    order_dict = {
        "orderId": order_id,
        "userId": str(current_user["_id"]),
        "items": [item.dict() for item in order_data.items],
        "subtotal": subtotal,
        "shipping": shipping,
        "total": total,
        "status": "pending",
        "shippingAddress": order_data.shippingAddress.dict(),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_dict)
    
    # Clear user's cart after order is created
    await db.carts.update_one(
        {"userId": str(current_user["_id"])},
        {"$set": {"items": [], "updatedAt": datetime.utcnow()}}
    )
    
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    created_order["_id"] = str(created_order["_id"])
    
    return created_order
