import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import fastDeliveryLogo from '../assets/fastdelivery-logo.jpg';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save login information
      localStorage.setItem(
        'grocery_user',
        JSON.stringify({
          ...data.user,
          token: data.token
        })
      );

      localStorage.setItem(
        'grocery_selected_role',
        data.user.role
      );

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
        {/* Logo and Header */}
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

          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Join FastDelivery for farm-fresh groceries delivered directly to your doorstep.
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <User
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

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="form-input"
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

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">
              Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.78rem' }}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength="6"
                className="form-input"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>Sign Up &amp; Start Shopping</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/customer/login">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;