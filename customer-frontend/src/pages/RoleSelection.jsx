import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Bike, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { selectRole } = useAuth();

  const handleSelectRole = (role) => {
    selectRole(role);
    if (role === 'customer') {
      navigate('/customer/login');
    } else if (role === 'admin') {
      navigate('/admin/login');
    } else if (role === 'delivery') {
      navigate('/delivery/login');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            background: 'var(--primary-light)',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'var(--primary-dark)'
          }}
        >
          <ShoppingBag size={36} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Welcome to FastDelivery
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Please select your portal role to continue.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}
      >
        {/* Customer Card */}
        <div
          onClick={() => handleSelectRole('customer')}
          style={{
            background: 'white',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
          }}
          className="role-card-hover"
        >
          <div
            style={{
              background: '#d1fae5',
              color: '#059669',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <ShoppingBag size={30} />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.3rem'
            }}
          >
            User Portal
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
            Customer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.8rem', flex: 1 }}>
            Shop for fresh groceries, fruits, dairy, and household essentials. Place orders with 20-min express delivery.
          </p>

          <div
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Continue as Customer</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Admin Card */}
        <div
          onClick={() => handleSelectRole('admin')}
          style={{
            background: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '20px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
          }}
          className="role-card-hover"
        >
          <div
            style={{
              background: '#dbeafe',
              color: '#2563eb',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <ShieldCheck size={30} />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#2563eb',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.3rem'
            }}
          >
            Management
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
            Admin
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.8rem', flex: 1 }}>
            Manage products, categories, customer orders, store analytics, and delivery partner assignments.
          </p>

          <div
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Access Admin Portal</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Delivery Partner Card */}
        <div
          onClick={() => handleSelectRole('delivery')}
          style={{
            background: 'white',
            border: '2px solid #f59e0b',
            borderRadius: '20px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)'
          }}
          className="role-card-hover"
        >
          <div
            style={{
              background: '#fef3c7',
              color: '#d97706',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <Bike size={30} />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#d97706',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.3rem'
            }}
          >
            Fulfillment
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
            Delivery Partner
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.8rem', flex: 1 }}>
            View nearby available orders, pickup locations, customer delivery directions, and update delivery status.
          </p>

          <div
            style={{
              background: '#f59e0b',
              color: 'white',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Access Delivery Portal</span>
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
