import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import fastDeliveryLogo from '../assets/fastdelivery-logo.jpg';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://fastdelivery-x0ce.onrender.com/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          role: 'customer'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save real user and JWT through AuthContext
      login(data.user, data.token);

      // Go to customer home
      navigate('/home');

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <Link to="/home" title="FastDelivery Home">
              <img
                src={fastDeliveryLogo}
                alt="FastDelivery Logo"
                className="auth-logo"
                style={{
                  height: '56px',
                  width: 'auto',
                  objectFit: 'contain',
                  borderRadius: '10px'
                }}
              />
            </Link>
          </div>

          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your orders, saved addresses and grocery cart
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="auth-error"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={17}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--primary)'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={17}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--primary)'
                }}
              />
            </div>
          </div>

          {/* Forgot Password link */}
          <div style={{ textAlign: 'right', marginTop: '-0.25rem', marginBottom: '1rem' }}>
            <Link
              to="/customer/forgot-password"
              style={{
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/customer/register">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}