#!/usr/bin/env python3
"""
Script to synchronize inStock field with stock quantity for all products
Run this after importing products from backup to fix stock status
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')
load_dotenv('.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'r32_database')

async def sync_stock():
    """Synchronize inStock field based on stock quantity"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"Connected to MongoDB: {MONGO_URL}")
    print(f"Database: {DB_NAME}")
    print()
    
    # Get all products
    products = await db.products.find({}).to_list(length=None)
    total = len(products)
    print(f"Found {total} products to check")
    print()
    
    # Counters
    updated = 0
    already_correct = 0
    no_stock_field = 0
    
    for product in products:
        product_id = product['_id']
        product_name = product.get('name', 'Unknown')
        current_in_stock = product.get('inStock', None)
        stock_qty = product.get('stock', 0)
        
        # Determine what inStock should be
        should_be_in_stock = stock_qty > 0
        
        # Check if update is needed
        if current_in_stock != should_be_in_stock:
            # Update the product
            result = await db.products.update_one(
                {'_id': product_id},
                {'$set': {'inStock': should_be_in_stock}}
            )
            
            if result.modified_count > 0:
                updated += 1
                status = "✓ IN STOCK" if should_be_in_stock else "✗ OUT OF STOCK"
                print(f"Updated: {product_name[:50]:<50} | Stock: {stock_qty:>3} | {status}")
        else:
            already_correct += 1
            
        if 'stock' not in product:
            no_stock_field += 1
    
    print()
    print("=" * 80)
    print("SYNC COMPLETE")
    print("=" * 80)
    print(f"Total products: {total}")
    print(f"Updated: {updated}")
    print(f"Already correct: {already_correct}")
    print(f"Missing stock field: {no_stock_field}")
    print()
    
    # Show current stats
    total_in_stock = await db.products.count_documents({
        "$or": [
            {"inStock": True},
            {"stock": {"$gt": 0}}
        ]
    })
    total_out_of_stock = total - total_in_stock
    
    print(f"✓ Products IN STOCK: {total_in_stock}/{total}")
    print(f"✗ Products OUT OF STOCK: {total_out_of_stock}/{total}")
    print()
    
    # Close connection
    client.close()
    print("Connection closed")

if __name__ == "__main__":
    print("=" * 80)
    print("STOCK SYNCHRONIZATION SCRIPT")
    print("=" * 80)
    print()
    asyncio.run(sync_stock())
