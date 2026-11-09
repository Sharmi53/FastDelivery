import React, { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://fastdelivery-x0ce.onrender.com/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const storedUser = localStorage.getItem('grocery_user');

      if (!storedUser) {
        setError('Please login to view your orders.');
        return;
      }

      const userData = JSON.parse(storedUser);

      if (!userData.token) {
        setError('Login session expired. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      console.log('Orders response status:', response.status);
      console.log('Orders response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load orders.');
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date unavailable';

    return new Date(dateValue).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';

    return status
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#10b981';

      case 'cancelled':
        return '#ef4444';

      case 'out_for_delivery':
      case 'picked_up':
        return '#f59e0b';

      case 'preparing':
      case 'ready_for_pickup':
      case 'assigned':
        return '#8b5cf6';

      case 'confirmed':
        return '#3b82f6';

      default:
        return '#64748b';
    }
  };

  const getOrderId = (order) => {
    return order.order_number || order.orderNumber || `Order #${order.id}`;
  };

  const getOrderTotal = (order) => {
    return Number(
      order.total_amount ??
      order.totalAmount ??
      order.total ??
      0
    ).toFixed(2);
  };
  const getOrderSubtotal = (order) => {
    return Number(
      order.subtotal ??
      order.subtotalAmount ??
      0
    ).toFixed(2);
  };

  const getDeliveryCharge = (order) => {
    return Number(
      order.delivery_charge ??
      order.deliveryCharge ??
      0
    ).toFixed(2);
  };

  const getOrderDiscount = (order) => {
    return Number(
      order.discount ??
      0
    ).toFixed(2);
  };
  const getOrderStatus = (order) => {
    return order.order_status || order.orderStatus || 'placed';
  };

  const getOrderItems = (order) => {
    return order.items || order.order_items || [];
  };

  const getItemName = (item) => {
    return item.product_name || item.productName || item.name || 'Product';
  };

  const getItemQuantity = (item) => {
    return item.quantity || item.qty || 1;
  };

  const getItemSubtotal = (item) => {
    return Number(
      item.subtotal ??
      item.total ??
      item.price ??
      0
    ).toFixed(2);
  };

  const getAddress = (order) => {
    if (order.address) {
      if (typeof order.address === 'string') {
        return order.address;
      }

      return [
        order.address.address_line,
        order.address.landmark,
        order.address.city,
        order.address.state,
        order.address.pincode
      ]
        .filter(Boolean)
        .join(', ');
    }

    return [
      order.address_line,
      order.city,
      order.state,
      order.pincode
    ]
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div>
        <h1 className="section-title" style={{ marginBottom: '0.4rem' }}>
          My Orders
        </h1>

        <p className="section-subtitle">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="section-title" style={{ marginBottom: '0.4rem' }}>
          My Orders
        </h1>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '12px',
            background: '#fef2f2',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>

        <button
          onClick={fetchOrders}
          style={{
            marginTop: '1rem',
            padding: '0.7rem 1rem',
            border: 'none',
            borderRadius: '8px',
            background: 'var(--primary)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1
        className="section-title"
        style={{ marginBottom: '0.4rem' }}
      >
        My Orders
      </h1>

      <p
        className="section-subtitle"
        style={{ marginBottom: '1.5rem' }}
      >
        Track your active deliveries and past purchases
      </p>

      {/* Defective Product & Refund WhatsApp Support Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
          border: '1.5px solid #a7f3d0',
          borderRadius: '16px',
          padding: '1.1rem 1.35rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)'
            }}
          >
            {/* WhatsApp Chat Bubble Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.98rem', marginBottom: '0.2rem' }}>
              Defective Product or Refund Request?
            </div>
            <div style={{ color: '#047857', fontSize: '0.86rem', lineHeight: 1.45 }}>
              For defective products, damaged items, or refund assistance, contact us directly on WhatsApp with your Order ID and product photo.
            </div>
          </div>
        </div>

        <a
          href="https://wa.me/919800157525?text=Hello%20FastDelivery,%20I%20have%20an%20issue%20with%20a%20defective%20product%20and%20would%20like%20to%20request%20assistance%20/%20refund."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: 'white',
            padding: '0.65rem 1.25rem',
            borderRadius: '25px',
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.28)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {/* WhatsApp Logo Icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
          </svg>
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}
        >
          <Package
            size={48}
            color="var(--text-muted)"
            style={{ marginBottom: '1rem' }}
          />

          <h3 style={{ marginBottom: '0.5rem' }}>
            No orders yet
          </h3>

          <p style={{ color: 'var(--text-muted)' }}>
            Your placed orders will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {orders.map((order) => {
            const status = getOrderStatus(order);
            const statusColor = getStatusColor(status);
            const items = getOrderItems(order);
            const address = getAddress(order);

            return (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.5rem'
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.8rem'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800
                      }}
                    >
                      {getOrderId(order)}
                    </span>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem'
                      }}
                    >
                      Ordered on{' '}
                      {formatDate(
                        order.created_at || order.createdAt
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span
                      style={{
                        background: `${statusColor}15`,
                        color: statusColor,
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      ● {formatStatus(status)}
                    </span>

                    <div
                      style={{
                        textAlign: 'right'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.15rem'
                        }}
                      >
                        Total
                      </div>

                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: 'var(--primary-dark)'
                        }}
                      >
                        ₹{getOrderTotal(order)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div style={{ marginBottom: '1rem' }}>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div
                        key={item.id || index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                          gap: '1rem'
                        }}
                      >
                        <span>
                          {getItemName(item)} ×{' '}
                          {getItemQuantity(item)}
                        </span>

                        <span
                          style={{
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ₹{getItemSubtotal(item)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                      }}
                    >
                      Order items are not available.
                    </span>
                  )}
                </div>

                {/* Price breakdown */}
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.9rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span>Subtotal</span>
                    <span>
                      ₹{getOrderSubtotal(order)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span>Delivery Charge</span>
                    <span>
                      ₹{getDeliveryCharge(order)}
                    </span>
                  </div>

                  {Number(order.discount || 0) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem',
                        fontSize: '0.9rem',
                        color: '#16a34a'
                      }}
                    >
                      <span>Discount</span>
                      <span>
                        -₹{getOrderDiscount(order)}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.6rem',
                      marginTop: '0.6rem',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: 'var(--primary-dark)' }}>
                      ₹{getOrderTotal(order)}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      fontSize: '0.88rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                    <span style={{ fontWeight: 600 }}>
                      {(() => {
                        const pm = (order.payment_method || order.paymentMethod || '').toLowerCase();
                        if (pm === 'cod') return 'COD';
                        if (pm === 'online') return 'Online';
                        if (pm) return pm.charAt(0).toUpperCase() + pm.slice(1);
                        return '—';
                      })()}
                    </span>
                  </div>

                </div>

                {/* Address and timeline */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    flexWrap: 'wrap',
                    gap: '0.8rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <MapPin
                      size={14}
                      color="var(--text-muted)"
                    />

                    <span>
                      Deliver to:{' '}
                      <strong>
                        {address || 'Address unavailable'}
                      </strong>
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--primary-dark)',
                      fontWeight: 700
                    }}
                  >
                    <Clock size={14} />
                    <span>{formatStatus(status)}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}