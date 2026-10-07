import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle, X } from 'lucide-react';
import fastDeliveryLogo from '../assets/fastdelivery-logo.jpg';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

function FieldIcon({ icon: Icon }) {
  return (
    <Icon
      size={17}
      style={{
        position: 'absolute',
        left: '0.85rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--primary)'
      }}
    />
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  // step: 'form' | 'password' | 'success'
  const [step, setStep] = useState('form');

  // Step 1: Identity verification fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');

  // Step 2: OTP popup/modal state
  const [showModal, setShowModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Step 3: Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // 1. Send OTP: Verify Name, Email, Phone
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSendError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setSendError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setSendError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setSendError('Please enter a valid email address.');
      return;
    }

    if (!trimmedPhone) {
      setSendError('Please enter your phone number.');
      return;
    }

    setSendLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setSendError(data.message || 'The provided details do not match our records.');
        return;
      }

      // Store OTP and open the modal popup
      setGeneratedOtp(data.otp);
      setEnteredOtp('');
      setVerifyError('');
      setShowModal(true);
    } catch {
      setSendError('Network error. Please check your connection and try again.');
    } finally {
      setSendLoading(false);
    }
  };

  // 2. Verify OTP inside Modal
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerifyError('');

    const trimmedOtp = enteredOtp.trim();
    if (!trimmedOtp) {
      setVerifyError('Please enter the OTP.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setVerifyError('OTP must be exactly 6 digits.');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: trimmedOtp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setVerifyError(data.message || 'Invalid OTP. Please try again.');
        return;
      }

      // Close modal and transition to New Password step
      setShowModal(false);
      setStep('password');
    } catch {
      setVerifyError('Network error. Please check your connection and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!newPassword) {
      setResetError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }

    if (!confirmPassword) {
      setResetError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: enteredOtp.trim(),
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.message || 'Failed to reset password. Please try again.');
        return;
      }

      setStep('success');
    } catch {
      setResetError('Network error. Please check your connection and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const LogoHeader = ({ title, subtitle }) => (
    <div className="auth-header">
      <div className="auth-logo-wrapper">
        <Link to="/home" title="FastDelivery Home">
          <img
            src={fastDeliveryLogo}
            alt="FastDelivery Logo"
            className="auth-logo"
            style={{ height: '56px', width: 'auto', objectFit: 'contain', borderRadius: '10px' }}
          />
        </Link>
      </div>
      <h2 className="auth-title">{title}</h2>
      <p className="auth-subtitle">{subtitle}</p>
    </div>
  );

  const ErrorBanner = ({ msg }) =>
    msg ? (
      <div
        className="auth-error"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      >
        <AlertCircle size={16} />
        <span>{msg}</span>
      </div>
    ) : null;

  // SUCCESS STEP
  if (step === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <LogoHeader title="Password Reset!" subtitle="Your password has been updated successfully." />
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem 0 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                background: '#d1fae5',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem'
              }}
            >
              <CheckCircle size={32} color="#059669" />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
              You can now log in using your new password.
            </p>
          </div>
          <button
            className="submit-btn"
            onClick={() => navigate('/customer/login')}
            style={{ marginTop: '0.5rem' }}
          >
            <span>Go to Login</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: NEW PASSWORD ENTRY
  if (step === 'password') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <LogoHeader
            title="Create New Password"
            subtitle={`OTP verified for ${email}. Please enter your new password below.`}
          />
          <ErrorBanner msg={resetError} />

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-new-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="fp-new-password"
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setResetError('');
                  }}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="new-password"
                />
                <FieldIcon icon={Lock} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fp-confirm-password">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="fp-confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setResetError('');
                  }}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="new-password"
                />
                <FieldIcon icon={Lock} />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={resetLoading}>
              {resetLoading ? <span>Resetting Password...</span> : <><span>Reset Password</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/customer/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: VERIFY IDENTITY (Name, Email, Phone) + OTP MODAL
  return (
    <div className="auth-page">
      <div className="auth-card">
        <LogoHeader
          title="Forgot Password?"
          subtitle="Enter your name, email and phone number to verify your account and receive an OTP."
        />
        <ErrorBanner msg={sendError} />

        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label" htmlFor="fp-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fp-name"
                type="text"
                className="form-input"
                placeholder="Enter your registered name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSendError('');
                }}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="name"
              />
              <FieldIcon icon={User} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fp-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fp-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSendError('');
                }}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
              <FieldIcon icon={Mail} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fp-phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fp-phone"
                type="tel"
                className="form-input"
                placeholder="Enter your registered phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSendError('');
                }}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="tel"
              />
              <FieldIcon icon={Phone} />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={sendLoading}>
            {sendLoading ? <span>Verifying...</span> : <><span>Send OTP</span><ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/customer/login">← Back to Login</Link>
        </div>
      </div>

      {/* OTP POPUP / MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '430px',
              width: '100%',
              padding: '2rem 1.75rem',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid var(--border)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-brand)', margin: 0 }}>
                  Enter OTP
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                  Verification code for {email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                title="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Generated OTP Display Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
                border: '2px dashed var(--primary)',
                borderRadius: '12px',
                padding: '1.1rem',
                textAlign: 'center',
                margin: '1.25rem 0'
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--primary-dark)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.35rem'
                }}
              >
                Your One-Time Password
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  letterSpacing: '0.25em',
                  color: 'var(--primary-dark)',
                  fontFamily: 'monospace'
                }}
              >
                {generatedOtp}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Valid for 10 minutes
              </div>
            </div>

            {/* Error inside modal */}
            {verifyError && (
              <div
                className="auth-error"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}
              >
                <AlertCircle size={16} />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="modal-otp">
                  Enter 6-digit OTP
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="modal-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setVerifyError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      letterSpacing: '0.15em',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                    autoComplete="one-time-code"
                  />
                  <FieldIcon icon={KeyRound} />
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={verifyLoading}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                {verifyLoading ? <span>Verifying...</span> : <><span>Verify OTP</span><ArrowRight size={18} /></>}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
