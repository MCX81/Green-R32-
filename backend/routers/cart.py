from fastapi import APIRouter, HTTPException, status, Depends
from models.cart import Cart, CartItemAdd, CartItemUpdate
from utils.dependencies import db, get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/cart", tags=["Cart"])

@router.get("", response_model=Cart)
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart"""
    cart = await db.carts.find_one({"userId": str(current_user["_id"])})
    
    if not cart:
        # Create empty cart if doesn't exist
        cart_dict = {
            "userId": str(current_user["_id"]),
            "items": [],
            "updatedAt": datetime.utcnow()
        }
        result = await db.carts.insert_one(cart_dict)
        cart = await db.carts.find_one({"_id": result.inserted_id})
    
    cart["_id"] = str(cart["_id"])
    return cart

@router.post("/items", response_model=Cart)
async def add_to_cart(
    item: CartItemAdd,
    current_user: dict = Depends(get_current_user)
):
    """Add item to cart"""
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
    
    # Get or create cart
    cart = await db.carts.find_one({"userId": str(current_user["_id"])})
    
    if not cart:
        cart_dict = {
            "userId": str(current_user["_id"]),
            "items": [{
                "productId": item.productId,
                "quantity": item.quantity,
                "price": product["price"]
            }],
            "updatedAt": datetime.utcnow()
        }
        result = await db.carts.insert_one(cart_dict)
        cart = await db.carts.find_one({"_id": result.inserted_id})
    else:
        # Check if item already in cart
        existing_item = None
        for cart_item in cart.get("items", []):
            if cart_item["productId"] == item.productId:
                existing_item = cart_item
                break
        
        if existing_item:
            # Update quantity
            await db.carts.update_one(
                {"_id": cart["_id"], "items.productId": item.productId},
                {
                    "$inc": {"items.$.quantity": item.quantity},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
        else:
            # Add new item
            await db.carts.update_one(
                {"_id": cart["_id"]},
                {
                    "$push": {
                        "items": {
                            "productId": item.productId,
                            "quantity": item.quantity,
                            "price": product["price"]
                        }
                    },
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
        
        cart = await db.carts.find_one({"_id": cart["_id"]})
    
    cart["_id"] = str(cart["_id"])
    return cart

@router.put("/items/{product_id}", response_model=Cart)
async def update_cart_item(
    product_id: str,
    update_data: CartItemUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update item quantity in cart"""
    if update_data.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be at least 1"
        )
    
    result = await db.carts.update_one(
        {"userId": str(current_user["_id"]), "items.productId": product_id},
        {
            "$set": {
                "items.$.quantity": update_data.quantity,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    cart = await db.carts.find_one({"userId": str(current_user["_id"])})
    cart["_id"] = str(cart["_id"])
    return cart

@router.delete("/items/{product_id}", response_model=Cart)
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove item from cart"""
    await db.carts.update_one(
        {"userId": str(current_user["_id"])},
        {
            "$pull": {"items": {"productId": product_id}},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    cart = await db.carts.find_one({"userId": str(current_user["_id"])})
    if cart:
        cart["_id"] = str(cart["_id"])
        return cart
    
    # Return empty cart if not found
    return {
        "_id": "new",
        "userId": str(current_user["_id"]),
        "items": [],
        "updatedAt": datetime.utcnow()
    }

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Clear cart"""
    await db.carts.update_one(
        {"userId": str(current_user["_id"])},
        {
            "$set": {
                "items": [],
                "updatedAt": datetime.utcnow()
            }
        }
    )
    return None
