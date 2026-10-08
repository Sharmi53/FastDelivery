import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Truck, CreditCard, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://fastdelivery-x0ce.onrender.com/api';

export default function Checkout() {
  const {
    cartItems,
    total,
    subtotal,
    deliveryFee,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'cod'
  });

  // =====================================
  // GPS LOCATION STATE
  // =====================================
  const [gpsLatitude, setGpsLatitude] = useState(null);
  const [gpsLongitude, setGpsLongitude] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle');
  // 'idle' | 'loading' | 'captured' | 'error'
  const [gpsError, setGpsError] = useState('');

  const [isPlaced, setIsPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // =====================================
  // GPS: REQUEST CURRENT LOCATION
  // Only called when the customer explicitly clicks the button.
  // Uses navigator.geolocation.getCurrentPosition — one-shot.
  // =====================================
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Your browser does not support GPS location.');
      return;
    }

    setGpsStatus('loading');
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLatitude(position.coords.latitude);
        setGpsLongitude(position.coords.longitude);
        setGpsStatus('captured');
        setGpsError('');
      },
      (err) => {
        setGpsStatus('error');
        setGpsLatitude(null);
        setGpsLongitude(null);

        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please enter your address manually.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Location unavailable. Please enter your address manually.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Location request timed out. Please enter your address manually.');
        } else {
          setGpsError('Unable to access your current location. Please enter your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const savedUser = localStorage.getItem('grocery_user');

    if (!savedUser) {
      setError('Please log in before placing an order.');
      return;
    }

    let userData;

    try {
      userData = JSON.parse(savedUser);
    } catch {
      setError('Your login session is invalid. Please log in again.');
      return;
    }

    if (!userData.token) {
      setError('Your login session has expired. Please log in again.');
      return;
    }

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: Number(item.quantity)
      })),

      address: {
        fullName: formData.fullName,
        phone: formData.phone,
        addressLine: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.zip,

        latitude: gpsLatitude,
        longitude: gpsLongitude
      },

      paymentMethod: formData.paymentMethod
    };

    // ==========================================
    // COD PAYMENT
    // ==========================================

    if (formData.paymentMethod === 'cod') {
      try {
        setIsSubmitting(true);

        const response = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.token}`
          },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();

        console.log('COD order response:', data);

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to place order.');
        }

        setCreatedOrder(data.order);
        setIsPlaced(true);
        clearCart();

      } catch (err) {
        console.error('COD order error:', err);
        setError(err.message || 'Something went wrong while placing your order.');

      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    // ==========================================
    // RAZORPAY ONLINE PAYMENT
    // ==========================================

    try {
      setIsSubmitting(true);

      // ------------------------------------------
      // 1. Create Razorpay order
      // ------------------------------------------

      const paymentResponse = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          items: cartItems,
          address: orderData.address
        })
      });

      const paymentData = await paymentResponse.json();

      console.log('Razorpay initiate response:', paymentData);

      if (!paymentResponse.ok || !paymentData.success) {
        throw new Error(
          paymentData.message || 'Unable to start online payment.'
        );
      }

      // ------------------------------------------
      // 2. Make sure Razorpay Checkout is loaded
      // ------------------------------------------

      if (!window.Razorpay) {
        throw new Error(
          'Razorpay Checkout could not be loaded. Please refresh the page and try again.'
        );
      }

      // ------------------------------------------
      // 3. Razorpay Checkout options
      // ------------------------------------------

      const options = {
        key: paymentData.keyId,

        amount: paymentData.amount,

        currency: paymentData.currency,

        name: 'FastDelivery',

        description: 'Grocery Order Payment',

        order_id: paymentData.razorpayOrderId,


        theme: {
          color: '#0891b2'
        },

        handler: async function (razorpayResponse) {

          try {
            // --------------------------------------
            // 4. Verify Razorpay payment
            // --------------------------------------

            const verifyResponse = await fetch(
              `${API_URL}/payments/confirm`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${userData.token}`
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    razorpayResponse.razorpay_order_id,

                  razorpay_payment_id:
                    razorpayResponse.razorpay_payment_id,

                  razorpay_signature:
                    razorpayResponse.razorpay_signature
                })
              }
            );

            const verifyData = await verifyResponse.json();

            console.log('Razorpay verification response:', verifyData);

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || 'Payment verification failed.'
              );
            }

            // --------------------------------------
            // 5. Payment confirmed → order finalized
            // --------------------------------------

            setCreatedOrder(verifyData.order);
            setIsPlaced(true);
            clearCart();

          } catch (err) {
            console.error('Online payment/order error:', err);
            setError(
              err.message ||
              'Payment verification failed. Please contact support.'
            );

          } finally {
            setIsSubmitting(false);
          }
        },

        modal: {
          ondismiss: function () {
            console.log('Razorpay payment window closed.');
            setIsSubmitting(false);
            setError('Payment was cancelled.');
          }
        }
      };

      // ------------------------------------------
      // 6. Open Razorpay
      // ------------------------------------------

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);

        setIsSubmitting(false);

        setError(
          response.error?.description ||
          'Payment failed. Please try again.'
        );
      });

      razorpay.open();

    } catch (err) {
      console.error('Razorpay payment initiation error:', err);

      setError(
        err.message ||
        'Unable to start online payment.'
      );

      setIsSubmitting(false);
    }
  };

  if (isPlaced && createdOrder) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          maxWidth: '540px',
          margin: '2rem auto'
        }}
      >
        <CheckCircle2 color="var(--primary)" size={64} style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-brand)' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
          Thank you for shopping with FastDelivery. Your order{' '}
          <strong>#{createdOrder.orderNumber}</strong> has been received.
        </p>
        <div
          style={{
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Order Number:</strong> {createdOrder.orderNumber}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Delivery Address:</strong>{' '}
            {formData.address}, {formData.city}, {formData.state} - {formData.zip}
          </div>
          {gpsLatitude && gpsLongitude && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>GPS Location:</strong> {gpsLatitude.toFixed(6)}, {gpsLongitude.toFixed(6)}
            </div>
          )}
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Payment Method:</strong>{' '}
            {formData.paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : 'Online Payment'}
          </div>
          <div>
            <strong>Total Payable:</strong> Rs.{Number(createdOrder.totalAmount || 0).toFixed(2)}
          </div>
        </div>
        <button onClick={() => navigate('/orders')} className="submit-btn">
          Track Order Status
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>
        Checkout &amp; Delivery Details
      </h1>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}
      >
        {/* Delivery Form */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem'
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Truck color="var(--primary-dark)" size={20} />
            Shipping Address
          </h3>

          {/* ===================================== */}
          {/* GPS LOCATION CAPTURE                  */}
          {/* Triggered ONLY by explicit button tap */}
          {/* ===================================== */}
          <div
            style={{
              marginBottom: '1.2rem',
              padding: '0.85rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px'
            }}
          >
            <div
              style={{
                fontSize: '0.82rem',
                color: '#166534',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}
            >
              📍 GPS Location (Optional)
            </div>

            {gpsStatus === 'captured' ? (
              <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>
                ✓ Current location captured
                <span
                  style={{
                    display: 'block',
                    color: '#4b5563',
                    fontWeight: 400,
                    marginTop: '0.2rem',
                    fontSize: '0.78rem'
                  }}
                >
                  Lat: {gpsLatitude?.toFixed(6)}, Lng: {gpsLongitude?.toFixed(6)}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gpsStatus === 'loading'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: gpsStatus === 'loading' ? 'var(--primary-light)' : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  color: gpsStatus === 'loading' ? 'var(--primary-dark)' : 'white',
                  border: 'none',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: gpsStatus === 'loading' ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(8, 145, 178, 0.2)'
                }}
              >
                <MapPin size={15} />
                {gpsStatus === 'loading' ? 'Getting location...' : '📍 Use Current Location'}
              </button>
            )}

            {gpsStatus === 'error' && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#b91c1c' }}>
                {gpsError}
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.4rem', marginBottom: 0 }}>
              Helps the delivery partner navigate to you. You must still fill in your address below.
            </p>
          </div>
          {/* ===================================== */}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address / House No.</label>
            <input
              type="text"
              name="address"
              required
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="House number, street, area"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Landmark</label>
            <input
              type="text"
              name="landmark"
              className="form-input"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Nearby landmark (optional)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                required
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                required
                className="form-input"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input
              type="text"
              name="zip"
              required
              className="form-input"
              value={formData.zip}
              onChange={handleChange}
              placeholder="Enter pincode"
            />
          </div>

          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              margin: '1.5rem 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CreditCard color="var(--primary-dark)" size={20} />
            Payment Option
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                border: formData.paymentMethod === 'cod' ? '1.5px solid var(--secondary)' : '1px solid var(--border)',
                background: formData.paymentMethod === 'cod' ? 'var(--primary-light)' : 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={handleChange}
              />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-brand)' }}>
                  Cash on Delivery (COD)
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Pay cash or UPI scan when the delivery partner arrives.
                </span>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                border: formData.paymentMethod === 'online' ? '1.5px solid var(--secondary)' : '1px solid var(--border)',
                background: formData.paymentMethod === 'online' ? 'var(--primary-light)' : 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={formData.paymentMethod === 'online'}
                onChange={handleChange}
              />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-brand)' }}>
                  Online Card / UPI
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Instant digital payment through UPI / Card.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            height: 'fit-content'
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem'
            }}
          >
            Order Items ({cartItems.length})
          </h3>

          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '1rem',
              paddingRight: '0.3rem'
            }}
          >
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.6rem',
                  fontSize: '0.85rem',
                  gap: '1rem'
                }}
              >
                <span>{item.name} x {item.quantity}</span>
                <span style={{ fontWeight: 700 }}>
                  Rs.{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span>Rs.{Number(subtotal || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Fee:</span>
              <span
                style={{
                  color: Number(deliveryFee || 0) === 0 ? '#10b981' : 'inherit',
                  fontWeight: 700
                }}
              >
                {Number(deliveryFee || 0) === 0
                  ? 'FREE'
                  : `Rs.${Number(deliveryFee || 0).toFixed(2)}`}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px dashed var(--border)',
                paddingTop: '0.6rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800
              }}
            >
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary-dark)' }}>
                Rs.{Number(total || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}