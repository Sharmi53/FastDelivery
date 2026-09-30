import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { sampleCategories } from '../data/sampleData';
import { Search as SearchIcon } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

export default function Products() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All Products';
  const initialSearch = queryParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const categoryFromUrl = queryParams.get('category');
    const searchFromUrl = queryParams.get('search');

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }

    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      const productList = Array.isArray(data)
        ? data
        : data.products || data.data || [];

      setProducts(productList);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load products. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  let filtered = products.filter((product) => {
    const productCategory =
      product.category_name ||
      product.category ||
      '';

    const matchesCategory =
      selectedCategory === 'All Products' ||
      productCategory === selectedCategory;

    const productName = product.name || '';

    const matchesSearch =
      !searchTerm ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'price-low') {
    filtered.sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );
  } else if (sortBy === 'price-high') {
    filtered.sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0)
    );
  } else if (sortBy === 'rating') {
    filtered.sort(
      (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title">All Grocery Products</h1>
        <p className="section-subtitle">
          Browse through our complete fresh catalog
        </p>
      </div>

      {/* Category filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="category-grid">
          {sampleCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          ))}
        </div>
      </div>

      {/* Search and sorting controls */}
      <div
        style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: '240px'
          }}
        >
          <SearchIcon size={18} color="var(--primary)" />

          <input
            type="text"
            placeholder="Filter product names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{
              width: '100%',
              padding: '0.55rem 0.9rem',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-brand)'
            }}
          >
            Sort by:
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              fontSize: '0.88rem',
              color: 'var(--text-brand)',
              fontWeight: 600,
              background: '#ffffff',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}
        >
          <h3>Loading products...</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Please wait while we load fresh products.
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}
        >
          <h3 style={{ color: '#dc2626' }}>
            Unable to load products
          </h3>

          <p style={{ color: 'var(--text-muted)' }}>
            {error}
          </p>

          <button
            onClick={fetchProducts}
            className="submit-btn"
            style={{
              marginTop: '1rem',
              width: 'auto',
              display: 'inline-flex',
              padding: '0.65rem 1.4rem'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}
        >
          <h3
            style={{
              fontSize: '1.2rem',
              marginBottom: '0.5rem'
            }}
          >
            No products found
          </h3>

          <p style={{ color: 'var(--text-muted)' }}>
            Try adjusting your search query or selecting another category.
          </p>
        </div>
      )}

      {/* Product list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}