import React, { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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