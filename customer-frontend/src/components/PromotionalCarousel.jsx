import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://fastdelivery-x0ce.onrender.com/api';

const AUTO_SLIDE_INTERVAL = 4500; // 4.5 seconds

export default function PromotionalCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const timerRef = useRef(null);

  // Fetch active banners from backend
  useEffect(() => {
    let isCancelled = false;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/banners`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (isCancelled) return;

        if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        } else {
          setBanners([]);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load promotional banners:', err);
          setBanners([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchBanners();

    return () => {
      isCancelled = true;
    };
  }, []);

  const total = banners.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  // Automatic sliding timer (slides every 4.5 seconds from right to left)
  useEffect(() => {
    if (loading || total <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, total, isPaused, handleNext, currentIndex]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    const threshold = 50; // min swipe distance in px

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left -> next
        handleNext();
      } else {
        // Swiped right -> prev
        handlePrev();
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const handleImageError = (id) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  // If loading, render an animated skeleton matching the hero dimensions
  if (loading) {
    return (
      <div className="promo-carousel-skeleton" aria-label="Loading promotional banners">
        <div className="promo-skeleton-shimmer" />
      </div>
    );
  }

  // If no active banners exist or API error, gracefully render nothing (hero remains top)
  if (total === 0) {
    return null;
  }

  return (
    <div
      className="promo-carousel-container"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Sliding Viewport & Track */}
      <div className="promo-carousel-track-wrapper">
        <div
          className="promo-carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => {
            const hasImageError = imageErrorMap[banner.id];
            const isSlideActive = index === currentIndex;

            return (
              <div
                key={banner.id}
                className={`promo-carousel-slide ${isSlideActive ? 'active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${total}: ${banner.title || 'Promotional Banner'}`}
                aria-hidden={!isSlideActive}
              >
                {banner.link_url ? (
                  <Link
                    to={banner.link_url}
                    className="promo-carousel-link"
                    tabIndex={isSlideActive ? 0 : -1}
                    aria-label={banner.title || 'Promotional Banner'}
                  >
                    {!hasImageError ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title || 'Promotional Banner'}
                        className="promo-carousel-img"
                        onError={() => handleImageError(banner.id)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="promo-carousel-fallback-bg" />
                    )}
                  </Link>
                ) : (
                  !hasImageError ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Promotional Banner'}
                      className="promo-carousel-img"
                      onError={() => handleImageError(banner.id)}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="promo-carousel-fallback-bg" />
                  )
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* Manual Navigation: Previous Arrow */}
      {total > 1 && (
        <button
          type="button"
          className="promo-carousel-arrow prev"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Manual Navigation: Next Arrow */}
      {total > 1 && (
        <button
          type="button"
          className="promo-carousel-arrow next"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Indicators / Dots */}
      {total > 1 && (
        <div className="promo-carousel-dots" role="tablist" aria-label="Slide indicators">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}: ${banner.title}`}
              className={`promo-carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
