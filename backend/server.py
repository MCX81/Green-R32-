from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# IMPORTANT: Load environment variables FIRST before importing routers
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routers AFTER loading environment variables
from routers import auth, products, categories, cart, wishlist, orders, reviews, admin, backup, facturare

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="R32 E-Commerce API", version="1.0.0")

# Create a router with the /api prefix for basic routes
api_router = APIRouter(prefix="/api")

# Basic health check route
@api_router.get("/")
async def root():
    return {"message": "R32 E-Commerce API is running", "version": "1.0.0"}

# Include all routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(backup.router)
app.include_router(facturare.router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Auto-create admin user on startup
@app.on_event("startup")
async def create_admin_user():
    """Create default admin user if not exists"""
    try:
        from utils.auth import get_password_hash
        from datetime import datetime
        import uuid
        
        admin_email = "admin@r32.ro"
        
        # Check if admin exists
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if not existing_admin:
            logger.info("Admin user not found. Creating default admin user...")
            
            admin_user = {
                "_id": str(uuid.uuid4()),
                "name": "Admin User",
                "email": admin_email,
                "password": get_password_hash("admin123"),
                "phone": "0700000000",
                "address": "Admin Address",
                "role": "admin",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
            
            await db.users.insert_one(admin_user)
            logger.info(f"✅ Admin user created successfully: {admin_email}")
            logger.info("⚠️  Default password: admin123 - CHANGE THIS IMMEDIATELY!")
        else:
            logger.info(f"✅ Admin user already exists: {admin_email}")
    except Exception as e:
        logger.error(f"❌ Failed to create admin user: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()