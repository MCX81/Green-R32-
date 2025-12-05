"""
MongoDB connection utilities with production-ready Atlas configuration
"""
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)


def get_mongodb_client(mongo_url: Optional[str] = None) -> AsyncIOMotorClient:
    """
    Create MongoDB client with Atlas-optimized settings
    
    Args:
        mongo_url: MongoDB connection string. If None, uses MONGO_URL env var
        
    Returns:
        AsyncIOMotorClient configured for production use with Atlas
    """
    url = mongo_url or os.environ.get('MONGO_URL')
    
    if not url:
        logger.warning("MONGO_URL not set in environment, using localhost:27017 for development")
        url = 'mongodb://localhost:27017'
    
    # Production-ready configuration for MongoDB Atlas
    client = AsyncIOMotorClient(
        url,
        # Server selection and connection timeouts
        serverSelectionTimeoutMS=30000,  # 30 seconds to select a server
        connectTimeoutMS=30000,           # 30 seconds to establish connection
        socketTimeoutMS=30000,            # 30 seconds for socket operations
        
        # Connection pool settings
        maxPoolSize=50,                   # Maximum connections in pool
        minPoolSize=10,                   # Minimum connections to maintain
        maxIdleTimeMS=45000,              # Close idle connections after 45s
        
        # Retry and write concern
        retryWrites=True,                 # Retry write operations on network errors
        retryReads=True,                  # Retry read operations on network errors
        w='majority',                     # Wait for majority of nodes to acknowledge writes
        
        # Read preference for replica sets
        readPreference='primaryPreferred', # Try primary first, fallback to secondary
        
        # Compression (improves network efficiency with Atlas)
        compressors='snappy,zlib',
        
        # Application name for monitoring
        appName=os.environ.get('APP_NAME', 'r32-app'),
    )
    
    logger.info(f"MongoDB client created with connection to: {url.split('@')[-1] if '@' in url else url}")
    
    return client


async def test_mongodb_connection(client: AsyncIOMotorClient) -> bool:
    """
    Test MongoDB connection by pinging the server
    
    Args:
        client: MongoDB client to test
        
    Returns:
        True if connection successful, False otherwise
    """
    try:
        await client.admin.command('ping')
        logger.info("✅ MongoDB connection test successful")
        return True
    except Exception as e:
        logger.error(f"❌ MongoDB connection test failed: {str(e)}")
        return False


def to_object_id(id_value: str) -> Any:
    """
    Convert ID to ObjectId if valid, otherwise return as string.
    Supports both ObjectId format and UUID strings.
    
    Args:
        id_value: String ID (can be ObjectId hex or UUID)
        
    Returns:
        ObjectId if valid ObjectId format, otherwise original string
    """
    if ObjectId.is_valid(id_value):
        return ObjectId(id_value)
    return id_value


async def find_by_id(collection, id_value: str) -> Optional[dict]:
    """
    Find document by _id, supporting both ObjectId and UUID string formats.
    
    Args:
        collection: MongoDB collection
        id_value: ID to search for (ObjectId hex or UUID string)
        
    Returns:
        Document if found, None otherwise
    """
    # Try as ObjectId first
    if ObjectId.is_valid(id_value):
        doc = await collection.find_one({"_id": ObjectId(id_value)})
        if doc:
            return doc
    
    # Try as string (UUID or other string-based IDs)
    return await collection.find_one({"_id": id_value})

