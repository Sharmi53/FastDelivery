import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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
    <div className="auth-container">

      <div className="auth-header">

        <div
          style={{
            background: 'var(--primary-light)',
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: 'var(--primary-dark)'
          }}
        >
          <ShoppingBag size={28} />
        </div>

        <h2 className="auth-title">Welcome Back</h2>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}
        >
          Sign in to access your orders and grocery cart
        </p>

      </div>


      {/* Error message */}
      {error && (
        <div
          style={{
            color: '#b91c1c',
            background: '#fee2e2',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}
        >
          {error}
        </div>
      )}


      <form onSubmit={handleSubmit}>

        <div className="form-group">

          <label className="form-label">
            Email Address
          </label>

          <input
            type="email"
            required
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

        </div>


        <div className="form-group">

          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            required
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

        </div>


        <button
          type="submit"
          className="submit-btn"
          style={{ marginTop: '0.5rem' }}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

      </form>


      <div
        style={{
          textAlign: 'center',
          marginTop: '1.2rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        Don't have an account?{' '}

        <Link
          to="/customer/register"
          style={{
            color: 'var(--primary-dark)',
            fontWeight: 700
          }}
        >
          Create Account
        </Link>

      </div>

    </div>
  );
}