import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { sampleCategories } from '../data/sampleData';
import { Search as SearchIcon } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

const PAGE_SIZE = 8;

export default function Products() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All Products';
  const initialSearch   = queryParams.get('search')   || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm,       setSearchTerm]        = useState(initialSearch);
  const [sortBy,           setSortBy]            = useState('featured');

  // Accumulated product list (Load More appends to this)
  const [products,    setProducts]    = useState([]);
  const [offset,      setOffset]      = useState(0);
  const [hasMore,     setHasMore]     = useState(false);

  // Separate loading states: initial load vs. Load More spinner
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState('');

  // Track the "current filters" so we can detect when they change
  // and reset pagination without a stale-closure problem.
  const filtersRef = useRef({ selectedCategory, searchTerm });

  // ---------------------------------------------------------------
  // Sync URL query params → state (unchanged from original behaviour)
  // ---------------------------------------------------------------
  useEffect(() => {
    const params        = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    const searchFromUrl   = params.get('search');

    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
    if (searchFromUrl !== null) setSearchTerm(searchFromUrl);
  }, [location.search]);

  // ---------------------------------------------------------------
  // Reset & re-fetch whenever category or search changes
  // ---------------------------------------------------------------
  useEffect(() => {
    filtersRef.current = { selectedCategory, searchTerm };
    setProducts([]);
    setOffset(0);
    setHasMore(false);
    setError('');
    fetchProducts(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm]);

  // ---------------------------------------------------------------
  // Core fetch function
  //   fetchOffset  – which page to request
  //   append       – true = Load More (append), false = fresh load (replace)
  // ---------------------------------------------------------------
  const fetchProducts = async (fetchOffset, append) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      // Build URL with backend filters + pagination params
      const params = new URLSearchParams();
      params.set('limit',  PAGE_SIZE);
      params.set('offset', fetchOffset);

      const { selectedCategory: cat, searchTerm: search } = filtersRef.current;

      if (cat && cat !== 'All Products') {
        params.set('category', cat);
      }
      if (search && search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`${API_URL}/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      const newProducts = Array.isArray(data.products)
        ? data.products
        : Array.isArray(data)
          ? data
          : [];

      const more =
        typeof data.hasMore === 'boolean'
          ? data.hasMore
          : typeof data.total === 'number'
            ? fetchOffset + newProducts.length < data.total
            : false;

      setHasMore(more);

      if (append) {
        // Deduplicate by id to be safe against double-clicks
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const fresh = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...fresh];
        });
      } else {
        setProducts(newProducts);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load products. Please check that the backend is running.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ---------------------------------------------------------------
  // Load More handler
  // ---------------------------------------------------------------
  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchProducts(nextOffset, true);
  };

  // ---------------------------------------------------------------
  // Retry handler (error state)
  // ---------------------------------------------------------------
  const handleRetry = () => {
    filtersRef.current = { selectedCategory, searchTerm };
    setProducts([]);
    setOffset(0);
    setHasMore(false);
    fetchProducts(0, false);
  };

  // ---------------------------------------------------------------
  // Client-side sort on the already-accumulated list
  // (backend returns p.id ASC; price/rating sort stays client-side
  //  so it works across all accumulated pages)
  // ---------------------------------------------------------------
  let displayed = [...products];

  if (sortBy === 'price-low') {
    displayed.sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );
  } else if (sortBy === 'price-high') {
    displayed.sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0)
    );
  } else if (sortBy === 'rating') {
    displayed.sort(
      (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
    );
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
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

      {/* Initial loading state */}
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
            onClick={handleRetry}
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
      {!loading && !error && displayed.length === 0 && (
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

      {/* Product grid */}
      {!loading && !error && displayed.length > 0 && (
        <div className="product-grid">
          {displayed.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* Load More button */}
      {!loading && !error && hasMore && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2rem'
          }}
        >
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="submit-btn"
            style={{
              width: 'auto',
              padding: '0.75rem 2.5rem',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loadingMore ? 0.7 : 1,
              cursor: loadingMore ? 'not-allowed' : 'pointer'
            }}
          >
            {loadingMore ? 'Loading more...' : 'Load More'}
          </button>
        </div>
      )}

      {/* "All loaded" indicator when user has clicked Load More at least once */}
      {!loading && !error && !hasMore && displayed.length > 0 && offset > 0 && (
        <p
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            color: 'var(--text-muted)',
            fontSize: '0.88rem'
          }}
        >
          You've seen all {displayed.length} product{displayed.length !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}