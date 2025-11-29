# ⚡ Quick Start - Create Admin User

## 🚨 Problem: "Email sau parolă incorectă" la admin login?

## ✅ Solution: Run acest script!

---

## 🚀 Metoda RAPIDĂ (Copy-Paste):

```bash
cd /app/backend && export $(cat .env | xargs) && python3 create_admin_user.py
```

**SAU:**

```bash
./scripts/create_admin.sh
```

---

## 📋 Output de așteptat:

```
✅ ✅ ✅  ADMIN USER CREATED SUCCESSFULLY!  ✅ ✅ ✅

📋 Admin Credentials:
   Email: admin@r32.ro
   Password: admin123

🔗 Login URL:
   https://r32.ro/admin/login
```

---

## 🎯 Apoi:

1. **Login:** https://r32.ro/admin/login
   - Email: `admin@r32.ro`
   - Password: `admin123`

2. **Restaurează backup:**
   - Admin Panel → Backup
   - Upload `r32_backup.json`

3. **Schimbă parola!** (IMPORTANT)

---

## 📖 Detalii complete:

Vezi: [CREATE_ADMIN_INSTRUCTIONS.md](./CREATE_ADMIN_INSTRUCTIONS.md)

---

**That's it! Simplu și rapid! 🚀**
