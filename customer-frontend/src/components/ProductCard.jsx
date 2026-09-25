import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();

  const cartItem = cartItems.find(
    (item) => item.id === product.id
  );

  const isInCart = Boolean(cartItem);

  // MySQL product fields
  const productCategory =
    product.category_name || 'Grocery';

  const stockQuantity = Number(
    product.stock_quantity || 0
  );

  const isInStock =
    product.status === 'active' &&
    stockQuantity > 0;

  const rating = Number(product.rating || 0);

  const reviewsCount =
    product.reviews_count || 0;

  const originalPrice = product.original_price;

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-img"
          />
        </Link>

        {!isInStock && (
          <span className="badge badge-out">
            Out of Stock
          </span>
        )}
      </div>

      <div className="product-body">
        <span className="product-category">
          {productCategory}
        </span>

        <Link
          to={`/products/${product.id}`}
          className="product-title"
        >
          {product.name}
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: '#f59e0b',
            margin: '0.2rem 0 0.5rem'
          }}
        >
          <Star
            size={14}
            fill="#f59e0b"
          />

          <span style={{ fontWeight: 700 }}>
            {rating > 0 ? rating.toFixed(1) : 'New'}
          </span>

          <span style={{ color: 'var(--text-muted)' }}>
            ({reviewsCount})
          </span>
        </div>

        <div className="product-unit">
          {product.unit}
        </div>

        <div className="product-footer">
          <div className="price-container">
            <span className="product-price">
              Rs.{Number(product.price || 0).toFixed(2)}
            </span>

            {originalPrice && (
              <span className="original-price">
                Rs.{Number(originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!isInStock}
            className="add-btn"
          >
            {isInCart ? (
              <>
                <Check size={16} />
                Added ({cartItem.quantity})
              </>
            ) : isInStock ? (
              <>
                <Plus size={16} />
                Add
              </>
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}