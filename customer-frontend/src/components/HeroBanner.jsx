import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <span className="hero-tag">
          <Sparkles size={14} inline="true" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Freshness Guaranteed
        </span>
        <h1 className="hero-title">Farm-Fresh Groceries </h1>
        <p className="hero-subtitle">
          Shop daily organic fruits, crisp vegetables, dairy essentials & household products at the lowest prices.
        </p>
        <Link to="/products" className="hero-btn">
          <span>Shop Now</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="hero-image" style={{ display: 'none', md: 'block' }}>
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"
          alt="Grocery Basket"
          style={{ width: '260px', height: '200px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
        />
      </div>
    </div>
  );
}
