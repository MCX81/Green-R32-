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
from routers import auth, products, categories, cart, wishlist, orders, reviews, admin, backup

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'r32_ecommerce')]

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()