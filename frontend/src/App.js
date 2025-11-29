import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Reviews from "./pages/admin/Reviews";
import Backup from "./pages/admin/Backup";
import { Toaster } from "./components/ui/toaster";

// Facturare imports
import FacturareDashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Clients from "./pages/Clients";
import FacturareProducts from "./pages/Products";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceView from "./pages/InvoiceView";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  const [cartCount] = useState(2);
  const [wishlistCount] = useState(4);

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes without header/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin login - separate from regular login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="backup" element={<Backup />} />
            </Route>

            {/* Facturare routes */}
            <Route path="/factura" element={<FacturareDashboard />} />
            <Route path="/factura/dashboard" element={<FacturareDashboard />} />
            <Route path="/factura/companies" element={<Companies />} />
            <Route path="/factura/clients" element={<Clients />} />
            <Route path="/factura/products" element={<FacturareProducts />} />
            <Route path="/factura/invoices" element={<Invoices />} />
            <Route path="/factura/invoices/new" element={<InvoiceForm />} />
            <Route path="/factura/invoices/:id" element={<InvoiceView />} />
            <Route path="/factura/reports" element={<Reports />} />
            <Route path="/factura/settings" element={<Settings />} />
            
            {/* Main routes with header/footer */}
            <Route path="/*" element={
              <>
                <Header cartCount={cartCount} wishlistCount={wishlistCount} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/account" element={<Account />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
