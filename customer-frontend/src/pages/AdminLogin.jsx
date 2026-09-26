import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, name: 'Store Administrator' }, 'admin');
    // Open or redirect to Admin Panel
   window.location.href = 'https://fast-delivery-ft2x.vercel.app';
  };

  return (
    <div className="auth-container" style={{ borderTop: '4px solid #3b82f6' }}>
      <Link
        to="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}
      >
        <ArrowLeft size={16} /> Switch Role
      </Link>

      <div className="auth-header">
        <div style={{ background: '#dbeafe', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#2563eb' }}>
          <ShieldCheck size={28} />
        </div>
        <h2 className="auth-title">Admin Portal Login</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign in to access store products, orders & management</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Admin Email</label>
          <input
            type="email"
            required
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="submit-btn" style={{ background: '#3b82f6', marginTop: '0.5rem' }}>
          Sign In as Admin →
        </button>
      </form>
    </div>
  );
}
