# 🚀 DEPLOY SIMPLU - R32 pe r32.ro

## ✅ DOAR 2 PAȘI:

---

## 📍 Pasul 1: Deploy prin Emergent

Click pe **"Deploy"** → Selectează **r32.ro** → Confirm

Așteaptă 5-10 minute.

---

## 📍 Pasul 2: Restaurează tot (admin + produse)

**O SINGURĂ COMANDĂ:**

```bash
cd /app/backend && export $(cat .env | xargs) && python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os, json

async def restore():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    with open('/app/frontend/public/r32_backup.json') as f:
        backup = json.load(f)
    
    collections = backup['collections']
    
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.categories.delete_many({})
    
    if 'users' in collections and collections['users']:
        await db.users.insert_many(collections['users'])
        print(f'✅ Users: {len(collections[\"users\"])}')
    
    if 'categories' in collections and collections['categories']:
        await db.categories.insert_many(collections['categories'])
        print(f'✅ Categories: {len(collections[\"categories\"])}')
    
    if 'products' in collections and collections['products']:
        await db.products.insert_many(collections['products'])
        print(f'✅ Products: {len(collections[\"products\"])}')
    
    print()
    print('🎉 GATA!')
    print('Login: https://r32.ro/admin/login')
    print('Email: admin@r32.ro')
    print('Password: admin123')
    
    client.close()

asyncio.run(restore())
"
```

---

## ✅ GATA!

Accesează: **https://r32.ro/admin/login**

- Email: `admin@r32.ro`
- Password: `admin123`

**Schimbă parola după login!**

---

**ATÂT! 2 pași și ești LIVE! 🚀**
