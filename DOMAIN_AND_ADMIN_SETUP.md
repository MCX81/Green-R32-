# 🌐 Setup Domeniu r32.ro & Admin Access

## ✅ Status Deployment

**Deployment URL Curent**: https://market-double-4-replaced-1764108266.emergent.host/

**Status**:
- ✅ Backend: Funcțional
- ✅ Frontend: Funcțional  
- ✅ Admin API: Funcțional (testat cu curl)
- ⚠️ Admin Login UI: Are probleme (se investigează)
- ⚠️ Domeniu r32.ro: Trebuie configurat

---

## 👤 Credențiale Admin

### User Admin Existent:
```
Email: admin@r32.ro
Parolă: admin123
```

**⚠️ IMPORTANT**: Schimbă parola după primul login!

### Verificare Admin User:

1. **Via Browser Console** (temporar până fixăm UI-ul):
```javascript
// Deschide Console (F12) pe https://market-double-4-replaced-1764108266.emergent.host/admin/login

// Login direct cu fetch:
fetch('https://market-double-4-replaced-1764108266.emergent.host/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@r32.ro',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  console.log('Login success!', data);
  window.location.href = '/admin';
});
```

2. **Via curl** (pentru testare):
```bash
curl -X POST "https://market-double-4-replaced-1764108266.emergent.host/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@r32.ro","password":"admin123"}'
```

**Response esperado**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "name": "Admin User",
    "email": "admin@r32.ro",
    "role": "admin",
    ...
  }
}
```

---

## 🌐 Configurare Domeniu r32.ro

### Pas 1: Verifică Status Curent

1. Deschide **Emergent Dashboard**: https://app.emergent.sh
2. Mergi la **Deployments**
3. Găsește deployment-ul **easycart-52** (unde e conectat r32.ro acum)

### Pas 2: Deconectează r32.ro de la easycart-52

În Emergent Dashboard pentru easycart-52:

1. Navighează la **Settings** → **Domains**
2. Găsește domeniul `r32.ro`
3. Click pe **Remove** sau **Disconnect**
4. Confirmă deconectarea

**⚠️ NOTE**: 
- Site-ul easycart-52 va rămâne funcțional pe domeniul Emergent default
- Doar domeniul custom r32.ro va fi eliberat

### Pas 3: Conectează r32.ro la market-double-4

În Emergent Dashboard pentru **market-double-4**:

1. Navighează la deployment-ul curent (market-double-4)
2. Mergi la **Settings** → **Domains**
3. Click pe **Add Custom Domain**
4. Introdu: `r32.ro`
5. Click **Add Domain**

### Pas 4: Configurare DNS

După ce adaugi domeniul în Emergent, vei primi instrucțiuni DNS:

**Opțiunea A: CNAME Record (Recomandat)**
```
Type: CNAME
Name: @
Value: <emergent-provided-cname>
TTL: 300
```

**Opțiunea B: A Record**
```
Type: A
Name: @
Value: <emergent-provided-ip>
TTL: 300
```

**Pentru www subdomain:**
```
Type: CNAME
Name: www
Value: r32.ro
TTL: 300
```

### Pas 5: Așteaptă Propagarea DNS

- **Timp estimat**: 5-30 minute
- **Verificare**: `nslookup r32.ro`
- **Status în Emergent**: Va arăta "✅ Active" când e gata

### Pas 6: SSL Certificate

Emergent va genera automat SSL certificate (Let's Encrypt):
- **Timp**: ~5-10 minute după DNS propagare
- **Status**: Verifică în Emergent Dashboard
- **Result**: https://r32.ro va funcționa

---

## 🔧 Troubleshooting

### Problema 1: Admin Login Button nu face nimic

**Cauze posibile:**
1. **JavaScript Error** în console
2. **CORS Issue** între frontend și backend
3. **Network Error**

**Soluție temporară (Browser Console)**:
```javascript
// Login manual (vezi secțiunea Credențiale Admin mai sus)
fetch('https://market-double-4-replaced-1764108266.emergent.host/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@r32.ro',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location.href = '/admin';
});
```

**Debug Steps:**
1. Deschide Developer Tools (F12)
2. Mergi la **Console** tab
3. Încearcă login
4. Verifică erori JavaScript
5. Mergi la **Network** tab
6. Verifică request-ul la `/api/admin/login`
7. Verifică response-ul

### Problema 2: r32.ro nu se conectează

**Check DNS:**
```bash
# Verifică DNS records
nslookup r32.ro
dig r32.ro

# Verifică CNAME
nslookup r32.ro 8.8.8.8
```

**Check în Browser:**
```bash
# Deschide Developer Tools → Network
# Încearcă să accesezi r32.ro
# Verifică unde pointează request-ul
```

**Soluție**:
- Așteaptă propagarea DNS (până la 48h în cazuri rare)
- Verifică că ai configurat corect CNAME/A record
- Clear browser cache: `Ctrl+Shift+Delete`
- Try incognito mode

### Problema 3: SSL Certificate Error

**Cauze**:
- DNS nu s-a propagat complet
- Certificate în curs de generare

**Soluție**:
- Așteaptă 10-15 minute după DNS propagare
- Verifică status în Emergent Dashboard
- Forțează refresh: `Ctrl+F5`

---

## 🚀 Quick Start Guide

### Pentru Admin pe Domeniul Curent:

1. **Acces direct via Console** (temporar):
```javascript
// Deschide https://market-double-4-replaced-1764108266.emergent.host/admin/login
// Press F12 → Console
// Paste și run:

fetch('https://market-double-4-replaced-1764108266.emergent.host/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@r32.ro', password: 'admin123' })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  alert('Login success! Redirecting...');
  window.location.href = '/admin';
});
```

2. **Acces Admin Dashboard**:
   - URL: https://market-double-4-replaced-1764108266.emergent.host/admin
   - După login, vei vedea panoul admin

3. **Features Admin**:
   - Products management
   - Orders management
   - Users management
   - Statistics
   - Reviews moderation

### Pentru Facturare:

1. **Access**: https://market-double-4-replaced-1764108266.emergent.host/factura
2. **Login**: Poți folosi contul de test sau să creezi unul nou
3. **Features**:
   - Gestionare companii
   - Clienți
   - Produse/Servicii
   - Facturi (toate tipurile)
   - Export PDF
   - Dashboard cu statistici

---

## 📋 Checklist Final

### După Configurare Domeniu:

- [ ] r32.ro pointează către market-double-4
- [ ] DNS propagat (verificat cu nslookup)
- [ ] SSL certificate activ (https funcționează)
- [ ] Homepage funcționează: https://r32.ro/
- [ ] Admin login: https://r32.ro/admin/login
- [ ] Facturare: https://r32.ro/factura
- [ ] E-commerce: https://r32.ro/catalog
- [ ] Toate API-urile răspund corect

### După Login Admin:

- [ ] Dashboard admin se încarcă
- [ ] Poți accesa Products
- [ ] Poți accesa Orders
- [ ] Poți accesa Users
- [ ] Statistics se afișează corect

---

## 🔐 Securitate Post-Deployment

### Schimbă Parola Admin:

1. Login ca admin
2. Mergi la Profile/Settings
3. Schimbă parola din `admin123` la o parolă puternică
4. **Minimum requirements**:
   - 12+ caractere
   - Majuscule + minuscule
   - Cifre
   - Caractere speciale

### Backup Credențiale:

Salvează într-un password manager:
- Email: admin@r32.ro
- Parola: [noua-parola-puternica]
- URL Admin: https://r32.ro/admin/login

---

## 📞 Support

### Probleme Admin Login:

1. Verifică că backend-ul răspunde:
   ```bash
   curl https://market-double-4-replaced-1764108266.emergent.host/api/
   ```

2. Testează admin login API:
   ```bash
   curl -X POST https://market-double-4-replaced-1764108266.emergent.host/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@r32.ro","password":"admin123"}'
   ```

3. Verifică browser console pentru erori JavaScript

### Probleme Domeniu:

1. Verifică DNS: `nslookup r32.ro`
2. Check Emergent Dashboard pentru status
3. Așteaptă propagarea DNS (5-30 min)

### Contact:

- **Emergent Support**: support@emergent.sh
- **Dashboard**: https://app.emergent.sh
- **Docs**: https://docs.emergent.sh

---

## 🎉 Success!

Când totul funcționează:
- ✅ https://r32.ro/ → Homepage
- ✅ https://r32.ro/catalog → E-commerce
- ✅ https://r32.ro/admin → Admin panel
- ✅ https://r32.ro/factura → Module facturare

**Aplicația este LIVE pe domeniul tău! 🚀**
