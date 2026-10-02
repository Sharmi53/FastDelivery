import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock } from 'lucide-react';
import fastDeliveryLogo from '../assets/fastdelivery-logo.jpg';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <img
              src={fastDeliveryLogo}
              alt="FastDelivery Logo"
              style={{
                maxHeight: '44px',
                width: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                background: 'white',
                padding: '3px 8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
          </div>
          <p>Your one-stop daily grocery & organic market. Super fast doorstep delivery</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.2rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Truck size={18} color="#22d3ee" /> Fast Shipping
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="#22d3ee" /> Daily Support
            </span>
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
            <li><a href="https://fast-delivery-7fe5.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', fontWeight: 600 }}>Delivery Partner Panel →</a></li>
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
