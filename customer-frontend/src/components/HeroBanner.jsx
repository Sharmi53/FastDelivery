import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <span className="hero-tag">
          <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Freshness Guaranteed
        </span>
        <h1 className="hero-title">Farm-Fresh Groceries Delivered Fast</h1>
        <p className="hero-subtitle">
          Shop daily organic fruits, crisp vegetables, dairy essentials &amp; household products at the lowest prices.
        </p>
        <Link to="/products" className="hero-btn">
          <span>Shop Now</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"
          alt="Grocery Basket"
          style={{
            width: '280px',
            height: '210px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
            border: '2px solid rgba(255,255,255,0.25)'
          }}
        />
      </div>
    </div>
  );
}
