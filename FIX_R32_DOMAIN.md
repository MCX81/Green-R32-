# 🔴 FIX URGENT: r32.ro Arată Versiunea Veche

## Problema Identificată

**r32.ro este conectat la un DEPLOYMENT VECHI (probabil easycart-52)**  
**Deploymentul curent (market-double-4) NU este cel pe care îl vezi la r32.ro**

De aceea:
- ❌ r32.ro/factura = Magazin vechi R32
- ✅ market-double-4-replaced-1764108266.emergent.host/factura = Aplicație nouă FinRo

## ✅ Soluție Pas cu Pas

### Opțiunea 1: Reconectează Domeniul (Recomandat)

#### Pasul 1: Deconectează r32.ro de la Proiectul Vechi

1. Du-te în **Dashboard Emergent**
2. Găsește proiectul **VECHI** (easycart-52 sau similar) în listă
3. Click pe proiect
4. Mergi la **Settings** sau **Domains**
5. Găsește **r32.ro** în listă
6. Click **Disconnect** sau **Remove**
7. Confirmă deconectarea

#### Pasul 2: Conectează r32.ro la Proiectul Curent

1. Revino la proiectul **CURENT** (market-double-4-replaced-1764108266)
2. Click pe **Settings** sau **Domains**
3. Click **Add Custom Domain** sau **Link Domain**
4. Introdu: `r32.ro`
5. Click **Add** sau **Save**
6. Așteaptă confirmarea

#### Pasul 3: Verifică DNS (dacă nu merge automat)

Dacă Emergent cere configurare DNS:
1. Mergi la provider-ul tău de domenii (unde ai cumpărat r32.ro)
2. Găsește secțiunea **DNS Settings** sau **DNS Management**
3. Adaugă/Modifică record-ul:
   - Type: **A** sau **CNAME**
   - Name: **@** (pentru r32.ro) sau **www** (pentru www.r32.ro)
   - Value: (va fi furnizat de Emergent - ex: `123.45.67.89`)
4. Salvează modificările
5. Așteaptă 5-30 minute pentru propagare DNS

---

### Opțiunea 2: Contactează Suportul (Dacă Opțiunea 1 Nu Funcționează)

Dacă la Pasul 1 NU găsești domeniul r32.ro în proiectul vechi SAU obții eroare "domain already exists":

#### Trimite Email la Suport:

**To:** support@emergent.sh

**Subject:** URGENT: Domain r32.ro Stuck on Old Project

**Message:**
```
Bună ziua,

Am nevoie de ajutor pentru a muta domeniul r32.ro la proiectul meu curent.

Detalii:
- Domeniu: r32.ro
- Proiect vechi: easycart-52 (sau ID-ul proiectului vechi)
- Proiect nou (curent): market-double-4-replaced-1764108266.emergent.host
- Job ID curent: [ID-ul acestui job]

Problema:
- r32.ro arată versiunea veche a aplicației
- Când încerc să adaug r32.ro la proiectul nou, primesc eroare "domain already exists"
- Nu găsesc r32.ro în setările proiectului vechi pentru a-l deconecta

Vă rog să mutați domeniul r32.ro de la proiectul vechi la proiectul curent (market-double-4-replaced-1764108266).

Mulțumesc!
```

**Răspuns așteptat:** 2-24 ore (de obicei în câteva ore)

---

## 🧪 Testare După Fix

După ce domeniul este conectat corect:

### 1. Șterge Cache Browser
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```
SAU deschide în **modul incognito**

### 2. Testează URL-urile

✅ `https://r32.ro/factura` → Ar trebui să vezi **FinRo Dashboard** (nu magazinul)  
✅ `https://r32.ro/admin/login` → Ar trebui să vezi pagina de **Admin Login**

### 3. Testează Login-ul Admin

- Email: `admin@r32.ro`
- Parolă: `admin123`
- Ar trebui să te redirecteze către `/admin`

---

## ⚡ De Ce Se Întâmplă Asta?

În Emergent, fiecare **fork** sau **deployment nou** creează un **URL nou**:
- Primul deployment: `invoice-hub-86.preview.emergentagent.com`
- Deployment nou: `market-double-4-replaced-1764108266.emergent.host`

Domeniul custom (r32.ro) trebuie **reconectat manual** la noul deployment!

---

## 📋 Checklist

- [ ] Am deconectat r32.ro de la proiectul vechi
- [ ] Am conectat r32.ro la proiectul curent (market-double-4)
- [ ] Am șters cache-ul browser
- [ ] Am testat r32.ro/factura (ar trebui să văd FinRo)
- [ ] Am testat r32.ro/admin/login (ar trebui să funcționeze)

---

## 🆘 Dacă Nimic Nu Funcționează

1. **Screenshot** din pagina de domenii din Emergent (arată ce domenii sunt conectate unde)
2. **Screenshot** din r32.ro/factura (arată ce apare)
3. **Trimite-mi** screenshot-urile și îți voi ajuta imediat

---

## 💡 Pro Tip

Pentru viitor, când faci un fork/deployment nou:
1. Notează-ți noul URL
2. Reconectează imediat domeniul custom
3. Testează înainte de a lucra mai departe

Acest lucru îți economisește timp și confuzie! 🚀
