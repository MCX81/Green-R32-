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
    categories = [
        {"name": "Telefoane & Tablete", "slug": "telefoane-tablete", "icon": "Smartphone", "description": "Smartphone-uri și tablete", "createdAt": datetime.utcnow()},
        {"name": "Laptop, PC & Periferice", "slug": "laptop-pc", "icon": "Laptop", "description": "Laptopuri, computere și accesorii", "createdAt": datetime.utcnow()},
        {"name": "TV, Audio-Video & Foto", "slug": "tv-audio-video", "icon": "Tv", "description": "Televizoare, audio și foto", "createdAt": datetime.utcnow()},
        {"name": "Electrocasnice", "slug": "electrocasnice", "icon": "Refrigerator", "description": "Frigidere, mașini de spălat și altele", "createdAt": datetime.utcnow()},
        {"name": "Gaming", "slug": "gaming", "icon": "Gamepad2", "description": "Console, jocuri și accesorii gaming", "createdAt": datetime.utcnow()},
        {"name": "Fashion", "slug": "fashion", "icon": "Shirt", "description": "Îmbrăcăminte și încălțăminte", "createdAt": datetime.utcnow()},
        {"name": "Carte", "slug": "carte", "icon": "BookOpen", "description": "Cărți și reviste", "createdAt": datetime.utcnow()},
        {"name": "Casă & Grădină", "slug": "casa-gradina", "icon": "Home", "description": "Produse pentru casă și grădină", "createdAt": datetime.utcnow()},
        {"name": "Sport", "slug": "sport", "icon": "Dumbbell", "description": "Echipament sportiv", "createdAt": datetime.utcnow()},
        {"name": "Jucării & Copii", "slug": "jucarii-copii", "icon": "Baby", "description": "Jucării și produse pentru copii", "createdAt": datetime.utcnow()},
    ]
    await db.categories.insert_many(categories)
    print(f"✅ Created {len(categories)} categories")
    
    # Create products
    print("Creating products...")
    products = [
        {
            "name": "Samsung Galaxy S24 Ultra 256GB",
            "description": "Telefon Samsung Galaxy S24 Ultra cu ecran Dynamic AMOLED 2X de 6.8 inch, procesor Snapdragon 8 Gen 3, cameră de 200MP și baterie de 5000mAh.",
            "category": "telefoane-tablete",
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
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "iPhone 15 Pro Max 512GB",
            "description": "iPhone 15 Pro Max cu ecran Super Retina XDR, chip A17 Pro și sistem foto Pro cu zoom optic 5x.",
            "category": "telefoane-tablete",
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
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Laptop Lenovo IdeaPad 3 15.6\" Intel Core i5",
            "description": "Laptop Lenovo IdeaPad 3 cu procesor Intel Core i5, 16GB RAM, SSD 512GB și ecran Full HD de 15.6 inch.",
            "category": "laptop-pc",
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
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "MacBook Pro 16\" M3 Pro 512GB",
            "description": "MacBook Pro cu chip M3 Pro, 18GB RAM, SSD 512GB și ecran Liquid Retina XDR de 16 inch.",
            "category": "laptop-pc",
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
