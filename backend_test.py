import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class FinRoAPITester:
    def __init__(self, base_url="https://invoice-hub-85.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.company_id = None
        self.client_id = None
        self.product_id = None
        self.invoice_id = None
        
        # Test data
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"
        self.test_name = "Test User"

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        data = {
            "email": self.test_email,
            "name": self.test_name,
            "password": self.test_password
        }
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=data
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        data = {
            "email": self.test_email,
            "password": self.test_password
        }
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=data
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_get_user_profile(self):
        """Test get current user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_company(self):
        """Test company creation"""
        data = {
            "name": "Test Company SRL",
            "cui": "RO12345678",
            "reg_com": "J40/1234/2023",
            "address": "Str. Test nr. 1",
            "city": "București",
            "county": "București",
            "postal_code": "010101",
            "phone": "0721234567",
            "email": "contact@testcompany.ro",
            "bank_account": "RO49AAAA1B31007593840000",
            "bank_name": "Banca Test",
            "vat_rate": 19.0
        }
        success, response = self.run_test(
            "Create Company",
            "POST",
            "companies",
            200,
            data=data
        )
        if success and 'id' in response:
            self.company_id = response['id']
            return True
        return False

    def test_get_companies(self):
        """Test get companies list"""
        success, response = self.run_test(
            "Get Companies",
            "GET",
            "companies",
            200
        )
        return success and isinstance(response, list)

    def test_get_company_by_id(self):
        """Test get specific company"""
        if not self.company_id:
            return False
        success, response = self.run_test(
            "Get Company by ID",
            "GET",
            f"companies/{self.company_id}",
            200
        )
        return success

    def test_create_client(self):
        """Test client creation"""
        if not self.company_id:
            return False
        data = {
            "company_id": self.company_id,
            "name": "Client Test SRL",
            "cui": "RO87654321",
            "reg_com": "J40/5678/2023",
            "address": "Str. Client nr. 2",
            "city": "Cluj-Napoca",
            "county": "Cluj",
            "phone": "0731234567",
            "email": "contact@clienttest.ro"
        }
        success, response = self.run_test(
            "Create Client",
            "POST",
            "clients",
            200,
            data=data
        )
        if success and 'id' in response:
            self.client_id = response['id']
            return True
        return False

    def test_get_clients(self):
        """Test get clients list"""
        success, response = self.run_test(
            "Get Clients",
            "GET",
            "clients",
            200
        )
        return success and isinstance(response, list)

    def test_create_product(self):
        """Test product creation"""
        if not self.company_id:
            return False
        data = {
            "company_id": self.company_id,
            "name": "Serviciu Consultanță",
            "description": "Servicii de consultanță IT",
            "unit": "oră",
            "price": 150.0,
            "vat_rate": 19.0
        }
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=data
        )
        if success and 'id' in response:
            self.product_id = response['id']
            return True
        return False

    def test_get_products(self):
        """Test get products list"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        return success and isinstance(response, list)

    def test_create_invoice(self):
        """Test invoice creation"""
        if not self.company_id or not self.client_id:
            return False
        data = {
            "company_id": self.company_id,
            "client_id": self.client_id,
            "invoice_number": "001",
            "series": "FAC",
            "invoice_type": "factura",
            "issue_date": datetime.now(timezone.utc).isoformat(),
            "due_date": None,
            "items": [
                {
                    "product_name": "Serviciu Consultanță",
                    "description": "Consultanță IT pentru proiect",
                    "quantity": 10.0,
                    "unit": "oră",
                    "price": 150.0,
                    "vat_rate": 19.0,
                    "total": 1500.0
                }
            ],
            "notes": "Factură de test"
        }
        success, response = self.run_test(
            "Create Invoice",
            "POST",
            "invoices",
            200,
            data=data
        )
        if success and 'id' in response:
            self.invoice_id = response['id']
            return True
        return False

    def test_get_invoices(self):
        """Test get invoices list"""
        success, response = self.run_test(
            "Get Invoices",
            "GET",
            "invoices",
            200
        )
        return success and isinstance(response, list)

    def test_get_invoice_by_id(self):
        """Test get specific invoice"""
        if not self.invoice_id:
            return False
        success, response = self.run_test(
            "Get Invoice by ID",
            "GET",
            f"invoices/{self.invoice_id}",
            200
        )
        return success

    def test_get_invoice_pdf(self):
        """Test invoice PDF generation"""
        if not self.invoice_id:
            return False
        success, response = self.run_test(
            "Get Invoice PDF",
            "GET",
            f"invoices/{self.invoice_id}/pdf",
            200
        )
        return success and 'pdf' in response

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        return success and 'total_companies' in response

    def test_recent_invoices(self):
        """Test recent invoices endpoint"""
        success, response = self.run_test(
            "Recent Invoices",
            "GET",
            "dashboard/recent-invoices?limit=5",
            200
        )
        return success and isinstance(response, list)

    def run_all_tests(self):
        """Run all API tests in sequence"""
        self.log("🚀 Starting FinRo API Tests...")
        
        # Authentication tests
        if not self.test_user_registration():
            self.log("❌ Registration failed, stopping tests")
            return False
            
        if not self.test_user_login():
            self.log("❌ Login failed, stopping tests")
            return False
            
        self.test_get_user_profile()
        
        # Company tests
        if not self.test_create_company():
            self.log("❌ Company creation failed, stopping tests")
            return False
            
        self.test_get_companies()
        self.test_get_company_by_id()
        
        # Client tests
        if not self.test_create_client():
            self.log("❌ Client creation failed, stopping tests")
            return False
            
        self.test_get_clients()
        
        # Product tests
        if not self.test_create_product():
            self.log("❌ Product creation failed, stopping tests")
            return False
            
        self.test_get_products()
        
        # Invoice tests
        if not self.test_create_invoice():
            self.log("❌ Invoice creation failed, stopping tests")
            return False
            
        self.test_get_invoices()
        self.test_get_invoice_by_id()
        self.test_get_invoice_pdf()
        
        # Dashboard tests
        self.test_dashboard_stats()
        self.test_recent_invoices()
        
        # Print results
        self.log(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        self.log(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = FinRoAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())