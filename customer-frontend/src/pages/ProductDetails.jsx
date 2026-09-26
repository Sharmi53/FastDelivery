import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/products/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.product) {
          throw new Error(data.message || 'Product not found');
        }

        const p = data.product;

        setProduct({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          price: Number(p.price),
          originalPrice: p.original_price
            ? Number(p.original_price)
            : null,
          unit: p.unit,
          category: p.category_name,
          inStock: Number(p.stock_quantity) > 0,
          stockQuantity: Number(p.stock_quantity),
          rating: 5,
          reviewsCount: 0
        });
      } catch (err) {
        console.error('Product details error:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Product Not Found</h2>

        <p
          style={{
            color: 'var(--text-muted)',
            margin: '1rem 0'
          }}
        >
          {error || 'The product you are looking for does not exist.'}
        </p>

        <Link
          to="/products"
          className="nav-btn nav-btn-primary"
          style={{ display: 'inline-flex' }}
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem'
        }}
      >
        {/* Product Image */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              maxWidth: '100%',
              maxHeight: '380px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Product Details Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--primary-dark)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {product.category}
          </span>

          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              margin: '0.4rem 0 0.8rem',
              color: 'var(--text-main)'
            }}
          >
            {product.name}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                color: '#f59e0b'
              }}
            >
              <Star size={18} fill="#f59e0b" />
              <span style={{ fontWeight: 700 }}>
                {product.rating}
              </span>
            </div>

            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}
            >
              ({product.reviewsCount} customer reviews)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.8rem',
              marginBottom: '1.2rem'
            }}
          >
            <span
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--primary-dark)'
              }}
            >
              ₹{product.price.toFixed(2)}
            </span>

            {product.originalPrice && (
              <span
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through'
                }}
              >
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}

            <span
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
              }}
            >
              / {product.unit}
            </span>
          </div>

          <p
            style={{
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}
          >
            {product.description}
          </p>

          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Availability:</span>

              <span
                style={{
                  fontWeight: 700,
                  color: product.inStock
                    ? '#10b981'
                    : '#ef4444'
                }}
              >
                {product.inStock
                  ? `In Stock (${product.stockQuantity}available)`
                  : 'Out of Stock'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
            </div>
          </div>

          {/* Quantity Selector & Add button */}
          {product.inStock ? (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginTop: 'auto'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'white'
                }}
              >
                <button
                  onClick={() =>
                    setQuantity(q => Math.max(1, q - 1))
                  }
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'none'
                  }}
                >
                  <Minus size={16} />
                </button>

                <span
                  style={{
                    padding: '0 1rem',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(q =>
                      Math.min(
                        product.stockQuantity,
                        q + 1
                      )
                    )
                  }
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'none'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="submit-btn"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShoppingCart size={18} />

                Add to Cart • ₹
                {(product.price * quantity).toFixed(2)}
              </button>
            </div>
          ) : (
            <button
              className="submit-btn"
              disabled
              style={{
                background: '#cbd5e1',
                cursor: 'not-allowed'
              }}
            >
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}