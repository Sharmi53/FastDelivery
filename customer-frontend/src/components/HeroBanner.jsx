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
        <h1 className="hero-title">Craving Fresh Today? We’re Already on the Way!</h1>
        <p className="hero-subtitle">
          <strong>
            Delivery is available from 7 am to 11pm. Orders after 11pm may get cancelled or delivered next day.
          </strong>
        </p>
        <Link to="/products" className="hero-btn">
          <span>Shop Now</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}