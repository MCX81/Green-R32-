# Integrare Modul Facturare în R32 - Ghid Complet

## ✅ Status Integrare

Modulul de facturare **FinRo** este complet integrat în proiectul R32.

### Ce funcționează:
- ✅ Backend integrat: `/api/factura/*`
- ✅ Frontend integrat: `/factura/*`
- ✅ Autentificare unificată (același JWT)
- ✅ Paleta de culori R32 (verde #16a34a)
- ✅ Aceleași colecții MongoDB
- ✅ Export PDF funcțional
- ✅ Deployment funcțional

---

## 🚀 Push la GitHub

### Pas 1: Configurare Git Credentials

Alege una dintre metode:

#### Metodă A: GitHub Personal Access Token (Recomandat)

1. Generează un **Personal Access Token** pe GitHub:
   - Mergi la: https://github.com/settings/tokens
   - Click pe "Generate new token" → "Generate new token (classic)"
   - Selectează scope-uri: `repo` (toate)
   - Copiază token-ul generat

2. Configurează git cu token-ul:
```bash
cd /app
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/MCX81/Green-R32-.git
git push -u origin main
```

#### Metodă B: SSH Key

1. Generează SSH key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
```

2. Adaugă cheia pe GitHub:
   - Mergi la: https://github.com/settings/ssh/new
   - Paste cheia și salvează

3. Configurează remote:
```bash
cd /app
git remote set-url origin git@github.com:MCX81/Green-R32-.git
git push -u origin main
```

### Pas 2: Push Changes

După configurarea credentials:
```bash
cd /app
git push -u origin main
```

---

## 🌐 Configurare Domeniu r32.ro

### Opțiunea 1: Deployment pe Vercel/Netlify (Recomandat)

#### Deploy pe Vercel:

1. **Instalează Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login și Deploy:**
```bash
cd /app
vercel login
vercel --prod
```

3. **Configurare Domeniu:**
   - În Vercel Dashboard → Settings → Domains
   - Adaugă `r32.ro`
   - Configurează DNS-ul domeniul:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     ```

4. **Variabile de Mediu:**
   - În Vercel Dashboard → Settings → Environment Variables
   - Adaugă:
     - `MONGO_URL`: URL-ul MongoDB
     - `DB_NAME`: r32_database
     - `JWT_SECRET`: secret-key-puternic
     - `CORS_ORIGINS`: https://r32.ro

#### Deploy pe Netlify:

1. **Instalează Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login și Deploy:**
```bash
cd /app
netlify login
netlify deploy --prod
```

3. **Configurare Domeniu:**
   - În Netlify Dashboard → Domain Settings
   - Adaugă `r32.ro`
   - Configurează DNS:
     ```
     Type: CNAME
     Name: @
     Value: YOUR_NETLIFY_SUBDOMAIN.netlify.app
     ```

### Opțiunea 2: Server Propriu (VPS/Cloud)

#### Deployment pe VPS:

1. **Pregătește serverul:**
```bash
# Pe server
apt update && apt install -y nginx mongodb docker docker-compose
```

2. **Clonează repo:**
```bash
git clone https://github.com/MCX81/Green-R32-.git /var/www/r32
cd /var/www/r32
```

3. **Configurează Environment:**
```bash
# Backend .env
cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=r32_database
JWT_SECRET=your-strong-secret-key-here
CORS_ORIGINS=https://r32.ro,https://www.r32.ro
RESEND_API_KEY=your-resend-api-key
EOF

# Frontend .env
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=https://r32.ro
EOF
```

4. **Build și Start:**
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 &

# Frontend
cd ../frontend
yarn install
yarn build
```

5. **Configurează Nginx:**
```nginx
# /etc/nginx/sites-available/r32.ro
server {
    listen 80;
    server_name r32.ro www.r32.ro;

    # Frontend
    location / {
        root /var/www/r32/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable și Restart Nginx:**
```bash
ln -s /etc/nginx/sites-available/r32.ro /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

7. **SSL cu Let's Encrypt:**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d r32.ro -d www.r32.ro
```

---

## 📁 Structura Proiect Integrat

```
/app
├── backend/
│   ├── server.py              # Include router facturare
│   ├── routers/
│   │   ├── facturare.py       # ✨ NOU - Toate endpoint-urile facturare
│   │   ├── auth.py            # Autentificare R32
│   │   ├── products.py        # E-commerce R32
│   │   ├── orders.py          # Comenzi R32
│   │   └── ...
│   └── .env                   # Variabile mediu
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          # R32 E-commerce
│   │   │   ├── Catalog.jsx       # R32 E-commerce
│   │   │   ├── Dashboard.js      # ✨ Facturare Dashboard
│   │   │   ├── Companies.js      # ✨ Facturare Companii
│   │   │   ├── Clients.js        # ✨ Facturare Clienți
│   │   │   ├── Products.js       # ✨ Facturare Produse
│   │   │   ├── Invoices.js       # ✨ Facturare Facturi
│   │   │   ├── InvoiceForm.js    # ✨ Creare Factură
│   │   │   └── InvoiceView.js    # ✨ Vizualizare Factură
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Sidebar.js    # ✨ Sidebar Facturare
│   │   ├── context/
│   │   │   └── AuthContext.js    # Autentificare unificată
│   │   └── App.js                # Rutare unificată
│   └── .env
│
└── README.md
```

---

## 🔗 Rute Disponibile

### E-commerce R32:
- `/` - Homepage
- `/catalog` - Catalog produse
- `/product/:id` - Detalii produs
- `/cart` - Coș cumpărături
- `/checkout` - Finalizare comandă
- `/account` - Cont utilizator

### Facturare:
- `/factura` → `/factura/dashboard` - Dashboard facturare
- `/factura/companies` - Gestionare companii
- `/factura/clients` - Gestionare clienți
- `/factura/products` - Gestionare produse/servicii
- `/factura/invoices` - Lista facturi
- `/factura/invoices/new` - Factură nouă
- `/factura/invoices/:id` - Vizualizare factură
- `/factura/reports` - Rapoarte
- `/factura/settings` - Setări

### Admin:
- `/admin` - Admin dashboard
- `/admin/products` - Gestionare produse e-commerce
- `/admin/orders` - Gestionare comenzi
- `/admin/users` - Gestionare utilizatori

### API Backend:
- `/api/auth/*` - Autentificare
- `/api/products/*` - Produse e-commerce
- `/api/orders/*` - Comenzi
- `/api/factura/*` - ✨ Facturare (NOU)
  - `/api/factura/companies` - Companii
  - `/api/factura/clients` - Clienți
  - `/api/factura/products` - Produse facturare
  - `/api/factura/invoices` - Facturi
  - `/api/factura/dashboard/stats` - Statistici

---

## 💾 Colecții MongoDB

### R32 E-commerce:
- `users` - Utilizatori (partajat cu facturare)
- `products` - Produse e-commerce
- `categories` - Categorii
- `orders` - Comenzi
- `cart_items` - Coș cumpărături
- `reviews` - Review-uri

### Facturare (NOI):
- `factura_companies` - Companii utilizator
- `factura_clients` - Clienți facturi
- `factura_products` - Produse/servicii facturare
- `factura_invoices` - Facturi emise

---

## 🎨 Paleta de Culori

```css
/* index.css - Culorile R32 */
:root {
    --primary: 142 71% 45%;          /* Verde #16a34a (green-600) */
    --primary-foreground: 0 0% 98%;  /* Alb pentru text pe verde */
    --accent: 142 71% 45%;           /* Verde */
    --background: 0 0% 100%;         /* Alb */
    --surface: 210 40% 98%;          /* Gray-50 */
    --border: 214 32% 91%;           /* Slate-200 */
    --ring: 142 71% 45%;             /* Verde pentru focus */
}
```

---

## 🧪 Testare

### Test Local:

```bash
# Backend
cd /app/backend
python -m pytest tests/

# Frontend
cd /app/frontend
yarn test

# API Test
curl -X POST https://r32.ro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Facturare:

1. **Login**: https://r32.ro/login
2. **Acces Facturare**: https://r32.ro/factura
3. **Creare Companie**: https://r32.ro/factura/companies
4. **Creare Factură**: https://r32.ro/factura/invoices/new

---

## 📞 Suport și Documentație

### Credențiale Test:
```
Email: test@example.com
Parolă: password123
```

### API Documentation:
- FastAPI Docs: https://r32.ro/docs
- ReDoc: https://r32.ro/redoc

### Resurse:
- GitHub Repo: https://github.com/MCX81/Green-R32-
- Emergent Platform: https://app.emergent.sh

---

## 🔒 Securitate

### Variabile Importante:

```bash
# Backend .env
JWT_SECRET=          # Secret puternic pentru JWT (minim 32 caractere)
RESEND_API_KEY=      # Pentru trimitere email recuperare parolă
MONGO_URL=           # URL MongoDB production

# Frontend .env
REACT_APP_BACKEND_URL=  # URL backend production (https://r32.ro)
```

### Best Practices:
- ✅ Folosește HTTPS pentru production
- ✅ Configurează CORS corect
- ✅ Backup regulat MongoDB
- ✅ Rate limiting pentru API
- ✅ Environment variables pentru secrets
- ✅ SSL certificate cu Let's Encrypt

---

## 🎉 Ready for Production!

Aplicația este complet integrată și gata pentru deployment:
- ✅ Cod integrat în același repository
- ✅ Autentificare unificată
- ✅ Același build process
- ✅ Același styling (verde R32)
- ✅ MongoDB collections separate
- ✅ Nu interferează cu e-commerce

**Next:** Urmează pașii de mai sus pentru deploy și configurare domeniu r32.ro! 🚀
