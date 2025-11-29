# 🔧 Create Admin User - Instructions

## 📋 Când să folosești acest script:

Folosește acest script când:
- ✅ Ai făcut deployment pe r32.ro
- ✅ Încerci să te loghezi la `/admin/login` 
- ❌ Primești eroare "Email sau parolă incorectă"
- ❌ User-ul admin nu există în baza de date

---

## 🚀 Metoda 1: Script Bash (RAPID)

```bash
./scripts/create_admin.sh
```

**Ce face:**
1. Se conectează la MongoDB Atlas
2. Verifică dacă user-ul admin există
3. Dacă NU există, îl creează
4. Afișează credențialele

---

## 🚀 Metoda 2: Script Python Direct

```bash
cd backend
export $(cat .env | xargs)
python3 create_admin_user.py
```

---

## 🚀 Metoda 3: Din Emergent Terminal

Dacă ai acces la terminal în Emergent după deployment:

```bash
cd /app/backend
export $(cat .env | xargs)
python3 create_admin_user.py
```

---

## 📊 Output-ul script-ului:

### ✅ User există deja:

```
✅ Admin user already exists!
   User ID: xxx-xxx-xxx
   Name: Admin User
   Role: admin

ℹ️  No action needed. You can login with:
   Email: admin@r32.ro
   Password: admin123
```

### ✅ User creat cu succes:

```
✅ ✅ ✅  ADMIN USER CREATED SUCCESSFULLY!  ✅ ✅ ✅

📋 Admin Credentials:
   Email: admin@r32.ro
   Password: admin123

🔗 Login URL:
   https://r32.ro/admin/login
```

---

## 🔐 Credențiale Admin Default:

- **Email:** `admin@r32.ro`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Schimbă parola imediat după primul login!

---

## 📝 Ce face scriptul:

1. **Verifică** dacă user-ul `admin@r32.ro` există
2. **Dacă NU există:**
   - Creează user cu UUID
   - Hash-uiește parola `admin123` cu bcrypt
   - Setează role `admin`
   - Inserează în collection `users`
3. **Afișează** statistici database (users, products, categories)

---

## 🐛 Troubleshooting

### Eroare: "KeyError: 'JWT_SECRET_KEY'"

**Cauză:** Variabilele de mediu nu sunt exportate

**Soluție:**
```bash
cd /app/backend
export $(cat .env | xargs)
python3 create_admin_user.py
```

### Eroare: "Connection failed"

**Cauză:** MongoDB Atlas connection string invalid sau network access

**Soluție:**
1. Verifică `MONGO_URL` în `backend/.env`
2. Verifică Network Access în MongoDB Atlas (0.0.0.0/0)
3. Verifică că user-ul `r32user` există în Database Access

### Eroare: "authentication failed"

**Cauză:** User-ul MongoDB sau parola sunt incorecte

**Soluție:**
1. Verifică user-ul `r32user` în MongoDB Atlas
2. Resetează parola user-ului
3. Actualizează `MONGO_URL` în `backend/.env`

---

## 📋 După ce ai creat user-ul admin:

### 1. Testează Login-ul:

```
https://r32.ro/admin/login
```

- Email: `admin@r32.ro`
- Password: `admin123`

### 2. Populează Baza de Date:

Dacă vezi `Products: 0` în output:

1. Login în admin panel
2. Mergi la secțiunea **Backup**
3. Click **Restore** sau **Upload Backup**
4. Încarcă fișierul: `r32_backup.json`
5. Așteaptă 2-3 minute
6. Refresh page

### 3. Schimbă Parola Admin:

**CRITICAL pentru producție:**

1. Admin Panel → Utilizatori
2. Editează user `admin@r32.ro`
3. Schimbă parola
4. Salvează

---

## 🔄 Run Script Multiple Times?

**Este SAFE!** Script-ul verifică întâi dacă user-ul există:
- Dacă există → Nu face nimic, doar afișează info
- Dacă NU există → Îl creează

---

## 📊 Database Statistics

Script-ul afișează automat:
- **Users:** Număr de utilizatori
- **Products:** Număr de produse
- **Categories:** Număr de categorii

**Dacă toate sunt 0** → Database-ul este gol, restaurează backup-ul!

---

## 🎯 Success Checklist:

- [ ] Script executat cu succes
- [ ] User admin creat (sau confirmat că există)
- [ ] Login la `/admin/login` funcționează
- [ ] Dashboard admin se încarcă
- [ ] Backup restaurat (dacă DB era gol)
- [ ] Parola admin schimbată

---

## 📞 Need Help?

**Dacă scriptul eșuează:**
1. Verifică connection string-ul MongoDB
2. Verifică că variabilele din `.env` sunt corecte
3. Testează conexiunea manuală la MongoDB
4. Verifică logs-urile pentru erori detaliate

---

## 🔗 Related Files:

- **Script principal:** `/app/backend/create_admin_user.py`
- **Script wrapper:** `/app/scripts/create_admin.sh`
- **Environment:** `/app/backend/.env`
- **Backup file:** `/app/frontend/public/r32_backup.json`

---

**Script creat:** 26 Noiembrie 2025  
**Aplicație:** R32 E-Commerce Platform  
**MongoDB:** Atlas Cloud Database
