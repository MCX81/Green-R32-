# 🛒 R32 E-Commerce Platform

Clona modernă a EMAG pentru piața românească - platformă e-commerce completă cu React, FastAPI și MongoDB.

---

## 🚀 DEPLOYMENT PE R32.RO

👉 **Citește [DEPLOYMENT.md](./DEPLOYMENT.md)** pentru ghidul complet de deployment pe domeniul tău!

### Quick Steps:

1. **Setup MongoDB Atlas** (vezi DEPLOYMENT.md)
2. **Update Environment Variables:**
   ```bash
   # Frontend
   REACT_APP_BACKEND_URL=https://r32.ro
   
   # Backend  
   MONGO_URL=mongodb+srv://...
   JWT_SECRET_KEY=<generate nou>
   ```
3. **Generate JWT Secret:**
   ```bash
   python3 scripts/generate_jwt_secret.py
   ```
4. **Deploy prin Emergent**
5. **Populează baza de date** cu backup din admin panel

📖 **[CITEȘTE DEPLOYMENT.md PENTRU DETALII COMPLETE](./DEPLOYMENT.md)**

---

## ✨ Features

- ✅ Categorii multi-nivel cu hover panel
- ✅ Catalog produse cu filtrare și sortare  
- ✅ Coș de cumpărături & Wishlist
- ✅ Admin panel complet
- ✅ **Backup & Restore** bază de date
- ✅ 1337 produse, 67 categorii (3 nivele)

---

## 📦 Backup Files

**Locație:** `frontend/public/`

1. **r32_backup.json** - Full (1337 produse, 67 categorii)
2. **r32_backup_small.json** - Small (50 produse, 10 categorii)

**Cum se folosesc:** Admin Panel → Backup → Restore → Upload file

---

## 🔐 Default Admin

- **Email:** admin@r32.ro  
- **Password:** admin123

⚠️ **Schimbă parola în producție!**

---

## 📁 Structure

```
/app
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── scripts/          # Helper scripts
├── DEPLOYMENT.md     # 📖 Ghid deployment complet
└── README.md         # Acest file
```

---

## 🐛 Probleme Comune

### "Nu s-au putut încărca produsele"
→ Populează DB cu backup din `frontend/public/r32_backup.json`

### Admin login nu funcționează  
→ Folosește `/admin/login` (NU `/login`)

### CORS errors
→ Verifică `CORS_ORIGINS` în `backend/.env`

**Mai multe soluții:** Vezi DEPLOYMENT.md

---

## 📞 Ai nevoie de ajutor?

1. ✅ Citește [DEPLOYMENT.md](./DEPLOYMENT.md)
2. ✅ Verifică acest README  
3. ✅ Contactează support

---

**Made with ❤️ for Romanian e-commerce**  
**Version:** 1.0 | **Updated:** 26 Nov 2025
