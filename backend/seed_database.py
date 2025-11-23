"""
Seed database with initial data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from utils.auth import get_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'r32_ecommerce')]

async def seed_database():
    print("Starting database seeding...")
    
    # Clear existing data
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.categories.delete_many({})
    await db.carts.delete_many({})
    await db.orders.delete_many({})
    await db.reviews.delete_many({})
    await db.wishlists.delete_many({})
    
    # Create admin user
    print("Creating admin user...")
    admin_user = {
        "name": "Admin User",
        "email": "admin@r32.ro",
        "password": get_password_hash("admin123"),
        "phone": "0700000000",
        "address": "Admin Address",
        "role": "admin",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    await db.users.insert_one(admin_user)
    print("✅ Admin user created (email: admin@r32.ro, password: admin123)")
    
    # Create test user
    test_user = {
        "name": "Ion Popescu",
        "email": "ion@test.ro",
        "password": get_password_hash("test123"),
        "phone": "0712345678",
        "address": "Str. Exemplu nr. 123, București",
        "role": "user",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    await db.users.insert_one(test_user)
    print("✅ Test user created (email: ion@test.ro, password: test123)")
    
    # Create categories
    print("Creating categories...")
    # First create main categories
    main_categories = [
        {"name": "Telefoane & Tablete", "slug": "telefoane-tablete", "icon": "Smartphone", "description": "Smartphone-uri și tablete", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Laptop, PC & Periferice", "slug": "laptop-pc", "icon": "Laptop", "description": "Laptopuri, computere și accesorii", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "TV, Audio-Video & Foto", "slug": "tv-audio-video", "icon": "Tv", "description": "Televizoare, audio și foto", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Electrocasnice", "slug": "electrocasnice", "icon": "Refrigerator", "description": "Frigidere, mașini de spălat și altele", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Gaming", "slug": "gaming", "icon": "Gamepad2", "description": "Console, jocuri și accesorii gaming", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Fashion", "slug": "fashion", "icon": "Shirt", "description": "Îmbrăcăminte și încălțăminte", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Carte", "slug": "carte", "icon": "BookOpen", "description": "Cărți și reviste", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Casă & Grădină", "slug": "casa-gradina", "icon": "Home", "description": "Produse pentru casă și grădină", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Sport", "slug": "sport", "icon": "Dumbbell", "description": "Echipament sportiv", "parentId": None, "createdAt": datetime.utcnow()},
        {"name": "Jucării & Copii", "slug": "jucarii-copii", "icon": "Baby", "description": "Jucării și produse pentru copii", "parentId": None, "createdAt": datetime.utcnow()},
    ]
    result = await db.categories.insert_many(main_categories)
    category_ids = {cat['slug']: str(result.inserted_ids[i]) for i, cat in enumerate(main_categories)}
    print(f"✅ Created {len(main_categories)} main categories")
    
    # Create subcategories
    subcategories = [
        # Telefoane & Tablete subcategories
        {"name": "Telefoane Mobile", "slug": "telefoane-mobile", "icon": None, "description": "Smartphone-uri", "parentId": category_ids['telefoane-tablete'], "createdAt": datetime.utcnow()},
        {"name": "Tablete", "slug": "tablete", "icon": None, "description": "Tablete și iPad-uri", "parentId": category_ids['telefoane-tablete'], "createdAt": datetime.utcnow()},
        {"name": "Smartwatch & Wearables", "slug": "smartwatch-wearables", "icon": None, "description": "Ceasuri inteligente", "parentId": category_ids['telefoane-tablete'], "createdAt": datetime.utcnow()},
        {"name": "Accesorii Telefoane", "slug": "accesorii-telefoane", "icon": None, "description": "Huse, folii, încărcătoare", "parentId": category_ids['telefoane-tablete'], "createdAt": datetime.utcnow()},
        
        # Laptop, PC subcategories
        {"name": "Laptopuri", "slug": "laptopuri", "icon": None, "description": "Laptop-uri și notebook-uri", "parentId": category_ids['laptop-pc'], "createdAt": datetime.utcnow()},
        {"name": "Calculatoare Desktop", "slug": "calculatoare-desktop", "icon": None, "description": "PC-uri desktop", "parentId": category_ids['laptop-pc'], "createdAt": datetime.utcnow()},
        {"name": "Monitoare", "slug": "monitoare", "icon": None, "description": "Monitoare PC", "parentId": category_ids['laptop-pc'], "createdAt": datetime.utcnow()},
        {"name": "Tastaturi & Mouse", "slug": "tastaturi-mouse", "icon": None, "description": "Periferice", "parentId": category_ids['laptop-pc'], "createdAt": datetime.utcnow()},
        {"name": "Imprimante & Scannere", "slug": "imprimante-scannere", "icon": None, "description": "Echipamente birou", "parentId": category_ids['laptop-pc'], "createdAt": datetime.utcnow()},
        
        # TV, Audio-Video subcategories
        {"name": "Televizoare", "slug": "televizoare", "icon": None, "description": "LED, OLED, QLED", "parentId": category_ids['tv-audio-video'], "createdAt": datetime.utcnow()},
        {"name": "Soundbar & Boxe", "slug": "soundbar-boxe", "icon": None, "description": "Sisteme audio", "parentId": category_ids['tv-audio-video'], "createdAt": datetime.utcnow()},
        {"name": "Căști & Earbuds", "slug": "casti-earbuds", "icon": None, "description": "Căști audio", "parentId": category_ids['tv-audio-video'], "createdAt": datetime.utcnow()},
        {"name": "Camere Foto & Video", "slug": "camere-foto-video", "icon": None, "description": "DSLR, mirrorless", "parentId": category_ids['tv-audio-video'], "createdAt": datetime.utcnow()},
        
        # Gaming subcategories
        {"name": "Console Gaming", "slug": "console-gaming", "icon": None, "description": "PlayStation, Xbox, Nintendo", "parentId": category_ids['gaming'], "createdAt": datetime.utcnow()},
        {"name": "Jocuri Video", "slug": "jocuri-video", "icon": None, "description": "Jocuri pentru console", "parentId": category_ids['gaming'], "createdAt": datetime.utcnow()},
        {"name": "Accesorii Gaming", "slug": "accesorii-gaming", "icon": None, "description": "Controllere, headset-uri", "parentId": category_ids['gaming'], "createdAt": datetime.utcnow()},
        {"name": "PC Gaming", "slug": "pc-gaming", "icon": None, "description": "Calculatoare gaming", "parentId": category_ids['gaming'], "createdAt": datetime.utcnow()},
        
        # Fashion subcategories
        {"name": "Pantofi Sport", "slug": "pantofi-sport", "icon": None, "description": "Adidași", "parentId": category_ids['fashion'], "createdAt": datetime.utcnow()},
        {"name": "Îmbrăcăminte Bărbați", "slug": "imbracaminte-barbati", "icon": None, "description": "Haine bărbați", "parentId": category_ids['fashion'], "createdAt": datetime.utcnow()},
        {"name": "Îmbrăcăminte Femei", "slug": "imbracaminte-femei", "icon": None, "description": "Haine femei", "parentId": category_ids['fashion'], "createdAt": datetime.utcnow()},
        {"name": "Accesorii Fashion", "slug": "accesorii-fashion", "icon": None, "description": "Genți, curele, ceasuri", "parentId": category_ids['fashion'], "createdAt": datetime.utcnow()},
    ]
    await db.categories.insert_many(subcategories)
    print(f"✅ Created {len(subcategories)} subcategories")
    
    # Get subcategory IDs for easier reference
    all_subcats = await db.categories.find({"parentId": {"$ne": None}}).to_list(length=None)
    subcat_ids = {cat['slug']: cat['_id'] for cat in all_subcats}
    
    # Create products
    print("Creating products...")
    products = [
        # Telefoane Mobile
        {
            "name": "Samsung Galaxy S24 Ultra 256GB",
            "description": "Telefon Samsung Galaxy S24 Ultra cu ecran Dynamic AMOLED 2X de 6.8 inch, procesor Snapdragon 8 Gen 3, cameră de 200MP și baterie de 5000mAh.",
            "category": "telefoane-mobile",
            "brand": "Samsung",
            "price": 5499,
            "oldPrice": 6299,
            "rating": 4.8,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80"],
            "inStock": True,
            "stock": 50,
            "isNew": True,
            "discount": 13,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "iPhone 15 Pro Max 512GB",
            "description": "iPhone 15 Pro Max cu ecran Super Retina XDR, chip A17 Pro și sistem foto Pro cu zoom optic 5x.",
            "category": "telefoane-mobile",
            "brand": "Apple",
            "price": 7899,
            "oldPrice": None,
            "rating": 4.9,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80"],
            "inStock": True,
            "stock": 30,
            "isNew": True,
            "discount": 0,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Google Pixel 8 Pro 128GB",
            "description": "Google Pixel 8 Pro cu ecran OLED de 6.7 inch, procesor Google Tensor G3 și cameră de 50MP cu AI.",
            "category": "telefoane-mobile",
            "brand": "Google",
            "price": 4299,
            "oldPrice": 4899,
            "rating": 4.7,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80"],
            "inStock": True,
            "stock": 25,
            "isNew": False,
            "discount": 12,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Xiaomi 14 Pro 512GB",
            "description": "Xiaomi 14 Pro cu ecran AMOLED de 6.73 inch, procesor Snapdragon 8 Gen 3 și încărcare rapidă 120W.",
            "category": "telefoane-mobile",
            "brand": "Xiaomi",
            "price": 3999,
            "oldPrice": None,
            "rating": 4.6,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"],
            "inStock": True,
            "stock": 40,
            "isNew": True,
            "discount": 0,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Tablete
        {
            "name": "Samsung Galaxy Tab S9+ 256GB",
            "description": "Tabletă Samsung Galaxy Tab S9+ cu ecran Dynamic AMOLED 2X de 12.4 inch și S Pen inclus.",
            "category": "tablete",
            "brand": "Samsung",
            "price": 4499,
            "oldPrice": 5299,
            "rating": 4.7,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80"],
            "inStock": True,
            "stock": 20,
            "isNew": False,
            "discount": 15,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "iPad Pro 12.9\" M2 512GB",
            "description": "iPad Pro cu chip M2, ecran Liquid Retina XDR de 12.9 inch și suport pentru Apple Pencil.",
            "category": "tablete",
            "brand": "Apple",
            "price": 6799,
            "oldPrice": None,
            "rating": 4.9,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1585790050230-5dd28404f9bc?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1585790050230-5dd28404f9bc?w=500&q=80"],
            "inStock": True,
            "stock": 15,
            "isNew": True,
            "discount": 0,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Smartwatch & Wearables
        {
            "name": "Apple Watch Series 9 GPS 45mm",
            "description": "Apple Watch Series 9 cu ecran Retina Always-On și chip S9 pentru performanță îmbunătățită.",
            "category": "smartwatch-wearables",
            "brand": "Apple",
            "price": 2199,
            "oldPrice": 2499,
            "rating": 4.8,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
            "inStock": True,
            "stock": 35,
            "isNew": False,
            "discount": 12,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Samsung Galaxy Watch 6 Classic 47mm",
            "description": "Samsung Galaxy Watch 6 Classic cu ecran Super AMOLED și rotativă fizică pentru navigare ușoară.",
            "category": "smartwatch-wearables",
            "brand": "Samsung",
            "price": 1799,
            "oldPrice": None,
            "rating": 4.6,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1617625802912-cde586faf331?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1617625802912-cde586faf331?w=500&q=80"],
            "inStock": True,
            "stock": 28,
            "isNew": True,
            "discount": 0,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Laptopuri
        {
            "name": "Laptop Lenovo IdeaPad 3 15.6\" Intel Core i5",
            "description": "Laptop Lenovo IdeaPad 3 cu procesor Intel Core i5, 16GB RAM, SSD 512GB și ecran Full HD de 15.6 inch.",
            "category": "laptopuri",
            "brand": "Lenovo",
            "price": 2799,
            "oldPrice": 3299,
            "rating": 4.5,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80"],
            "inStock": True,
            "stock": 25,
            "isNew": False,
            "discount": 15,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "MacBook Pro 16\" M3 Pro 512GB",
            "description": "MacBook Pro cu chip M3 Pro, 18GB RAM, SSD 512GB și ecran Liquid Retina XDR de 16 inch.",
            "category": "laptopuri",
            "brand": "Apple",
            "price": 13999,
            "oldPrice": None,
            "rating": 4.9,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80"],
            "inStock": True,
            "stock": 15,
            "isNew": True,
            "discount": 0,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "ASUS ROG Strix G16 RTX 4060",
            "description": "Laptop gaming ASUS ROG Strix G16 cu procesor Intel Core i7, RTX 4060, 16GB RAM și ecran 165Hz.",
            "category": "laptopuri",
            "brand": "Asus",
            "price": 5999,
            "oldPrice": 6999,
            "rating": 4.7,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80"],
            "inStock": True,
            "stock": 18,
            "isNew": False,
            "discount": 14,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "HP Pavilion 15 AMD Ryzen 7",
            "description": "Laptop HP Pavilion 15 cu procesor AMD Ryzen 7, 16GB RAM, SSD 512GB și ecran Full HD.",
            "category": "laptopuri",
            "brand": "HP",
            "price": 3299,
            "oldPrice": None,
            "rating": 4.4,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"],
            "inStock": True,
            "stock": 22,
            "isNew": False,
            "discount": 0,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        
        # Monitoare
        {
            "name": "Monitor Samsung Odyssey G7 32\" 240Hz",
            "description": "Monitor gaming curbat Samsung Odyssey G7 cu rezoluție QHD, 240Hz și timp de răspuns 1ms.",
            "category": "monitoare",
            "brand": "Samsung",
            "price": 2499,
            "oldPrice": 2999,
            "rating": 4.8,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"],
            "inStock": True,
            "stock": 15,
            "isNew": False,
            "discount": 17,
            "featured": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Monitor LG UltraWide 34\" 5K",
            "description": "Monitor ultrawide LG 34 inch cu rezoluție 5K2K, suport HDR10 și acoperire 98% DCI-P3.",
            "category": "monitoare",
            "brand": "LG",
            "price": 4299,
            "oldPrice": None,
            "rating": 4.7,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&q=80"],
            "inStock": True,
            "stock": 12,
            "isNew": True,
            "discount": 0,
            "featured": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Samsung Smart TV 65\" QLED 4K",
            "description": "Televizor Samsung QLED 4K cu ecran de 65 inch, tehnologie Quantum Dot și sistem Smart TV Tizen.",
            "category": "tv-audio-video",
            "brand": "Samsung",
            "price": 4299,
            "oldPrice": 5199,
            "rating": 4.7,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80"],
            "inStock": True,
            "stock": 20,
            "isNew": False,
            "discount": 17,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "LG OLED TV 55\" 4K Smart",
            "description": "Televizor LG OLED cu ecran de 55 inch, tehnologie self-lit pixels și suport pentru Dolby Vision IQ.",
            "category": "tv-audio-video",
            "brand": "LG",
            "price": 5699,
            "oldPrice": None,
            "rating": 4.8,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80"],
            "inStock": True,
            "stock": 12,
            "isNew": True,
            "discount": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "PlayStation 5 Slim Digital Edition",
            "description": "Consolă PlayStation 5 Slim Digital Edition cu SSD de 1TB și suport pentru jocuri 4K.",
            "category": "gaming",
            "brand": "Sony",
            "price": 2499,
            "oldPrice": 2799,
            "rating": 4.9,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80"],
            "inStock": False,
            "stock": 0,
            "isNew": True,
            "discount": 11,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Xbox Series X 1TB",
            "description": "Consolă Xbox Series X cu 1TB SSD, suport 4K și 120fps, compatibilă cu jocuri Xbox și Game Pass.",
            "category": "gaming",
            "brand": "Microsoft",
            "price": 2699,
            "oldPrice": None,
            "rating": 4.8,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&q=80"],
            "inStock": True,
            "stock": 18,
            "isNew": False,
            "discount": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Frigider Samsung Side by Side 617L",
            "description": "Frigider Samsung Side by Side cu capacitate totală de 617L, tehnologie No Frost și dispenser apă/gheață.",
            "category": "electrocasnice",
            "brand": "Samsung",
            "price": 4899,
            "oldPrice": 5799,
            "rating": 4.6,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80"],
            "inStock": True,
            "stock": 10,
            "isNew": False,
            "discount": 16,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Mașină de spălat Bosch Serie 6 9kg",
            "description": "Mașină de spălat Bosch Serie 6 cu capacitate de 9kg, clasa energetică A și tehnologie VarioPerfect.",
            "category": "electrocasnice",
            "brand": "Bosch",
            "price": 2999,
            "oldPrice": None,
            "rating": 4.7,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80"],
            "inStock": True,
            "stock": 15,
            "isNew": False,
            "discount": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Nike Air Max 270 React",
            "description": "Adidași Nike Air Max 270 React cu sistem de amortizare Air Max și design modern.",
            "category": "fashion",
            "brand": "Nike",
            "price": 599,
            "oldPrice": 799,
            "rating": 4.4,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"],
            "inStock": True,
            "stock": 40,
            "isNew": False,
            "discount": 25,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Adidas Ultraboost 22",
            "description": "Adidași Adidas Ultraboost 22 cu tehnologie Boost și talpă Continental pentru aderență maximă.",
            "category": "fashion",
            "brand": "Adidas",
            "price": 699,
            "oldPrice": None,
            "rating": 4.6,
            "reviews": 0,
            "image": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
            "images": ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"],
            "inStock": True,
            "stock": 35,
            "isNew": True,
            "discount": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
    ]
    await db.products.insert_many(products)
    print(f"✅ Created {len(products)} products")
    
    print("\n✅ Database seeding completed successfully!")
    print("\n📝 Login credentials:")
    print("   Admin: admin@r32.ro / admin123")
    print("   User: ion@test.ro / test123")

if __name__ == "__main__":
    asyncio.run(seed_database())
