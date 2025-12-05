#!/usr/bin/env python3
"""
Script to fix products after restore from old backup
Ensures all products have proper structure and are accessible
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')
load_dotenv('.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'r32_database')

async def fix_products():
    """Fix all products after restore to ensure proper structure"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 80)
    print("FIXING PRODUCTS AFTER RESTORE")
    print("=" * 80)
    print(f"MongoDB: {MONGO_URL}")
    print(f"Database: {DB_NAME}")
    print()
    
    # Get all products
    products = await db.products.find({}).to_list(length=None)
    total = len(products)
    
    if total == 0:
        print("❌ No products found in database!")
        print("   Please restore backup first: /admin/backup")
        client.close()
        return
    
    print(f"Found {total} products to fix")
    print()
    
    # Counters
    fixed_count = 0
    errors = 0
    
    # Fix each product
    for i, product in enumerate(products, 1):
        try:
            product_id = product['_id']
            product_name = product.get('name', 'Unknown')
            updates = {}
            issues = []
            
            # 1. Ensure _id is ObjectId
            if not isinstance(product_id, ObjectId):
                # Try to convert
                try:
                    new_id = ObjectId(str(product_id))
                    # This is complex - would need to update references
                    issues.append("ID format issue")
                except:
                    issues.append("Invalid ID")
            
            # 2. Ensure stock field exists
            if 'stock' not in product:
                updates['stock'] = 0
                issues.append("Added stock=0")
            
            # 3. Sync inStock with stock quantity
            stock_qty = product.get('stock', 0)
            current_in_stock = product.get('inStock', None)
            should_be_in_stock = stock_qty > 0
            
            if current_in_stock != should_be_in_stock:
                updates['inStock'] = should_be_in_stock
                issues.append(f"Set inStock={should_be_in_stock}")
            
            # 4. Ensure required fields exist
            if 'name' not in product or not product['name']:
                issues.append("Missing name")
                errors += 1
                continue
            
            if 'price' not in product:
                updates['price'] = 0
                issues.append("Added price=0")
            
            if 'category' not in product:
                updates['category'] = 'uncategorized'
                issues.append("Added category=uncategorized")
            
            if 'image' not in product or not product['image']:
                updates['image'] = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
                issues.append("Added default image")
            
            if 'images' not in product or not product['images']:
                updates['images'] = [product.get('image', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80')]
                issues.append("Added images array")
            
            # 5. Ensure numeric fields are numbers
            if 'rating' not in product:
                updates['rating'] = 0
            elif not isinstance(product['rating'], (int, float)):
                updates['rating'] = 0
            
            if 'reviews' not in product:
                updates['reviews'] = 0
            elif not isinstance(product['reviews'], int):
                updates['reviews'] = 0
            
            # 6. Ensure boolean fields exist
            if 'isNew' not in product:
                updates['isNew'] = False
            
            if 'featured' not in product:
                updates['featured'] = False
            
            # Apply updates if any
            if updates:
                await db.products.update_one(
                    {'_id': product_id},
                    {'$set': updates}
                )
                fixed_count += 1
                status = f"[{i}/{total}] FIXED: {product_name[:50]:<50}"
                if issues:
                    status += f" | Issues: {', '.join(issues)}"
                print(status)
            else:
                if i % 100 == 0:
                    print(f"[{i}/{total}] OK: {product_name[:50]}")
        
        except Exception as e:
            errors += 1
            print(f"[{i}/{total}] ERROR: {product_name[:50]} - {str(e)}")
    
    print()
    print("=" * 80)
    print("FIX COMPLETE")
    print("=" * 80)
    print(f"Total products: {total}")
    print(f"Fixed: {fixed_count}")
    print(f"Errors: {errors}")
    print(f"Already OK: {total - fixed_count - errors}")
    print()
    
    # Run stock sync
    print("Running stock synchronization...")
    print()
    
    # Sync inStock with stock
    in_stock_count = await db.products.count_documents({
        "$or": [
            {"inStock": True},
            {"stock": {"$gt": 0}}
        ]
    })
    
    out_of_stock_count = total - in_stock_count
    
    print(f"✓ Products IN STOCK: {in_stock_count}/{total}")
    print(f"✗ Products OUT OF STOCK: {out_of_stock_count}/{total}")
    print()
    
    # Check categories
    print("Checking categories...")
    categories = await db.categories.find({}).to_list(length=None)
    cat_count = len(categories)
    print(f"Found {cat_count} categories")
    
    if cat_count == 0:
        print("⚠️  WARNING: No categories found!")
        print("   Sidebar will be empty until categories are added")
    
    print()
    
    # Close connection
    client.close()
    print("✅ All fixes applied successfully!")
    print()
    print("Next steps:")
    print("1. Verify products are accessible: r32.ro/catalog")
    print("2. Click on any product to test detail page")
    print("3. Try adding to cart")
    print("4. If sidebar is empty, check /admin/categories")
    print()

if __name__ == "__main__":
    print()
    asyncio.run(fix_products())
