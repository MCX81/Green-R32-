# 🚀 Deployment Guide - R32 E-Commerce

Ghid complet pentru deployment-ul aplicației R32 pe domeniul **r32.ro**

---

## 📋 Cerințe Pre-Deployment

### 1. MongoDB Atlas
- [ ] Ai un cluster MongoDB Atlas creat
- [ ] Ai connection string-ul MongoDB Atlas
- [ ] Ai whitelist IP-urile necesare (0.0.0.0/0 pentru început, apoi restricționează)

### 2. Domeniu
- [ ] Domeniul r32.ro este configurat și activ
- [ ] DNS-ul pointează corect către Emergent

---

## ⚙️ Variabile de Mediu pentru Producție

### 🎨 Frontend Environment Variables

Fișier: `frontend/.env`

```env
REACT_APP_BACKEND_URL=https://r32.ro
```

**Important:** 
- NU include `/api` la final
- Backend-ul va rula pe același domeniu (r32.ro)
- Request-urile vor merge la `https://r32.ro/api/*`

---

### 🔧 Backend Environment Variables

Fișier: `backend/.env`

```env
# MongoDB Atlas Connection
MONGO_URL=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=r32_production

# JWT Secret (generează unul nou și sigur!)
JWT_SECRET_KEY=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_MIN_32_CHARS

# CORS Origins (permite accesul de pe domeniul tău)
CORS_ORIGINS=https://r32.ro,https://www.r32.ro,http://localhost:3000
```

**Detalii importante:**

1. **MONGO_URL**: 
   - Obține connection string din MongoDB Atlas Dashboard
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
   - Înlocuiește `USERNAME` și `PASSWORD` cu credențialele tale

2. **JWT_SECRET_KEY**: 
   - Generează un string random sigur de minim 32 caractere
   - Exemplu comenzi pentru generare:
     ```bash
     # Python
     python3 -c "import secrets; print(secrets.token_urlsafe(32))"
     
     # OpenSSL
     openssl rand -base64 32
     ```

3. **CORS_ORIGINS**:
   - Adaugă toate domeniile de unde vei accesa API-ul
   - Separă cu virgulă, fără spații
   - Include și varianta cu www dacă o folosești

---

## 📝 Setup pentru MongoDB Atlas

### 1. Creează Cluster (dacă nu ai deja)
1. Mergi la [MongoDB Atlas](https://cloud.mongodb.com)
2. Creează un cluster gratuit (M0)
3. Selectează regiunea cea mai apropiată de utilizatori

### 2. Configurare Network Access
1. Database Access → Add New Database User
   - Username: `r32admin` (sau ce preferi)
   - Password: generează unul sigur
   - Role: `Atlas admin` sau `Read and write to any database`

2. Network Access → Add IP Address
   - Pentru început: `0.0.0.0/0` (permite toate IP-urile)
   - **Mai târziu**: restricționează la IP-urile serverelor tale

### 3. Obține Connection String
1. Clusters → Connect → Connect your application
2. Copiază connection string-ul
3. Înlocuiește `<username>` și `<password>` cu credențialele tale
4. Adaugă în `backend/.env` ca `MONGO_URL`

---

## 🗄️ Popularea Bazei de Date

După deployment, trebuie să populezi baza de date cu date inițiale.

### Opțiunea 1: Folosește Backup-ul Existent

**Pași:**
1. Accesează panoul admin: `https://r32.ro/admin/login`
2. Login cu: `admin@r32.ro` / `admin123`
3. Mergi la secțiunea **Backup**
4. Descarcă fișierul `r32_backup.json` din `frontend/public/`
5. Încarcă-l folosind funcția de restore

**Fișiere backup disponibile:**
- `frontend/public/r32_backup.json` - Full backup (1337 produse, 67 categorii)
- `frontend/public/r32_backup_small.json` - Small backup (50 produse, 10 categorii)

### Opțiunea 2: Run Seed Script Manual

**Doar pentru dezvoltare/testare locală:**
```bash
cd /app/backend
export $(cat .env | xargs)
python3 seed_rich_data.py
```

⚠️ **Nu rula seed scripts direct în producție!** Folosește backup/restore din admin panel.

---

## 🔐 Securitate

### 1. Schimbă Parola Admin

**IMPORTANT:** După primul deployment, schimbă imediat parola admin!

Credențialele default sunt:
- Email: `admin@r32.ro`
- Password: `admin123`

**Pentru a schimba:**
1. Login în admin panel
2. Mergi la Utilizatori
3. Editează userul admin și schimbă parola

### 2. Generează JWT Secret Nou

Nu folosi JWT_SECRET_KEY din development în producție!

```bash
# Generează unul nou
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Restricționează CORS

După ce totul funcționează, restricționează `CORS_ORIGINS` doar la domeniile tale:
```env
CORS_ORIGINS=https://r32.ro,https://www.r32.ro
```

---

## ✅ Checklist Pre-Deployment

- [ ] MongoDB Atlas cluster creat și configurat
- [ ] Connection string obținut și testat
- [ ] JWT_SECRET_KEY generat (minim 32 caractere)
- [ ] `frontend/.env` actualizat cu `REACT_APP_BACKEND_URL=https://r32.ro`
- [ ] `backend/.env` actualizat cu toate variabilele
- [ ] Domeniul r32.ro este configurat
- [ ] Ai făcut commit la toate modificările

---

## 🚀 Deployment Steps

1. **Asigură-te că `.env` files sunt actualizate**
   ```bash
   # Verifică frontend
   cat frontend/.env
   
   # Verifică backend
   cat backend/.env
   ```

2. **Fă commit dacă ai modificări**
   ```bash
   git add .
   git commit -m "Configure for production deployment on r32.ro"
   ```

3. **Inițiază deployment în Emergent**
   - Click pe "Deploy" în interfața Emergent
   - Selectează deployment pentru r32.ro
   - Confirmă deployment-ul

4. **Așteaptă ca build-ul să se finalizeze**
   - Monitorizează logs-urile de build
   - Verifică că nu apar erori

5. **Testează aplicația**
   - Accesează `https://r32.ro`
   - Verifică că homepage-ul se încarcă
   - Testează login admin: `https://r32.ro/admin/login`

---

## 🔍 Verificări Post-Deployment

### 1. Homepage Funcționează
- [ ] Site-ul se încarcă la `https://r32.ro`
- [ ] Categoriile apar în sidebar
- [ ] Logo și branding sunt corecte

### 2. Catalog Funcționează
- [ ] Poți naviga prin categorii
- [ ] Produsele se încarcă
- [ ] Imaginile se afișează

### 3. Admin Panel
- [ ] Login funcționează la `https://r32.ro/admin/login`
- [ ] Dashboard-ul afișează statistici
- [ ] Poți accesa toate secțiunile admin

### 4. API Funcționează
Testează câteva endpoint-uri:
```bash
# Test products
curl https://r32.ro/api/products

# Test categories
curl https://r32.ro/api/categories

# Test health
curl https://r32.ro/api/
```

---

## 🐛 Troubleshooting

### Problema: "Nu s-au putut încărca produsele"

**Soluție:**
1. Verifică că MongoDB Atlas este accesibil
2. Verifică că IP-ul serverului este în whitelist
3. Verifică connection string-ul în `.env`
4. Populează baza de date folosind backup/restore

### Problema: Login admin nu funcționează

**Soluție:**
1. Verifică că backend-ul rulează
2. Populează baza de date (userul admin este creat de seed/backup)
3. Verifică CORS settings în backend `.env`

### Problema: "CORS error" în console

**Soluție:**
1. Verifică `CORS_ORIGINS` în `backend/.env`
2. Asigură-te că include domeniul tău: `https://r32.ro`
3. Redeploy după modificare

### Problema: Imagini produse nu se încarcă

**Soluție:**
1. Verifică că ai folosit backup-ul nou (cu câmpul `image`)
2. Fișierele backup corecte:
   - `frontend/public/r32_backup.json`
   - `frontend/public/r32_backup_small.json`

---

## 📊 Monitorizare

### Logs Backend
Verifică logs-urile pentru erori:
- Erori de conexiune MongoDB
- Erori CORS
- Erori de autentificare

### Performance
- Timpul de răspuns al API-ului
- Timpul de încărcare pagini
- Număr de utilizatori concurenți

---

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică logs-urile de deployment
2. Testează API-ul direct cu curl
3. Verifică că toate variabilele de mediu sunt setate corect
4. Contactează suportul Emergent dacă problema persistă

---

## 🎯 Success!

Dacă toate verificările de mai sus sunt ✅, aplicația ta R32 este live pe **r32.ro**! 🎉

**Next steps:**
1. Schimbă parola admin
2. Populează cu date reale
3. Testează toate funcționalitățile
4. Configurează backup automat
5. Monitorizează performanța

---

**Versiune document:** 1.0  
**Data:** 26 Noiembrie 2025  
**Aplicație:** R32 E-Commerce Platform
