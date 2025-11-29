from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from PIL import Image
import io
import base64
import resend
import secrets
from weasyprint import HTML
from lxml import etree

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Resend API Key
resend.api_key = os.environ.get('RESEND_API_KEY', '')

security = HTTPBearer()

# Create the main app
app = FastAPI(title="FinRo - Aplicație Facturare")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    cui: str
    reg_com: str
    address: str
    city: str
    county: str
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    vat_rate: float = 19.0
    logo_base64: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanyCreate(BaseModel):
    name: str
    cui: str
    reg_com: str
    address: str
    city: str
    county: str
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    vat_rate: float = 19.0
    logo_base64: Optional[str] = None

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    cui: str
    reg_com: Optional[str] = None
    address: str
    city: str
    county: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    company_id: str
    name: str
    cui: str
    reg_com: Optional[str] = None
    address: str
    city: str
    county: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: Optional[str] = None
    unit: str = "buc"
    price: float
    vat_rate: float = 19.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    company_id: str
    name: str
    description: Optional[str] = None
    unit: str = "buc"
    price: float
    vat_rate: float = 19.0

class InvoiceItem(BaseModel):
    product_name: str
    description: Optional[str] = None
    quantity: float
    unit: str
    price: float
    vat_rate: float
    total: float

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    client_id: str
    invoice_number: str
    series: str
    invoice_type: str  # factura, proforma, aviz, chitanta
    issue_date: datetime
    due_date: Optional[datetime] = None
    items: List[InvoiceItem]
    subtotal: float
    vat_total: float
    total: float
    notes: Optional[str] = None
    efactura_sent: bool = False
    efactura_status: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    company_id: str
    client_id: str
    invoice_number: str
    series: str
    invoice_type: str
    issue_date: datetime
    due_date: Optional[datetime] = None
    items: List[InvoiceItem]
    notes: Optional[str] = None

# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalid")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Utilizator negăsit")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirat")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalid")

def calculate_invoice_totals(items: List[InvoiceItem]) -> dict:
    subtotal = sum(item.total for item in items)
    vat_by_rate = {}
    for item in items:
        vat_amount = item.total * item.vat_rate / 100
        if item.vat_rate not in vat_by_rate:
            vat_by_rate[item.vat_rate] = 0
        vat_by_rate[item.vat_rate] += vat_amount
    vat_total = sum(vat_by_rate.values())
    total = subtotal + vat_total
    return {"subtotal": round(subtotal, 2), "vat_total": round(vat_total, 2), "total": round(total, 2)}

# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email deja înregistrat")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_access_token({"sub": user.id})
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Email sau parolă incorectă")
    
    token = create_access_token({"sub": user['id']})
    return {"token": token, "user": {"id": user['id'], "email": user['email'], "name": user['name']}}

@api_router.post("/auth/password-reset-request")
async def password_reset_request(request: PasswordResetRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        return {"message": "Dacă emailul există, veți primi instrucțiuni de resetare"}
    
    reset_token = secrets.token_urlsafe(32)
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "token": reset_token,
        "user_id": user['id'],
        "expires_at": expire.isoformat(),
        "used": False
    })
    
    if resend.api_key:
        try:
            resend.Emails.send({
                "from": "noreply@yourdomain.com",
                "to": request.email,
                "subject": "Resetare Parolă - FinRo",
                "html": f"<p>Bună {user['name']},</p><p>Pentru a reseta parola, utilizează token-ul: <strong>{reset_token}</strong></p><p>Token-ul este valabil 1 oră.</p>"
            })
        except Exception as e:
            logging.error(f"Email send error: {e}")
    
    return {"message": "Dacă emailul există, veți primi instrucțiuni de resetare"}

@api_router.post("/auth/password-reset")
async def password_reset(reset_data: PasswordReset):
    reset_doc = await db.password_resets.find_one({
        "token": reset_data.token,
        "used": False
    })
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Token invalid sau expirat")
    
    expires_at = datetime.fromisoformat(reset_doc['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Token expirat")
    
    new_hash = hash_password(reset_data.new_password)
    await db.users.update_one(
        {"id": reset_doc['user_id']},
        {"$set": {"password_hash": new_hash}}
    )
    
    await db.password_resets.update_one(
        {"token": reset_data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Parola a fost resetată cu succes"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user['id'], "email": user['email'], "name": user['name']}

# ============= COMPANIES ENDPOINTS =============

@api_router.post("/companies")
async def create_company(company_data: CompanyCreate, user: dict = Depends(get_current_user)):
    company = Company(user_id=user['id'], **company_data.model_dump())
    doc = company.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.companies.insert_one(doc)
    return company

@api_router.get("/companies", response_model=List[Company])
async def get_companies(user: dict = Depends(get_current_user)):
    companies = await db.companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    for c in companies:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return companies

@api_router.get("/companies/{company_id}")
async def get_company(company_id: str, user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": company_id, "user_id": user['id']}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    if isinstance(company.get('created_at'), str):
        company['created_at'] = datetime.fromisoformat(company['created_at'])
    return company

@api_router.put("/companies/{company_id}")
async def update_company(company_id: str, company_data: CompanyCreate, user: dict = Depends(get_current_user)):
    result = await db.companies.update_one(
        {"id": company_id, "user_id": user['id']},
        {"$set": company_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    return {"message": "Companie actualizată"}

@api_router.delete("/companies/{company_id}")
async def delete_company(company_id: str, user: dict = Depends(get_current_user)):
    result = await db.companies.delete_one({"id": company_id, "user_id": user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    return {"message": "Companie ștearsă"}

# ============= CLIENTS ENDPOINTS =============

@api_router.post("/clients")
async def create_client(client_data: ClientCreate, user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": client_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    client = Client(**client_data.model_dump())
    doc = client.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.clients.insert_one(doc)
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(company_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if company_id:
        company = await db.companies.find_one({"id": company_id, "user_id": user['id']})
        if not company:
            raise HTTPException(status_code=404, detail="Companie negăsită")
        query["company_id"] = company_id
    else:
        companies = await db.companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        company_ids = [c['id'] for c in companies]
        query["company_id"] = {"$in": company_ids}
    
    clients = await db.clients.find(query, {"_id": 0}).to_list(1000)
    for c in clients:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return clients

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, client_data: ClientCreate, user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": client_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    result = await db.clients.update_one(
        {"id": client_id},
        {"$set": client_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client negăsit")
    return {"message": "Client actualizat"}

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(get_current_user)):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client negăsit")
    return {"message": "Client șters"}

# ============= PRODUCTS ENDPOINTS =============

@api_router.post("/products")
async def create_product(product_data: ProductCreate, user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": product_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.get("/products", response_model=List[Product])
async def get_products(company_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if company_id:
        company = await db.companies.find_one({"id": company_id, "user_id": user['id']})
        if not company:
            raise HTTPException(status_code=404, detail="Companie negăsită")
        query["company_id"] = company_id
    else:
        companies = await db.companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        company_ids = [c['id'] for c in companies]
        query["company_id"] = {"$in": company_ids}
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductCreate, user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": product_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produs negăsit")
    return {"message": "Produs actualizat"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produs negăsit")
    return {"message": "Produs șters"}

# ============= INVOICES ENDPOINTS =============

@api_router.post("/invoices")
async def create_invoice(invoice_data: InvoiceCreate, user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": invoice_data.company_id, "user_id": user['id']}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    client = await db.clients.find_one({"id": invoice_data.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client negăsit")
    
    totals = calculate_invoice_totals(invoice_data.items)
    invoice = Invoice(
        **invoice_data.model_dump(),
        subtotal=totals['subtotal'],
        vat_total=totals['vat_total'],
        total=totals['total']
    )
    
    doc = invoice.model_dump()
    doc['issue_date'] = doc['issue_date'].isoformat()
    if doc.get('due_date'):
        doc['due_date'] = doc['due_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.invoices.insert_one(doc)
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(company_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if company_id:
        company = await db.companies.find_one({"id": company_id, "user_id": user['id']})
        if not company:
            raise HTTPException(status_code=404, detail="Companie negăsită")
        query["company_id"] = company_id
    else:
        companies = await db.companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        company_ids = [c['id'] for c in companies]
        query["company_id"] = {"$in": company_ids}
    
    invoices = await db.invoices.find(query, {"_id": 0}).sort("issue_date", -1).to_list(1000)
    for inv in invoices:
        if isinstance(inv.get('issue_date'), str):
            inv['issue_date'] = datetime.fromisoformat(inv['issue_date'])
        if inv.get('due_date') and isinstance(inv['due_date'], str):
            inv['due_date'] = datetime.fromisoformat(inv['due_date'])
        if isinstance(inv.get('created_at'), str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
    return invoices

@api_router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, user: dict = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Factură negăsită")
    
    company = await db.companies.find_one({"id": invoice['company_id'], "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Nu aveți acces")
    
    if isinstance(invoice.get('issue_date'), str):
        invoice['issue_date'] = datetime.fromisoformat(invoice['issue_date'])
    if invoice.get('due_date') and isinstance(invoice['due_date'], str):
        invoice['due_date'] = datetime.fromisoformat(invoice['due_date'])
    if isinstance(invoice.get('created_at'), str):
        invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
    
    return invoice

@api_router.get("/invoices/{invoice_id}/pdf")
async def get_invoice_pdf(invoice_id: str, user: dict = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Factură negăsită")
    
    company = await db.companies.find_one({"id": invoice['company_id']}, {"_id": 0})
    if not company or company['user_id'] != user['id']:
        raise HTTPException(status_code=404, detail="Nu aveți acces")
    
    client = await db.clients.find_one({"id": invoice['client_id']}, {"_id": 0})
    
    html_content = generate_invoice_html(invoice, company, client)
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    return {"pdf": base64.b64encode(pdf_bytes).decode('utf-8')}

def generate_invoice_html(invoice: dict, company: dict, client: dict) -> str:
    issue_date = invoice['issue_date'] if isinstance(invoice['issue_date'], str) else invoice['issue_date'].strftime('%d.%m.%Y')
    due_date = ''
    if invoice.get('due_date'):
        due_date = invoice['due_date'] if isinstance(invoice['due_date'], str) else invoice['due_date'].strftime('%d.%m.%Y')
    
    items_html = ''
    for idx, item in enumerate(invoice['items'], 1):
        items_html += f'''
        <tr>
            <td>{idx}</td>
            <td>{item['product_name']}<br><small>{item.get('description', '')}</small></td>
            <td>{item['quantity']}</td>
            <td>{item['unit']}</td>
            <td>{item['price']:.2f}</td>
            <td>{item['vat_rate']:.0f}%</td>
            <td>{item['total']:.2f}</td>
        </tr>
        '''
    
    invoice_type_name = {
        'factura': 'FACTURĂ',
        'proforma': 'FACTURĂ PROFORMĂ',
        'aviz': 'AVIZ DE ÎNSOȚIRE',
        'chitanta': 'CHITANȚĂ'
    }.get(invoice.get('invoice_type', 'factura'), 'FACTURĂ')
    
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; font-size: 12px; }}
            .header {{ text-align: center; margin-bottom: 20px; }}
            .company-info, .client-info {{ margin-bottom: 20px; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .totals {{ margin-top: 20px; text-align: right; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{invoice_type_name}</h1>
            <p>Seria: {invoice['series']} Nr: {invoice['invoice_number']}</p>
            <p>Data: {issue_date}</p>
            {f'<p>Scadență: {due_date}</p>' if due_date else ''}
        </div>
        
        <div class="company-info">
            <h3>Furnizor:</h3>
            <p><strong>{company['name']}</strong></p>
            <p>CUI: {company['cui']}, Reg Com: {company['reg_com']}</p>
            <p>{company['address']}, {company['city']}, {company['county']}</p>
            {f"<p>Tel: {company.get('phone', '')}</p>" if company.get('phone') else ''}
            {f"<p>Email: {company.get('email', '')}</p>" if company.get('email') else ''}
            {f"<p>Cont: {company.get('bank_account', '')} - {company.get('bank_name', '')}</p>" if company.get('bank_account') else ''}
        </div>
        
        <div class="client-info">
            <h3>Client:</h3>
            <p><strong>{client['name']}</strong></p>
            <p>CUI: {client['cui']}</p>
            <p>{client['address']}, {client['city']}, {client['county']}</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Nr</th>
                    <th>Denumire</th>
                    <th>Cant.</th>
                    <th>UM</th>
                    <th>Preț</th>
                    <th>TVA</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>
        
        <div class="totals">
            <p><strong>Subtotal:</strong> {invoice['subtotal']:.2f} RON</p>
            <p><strong>TVA Total:</strong> {invoice['vat_total']:.2f} RON</p>
            <p><strong>Total de plată:</strong> {invoice['total']:.2f} RON</p>
        </div>
        
        {f'<p style="margin-top: 20px;"><strong>Observații:</strong> {invoice.get("notes", "")}</p>' if invoice.get('notes') else ''}
    </body>
    </html>
    '''

# ============= DASHBOARD & STATS =============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    companies = await db.companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    company_ids = [c['id'] for c in companies]
    
    total_invoices = await db.invoices.count_documents({"company_id": {"$in": company_ids}})
    total_clients = await db.clients.count_documents({"company_id": {"$in": company_ids}})
    total_products = await db.products.count_documents({"company_id": {"$in": company_ids}})
    
    invoices = await db.invoices.find(
        {"company_id": {"$in": company_ids}},
        {"_id": 0, "total": 1, "issue_date": 1}
    ).to_list(1000)
    
    total_revenue = sum(inv['total'] for inv in invoices)
    
    current_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_invoices = [
        inv for inv in invoices
        if datetime.fromisoformat(inv['issue_date']) >= current_month
    ]
    monthly_revenue = sum(inv['total'] for inv in monthly_invoices)
    
    return {
        "total_companies": len(companies),
        "total_invoices": total_invoices,
        "total_clients": total_clients,
        "total_products": total_products,
        "total_revenue": round(total_revenue, 2),
        "monthly_revenue": round(monthly_revenue, 2),
        "monthly_invoices_count": len(monthly_invoices)
    }

@api_router.get("/dashboard/recent-invoices")
async def get_recent_invoices(limit: int = 5, user: dict = Depends(get_current_user)):
    companies = await db.companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    company_ids = [c['id'] for c in companies]
    
    invoices = await db.invoices.find(
        {"company_id": {"$in": company_ids}},
        {"_id": 0}
    ).sort("issue_date", -1).limit(limit).to_list(limit)
    
    for inv in invoices:
        if isinstance(inv.get('issue_date'), str):
            inv['issue_date'] = datetime.fromisoformat(inv['issue_date'])
        if inv.get('due_date') and isinstance(inv['due_date'], str):
            inv['due_date'] = datetime.fromisoformat(inv['due_date'])
        if isinstance(inv.get('created_at'), str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
    
    return invoices

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()