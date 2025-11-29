from fastapi import APIRouter, HTTPException, status, Depends
from models.review import Review, ReviewCreate, ReviewUpdate
from utils.dependencies import db, get_current_user
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/products", tags=["Reviews"])

@router.get("/{product_id}/reviews", response_model=List[Review])
async def get_product_reviews(product_id: str):
    """Get all reviews for a product"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    reviews = await db.reviews.find(
        {"productId": product_id}
    ).sort("createdAt", -1).to_list(length=100)
    
    for review in reviews:
        review["_id"] = str(review["_id"])
    
    return reviews

@router.post("/{product_id}/reviews", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: str,
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a review for a product"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Verify product exists
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "productId": product_id,
        "userId": str(current_user["_id"])
    })
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    review_dict = review_data.dict()
    review_dict["productId"] = product_id
    review_dict["userId"] = str(current_user["_id"])
    review_dict["userName"] = current_user["name"]
    review_dict["createdAt"] = datetime.utcnow()
    
    result = await db.reviews.insert_one(review_dict)
    
    # Update product rating and review count
    all_reviews = await db.reviews.find({"productId": product_id}).to_list(length=1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {
            "$set": {
                "rating": round(avg_rating, 1),
                "reviews": len(all_reviews)
            }
        }
    )
    
    created_review = await db.reviews.find_one({"_id": result.inserted_id})
    created_review["_id"] = str(created_review["_id"])
    
    return created_review

@router.put("/reviews/{review_id}", response_model=Review)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a review"""
    if not ObjectId.is_valid(review_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
    
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if review belongs to user
    if review["userId"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this review"
        )
    
    update_data = review_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    await db.reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": update_data}
    )
    
    # Update product rating if rating changed
    if "rating" in update_data:
        all_reviews = await db.reviews.find({"productId": review["productId"]}).to_list(length=1000)
        avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
        
        await db.products.update_one(
            {"_id": ObjectId(review["productId"])},
            {"$set": {"rating": round(avg_rating, 1)}}
        )
    
    updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    updated_review["_id"] = str(updated_review["_id"])
    
    return updated_review

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a review"""
    if not ObjectId.is_valid(review_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
    
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if review belongs to user or user is admin
    if review["userId"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    await db.reviews.delete_one({"_id": ObjectId(review_id)})
    
    # Update product rating and review count
    all_reviews = await db.reviews.find({"productId": review["productId"]}).to_list(length=1000)
    if all_reviews:
        avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
        await db.products.update_one(
            {"_id": ObjectId(review["productId"])},
            {
                "$set": {
                    "rating": round(avg_rating, 1),
                    "reviews": len(all_reviews)
                }
            }
        )
    else:
        await db.products.update_one(
            {"_id": ObjectId(review["productId"])},
            {"$set": {"rating": 0, "reviews": 0}}
        )
    
    return None
