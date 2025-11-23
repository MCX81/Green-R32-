from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.dependencies import get_current_admin_user, db
from datetime import datetime
import json
import io
import os

class BackupRestoreRequest(BaseModel):
    backup_file: str

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
        
        # Helper function to convert all datetime fields
        def convert_datetime_fields(item):
            """Convert all datetime fields in an item to ISO format"""
            if isinstance(item, dict):
                for key, value in item.items():
                    if hasattr(value, 'isoformat'):  # datetime object
                        item[key] = value.isoformat()
                    elif isinstance(value, dict):
                        convert_datetime_fields(value)
                    elif isinstance(value, list):
                        for sub_item in value:
                            if isinstance(sub_item, dict):
                                convert_datetime_fields(sub_item)
            return item

        # Categories
        categories = await db.categories.find({}).to_list(length=None)
        for cat in categories:
            cat["_id"] = str(cat["_id"])
            convert_datetime_fields(cat)
        backup_data["collections"]["categories"] = categories
        
        # Products
        products = await db.products.find({}).to_list(length=None)
        for prod in products:
            prod["_id"] = str(prod["_id"])
            convert_datetime_fields(prod)
        backup_data["collections"]["products"] = products
        
        # Users (exclude passwords for security)
        users = await db.users.find({}).to_list(length=None)
        for user in users:
            user["_id"] = str(user["_id"])
            user.pop("password", None)  # Don't backup passwords
            convert_datetime_fields(user)
        backup_data["collections"]["users"] = users
        
        # Orders
        orders = await db.orders.find({}).to_list(length=None)
        for order in orders:
            order["_id"] = str(order["_id"])
            convert_datetime_fields(order)
        backup_data["collections"]["orders"] = orders
        
        # Reviews
        reviews = await db.reviews.find({}).to_list(length=None)
        for review in reviews:
            review["_id"] = str(review["_id"])
            convert_datetime_fields(review)
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
    request: BackupRestoreRequest,
    current_user: dict = Depends(get_current_admin_user)
):
    """Restore database from JSON backup - highly optimized with batch processing"""
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
        progress_details = []
        
        # Batch size for large collections
        BATCH_SIZE = 1000
        
        # Helper function to convert datetime strings
        def convert_dates(items):
            for item in items:
                for key in ["createdAt", "updatedAt"]:
                    if key in item and isinstance(item[key], str):
                        try:
                            item[key] = datetime.fromisoformat(item[key])
                        except (ValueError, TypeError):
                            pass
            return items
        
        # Helper function for batch insert
        async def batch_insert(collection, items, collection_name):
            if not items:
                return 0
            
            total_inserted = 0
            total_items = len(items)
            
            # Process in batches
            for i in range(0, total_items, BATCH_SIZE):
                batch = items[i:i + BATCH_SIZE]
                try:
                    result = await collection.insert_many(batch, ordered=False)
                    total_inserted += len(result.inserted_ids)
                    progress_details.append(
                        f"{collection_name}: Batch {i//BATCH_SIZE + 1} - {len(result.inserted_ids)} documente inserate"
                    )
                except Exception as e:
                    errors.append(f"{collection_name} batch {i//BATCH_SIZE + 1}: {str(e)}")
            
            return total_inserted
        
        # Restore Categories - BULK OPERATION WITH BATCHING
        if "categories" in collections_data and collections_data["categories"]:
            try:
                categories = collections_data["categories"]
                progress_details.append(f"Categories: Se procesează {len(categories)} documente...")
                
                # Clear existing categories
                delete_result = await db.categories.delete_many({})
                progress_details.append(f"Categories: {delete_result.deleted_count} documente vechi șterse")
                
                # Convert dates
                categories = convert_dates(categories)
                
                # Batch insert
                total = await batch_insert(db.categories, categories, "Categories")
                restored_stats["categories"] = total
                progress_details.append(f"Categories: ✓ Total {total} documente restaurate")
                    
            except Exception as e:
                errors.append(f"Categories: {str(e)}")
                restored_stats["categories"] = 0
                progress_details.append("Categories: ✗ Eroare")
        
        # Restore Products - BULK OPERATION WITH BATCHING
        if "products" in collections_data and collections_data["products"]:
            try:
                products = collections_data["products"]
                progress_details.append(f"Products: Se procesează {len(products)} documente...")
                
                # Clear existing products
                delete_result = await db.products.delete_many({})
                progress_details.append(f"Products: {delete_result.deleted_count} documente vechi șterse")
                
                # Convert dates
                products = convert_dates(products)
                
                # Batch insert
                total = await batch_insert(db.products, products, "Products")
                restored_stats["products"] = total
                progress_details.append(f"Products: ✓ Total {total} documente restaurate")
                    
            except Exception as e:
                errors.append(f"Products: {str(e)}")
                restored_stats["products"] = 0
                progress_details.append("Products: ✗ Eroare")
        
        # Restore Reviews - BULK OPERATION WITH BATCHING
        if "reviews" in collections_data and collections_data["reviews"]:
            try:
                reviews = collections_data["reviews"]
                progress_details.append(f"Reviews: Se procesează {len(reviews)} documente...")
                
                # Clear existing reviews
                delete_result = await db.reviews.delete_many({})
                progress_details.append(f"Reviews: {delete_result.deleted_count} documente vechi șterse")
                
                # Convert dates
                reviews = convert_dates(reviews)
                
                # Batch insert
                total = await batch_insert(db.reviews, reviews, "Reviews")
                restored_stats["reviews"] = total
                progress_details.append(f"Reviews: ✓ Total {total} documente restaurate")
                    
            except Exception as e:
                errors.append(f"Reviews: {str(e)}")
                restored_stats["reviews"] = 0
                progress_details.append("Reviews: ✗ Eroare")
        
        # Restore Orders - Only new orders (don't delete existing) - OPTIMIZED
        if "orders" in collections_data and collections_data["orders"]:
            try:
                orders = collections_data["orders"]
                progress_details.append(f"Orders: Se procesează {len(orders)} documente...")
                
                orders = convert_dates(orders)
                
                # OPTIMIZATION: Get all order IDs in ONE query instead of looping
                order_ids_from_backup = [order.get("orderId") for order in orders if order.get("orderId")]
                
                if order_ids_from_backup:
                    # Single query to get all existing orders
                    existing_orders = await db.orders.find(
                        {"orderId": {"$in": order_ids_from_backup}}
                    ).to_list(length=None)
                    
                    existing_order_ids = {order.get("orderId") for order in existing_orders}
                    progress_details.append(f"Orders: {len(existing_order_ids)} comenzi deja existente")
                    
                    # Filter out existing orders
                    new_orders = [
                        order for order in orders 
                        if order.get("orderId") not in existing_order_ids
                    ]
                else:
                    new_orders = orders
                
                if new_orders:
                    # Batch insert new orders
                    total = await batch_insert(db.orders, new_orders, "Orders")
                    restored_stats["orders"] = total
                    progress_details.append(f"Orders: ✓ {total} comenzi noi adăugate")
                else:
                    restored_stats["orders"] = 0
                    progress_details.append("Orders: Nicio comandă nouă de adăugat")
                    
            except Exception as e:
                errors.append(f"Orders: {str(e)}")
                restored_stats["orders"] = 0
                progress_details.append("Orders: ✗ Eroare")
        
        # Build response message
        message = "Backup restaurat cu succes!"
        if errors:
            message += f" Cu {len(errors)} erori."
        
        return {
            "success": len(errors) == 0,
            "message": message,
            "restored": restored_stats,
            "errors": errors if errors else None,
            "progress": progress_details,
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
