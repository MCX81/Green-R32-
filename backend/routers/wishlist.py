from fastapi import APIRouter, HTTPException, status, Depends
from models.wishlist import Wishlist, WishlistAdd
from utils.dependencies import db, get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("", response_model=Wishlist)
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    """Get user's wishlist"""
    wishlist = await db.wishlists.find_one({"userId": str(current_user["_id"])})
    
    if not wishlist:
        # Create empty wishlist if doesn't exist
        wishlist_dict = {
            "userId": str(current_user["_id"]),
            "products": [],
            "updatedAt": datetime.utcnow()
        }
        result = await db.wishlists.insert_one(wishlist_dict)
        wishlist = await db.wishlists.find_one({"_id": result.inserted_id})
    
    wishlist["_id"] = str(wishlist["_id"])
    return wishlist

@router.post("", response_model=Wishlist)
async def add_to_wishlist(
    item: WishlistAdd,
    current_user: dict = Depends(get_current_user)
):
    """Add product to wishlist"""
    # Verify product exists
    if not ObjectId.is_valid(item.productId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await db.products.find_one({"_id": ObjectId(item.productId)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get or create wishlist
    wishlist = await db.wishlists.find_one({"userId": str(current_user["_id"])})
    
    if not wishlist:
        wishlist_dict = {
            "userId": str(current_user["_id"]),
            "products": [item.productId],
            "updatedAt": datetime.utcnow()
        }
        result = await db.wishlists.insert_one(wishlist_dict)
        wishlist = await db.wishlists.find_one({"_id": result.inserted_id})
    else:
        # Check if product already in wishlist
        if item.productId not in wishlist.get("products", []):
            await db.wishlists.update_one(
                {"_id": wishlist["_id"]},
                {
                    "$push": {"products": item.productId},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            wishlist = await db.wishlists.find_one({"_id": wishlist["_id"]})
    
    wishlist["_id"] = str(wishlist["_id"])
    return wishlist

@router.delete("/{product_id}", response_model=Wishlist)
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove product from wishlist"""
    await db.wishlists.update_one(
        {"userId": str(current_user["_id"])},
        {
            "$pull": {"products": product_id},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    wishlist = await db.wishlists.find_one({"userId": str(current_user["_id"])})
    if wishlist:
        wishlist["_id"] = str(wishlist["_id"])
        return wishlist
    
    # Return empty wishlist if not found
    return {
        "_id": "new",
        "userId": str(current_user["_id"]),
        "products": [],
        "updatedAt": datetime.utcnow()
    }
