from fastapi import APIRouter, HTTPException, status, Depends
from models.user import UserCreate, UserLogin, User, Token, UserUpdate
from utils.auth import get_password_hash, verify_password, create_access_token
from utils.dependencies import db, get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_dict = user_data.dict(exclude={"password"})
    user_dict["password"] = hashed_password
    user_dict["role"] = "user"
    user_dict["createdAt"] = datetime.utcnow()
    user_dict["updatedAt"] = datetime.utcnow()
    
    # Insert into database
    result = await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    # Get created user
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    # Remove password from response
    created_user.pop("password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": created_user
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user - ONLY for regular users, NOT for admins"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    logger.info(f"Login attempt for {credentials.email}, user found: {user is not None}")
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # SECURITY: Block admin users from logging in through public login
    if user.get("role") == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin users must login through admin panel"
        )
    
    # Verify password
    password_valid = verify_password(credentials.password, user["password"])
    logger.info(f"Password verification result: {password_valid}")
    
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

@router.get("/me", response_model=User)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    current_user["_id"] = str(current_user["_id"])
    current_user.pop("password", None)
    return current_user

@router.put("/profile", response_model=User)
async def update_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_data = user_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updatedAt"] = datetime.utcnow()
    
    # Update user
    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    updated_user.pop("password", None)
    
    return updated_user
