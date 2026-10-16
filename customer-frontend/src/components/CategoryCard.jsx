import React from 'react';

export default function CategoryCard({ category, activeCategory, onSelectCategory }) {
  const isActive =
    activeCategory === category.name ||
    (activeCategory === 'All Products' && category.id === 'all');

  return (
    <div
      className={`category-card ${isActive ? 'active' : ''}`}
      onClick={() => onSelectCategory(category.name)}
    >
      <div className="category-icon">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.textContent = '🛒';
            }}
          />
        ) : (
          category.icon || '🛒'
        )}
      </div>
      <span className="category-name">{category.name}</span>
    </div>
  );
}
