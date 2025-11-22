from fastapi import APIRouter, HTTPException, status, Depends, Query
from models.product import Product, ProductCreate, ProductUpdate
from utils.dependencies import db, get_current_admin_user
from bson import ObjectId
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    is_new: Optional[bool] = None,
    discount: Optional[bool] = None,
    sort_by: Optional[str] = Query(None, regex="^(price_asc|price_desc|rating|name)$"),
    skip: int = 0,
    limit: int = 100
):
    """Get all products with filters"""
    query = {}
    
    # Apply filters
    if category:
        query["category"] = category
    if brand:
        query["brand"] = brand
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if in_stock is not None:
        query["inStock"] = in_stock
    if is_new is not None:
        query["isNew"] = is_new
    if discount:
        query["discount"] = {"$gt": 0}
    
    # Apply sorting
    sort_options = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "rating": [("rating", -1)],
        "name": [("name", 1)]
    }
    sort = sort_options.get(sort_by, [("createdAt", -1)])
    
    # Query database
    cursor = db.products.find(query).sort(sort).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for product in products:
        product["_id"] = str(product["_id"])
    
    return products

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get product by ID"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product["_id"] = str(product["_id"])
    return product

@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Create a new product (Admin only)"""
    product_dict = product_data.dict()
    product_dict["rating"] = 0.0
    product_dict["reviews"] = 0
    product_dict["createdAt"] = datetime.utcnow()
    product_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.products.insert_one(product_dict)
    
    created_product = await db.products.find_one({"_id": result.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    
    return created_product

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update product (Admin only)"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    update_data = product_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updatedAt"] = datetime.utcnow()
    
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    updated_product["_id"] = str(updated_product["_id"])
    
    return updated_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Delete product (Admin only)"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return None
