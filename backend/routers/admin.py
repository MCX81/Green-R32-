from fastapi import APIRouter, HTTPException, status, Depends, Query
from models.order import OrderStatusUpdate
from utils.dependencies import db, get_current_admin_user
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/stats")
async def get_dashboard_stats(current_admin: dict = Depends(get_current_admin_user)):
    """Get dashboard statistics"""
    # Total sales
    orders = await db.orders.find({"status": {"$ne": "cancelled"}}).to_list(length=10000)
    total_sales = sum(order.get("total", 0) for order in orders)
    
    # Total orders
    total_orders = len(orders)
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Total products
    total_products = await db.products.count_documents({})
    
    # Products in stock
    products_in_stock = await db.products.count_documents({"inStock": True})
    
    # Orders this month
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    orders_this_month = await db.orders.count_documents({
        "createdAt": {"$gte": first_day_of_month}
    })
    
    # Sales by month (last 6 months)
    sales_by_month = []
    for i in range(5, -1, -1):
        month_start = (datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30 * i))
        month_end = month_start + timedelta(days=30)
        
        month_orders = await db.orders.find({
            "createdAt": {"$gte": month_start, "$lt": month_end},
            "status": {"$ne": "cancelled"}
        }).to_list(length=10000)
        
        month_sales = sum(order.get("total", 0) for order in month_orders)
        
        sales_by_month.append({
            "month": month_start.strftime("%B"),
            "sales": month_sales,
            "orders": len(month_orders)
        })
    
    # Top products
    all_orders = await db.orders.find({"status": {"$ne": "cancelled"}}).to_list(length=10000)
    product_sales = {}
    
    for order in all_orders:
        for item in order.get("items", []):
            product_id = item.get("productId")
            if product_id not in product_sales:
                product_sales[product_id] = {
                    "productId": product_id,
                    "name": item.get("name"),
                    "quantity": 0,
                    "revenue": 0
                }
            product_sales[product_id]["quantity"] += item.get("quantity", 0)
            product_sales[product_id]["revenue"] += item.get("price", 0) * item.get("quantity", 0)
    
    top_products = sorted(product_sales.values(), key=lambda x: x["revenue"], reverse=True)[:5]
    
    # Recent orders
    recent_orders = await db.orders.find().sort("createdAt", -1).limit(5).to_list(length=5)
    for order in recent_orders:
        order["_id"] = str(order["_id"])
    
    return {
        "totalSales": total_sales,
        "totalOrders": total_orders,
        "totalUsers": total_users,
        "totalProducts": total_products,
        "productsInStock": products_in_stock,
        "ordersThisMonth": orders_this_month,
        "salesByMonth": sales_by_month,
        "topProducts": top_products,
        "recentOrders": recent_orders
    }

@router.get("/orders")
async def get_all_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all orders with filters"""
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(length=limit)
    total = await db.orders.count_documents(query)
    
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return {
        "orders": orders,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update order status"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": status_update.status,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
    updated_order["_id"] = str(updated_order["_id"])
    
    return updated_order

@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all users"""
    users = await db.users.find().skip(skip).limit(limit).to_list(length=limit)
    total = await db.users.count_documents({})
    
    for user in users:
        user["_id"] = str(user["_id"])
        user.pop("password", None)
    
    return {
        "users": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update user role"""
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'user' or 'admin'"
        )
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["_id"] = str(updated_user["_id"])
    updated_user.pop("password", None)
    
    return updated_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Delete user"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Cannot delete yourself
    if str(current_admin["_id"]) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return None

@router.get("/reviews")
async def get_all_reviews(
    skip: int = 0,
    limit: int = 50,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Get all reviews"""
    reviews = await db.reviews.find().sort("createdAt", -1).skip(skip).limit(limit).to_list(length=limit)
    total = await db.reviews.count_documents({})
    
    for review in reviews:
        review["_id"] = str(review["_id"])
    
    return {
        "reviews": reviews,
        "total": total,
        "skip": skip,
        "limit": limit
    }
