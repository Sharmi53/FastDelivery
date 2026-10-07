import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { sampleCategories } from '../data/sampleData';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';
const HOME_PRODUCT_LIMIT = 8;

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState('All Products');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: HOME_PRODUCT_LIMIT.toString()
        });

        if (selectedCategory && selectedCategory !== 'All Products') {
          params.set('category', selectedCategory);
        }

        const response = await fetch(
          `${API_URL}/products?${params.toString()}`
        );

        const data = await response.json();

        if (isCancelled) return;

        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Home products error:', error);
          setProducts([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  const filteredProducts = products;

  return (
    <div>
      <HeroBanner />

      {/* Category Section */}
      <section className="category-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Shop by Category
            </h2>

            <p className="section-subtitle">
              Select a category to browse fresh items
            </p>
          </div>

          <Link
            to="/products"
            style={{
              color: 'var(--primary-dark)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {sampleCategories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="product-section">
        <div className="section-header">
          <div>
            <h2
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <TrendingUp
                color="var(--primary)"
                size={24}
              />

              Popular Grocery Items
            </h2>

            <p className="section-subtitle">
              Freshly stocked and best prices in town
            </p>
          </div>

          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}
          >
            Showing {filteredProducts.length} items
          </span>
        </div>

        <div className="product-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products available.</p>
          ) : (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2.5rem'
          }}
        >
          <Link
            to="/products"
            className="submit-btn"
            style={{
              width: 'auto',
              padding: '0.85rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '12px',
              textDecoration: 'none'
            }}
          >
            <span>View All Products</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}