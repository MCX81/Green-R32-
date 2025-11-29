#!/usr/bin/env python3
"""
Create initial admin user for R32 application
Run this script after deployment to create the admin user
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from utils.auth import get_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_admin_user():
    """Create admin user if not exists"""
    print("=" * 60)
    print("🔧 R32 - Create Admin User Script")
    print("=" * 60)
    print()
    
    # Admin user data
    admin_email = "admin@r32.ro"
    admin_password = "admin123"
    
    print(f"📧 Admin Email: {admin_email}")
    print(f"🔐 Admin Password: {admin_password}")
    print()
    
    try:
        # Check if admin user already exists
        print("🔍 Checking if admin user exists...")
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if existing_admin:
            print("✅ Admin user already exists!")
            print(f"   User ID: {existing_admin.get('_id')}")
            print(f"   Name: {existing_admin.get('name')}")
            print(f"   Role: {existing_admin.get('role')}")
            print()
            print("ℹ️  No action needed. You can login with:")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
        else:
            print("❌ Admin user not found. Creating new admin user...")
            print()
            
            # Hash the password
            print("🔐 Hashing password...")
            hashed_password = get_password_hash(admin_password)
            
            # Create admin user document
            admin_user = {
                "_id": str(uuid.uuid4()),
                "name": "Admin User",
                "email": admin_email,
                "password": hashed_password,
                "phone": "0700000000",
                "address": "Admin Address",
                "role": "admin",
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
            
            # Insert into database
            print("💾 Inserting admin user into database...")
            result = await db.users.insert_one(admin_user)
            
            print()
            print("=" * 60)
            print("✅ ✅ ✅  ADMIN USER CREATED SUCCESSFULLY!  ✅ ✅ ✅")
            print("=" * 60)
            print()
            print("📋 Admin Credentials:")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            print()
            print("🔗 Login URL:")
            print("   https://r32.ro/admin/login")
            print()
            print("⚠️  IMPORTANT: Change the password after first login!")
            print()
        
        # Show database stats
        print("=" * 60)
        print("📊 Database Statistics:")
        print("=" * 60)
        
        users_count = await db.users.count_documents({})
        products_count = await db.products.count_documents({})
        categories_count = await db.categories.count_documents({})
        
        print(f"   Users: {users_count}")
        print(f"   Products: {products_count}")
        print(f"   Categories: {categories_count}")
        print()
        
        if products_count == 0:
            print("⚠️  Database is empty!")
            print("   Please restore backup from admin panel:")
            print("   1. Login to https://r32.ro/admin/login")
            print("   2. Go to Backup section")
            print("   3. Upload r32_backup.json")
            print()
        
    except Exception as e:
        print("=" * 60)
        print("❌ ERROR OCCURRED!")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print()
        print("🔍 Troubleshooting:")
        print("   1. Check MongoDB connection string in .env")
        print("   2. Verify network access in MongoDB Atlas")
        print("   3. Check database permissions")
        print()
        return False
    finally:
        client.close()
    
    return True

if __name__ == "__main__":
    print()
    success = asyncio.run(create_admin_user())
    print("=" * 60)
    if success:
        print("✅ Script completed successfully!")
    else:
        print("❌ Script failed. Please check errors above.")
    print("=" * 60)
    print()
