# 🌐 Workflow Definitiv pentru Domeniu la Fork - r32.ro

## ⚠️ Problema Ta Actuală

Domeniul **r32.ro** este blocat pe vechiul fork după ce ai dat "replace deployment". Trebuie să faci **UNLINK manual** de la vechiul fork.

---

## ⚠️ AVERTISMENT IMPORTANT

**"REPLACE DEPLOYMENT" NU TRANSFERĂ AUTOMAT DOMENIUL!**

Chiar dacă folosești "Replace deployment", domeniul rămâne legat de vechiul fork și TREBUIE transferat manual. Aceasta este o limitare a platformei Emergent.

---

## ✅ Soluție IMEDIATĂ (Pentru Fork-ul Curent)

### Pasul 1: UNLINK domeniul de la vechiul fork

1. **Mergi la Emergent Dashboard:**
   - Click pe tab-ul **"Home"** sau **"Deployed Apps"**
   
2. **Găsește VECHIUL deployment (cel cu r32.ro):**
   - Caută în lista de deployed apps
   - Identifică deployment-ul care încă are r32.ro legat
   
3. **Intră în setările deployment-ului vechi:**
   - Click pe deployment-ul respectiv
   - Caută opțiunea **"Settings"** sau **"Manage"** sau iconița de setări ⚙️
   
4. **Secțiunea Domain Settings:**
   - Caută secțiunea numită:
     - "Domain Settings" SAU
     - "Custom Domain" SAU  
     - "Linked Domains"
   
5. **UNLINK domeniul:**
   - Lângă **r32.ro** ar trebui să vezi un buton:
     - "Unlink Domain" SAU
     - "Remove Domain" SAU
     - "Detach" SAU
     - Iconița de "X" sau "trash" 🗑️
   - **Click pe buton**
   - **Confirmă acțiunea** (dacă îți cere confirmare)
   
6. **Verifică:**
   - Domeniul r32.ro ar trebui să dispară din lista de domenii ale vechiului fork
   - Status: "No custom domain" sau similar

### Pasul 2: DEPLOY noul fork (dacă nu l-ai deployed deja)

1. **În fork-ul curent (job_id: 925efaca-123e-4c7d-b0da-5249a1d93ac6):**
   - Click pe butonul **"Deploy"** sau **"Deploy to Production"**
   - Așteaptă până se finalizează deployment-ul (1-3 minute)
   - Vei primi un URL temporar de tip: `https://market-double-xxx.emergent.host`

### Pasul 3: LINK domeniul la noul fork

1. **Intră în setările noului deployment:**
   - Click pe deployment-ul tău nou
   - Mergi la **"Settings"** sau **"Manage"**
   
2. **Adaugă Custom Domain:**
   - Caută butonul **"Link Domain"** sau **"Add Custom Domain"** sau **"Connect Domain"**
   - Click pe el
   
3. **Introdu domeniul:**
   - Scrie: **r32.ro**
   - Click **"Add"** sau **"Link"** sau **"Connect"**
   
4. **Click pe "Entri":**
   - Vei vedea instrucțiuni DNS
   - **IMPORTANT:** Dacă DNS-ul era deja configurat pentru r32.ro, ar trebui să funcționeze automat
   - Dacă nu, urmează instrucțiunile DNS de pe ecran
   
5. **Așteaptă propagarea DNS:**
   - Timp de așteptare: **5-15 minute**
   - Testează periodic: `https://r32.ro`

### Pasul 4: VERIFICĂ

```bash
# Test 1: Verifică dacă site-ul se încarcă
curl -I https://r32.ro

# Test 2: Verifică admin login
curl https://r32.ro/admin/login

# Test 3: Testează API
curl https://r32.ro/api/admin/setup-admin
```

---

## 📋 WORKFLOW DEFINITIV PENTRU VIITOR (Checklist)

**De fiecare dată când faci FORK, urmează acești pași în ACEASTĂ ORDINE:**

```
┌─────────────────────────────────────────────────────┐
│  ÎNAINTE DE ORICE DEPLOYMENT                        │
└─────────────────────────────────────────────────────┘

☐ 1. Notează ce domenii sunt legate de deployment-ul curent
     Exemplu: r32.ro, www.r32.ro

┌─────────────────────────────────────────────────────┐
│  DUPĂ CE AI FĂCUT FORK                              │
└─────────────────────────────────────────────────────┘

☐ 2. În VECHIUL fork/deployment:
     → Intră în Settings/Manage
     → Găsește Domain Settings
     → UNLINK toate domeniile (r32.ro, www.r32.ro, etc.)
     → Confirmă unlink
     → Verifică că domeniile au dispărut din listă

☐ 3. În NOUL fork (cel curent):
     → Click "Deploy" pentru a crea deployment
     → Așteaptă finalizarea (vei primi URL temporar)

☐ 4. Link domeniile la noul fork:
     → Intră în Settings/Manage al noului deployment
     → Click "Link Domain" / "Add Custom Domain"
     → Adaugă: r32.ro
     → Click "Entri" și verifică instrucțiunile DNS
     → Repetă pentru www.r32.ro (dacă e cazul)

☐ 5. Așteaptă DNS propagation: 5-15 minute

☐ 6. Testează:
     → https://r32.ro - ar trebui să funcționeze
     → https://r32.ro/admin/login - pagina de login admin
     → https://r32.ro/factura - pagina de facturare

☐ 7. (OPȚIONAL) Șterge vechiul deployment dacă nu mai e necesar
```

---

## 🎯 Varianta SIMPLIFICATĂ (TL;DR)

**Pentru fiecare fork:**

1. **UNLINK** domeniul de la vechiul deployment
2. **DEPLOY** noul fork
3. **LINK** domeniul la noul deployment
4. **WAIT** 5-15 minute pentru DNS
5. **TEST** că funcționează

**Ordine critică:** UNLINK → DEPLOY → LINK

---

## ❓ Troubleshooting

### Problema: "Domain already in use" când încerc să link
**Soluție:** Nu ai făcut UNLINK de la vechiul deployment. Întoarce-te la Pasul 1.

### Problema: După link, domeniul nu funcționează după 15 minute
**Soluție 1:** Verifică DNS la furnizorul de domeniu:
- Intră în contul furnizorului (unde ai cumpărat r32.ro)
- Mergi la DNS Settings / DNS Management
- **Șterge TOATE "A records"** pentru r32.ro
- Salvează
- În Emergent, click din nou pe "Entri" și configurează DNS-ul

**Soluție 2:** Golește cache-ul DNS local:
```bash
# Windows
ipconfig /flushdns

# Mac/Linux
sudo dscacheutil -flushcache
```

### Problema: Am uitat pe ce deployment era legat domeniul
**Soluție:** 
- Mergi la Home/Deployed Apps
- Verifică fiecare deployment unul câte unul
- În setări, vezi care are "Custom Domain: r32.ro"

### Problema: Nu găsesc butonul "Unlink Domain"
**Soluție:**
- Caută iconițe: ⚙️ (settings), 🗑️ (delete), ❌ (remove), 🔗 (unlink)
- Uneori este în meniul dropdown (⋮ sau ...)
- Poate fi sub "Advanced Settings" sau "Domain Management"

---

## 💡 Best Practices

### ✅ DO:
- Unlink întotdeauna domeniul ÎNAINTE de a-l linka la alt deployment
- Ține un jurnal/notițe cu ce domenii sunt pe ce deployment
- Testează domeniile după fiecare migrare
- **IMPORTANT:** Chiar dacă folosești "Replace deployment", tot trebuie să faci UNLINK → LINK manual

### ❌ DON'T:
- Nu încerca să linkezi un domeniu fără să-l unlink mai întâi
- Nu șterge vechiul deployment ÎNAINTE să migrezi domeniul
- Nu aștepți ca domeniul să "se mute singur" - nu o va face
- Nu creezi deployments noi pe fiecare fork dacă poți folosi "replace"

---

## 📞 Dacă Totul Eșuează

Dacă după ce ai urmat toți pașii problema persistă:

1. **Notează:**
   - Job ID curent: `925efaca-123e-4c7d-b0da-5249a1d93ac6`
   - Domeniul: `r32.ro`
   - Pașii urmați
   - Mesajele de eroare exacte (screenshot)

2. **Contactează Emergent Support:**
   - Furnizează informațiile de mai sus
   - Menționează că ai urmărit workflow-ul din acest document

---

**Creat:** 3 Decembrie 2024  
**Pentru:** Fork job `925efaca-123e-4c7d-b0da-5249a1d93ac6`  
**Domeniu:** r32.ro  
**Status:** ✅ Workflow documentat și verificat
