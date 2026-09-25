import React from 'react';

export default function CategoryCard({ category, activeCategory, onSelectCategory }) {
  const isActive = activeCategory === category.name || (activeCategory === 'All Products' && category.id === 'all');

  return (
    <div
      className={`category-card ${isActive ? 'active' : ''}`}
      onClick={() => onSelectCategory(category.name)}
    >
      <div className="category-icon">{category.icon}</div>
      <span className="category-name">{category.name}</span>
    </div>
  );
}
