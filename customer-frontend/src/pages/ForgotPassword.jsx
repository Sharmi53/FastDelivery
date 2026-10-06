import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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

  // step: 'email' | 'otp' | 'success'
  const [step, setStep] = useState('email');

  // Step 1 state
  const [email, setEmail] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendInfo, setSendInfo] = useState('');

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 2 state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSendError('');
    setSendInfo('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setSendError('Please enter your email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) { setSendError('Please enter a valid email address.'); return; }

    setSendLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });
      const data = await response.json();
      if (!response.ok) { setSendError(data.message || 'Something went wrong. Please try again.'); return; }
      setSendInfo(data.message || 'OTP sent! Check your email inbox.');
      setStep('otp');
      startResendCooldown();
    } catch {
      setSendError('Network error. Please check your connection and try again.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSendError('');
    setSendInfo('');
    setSendLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();
      if (!response.ok) { setSendError(data.message || 'Could not resend OTP.'); return; }
      setSendInfo('A new OTP has been sent to your email.');
      setOtp('');
      startResendCooldown();
    } catch {
      setSendError('Network error. Please try again.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!otp.trim()) { setResetError('Please enter the OTP sent to your email.'); return; }
    if (!/^\d{6}$/.test(otp.trim())) { setResetError('OTP must be exactly 6 digits.'); return; }
    if (!newPassword) { setResetError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
    if (!confirmPassword) { setResetError('Please confirm your new password.'); return; }
    if (newPassword !== confirmPassword) { setResetError('Passwords do not match.'); return; }

    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword })
      });
      const data = await response.json();
      if (!response.ok) { setResetError(data.message || 'Failed to reset password. Please try again.'); return; }
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
          <img src={fastDeliveryLogo} alt="FastDelivery Logo" className="auth-logo"
            style={{ height: '56px', width: 'auto', objectFit: 'contain', borderRadius: '10px' }} />
        </Link>
      </div>
      <h2 className="auth-title">{title}</h2>
      <p className="auth-subtitle">{subtitle}</p>
    </div>
  );

  const ErrorBanner = ({ msg }) =>
    msg ? (
      <div className="auth-error"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <AlertCircle size={16} /><span>{msg}</span>
      </div>
    ) : null;

  const InfoBanner = ({ msg }) =>
    msg ? (
      <div style={{
        background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46',
        borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.88rem',
        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        <CheckCircle size={15} /><span>{msg}</span>
      </div>
    ) : null;

  // SUCCESS
  if (step === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <LogoHeader title="Password Reset!" subtitle="Your password has been updated successfully." />
          <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#d1fae5', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <CheckCircle size={32} color="#059669" />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
              You can now log in using your new password.
            </p>
          </div>
          <button className="submit-btn" onClick={() => navigate('/customer/login')} style={{ marginTop: '0.5rem' }}>
            <span>Go to Login</span><ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // OTP + NEW PASSWORD
  if (step === 'otp') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <LogoHeader
            title="Verify OTP"
            subtitle={`We sent a 6-digit code to ${email}. Enter it below along with your new password.`}
          />
          <InfoBanner msg={sendInfo} />
          <ErrorBanner msg={sendError || resetError} />

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-otp">One-Time Password (OTP)</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setResetError(''); setSendError(''); }}
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.15em', fontWeight: '600' }}
                  autoComplete="one-time-code"
                />
                <FieldIcon icon={KeyRound} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fp-new-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="fp-new-password"
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
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
                  onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
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

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.88rem' }}>
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || sendLoading}
              style={{
                background: 'none', border: 'none',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                fontWeight: '600', fontSize: '0.88rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0
              }}
            >
              <RefreshCw size={14} />
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="auth-footer">
            <Link to="/customer/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  // EMAIL ENTRY (default step)
  return (
    <div className="auth-page">
      <div className="auth-card">
        <LogoHeader
          title="Forgot Password?"
          subtitle="Enter your registered email address and we will send you a one-time password (OTP)."
        />
        <ErrorBanner msg={sendError} />
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label" htmlFor="fp-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fp-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSendError(''); }}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
              <FieldIcon icon={Mail} />
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={sendLoading}>
            {sendLoading ? <span>Sending OTP...</span> : <><span>Send OTP</span><ArrowRight size={18} /></>}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/customer/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
