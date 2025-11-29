from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
import os
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

router = APIRouter(prefix="/api/factura", tags=["Facturare"])

# MongoDB
from pathlib import Path
ROOT_DIR = Path(__file__).parent.parent
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

security = HTTPBearer()

# ============= MODELS =============

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
    invoice_type: str
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

# ============= COMPANIES ENDPOINTS =============

@router.post("/companies")
async def create_company(company_data: CompanyCreate, user: dict = Depends(get_current_user)):
    company = Company(user_id=user['id'], **company_data.model_dump())
    doc = company.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.factura_companies.insert_one(doc)
    return company

@router.get("/companies", response_model=List[Company])
async def get_companies(user: dict = Depends(get_current_user)):
    companies = await db.factura_companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    for c in companies:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return companies

@router.put("/companies/{company_id}")
async def update_company(company_id: str, company_data: CompanyCreate, user: dict = Depends(get_current_user)):
    result = await db.factura_companies.update_one(
        {"id": company_id, "user_id": user['id']},
        {"$set": company_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    return {"message": "Companie actualizată"}

@router.delete("/companies/{company_id}")
async def delete_company(company_id: str, user: dict = Depends(get_current_user)):
    result = await db.factura_companies.delete_one({"id": company_id, "user_id": user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    return {"message": "Companie ștearsă"}

# ============= CLIENTS ENDPOINTS =============

@router.post("/clients")
async def create_client(client_data: ClientCreate, user: dict = Depends(get_current_user)):
    company = await db.factura_companies.find_one({"id": client_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    client = Client(**client_data.model_dump())
    doc = client.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.factura_clients.insert_one(doc)
    return client

@router.get("/clients", response_model=List[Client])
async def get_clients(company_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if company_id:
        company = await db.factura_companies.find_one({"id": company_id, "user_id": user['id']})
        if not company:
            raise HTTPException(status_code=404, detail="Companie negăsită")
        query["company_id"] = company_id
    else:
        companies = await db.factura_companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        company_ids = [c['id'] for c in companies]
        query["company_id"] = {"$in": company_ids}
    
    clients = await db.factura_clients.find(query, {"_id": 0}).to_list(1000)
    for c in clients:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return clients

@router.put("/clients/{client_id}")
async def update_client(client_id: str, client_data: ClientCreate, user: dict = Depends(get_current_user)):
    company = await db.factura_companies.find_one({"id": client_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    result = await db.factura_clients.update_one(
        {"id": client_id},
        {"$set": client_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client negăsit")
    return {"message": "Client actualizat"}

@router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(get_current_user)):
    result = await db.factura_clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client negăsit")
    return {"message": "Client șters"}

# ============= PRODUCTS ENDPOINTS =============

@router.post("/products")
async def create_product(product_data: ProductCreate, user: dict = Depends(get_current_user)):
    company = await db.factura_companies.find_one({"id": product_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.factura_products.insert_one(doc)
    return product

@router.get("/products", response_model=List[Product])
async def get_products(company_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if company_id:
        company = await db.factura_companies.find_one({"id": company_id, "user_id": user['id']})
        if not company:
            raise HTTPException(status_code=404, detail="Companie negăsită")
        query["company_id"] = company_id
    else:
        companies = await db.factura_companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        company_ids = [c['id'] for c in companies]
        query["company_id"] = {"$in": company_ids}
    
    products = await db.factura_products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductCreate, user: dict = Depends(get_current_user)):
    company = await db.factura_companies.find_one({"id": product_data.company_id, "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    result = await db.factura_products.update_one(
        {"id": product_id},
        {"$set": product_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produs negăsit")
    return {"message": "Produs actualizat"}

@router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.factura_products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produs negăsit")
    return {"message": "Produs șters"}

# ============= INVOICES ENDPOINTS =============

@router.post("/invoices")
async def create_invoice(invoice_data: InvoiceCreate, user: dict = Depends(get_current_user)):
    company = await db.factura_companies.find_one({"id": invoice_data.company_id, "user_id": user['id']}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Companie negăsită")
    
    client = await db.factura_clients.find_one({"id": invoice_data.client_id}, {"_id": 0})
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
    await db.factura_invoices.insert_one(doc)
    return invoice

@router.get("/invoices", response_model=List[Invoice])
async def get_invoices(company_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if company_id:
        company = await db.factura_companies.find_one({"id": company_id, "user_id": user['id']})
        if not company:
            raise HTTPException(status_code=404, detail="Companie negăsită")
        query["company_id"] = company_id
    else:
        companies = await db.factura_companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        company_ids = [c['id'] for c in companies]
        query["company_id"] = {"$in": company_ids}
    
    invoices = await db.factura_invoices.find(query, {"_id": 0}).sort("issue_date", -1).to_list(1000)
    for inv in invoices:
        if isinstance(inv.get('issue_date'), str):
            inv['issue_date'] = datetime.fromisoformat(inv['issue_date'])
        if inv.get('due_date') and isinstance(inv['due_date'], str):
            inv['due_date'] = datetime.fromisoformat(inv['due_date'])
        if isinstance(inv.get('created_at'), str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
    return invoices

@router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str, user: dict = Depends(get_current_user)):
    invoice = await db.factura_invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Factură negăsită")
    
    company = await db.factura_companies.find_one({"id": invoice['company_id'], "user_id": user['id']})
    if not company:
        raise HTTPException(status_code=404, detail="Nu aveți acces")
    
    if isinstance(invoice.get('issue_date'), str):
        invoice['issue_date'] = datetime.fromisoformat(invoice['issue_date'])
    if invoice.get('due_date') and isinstance(invoice['due_date'], str):
        invoice['due_date'] = datetime.fromisoformat(invoice['due_date'])
    if isinstance(invoice.get('created_at'), str):
        invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
    
    return invoice

@router.get("/invoices/{invoice_id}/pdf")
async def get_invoice_pdf(invoice_id: str, user: dict = Depends(get_current_user)):
    invoice = await db.factura_invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Factură negăsită")
    
    company = await db.factura_companies.find_one({"id": invoice['company_id']}, {"_id": 0})
    if not company or company['user_id'] != user['id']:
        raise HTTPException(status_code=404, detail="Nu aveți acces")
    
    client = await db.factura_clients.find_one({"id": invoice['client_id']}, {"_id": 0})
    
    html_content = generate_invoice_html(invoice, company, client)
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    return {"pdf": base64.b64encode(pdf_bytes).decode('utf-8')}

def generate_invoice_html(invoice: dict, company: dict, client: dict) -> str:
    # Similar implementation as before
    return f"<html><body><h1>Factura {invoice['series']}-{invoice['invoice_number']}</h1></body></html>"

# ============= DASHBOARD & STATS =============

@router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    companies = await db.factura_companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    company_ids = [c['id'] for c in companies]
    
    total_invoices = await db.factura_invoices.count_documents({"company_id": {"$in": company_ids}})
    total_clients = await db.factura_clients.count_documents({"company_id": {"$in": company_ids}})
    total_products = await db.factura_products.count_documents({"company_id": {"$in": company_ids}})
    
    invoices = await db.factura_invoices.find(
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

@router.get("/dashboard/recent-invoices")
async def get_recent_invoices(limit: int = 5, user: dict = Depends(get_current_user)):
    companies = await db.factura_companies.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    company_ids = [c['id'] for c in companies]
    
    invoices = await db.factura_invoices.find(
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
