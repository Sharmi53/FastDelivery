import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--primary-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary-dark)' }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Grocery Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Looks like you haven't added any fresh items to your cart yet.</p>
        <Link to="/products" className="nav-btn nav-btn-primary" style={{ display: 'inline-flex' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="section-title">Your Grocery Cart ({cartItems.length} items)</h1>
        <button onClick={clearCart} style={{ color: '#ef4444', background: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
          Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map(item => (
            <div
              key={item.id}
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', background: '#f8fafc' }}
              />

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>{item.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.unit}</p>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.3rem' }}>
                  Rs.{Number(item.price || 0).toFixed(2)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ padding: '0.4rem 0.6rem', background: 'none' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0 0.6rem', fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: '0.4rem 0.6rem', background: 'none' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                style={{ background: 'none', color: '#94a3b8', padding: '0.4rem' }}
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>Rs.{Number(subtotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery Fee</span>
              <span style={{ fontWeight: 700, color: deliveryFee === 0 ? '#10b981' : 'inherit' }}>
                {deliveryFee === 0 ? 'FREE' : `Rs.${Number(deliveryFee || 0).toFixed(2)}`}
              </span>
            </div>
            {Number(subtotal || 0) < 150 && (
              <p style={{ fontSize: '0.78rem', color: '#d97706', background: '#fef3c7', padding: '0.5rem', borderRadius: '6px' }}>
                💡 Add Rs.{150 - Number(subtotal || 0).toFixed(2)} more for FREE Delivery!
              </p>
            )}
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary-dark)' }}>Rs.{Number(total || 0).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="submit-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
