from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from utils.dependencies import get_current_admin_user, db
from datetime import datetime
import json
import io
import os

router = APIRouter(prefix="/api/admin/backup", tags=["Backup"])

@router.get("/export")
async def export_database(current_user: dict = Depends(get_current_admin_user)):
    """Export entire database to JSON format"""
    try:
        # Get current timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        db_name = os.environ.get("DB_NAME", "r32_ecommerce")
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
async def restore_database(
    backup_file: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Restore database from JSON backup - optimized for bulk operations"""
    try:
        # Parse JSON
        backup_data = json.loads(backup_file)
        
        # Validate backup structure
        if "collections" not in backup_data:
            raise HTTPException(
                status_code=400,
                detail="Format backup invalid. Lipsește secțiunea 'collections'."
            )
        
        collections_data = backup_data["collections"]
        restored_stats = {}
        errors = []
        
        # Helper function to convert datetime strings
        def convert_dates(items):
            for item in items:
                for key in ["createdAt", "updatedAt"]:
                    if key in item and isinstance(item[key], str):
                        try:
                            item[key] = datetime.fromisoformat(item[key])
                        except:
                            pass
            return items
        
        # Restore Categories - BULK OPERATION
        if "categories" in collections_data and collections_data["categories"]:
            try:
                categories = collections_data["categories"]
                
                # Clear existing categories
                delete_result = await db.categories.delete_many({})
                
                # Convert dates
                categories = convert_dates(categories)
                
                # Bulk insert
                if categories:
                    result = await db.categories.insert_many(categories, ordered=False)
                    restored_stats["categories"] = len(result.inserted_ids)
                else:
                    restored_stats["categories"] = 0
                    
            except Exception as e:
                errors.append(f"Categories: {str(e)}")
                restored_stats["categories"] = 0
        
        # Restore Products - BULK OPERATION
        if "products" in collections_data and collections_data["products"]:
            try:
                products = collections_data["products"]
                
                # Clear existing products
                await db.products.delete_many({})
                
                # Convert dates
                products = convert_dates(products)
                
                # Bulk insert
                if products:
                    result = await db.products.insert_many(products, ordered=False)
                    restored_stats["products"] = len(result.inserted_ids)
                else:
                    restored_stats["products"] = 0
                    
            except Exception as e:
                errors.append(f"Products: {str(e)}")
                restored_stats["products"] = 0
        
        # Restore Reviews - BULK OPERATION
        if "reviews" in collections_data and collections_data["reviews"]:
            try:
                reviews = collections_data["reviews"]
                
                # Clear existing reviews
                await db.reviews.delete_many({})
                
                # Convert dates
                reviews = convert_dates(reviews)
                
                # Bulk insert
                if reviews:
                    result = await db.reviews.insert_many(reviews, ordered=False)
                    restored_stats["reviews"] = len(result.inserted_ids)
                else:
                    restored_stats["reviews"] = 0
                    
            except Exception as e:
                errors.append(f"Reviews: {str(e)}")
                restored_stats["reviews"] = 0
        
        # Restore Orders - Only new orders (don't delete existing)
        if "orders" in collections_data and collections_data["orders"]:
            try:
                orders = collections_data["orders"]
                orders = convert_dates(orders)
                
                new_orders = []
                for order in orders:
                    # Check if order exists
                    existing = await db.orders.find_one({"orderId": order.get("orderId")})
                    if not existing:
                        new_orders.append(order)
                
                if new_orders:
                    result = await db.orders.insert_many(new_orders, ordered=False)
                    restored_stats["orders"] = len(result.inserted_ids)
                else:
                    restored_stats["orders"] = 0
                    
            except Exception as e:
                errors.append(f"Orders: {str(e)}")
                restored_stats["orders"] = 0
        
        # Build response message
        message = "Backup restaurat cu succes!"
        if errors:
            message += f" Cu erori: {', '.join(errors)}"
        
        return {
            "success": len(errors) == 0,
            "message": message,
            "restored": restored_stats,
            "errors": errors if errors else None,
            "backup_info": {
                "timestamp": backup_data.get("timestamp"),
                "database": backup_data.get("database")
            }
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Fișier JSON invalid: {str(e)}"
        )
    except Exception as e:
        import traceback
        error_detail = f"Eroare la restaurarea backup-ului: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(
            status_code=500,
            detail=error_detail
        )

@router.get("/info")
async def get_backup_info(current_user: dict = Depends(get_current_admin_user)):
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
