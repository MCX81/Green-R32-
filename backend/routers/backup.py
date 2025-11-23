from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from utils.dependencies import get_current_user, admin_required
from database import db
from datetime import datetime
import json
import io

router = APIRouter(prefix="/api/admin/backup", tags=["Backup"])

@router.get("/export")
async def export_database(current_user: dict = Depends(admin_required)):
    """Export entire database to JSON format"""
    try:
        # Get current timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        db_name = "r32_ecommerce"
        filename = f"backup_{db_name}_{timestamp}.json"
        
        # Export all collections
        backup_data = {
            "timestamp": timestamp,
            "database": db_name,
            "collections": {}
        }
        
        # Categories
        categories = await db.categories.find({}).to_list(length=None)
        for cat in categories:
            cat["_id"] = str(cat["_id"])
        backup_data["collections"]["categories"] = categories
        
        # Products
        products = await db.products.find({}).to_list(length=None)
        for prod in products:
            prod["_id"] = str(prod["_id"])
            if "createdAt" in prod:
                prod["createdAt"] = prod["createdAt"].isoformat()
            if "updatedAt" in prod:
                prod["updatedAt"] = prod["updatedAt"].isoformat()
        backup_data["collections"]["products"] = products
        
        # Users (exclude passwords for security)
        users = await db.users.find({}).to_list(length=None)
        for user in users:
            user["_id"] = str(user["_id"])
            user.pop("password", None)  # Don't backup passwords
            if "createdAt" in user:
                user["createdAt"] = user["createdAt"].isoformat()
        backup_data["collections"]["users"] = users
        
        # Orders
        orders = await db.orders.find({}).to_list(length=None)
        for order in orders:
            order["_id"] = str(order["_id"])
            if "createdAt" in order:
                order["createdAt"] = order["createdAt"].isoformat()
            if "updatedAt" in order:
                order["updatedAt"] = order["updatedAt"].isoformat()
        backup_data["collections"]["orders"] = orders
        
        # Reviews
        reviews = await db.reviews.find({}).to_list(length=None)
        for review in reviews:
            review["_id"] = str(review["_id"])
            if "createdAt" in review:
                review["createdAt"] = review["createdAt"].isoformat()
        backup_data["collections"]["reviews"] = reviews
        
        # Add stats
        backup_data["stats"] = {
            "total_categories": len(categories),
            "total_products": len(products),
            "total_users": len(users),
            "total_orders": len(orders),
            "total_reviews": len(reviews)
        }
        
        # Convert to JSON string
        json_str = json.dumps(backup_data, indent=2, ensure_ascii=False)
        json_bytes = json_str.encode('utf-8')
        
        # Create file-like object
        file_like = io.BytesIO(json_bytes)
        
        # Return as downloadable file
        return StreamingResponse(
            file_like,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(json_bytes))
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Eroare la crearea backup-ului: {str(e)}"
        )

@router.post("/restore")
async def restore_database(current_user: dict = Depends(admin_required)):
    """Placeholder for future restore functionality"""
    raise HTTPException(
        status_code=501,
        detail="Restaurarea din backup se face manual folosind MongoDB tools"
    )

@router.get("/info")
async def get_backup_info(current_user: dict = Depends(admin_required)):
    """Get database statistics for backup info"""
    try:
        stats = {
            "categories": await db.categories.count_documents({}),
            "products": await db.products.count_documents({}),
            "users": await db.users.count_documents({}),
            "orders": await db.orders.count_documents({}),
            "reviews": await db.reviews.count_documents({})
        }
        
        return {
            "database": "r32_ecommerce",
            "timestamp": datetime.now().isoformat(),
            "collections": stats,
            "total_documents": sum(stats.values())
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Eroare la obținerea informațiilor: {str(e)}"
        )
