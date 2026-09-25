import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RoleSelection from './pages/RoleSelection';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import DeliveryLogin from './pages/DeliveryLogin';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import ShopContactPage from './pages/ShopContactPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes({ searchTerm, setSearchTerm }) {
  const { selectedRole } = useAuth();
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  if (isContactPage) {
    return (
      <Routes>
        <Route path="/contact" element={<ShopContactPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="main-content">
        <Routes>
          {/* Role Selection Screen */}
          <Route path="/" element={<RoleSelection />} />

          {/* Customer Flow Routes */}
          <Route path="/customer/login" element={<Login />} />
          <Route path="/customer/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/contact" element={<ShopContactPage />} />

          {/* Admin Flow Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Delivery Partner Flow Route */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
