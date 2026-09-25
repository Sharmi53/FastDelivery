import React, { useEffect, useState } from 'react';
import {
  Bike,
  MapPin,
  PhoneCall,
  CheckCircle,
  Navigation,
  DollarSign,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isOnline, setIsOnline] = useState(true);


  const [activeOrders, setActiveOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  const [availableOrders, setAvailableOrders] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState('');
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  // Check if delivery partner is already logged in
  // Check if delivery partner is already logged in
  useEffect(() => {
    const validateDeliveryToken = async () => {
      try {
        const savedUser = localStorage.getItem(
          'grocery_delivery_user'
        );

        // No saved login
        if (!savedUser) {
          setIsAuthenticated(false);
          return;
        }

        const userData = JSON.parse(savedUser);

        if (
          userData.role !== 'delivery_partner' ||
          !userData.token
        ) {
          localStorage.removeItem(
            'grocery_delivery_user'
          );

          setIsAuthenticated(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userData.token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          localStorage.removeItem(
            'grocery_delivery_user'
          );

          setIsAuthenticated(false);
          return;
        }

        if (
          !data.user ||
          data.user.role !== 'delivery_partner'
        ) {
          localStorage.removeItem(
            'grocery_delivery_user'
          );

          setIsAuthenticated(false);
          return;
        }

        const updatedUser = {
          ...userData,
          ...data.user,
          token: userData.token
        };

        localStorage.setItem(
          'grocery_delivery_user',
          JSON.stringify(updatedUser)
        );

        setIsAuthenticated(true);

      } catch (error) {
        console.error(
          'Delivery token validation failed:',
          error
        );

        localStorage.removeItem(
          'grocery_delivery_user'
        );

        setIsAuthenticated(false);

      } finally {
        // This must always run
        setCheckingAuth(false);
      }
    };

    validateDeliveryToken();
  }, []);
  // Load assigned orders after authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadAssignedOrders();
      loadAvailableOrders();
    }
  }, [isAuthenticated]);
  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          password,
          role: 'delivery_partner'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user.role !== 'delivery_partner') {
        throw new Error(
          'This account does not have delivery partner access.'
        );
      }

      localStorage.setItem(
        'grocery_delivery_user',
        JSON.stringify({
          ...data.user,
          token: data.token
        })
      );

      setIsAuthenticated(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grocery_delivery_user');

    setIsAuthenticated(false);
    setPhone('');
    setPassword('');
    setError('');
  };
  // =====================================
  // LOAD ASSIGNED DELIVERY ORDERS
  // =====================================
  const loadAssignedOrders = async () => {
    try {
      setOrderLoading(true);
      setOrderError('');

      const savedUser = localStorage.getItem(
        'grocery_delivery_user'
      );

      if (!savedUser) {
        throw new Error('Delivery partner login required.');
      }

      const userData = JSON.parse(savedUser);

      const response = await fetch(
        `${API_URL}/orders/delivery/assigned`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      console.log('Assigned delivery orders:', data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to load assigned orders'
        );
      }

      const formattedOrders = (data.orders || []).map(order => ({
        id: order.order_number,
        databaseId: order.id,

        storeName: 'FastDelivery Store',
        pickupAddress: 'FastDelivery Main Store',

        customerName: order.full_name || 'Customer',
        customerPhone: order.phone || '',

        deliveryAddress: [
          order.address_line,
          order.landmark,
          order.city,
          order.state,
          order.pincode
        ]
          .filter(Boolean)
          .join(', '),

        latitude: order.latitude ? Number(order.latitude) : null,
        longitude: order.longitude ? Number(order.longitude) : null,

        distance: 'Not available',
        estTime: 'Not available',
        payout: `₹${Number(order.total_amount || 0).toFixed(2)}`,
        itemsCount: Number(order.total_items || 0),

        status: order.order_status
      }));

      setActiveOrders(formattedOrders);
    } catch (error) {
      console.error(
        'Load assigned orders error:',
        error
      );

      setOrderError(error.message);
    } finally {
      setOrderLoading(false);
    }
  };

  // =====================================
  // LOAD AVAILABLE DELIVERY ORDERS
  // =====================================
  const loadAvailableOrders = async () => {
    try {
      setAvailableLoading(true);
      setAvailableError('');

      const savedUser = localStorage.getItem(
        'grocery_delivery_user'
      );

      if (!savedUser) {
        throw new Error('Delivery partner login required.');
      }

      const userData = JSON.parse(savedUser);

      const response = await fetch(
        `${API_URL}/orders/delivery/available`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      console.log('Available delivery orders:', data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to load available orders'
        );
      }

      const formattedOrders = (data.orders || []).map(order => ({
        id: order.order_number,
        databaseId: order.id,

        customerName: order.full_name || 'Customer',
        customerPhone: order.phone || '',

        deliveryAddress: [
          order.address_line,
          order.landmark,
          order.city,
          order.state,
          order.pincode
        ]
          .filter(Boolean)
          .join(', '),

        latitude: order.latitude ? Number(order.latitude) : null,
        longitude: order.longitude ? Number(order.longitude) : null,

        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        status: order.order_status,

        storeName: 'FastDelivery Store',
        pickupAddress: 'FastDelivery Main Store'
      }));

      setAvailableOrders(formattedOrders);

    } catch (error) {
      console.error(
        'Load available orders error:',
        error
      );

      setAvailableError(error.message);
    } finally {
      setAvailableLoading(false);
    }
  };
  // =====================================
  // ACCEPT AVAILABLE DELIVERY ORDER
  // =====================================
  const handleAcceptOrder = async (orderId) => {
    try {
      setAcceptingOrderId(orderId);
      setAvailableError('');

      const savedUser = localStorage.getItem(
        'grocery_delivery_user'
      );

      if (!savedUser) {
        throw new Error('Login required.');
      }

      const userData = JSON.parse(savedUser);

      const response = await fetch(
        `${API_URL}/orders/delivery/${orderId}/accept`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to accept order'
        );
      }

      alert('Order accepted successfully.');

      await loadAvailableOrders();
      await loadAssignedOrders();

    } catch (error) {
      console.error(
        'Accept delivery order error:',
        error
      );

      setAvailableError(error.message);

    } finally {
      setAcceptingOrderId(null);
    }
  };
  // =====================================
  // UPDATE DELIVERY ORDER STATUS
  // =====================================
  const handleUpdateStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      const savedUser = localStorage.getItem(
        'grocery_delivery_user'
      );

      if (!savedUser) {
        throw new Error('Login required.');
      }

      const userData = JSON.parse(savedUser);

      const response = await fetch(
        `${API_URL}/orders/delivery/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.token}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to update order status'
        );
      }

      alert(
        `Order status updated to ${newStatus.replaceAll('_', ' ')}.`
      );

      await loadAssignedOrders();
    } catch (error) {
      console.error(
        'Update delivery status error:',
        error
      );

      setOrderError(error.message);
    }
  };
  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        Checking login...
      </div>
    );
  }



  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: '420px',
          margin: '4rem auto',
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          borderTop: '4px solid #f59e0b'
        }}
      >
        <a
          href="http://localhost:3000"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          Back to Role Selection
        </a>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#fef3c7',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              color: '#d97706'
            }}
          >
            <Bike size={28} />
          </div>

          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800
            }}
          >
            Delivery Partner Login
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            Partner credentials required to view active deliveries
          </p>
        </div>

        {error && (
          <div
            style={{
              color: '#b91c1c',
              background: '#fee2e2',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '0.85rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.3rem'
              }}
            >
              Phone Number / Agent ID
            </label>

            <input
              type="text"
              required
              autoComplete="off"
              placeholder="Enter phone number"
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.3rem'
              }}
            >
              Password
            </label>

            <input
              type="password"
              required
              autoComplete="off"
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? 'Signing In...'
              : 'Sign In to Delivery Partner Portal →'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="delivery-container">

      {/* Top Header */}
      <header className="delivery-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <div
            style={{
              background: '#10b981',
              padding: '0.5rem',
              borderRadius: '10px'
            }}
          >
            <Bike size={22} color="white" />
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 800
              }}
            >
              Delivery Partner
            </h2>

            <span
              style={{
                fontSize: '0.75rem',
                opacity: 0.8
              }}
            >
              Agent ID: #DP-4402
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}
        >
          <div
            className="status-toggle"
            onClick={() => setIsOnline(!isOnline)}
            style={{ cursor: 'pointer' }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isOnline
                  ? '#10b981'
                  : '#ef4444'
              }}
            />

            <span>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Delivery Partner Content */}
      <main className="delivery-main">
        {/* Available Orders */}
        <div
          style={{
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 800
              }}
            >
              Available Orders ({availableOrders.length})
            </h3>

            <button
              onClick={loadAvailableOrders}
              style={{
                border: '1px solid var(--border)',
                background: 'white',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Refresh
            </button>
          </div>

          {availableLoading && (
            <div
              style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '10px',
                color: 'var(--text-muted)'
              }}
            >
              Loading available orders...
            </div>
          )}

          {availableError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}
            >
              {availableError}
            </div>
          )}

          {!availableLoading &&
            !availableError &&
            availableOrders.length === 0 && (
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                No available orders right now.
              </div>
            )}

          {availableOrders.map(order => (
            <div
              key={order.databaseId}
              className="order-card"
              style={{
                marginBottom: '1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '0.75rem',
                  marginBottom: '0.75rem'
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    {order.id}
                  </span>

                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Payment: {order.paymentMethod}
                  </span>
                </div>

                <span
                  style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    height: 'fit-content'
                  }}
                >
                  Available
                </span>
              </div>

              {/* Pickup */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  marginBottom: '0.6rem',
                  fontSize: '0.85rem'
                }}
              >
                <MapPin
                  size={16}
                  color="#3b82f6"
                  style={{
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                />

                <div>
                  <strong
                    style={{
                      display: 'block'
                    }}
                  >
                    Pickup: {order.storeName}
                  </strong>

                  <span
                    style={{
                      color: 'var(--text-muted)'
                    }}
                  >
                    {order.pickupAddress}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}
              >
                <Navigation
                  size={16}
                  color="#10b981"
                  style={{
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                />

                <div>
                  <strong
                    style={{
                      display: 'block'
                    }}
                  >
                    Deliver to: {order.customerName}
                  </strong>

                  <span
                    style={{
                      color: 'var(--text-muted)'
                    }}
                  >
                    {order.deliveryAddress}
                  </span>

                  {order.latitude && order.longitude && (
                    <div
                      style={{
                        marginTop: '0.3rem',
                        fontSize: '0.75rem',
                        color: '#166534',
                        background: '#dcfce7',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <MapPin size={12} />
                      GPS Available
                    </div>
                  )}
                </div>
              </div>

              {/* Accept Button */}
              <button
                onClick={() =>
                  handleAcceptOrder(order.databaseId)
                }
                disabled={acceptingOrderId === order.databaseId}
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.7rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor:
                    acceptingOrderId === order.databaseId
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    acceptingOrderId === order.databaseId
                      ? 0.7
                      : 1
                }}
              >
                {acceptingOrderId === order.databaseId
                  ? 'Accepting...'
                  : 'Accept Order'}
              </button>
            </div>
          ))}
        </div>


        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800
            }}
          >
            Assigned Deliveries ({activeOrders.length})
          </h3>

          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            Auto-refreshed
          </span>
        </div>
        {/* Assigned Orders List */}

        {orderLoading && (
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              marginBottom: '1rem'
            }}
          >
            Loading assigned orders...
          </div>
        )}

        {orderError && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1rem'
            }}
          >
            {orderError}
          </div>
        )}

        {!orderLoading && !orderError && activeOrders.length === 0 && (
          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            No assigned deliveries yet.
          </div>
        )}

        {activeOrders.map(order => (
          <div
            key={order.id}
            className="order-card"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem',
                marginBottom: '0.75rem'
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}
                >
                  {order.id}
                </span>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block'
                  }}
                >
                  {order.itemsCount} Items • Payout {order.payout}
                </span>
              </div>

              <span
                style={{
                  background: '#fef3c7',
                  color: '#d97706',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  height: 'fit-content'
                }}
              >
                {order.status
                  .replaceAll('_', ' ')
                  .replace(/\b\w/g, letter =>
                    letter.toUpperCase()
                  )}
              </span>
            </div>

            {/* Pickup */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                marginBottom: '0.6rem',
                fontSize: '0.85rem'
              }}
            >
              <MapPin
                size={16}
                color="#3b82f6"
                style={{
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              />

              <div>
                <strong
                  style={{
                    display: 'block',
                    color: 'var(--text-main)'
                  }}
                >
                  Pickup: {order.storeName}
                </strong>

                <span
                  style={{
                    color: 'var(--text-muted)'
                  }}
                >
                  {order.pickupAddress}
                </span>
              </div>
            </div>

            {/* Dropoff */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              <Navigation
                size={16}
                color="#10b981"
                style={{
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              />

              <div>
                <strong
                  style={{
                    display: 'block',
                    color: 'var(--text-main)'
                  }}
                >
                  Deliver to: {order.customerName}
                </strong>

                <span
                  style={{
                    color: 'var(--text-muted)'
                  }}
                >
                  {order.deliveryAddress}
                </span>

                {order.latitude && order.longitude && (
                  <div
                    style={{
                      marginTop: '0.3rem',
                      fontSize: '0.78rem',
                      color: '#15803d',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <MapPin size={13} />
                    <span>GPS: {order.latitude.toFixed(6)}, {order.longitude.toFixed(6)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap'
              }}
            >
              <a
                href={`tel:${order.customerPhone}`}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.6rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: 'var(--text-main)'
                }}
              >
                <PhoneCall size={16} />
                Call Customer
              </a>

              {order.latitude && order.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#166534'
                  }}
                >
                  <Navigation size={16} />
                  Navigate
                </a>
              )}

              {order.status === 'assigned' ? (
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      order.databaseId,
                      'picked_up'
                    )
                  }
                  style={{
                    flex: 1.5,
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Bike size={16} />
                  Mark Picked Up
                </button>

              ) : order.status === 'picked_up' ? (

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      order.databaseId,
                      'out_for_delivery'
                    )
                  }
                  style={{
                    flex: 1.5,
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Navigation size={16} />
                  Start Delivery
                </button>

              ) : order.status === 'out_for_delivery' ? (

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      order.databaseId,
                      'delivered'
                    )
                  }
                  style={{
                    flex: 1.5,
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <CheckCircle size={16} />
                  Mark Delivered
                </button>

              ) : (

                <button
                  disabled
                  style={{
                    flex: 1.5,
                    background: '#d1fae5',
                    color: '#047857',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  ✓ Completed
                </button>

              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}