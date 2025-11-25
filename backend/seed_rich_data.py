"""
Seed database with rich data - multiple category levels and many products
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from utils.auth import get_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
import json
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Rich category structure with 3 levels
CATEGORIES_STRUCTURE = [
    {
        "name": "Telefoane & Tablete",
        "slug": "telefoane-tablete",
        "icon": "Smartphone",
        "subcategories": [
            {
                "name": "Telefoane Mobile",
                "slug": "telefoane-mobile",
                "subcategories": [
                    {"name": "Smartphone Android", "slug": "smartphone-android"},
                    {"name": "iPhone", "slug": "iphone"},
                    {"name": "Telefoane Simple", "slug": "telefoane-simple"},
                ]
            },
            {
                "name": "Tablete",
                "slug": "tablete",
                "subcategories": [
                    {"name": "Tablete Android", "slug": "tablete-android"},
                    {"name": "iPad", "slug": "ipad"},
                    {"name": "Tablete Windows", "slug": "tablete-windows"},
                ]
            },
            {"name": "Smartwatch & Wearables", "slug": "smartwatch-wearables"},
            {"name": "Accesorii Telefoane", "slug": "accesorii-telefoane"},
        ]
    },
    {
        "name": "Laptop, PC & Periferice",
        "slug": "laptop-pc",
        "icon": "Laptop",
        "subcategories": [
            {
                "name": "Laptopuri",
                "slug": "laptopuri",
                "subcategories": [
                    {"name": "Laptopuri Gaming", "slug": "laptopuri-gaming"},
                    {"name": "Laptopuri Business", "slug": "laptopuri-business"},
                    {"name": "Ultrabook", "slug": "ultrabook"},
                    {"name": "Chromebook", "slug": "chromebook"},
                ]
            },
            {
                "name": "Calculatoare Desktop",
                "slug": "calculatoare-desktop",
                "subcategories": [
                    {"name": "PC Gaming", "slug": "pc-gaming"},
                    {"name": "PC Office", "slug": "pc-office"},
                    {"name": "Workstation", "slug": "workstation"},
                ]
            },
            {
                "name": "Monitoare",
                "slug": "monitoare",
                "subcategories": [
                    {"name": "Monitoare Gaming", "slug": "monitoare-gaming"},
                    {"name": "Monitoare Profesionale", "slug": "monitoare-profesionale"},
                ]
            },
            {"name": "Tastaturi & Mouse", "slug": "tastaturi-mouse"},
            {"name": "Componente PC", "slug": "componente-pc"},
        ]
    },
    {
        "name": "TV & Audio-Video",
        "slug": "tv-audio-video",
        "icon": "Tv",
        "subcategories": [
            {
                "name": "Televizoare",
                "slug": "televizoare",
                "subcategories": [
                    {"name": "Smart TV", "slug": "smart-tv"},
                    {"name": "TV OLED", "slug": "tv-oled"},
                    {"name": "TV QLED", "slug": "tv-qled"},
                    {"name": "TV 4K & 8K", "slug": "tv-4k-8k"},
                ]
            },
            {
                "name": "Sisteme Audio",
                "slug": "sisteme-audio",
                "subcategories": [
                    {"name": "Soundbar", "slug": "soundbar"},
                    {"name": "Boxe Active", "slug": "boxe-active"},
                    {"name": "Sisteme Home Cinema", "slug": "sisteme-home-cinema"},
                ]
            },
            {"name": "Casti & Accesorii Audio", "slug": "casti-audio"},
        ]
    },
    {
        "name": "Electrocasnice Mari",
        "slug": "electrocasnice-mari",
        "icon": "Refrigerator",
        "subcategories": [
            {
                "name": "Frigidere",
                "slug": "frigidere",
                "subcategories": [
                    {"name": "Frigidere Side by Side", "slug": "frigidere-side-by-side"},
                    {"name": "Frigidere Combinate", "slug": "frigidere-combinate"},
                    {"name": "Frigidere 1 Usa", "slug": "frigidere-1-usa"},
                ]
            },
            {"name": "Masini de Spalat", "slug": "masini-spalat"},
            {"name": "Aragaze & Cuptoare", "slug": "aragaze-cuptoare"},
            {"name": "Masini de Spalat Vase", "slug": "masini-spalat-vase"},
        ]
    },
    {
        "name": "Gaming & Console",
        "slug": "gaming-console",
        "icon": "Gamepad2",
        "subcategories": [
            {
                "name": "Console Gaming",
                "slug": "console-gaming",
                "subcategories": [
                    {"name": "PlayStation", "slug": "playstation"},
                    {"name": "Xbox", "slug": "xbox"},
                    {"name": "Nintendo", "slug": "nintendo"},
                ]
            },
            {"name": "Jocuri Video", "slug": "jocuri-video"},
            {"name": "Accesorii Gaming", "slug": "accesorii-gaming"},
        ]
    },
    {
        "name": "Fashion & Imbracaminte",
        "slug": "fashion",
        "icon": "Shirt",
        "subcategories": [
            {"name": "Haine Barbati", "slug": "haine-barbati"},
            {"name": "Haine Femei", "slug": "haine-femei"},
            {"name": "Incaltaminte", "slug": "incaltaminte"},
            {"name": "Accesorii Moda", "slug": "accesorii-moda"},
        ]
    },
    {
        "name": "Casa & Gradina",
        "slug": "casa-gradina",
        "icon": "Home",
        "subcategories": [
            {"name": "Mobilier", "slug": "mobilier"},
            {"name": "Decoratiuni", "slug": "decoratiuni"},
            {"name": "Scule & Unelte", "slug": "scule-unelte"},
            {"name": "Gradinarit", "slug": "gradinarit"},
        ]
    },
    {
        "name": "Sport & Outdoor",
        "slug": "sport-outdoor",
        "icon": "Dumbbell",
        "subcategories": [
            {"name": "Fitness & Cardio", "slug": "fitness-cardio"},
            {"name": "Biciclete", "slug": "biciclete"},
            {"name": "Camping", "slug": "camping"},
            {"name": "Echipament Sportiv", "slug": "echipament-sportiv"},
        ]
    },
]

# Product templates for generation
PRODUCT_BRANDS = {
    "telefoane-mobile": ["Samsung", "Apple", "Xiaomi", "Huawei", "OnePlus", "Google", "Motorola"],
    "laptopuri": ["Lenovo", "Dell", "HP", "Asus", "Acer", "MSI", "Apple"],
    "televizoare": ["Samsung", "LG", "Sony", "Philips", "Panasonic"],
    "frigidere": ["Samsung", "LG", "Whirlpool", "Bosch", "Arctic"],
    "console-gaming": ["Sony", "Microsoft", "Nintendo"],
}

def generate_products_for_category(category_name, category_slug, category_id, count=10):
    """Generate random products for a category"""
    products = []
    brands = PRODUCT_BRANDS.get(category_slug, ["Brand A", "Brand B", "Brand C"])
    
    for i in range(count):
        brand = random.choice(brands)
        model = f"Model {random.randint(100, 999)}"
        price = random.randint(500, 8000)
        discount_chance = random.random()
        
        product = {
            "_id": str(uuid.uuid4()),
            "name": f"{brand} {category_name} {model}",
            "slug": f"{category_slug}-{brand.lower()}-{i+1}",
            "description": f"Produs {category_name} de calitate premium de la {brand}. Caracteristici excelente și garantie completa.",
            "price": price,
            "discountPrice": int(price * 0.85) if discount_chance > 0.7 else None,
            "category": category_slug,
            "categoryId": category_id,
            "brand": brand,
            "stock": random.randint(5, 100),
            "images": [
                f"https://placehold.co/600x400/0ea5e9/white?text={brand}+{i+1}",
                f"https://placehold.co/600x400/10b981/white?text={brand}+{i+1}"
            ],
            "rating": round(random.uniform(3.5, 5.0), 1),
            "reviewCount": random.randint(10, 500),
            "featured": random.random() > 0.8,
            "specifications": {
                "Garantie": "24 luni",
                "Producator": brand,
                "Model": model
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        products.append(product)
    
    return products

async def create_categories_recursive(structure, parent_id=None):
    """Create categories recursively and return all categories and products"""
    all_categories = []
    all_products = []
    
    for item in structure:
        category_id = str(uuid.uuid4())
        category = {
            "_id": category_id,
            "name": item["name"],
            "slug": item["slug"],
            "icon": item.get("icon"),
            "parentId": parent_id,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        all_categories.append(category)
        
        # Generate products for this category
        if parent_id:  # Only generate products for subcategories (not top-level)
            products = generate_products_for_category(
                item["name"], 
                item["slug"], 
                category_id,
                count=random.randint(15, 30)  # 15-30 products per subcategory
            )
            all_products.extend(products)
        
        # Process subcategories recursively
        if "subcategories" in item:
            sub_cats, sub_products = await create_categories_recursive(item["subcategories"], category_id)
            all_categories.extend(sub_cats)
            all_products.extend(sub_products)
    
    return all_categories, all_products

async def seed_rich_database():
    print("🌱 Starting RICH database seeding...")
    
    # Create admin user
    print("Creating admin user...")
    admin_user = {
        "_id": str(uuid.uuid4()),
        "name": "Admin User",
        "email": "admin@r32.ro",
        "password": get_password_hash("admin123"),
        "phone": "0700000000",
        "address": "Admin Address",
        "role": "admin",
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": "admin@r32.ro"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print("✅ Admin user created")
    else:
        print("ℹ️  Admin user already exists")
    
    # Create categories and products
    print("\n📂 Creating rich category structure...")
    all_categories, all_products = await create_categories_recursive(CATEGORIES_STRUCTURE)
    
    print(f"   Generated {len(all_categories)} categories")
    print(f"   Generated {len(all_products)} products")
    
    # Clear existing data
    print("\n🗑️  Clearing old data...")
    await db.categories.delete_many({})
    await db.products.delete_many({})
    
    # Insert new data
    print("\n💾 Inserting new data...")
    if all_categories:
        await db.categories.insert_many(all_categories)
        print(f"✅ Inserted {len(all_categories)} categories")
    
    if all_products:
        await db.products.insert_many(all_products)
        print(f"✅ Inserted {len(all_products)} products")
    
    # Create backup JSON
    print("\n📦 Creating backup JSON...")
    backup_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "database": os.environ['DB_NAME'],
        "collections": {
            "categories": all_categories,
            "products": all_products,
            "users": [admin_user]
        }
    }
    
    # Save to desktop - try different possible paths
    desktop_paths = [
        Path.home() / "Desktop" / "r32_backup.json",
        Path.home() / "Downloads" / "r32_backup.json",
        Path("/app") / "r32_backup.json"
    ]
    
    saved = False
    for path in desktop_paths:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            print(f"✅ Backup saved to: {path}")
            saved = True
            break
        except Exception as e:
            print(f"⚠️  Could not save to {path}: {e}")
    
    if not saved:
        print("❌ Could not save backup to any location")
    
    print("\n✅ RICH DATABASE SEEDING COMPLETE!")
    print(f"   📊 Total categories: {len(all_categories)}")
    print(f"   📦 Total products: {len(all_products)}")
    print(f"   👤 Admin: admin@r32.ro / admin123")

if __name__ == "__main__":
    asyncio.run(seed_rich_database())
