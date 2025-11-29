from fastapi import APIRouter, HTTPException, status, Depends
from models.category import Category, CategoryCreate, CategoryUpdate
from utils.dependencies import db, get_current_admin_user
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[Category])
async def get_categories():
    """Get all categories with subcategories"""
    categories = await db.categories.find().to_list(length=200)
    
    for category in categories:
        category["_id"] = str(category["_id"])
        # Convert parentId if exists
        if category.get("parentId"):
            category["parentId"] = str(category["parentId"]) if category["parentId"] else None
    
    return categories

@router.post("", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Create a new category (Admin only)"""
    # Check if slug already exists
    existing = await db.categories.find_one({"slug": category_data.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category slug already exists"
        )
    
    category_dict = category_data.dict()
    category_dict["createdAt"] = datetime.utcnow()
    
    result = await db.categories.insert_one(category_dict)
    
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    created_category["_id"] = str(created_category["_id"])
    
    return created_category

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Update category (Admin only)"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
    
    update_data = category_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Check if slug already exists (if updating slug)
    if "slug" in update_data:
        existing = await db.categories.find_one({
            "slug": update_data["slug"],
            "_id": {"$ne": ObjectId(category_id)}
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category slug already exists"
            )
    
    result = await db.categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    updated_category = await db.categories.find_one({"_id": ObjectId(category_id)})
    updated_category["_id"] = str(updated_category["_id"])
    
    return updated_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """Delete category (Admin only)"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
    
    result = await db.categories.delete_one({"_id": ObjectId(category_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return None
