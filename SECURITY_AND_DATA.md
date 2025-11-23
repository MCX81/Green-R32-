# R32 E-Commerce - Securitate și Gestionare Date

## Securitate Autentificare

### Separarea Adminilor și Utilizatorilor Normali

Aplicația R32 implementează o separare strictă între conturile de admin și conturile de utilizatori normali:

#### 1. **Endpoint-uri Separate de Login**

- **Login Utilizatori Normali**: `/api/auth/login`
  - Permite DOAR utilizatorilor cu rol "user" să se autentifice
  - BLOCHEAZĂ adminii cu mesaj: "Admin users must login through admin panel"
  
- **Login Admin**: `/api/admin/login`
  - Permite DOAR utilizatorilor cu rol "admin" să se autentifice
  - BLOCHEAZĂ utilizatorii normali cu mesaj: "Access denied. Admin privileges required."

#### 2. **Pagini Frontend Separate**

- **Login Public**: `r32.ro/login` → Pentru clienți normali
- **Login Admin**: `r32.ro/admin/login` → Pentru administratori

#### 3. **Credențiale Admin**

```
Email: admin@r32.ro
Parolă: admin123
```

**⚠️ IMPORTANT**: Schimbă această parolă în producție!

---

## Persistența Datelor

### Protecție Împotriva Ștergerii Accidentale

Scriptul `seed_database.py` a fost modificat pentru a **PROTEJA** datele existente:

#### Comportament:

1. **Verifică dacă există date** în baza de date
2. **Dacă există date** → SKIP seed și afișează mesaj:
   ```
   ⚠️  Database already contains data:
      - Categories: 31
      - Products: 27
   Skipping seed to preserve existing data.
   ```

3. **Dacă NU există date** → Populează baza de date cu date inițiale

#### Date Inițiale Create:

- **10 categorii principale**
- **21 subcategorii**
- **27 produse**
- **2 utilizatori**:
  - Admin: admin@r32.ro / admin123
  - Test User: ion@test.ro / test123

---

## Cum să Re-populezi Baza de Date (Dacă Este Necesar)

### Opțiunea 1: Șterge Manual Datele

```bash
cd /app/backend
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')

async def clear_db():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'r32_ecommerce')]
    
    await db.categories.delete_many({})
    await db.products.delete_many({})
    print('✅ Datele au fost șterse')
    
    client.close()

asyncio.run(clear_db())
"
```

### Opțiunea 2: Rulează Seed-ul

După ce ai șters datele manual:

```bash
cd /app/backend
python seed_database.py
```

---

## Verificarea Stării Bazei de Date

Pentru a verifica ce date există în baza de date:

```bash
cd /app/backend
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')

async def check_db():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'r32_ecommerce')]
    
    users = await db.users.count_documents({})
    categories = await db.categories.count_documents({})
    products = await db.products.count_documents({})
    
    print(f'Utilizatori: {users}')
    print(f'Categorii: {categories}')
    print(f'Produse: {products}')
    
    client.close()

asyncio.run(check_db())
"
```

---

## Migrare/Backup Date

### Backup MongoDB

```bash
# Export all collections
mongodump --uri="<MONGO_URL>" --out=/path/to/backup

# Restore from backup
mongorestore --uri="<MONGO_URL>" /path/to/backup
```

---

## Best Practices Producție

1. **Schimbă parola de admin** imediat după deploy
2. **Activează HTTPS** pe domeniul custom
3. **Configurează rate limiting** pe endpoint-urile de login
4. **Monitorizează tentativele de login eșuate**
5. **Creează backup-uri regulate** ale bazei de date
6. **Nu expune endpoint-urile de admin** public (folosește IP whitelisting)

---

## Contact Support

Pentru probleme de securitate sau întrebări despre date:
- Email: support@r32.ro
- Admin Panel: r32.ro/admin
