import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Shield, Truck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShoppingBag color="#10b981" size={28} />
            <h3 style={{ margin: 0 }}>FastDelivery</h3>
          </div>
          <p>Your one-stop daily grocery & organic market. Super fast doorstep delivery </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', color: '#94a3b8' }}>
            <span><Truck size={18} /> Fast Shipping</span>
            <span><Clock size={18} /> daily Support</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <ul className="footer-links">
            <li><Link to="/products?category=Fruits%20%26%20Vegetables">Fruits & Vegetables</Link></li>
            <li><Link to="/products?category=Dairy%20%26%20Eggs">Dairy & Eggs</Link></li>
            <li><Link to="/products?category=Rice%20%26%20Grains">Rice & Grains</Link></li>
            <li><Link to="/products?category=Snacks">Snacks & Munchies</Link></li>
            <li><Link to="/products?category=Beverages">Beverages</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/cart">View Cart</Link></li>
            <li><Link to="/contact">Contact & Store Info</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/customer/login">Account Login</Link></li>
            <li><Link to="/customer/register">Create Account</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Other Panels</h4>
          <ul className="footer-links">
            <li><a href="https://fast-delivery-ft2x.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#f59e0b', fontWeight: 600 }}>Admin Dashboard →</a></li>
            <li><a href="https://fast-delivery-7fe5.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#10b981', fontWeight: 600 }}>Delivery Partner Panel →</a></li>
            {/* <li><a href="http://localhost:5000/api/health" target="_blank" rel="noreferrer">Backend API Status Check</a></li> */}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 FastDelivery Grocery Application. Designed for Clean & Modular E-Commerce.</p>
      </div>
    </footer>
  );
}
