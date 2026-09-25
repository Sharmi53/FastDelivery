import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, ShoppingCart, LogOut, ShieldCheck, ArrowRightLeft, Bell, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Header({ searchTerm, setSearchTerm }) {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout, selectedRole, clearRole } = useAuth();
  const navigate = useNavigate();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

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

  // Fetch notifications when user is authenticated
  const fetchNotifications = async () => {
    const storedUser = localStorage.getItem('grocery_user');
    if (!storedUser) return;

    try {
      const userData = JSON.parse(storedUser);
      if (!userData.token) return;

      setNotifLoading(true);

      const response = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notifId) => {
    const storedUser = localStorage.getItem('grocery_user');
    if (!storedUser) return;

    try {
      const userData = JSON.parse(storedUser);
      if (!userData.token) return;

      const response = await fetch(`${API_URL}/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update locally without refetching
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notifId ? { ...n, is_read: 1 } : n
          )
        );
      }
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  // Fetch on mount & when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (notifOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [notifOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Format timestamp
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return '';
    }
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
          {/* Logo */}
          <Link to="/home" className="logo">
            <div className="logo-icon">
              <ShoppingBag size={24} />
            </div>
            <span>FastDelivery</span>
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
                {/* Notification Bell */}
                <div className="notif-wrapper" ref={notifRef}>
                  <button
                    className="nav-btn nav-btn-outline notif-bell-btn"
                    onClick={() => setNotifOpen((prev) => !prev)}
                    title="Notifications"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount}</span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-dropdown-header">
                        <span className="notif-dropdown-title">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="notif-unread-count">{unreadCount} new</span>
                        )}
                      </div>

                      <div className="notif-dropdown-list">
                        {notifLoading ? (
                          <div className="notif-empty">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="notif-empty">No notifications yet.</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`notif-item ${!notif.is_read ? 'notif-unread' : ''}`}
                              onClick={() => {
                                if (!notif.is_read) {
                                  markAsRead(notif.id);
                                }
                              }}
                            >
                              <div className="notif-item-title">{notif.title}</div>
                              <div className="notif-item-message">{notif.message}</div>
                              <div className="notif-item-time">{formatTime(notif.created_at)}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
