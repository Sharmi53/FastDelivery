import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bike, Phone, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DeliveryLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: 'Delivery Agent #4402', phone }, 'delivery');
    // Open or redirect to Delivery Panel
    window.location.href = 'https://fast-delivery-7fe5.vercel.app';
  };

  return (
    <div className="auth-container" style={{ borderTop: '4px solid #f59e0b' }}>
      <Link
        to="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> Switch Role
      </Link>

      <div className="auth-header">
        <div style={{ background: '#fef3c7', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#d97706' }}>
          <Bike size={28} />
        </div>
        <h2 className="auth-title">Delivery Partner Login</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign in to view assigned orders and deliver groceries</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Phone Number / Agent ID</label>
          <input
            type="text"
            required
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn" style={{ background: '#f59e0b', marginTop: '0.5rem' }}>
          Sign In as Delivery Partner →
        </button>
      </form>
    </div>
  );
}
