from fastapi import APIRouter, HTTPException, status, Depends, Query
from models.order import OrderStatusUpdate
from utils.dependencies import db, get_current_admin_user
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Optional
import uuid

from models.user import UserLogin, Token
from utils.auth import verify_password, create_access_token, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/setup-admin")
async def setup_admin():
    """PUBLIC endpoint to create admin user - Access this once after deployment"""
    import logging
    logger = logging.getLogger(__name__)
    
    admin_email = "admin@r32.ro"
    admin_password = "admin123"
    
    try:
        # Check if admin exists
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if existing_admin:
            return {
                "status": "already_exists",
                "message": "Admin user already exists!",
                "email": admin_email,
                "password": "admin123",
                "login_url": "/admin/login"
            }
        
        # Create admin user
        admin_user = {
            "_id": str(uuid.uuid4()),
            "name": "Admin User",
            "email": admin_email,
            "password": get_password_hash(admin_password),
            "phone": "0700000000",
            "address": "Admin Address",
            "role": "admin",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        await db.users.insert_one(admin_user)
        logger.info(f"Admin user created via /setup-admin endpoint")
        
        return {
            "status": "created",
            "message": "✅ Admin user created successfully!",
            "email": admin_email,
            "password": admin_password,
            "login_url": "/admin/login",
            "note": "⚠️ Change password after first login!"
        }
        
    except Exception as e:
        logger.error(f"Failed to create admin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create admin user: {str(e)}"
        )

@router.get("/quick-login")
async def quick_admin_login():
    """Quick admin login for development - returns token directly"""
    user = await db.users.find_one({"email": "admin@r32.ro"})
    if not user:
        # Create admin if doesn't exist
        await setup_admin()
        user = await db.users.find_one({"email": "admin@r32.ro"})
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.post("/login", response_model=Token)
async def admin_login(credentials: UserLogin):
    """Admin login - ONLY for admin users"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    logger.info(f"Admin login attempt for {credentials.email}, user found: {user is not None}")
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # SECURITY: Only allow admin users to login through this endpoint
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    # Verify password
    password_valid = verify_password(credentials.password, user["password"])
    logger.info(f"Admin password verification result: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    # Prepare user response
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/stats")
async def get_dashboard_stats(current_admin: dict = Depends(get_current_admin_user)):
    """Get dashboard statistics"""
    # Total sales and orders using aggregation
    sales_pipeline = [
        {"$match": {"status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": None,
            "total_sales": {"$sum": "$total"},
            "total_orders": {"$sum": 1}
        }}
    ]
    sales_result = await db.orders.aggregate(sales_pipeline).to_list(1)
    total_sales = sales_result[0]["total_sales"] if sales_result else 0
    total_orders = sales_result[0]["total_orders"] if sales_result else 0
    
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
    
    # Sales by month (last 6 months) using aggregation
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    monthly_pipeline = [
        {"$match": {
            "status": {"$ne": "cancelled"},
            "createdAt": {"$gte": six_months_ago}
        }},
        {"$group": {
            "_id": {
                "$dateToString": {"format": "%Y-%m", "date": "$createdAt"}
            },
            "sales": {"$sum": "$total"},
            "orders": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    monthly_results = await db.orders.aggregate(monthly_pipeline).to_list(6)
    
    # Format monthly results
    sales_by_month = []
    for result in monthly_results:
        month_date = datetime.strptime(result["_id"], "%Y-%m")
        sales_by_month.append({
            "month": month_date.strftime("%B"),
            "sales": result["sales"],
            "orders": result["orders"]
        })
    
    # Top products using aggregation
    top_products_pipeline = [
        {"$match": {"status": {"$ne": "cancelled"}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.productId",
            "name": {"$first": "$items.name"},
            "quantity": {"$sum": "$items.quantity"},
            "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
        }},
        {"$sort": {"revenue": -1}},
        {"$limit": 5}
    ]
    top_products_results = await db.orders.aggregate(top_products_pipeline).to_list(5)
    top_products = [
        {
            "productId": p["_id"],
            "name": p["name"],
            "quantity": p["quantity"],
            "revenue": p["revenue"]
        }
        for p in top_products_results
    ]
    
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
