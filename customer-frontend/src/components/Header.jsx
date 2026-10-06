import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, LogOut, ShieldCheck, ArrowRightLeft, Phone } from 'lucide-react';
import fastDeliveryLogo from '../assets/fastdelivery-logo.jpg';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ searchTerm, setSearchTerm }) {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout, selectedRole, clearRole } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm?.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSwitchRole = () => {
    clearRole();
    navigate('/');
  };

  return (
    <header className="header-wrapper">
      {/* Top Banner */}
      <div className="header-top">
        <div className="header-top-inner">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>⚡ Express Delivery</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> 100% Quality Guarantee
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleSwitchRole}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <ArrowRightLeft size={12} /> Switch Role / Portal
            </button>
            <span>Support: 1-800-FRESH-CART</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header">
        <div className="header-inner">
          {/* Official FastDelivery Logo */}
          <Link to="/home" className="logo" title="FastDelivery Home">
            <img
              src={fastDeliveryLogo}
              alt="FastDelivery Logo"
              className="logo-img"
              style={{ maxHeight: '46px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Link>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search fresh vegetables, dairy, snacks & household items..."
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            />
          </form>

          {/* User Nav Actions */}
          <div className="nav-actions">
            <Link to="/products" className="nav-btn nav-btn-outline" style={{ display: 'none', md: 'flex' }}>
              All Products
            </Link>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/orders" className="nav-btn nav-btn-outline">
                  <User size={16} />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/', { replace: true });
                  }}
                  className="nav-btn nav-btn-outline"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/customer/login" className="nav-btn nav-btn-outline">
                <User size={16} />
                <span>Login / Register</span>
              </Link>
            )}

            {/* Contact Option */}
            <Link to="/contact" className="nav-btn nav-btn-outline contact-nav-btn" title="Contact Us & Location">
              <Phone size={16} />
              <span>Contact</span>
            </Link>

            <Link to="/cart" className="cart-btn">
              <ShoppingCart size={20} />
              <span>Cart</span>
              <span className="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
