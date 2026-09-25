import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartStorageKey = (userId) => {
  return userId ? `grocery_cart_${userId}` : 'grocery_cart_guest';
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || null;
  const activeUserRef = useRef(currentUserId);

  const [cartItems, setCartItems] = useState(() => {
    if (!currentUserId) {
      return [];
    }

    const userKey = getCartStorageKey(currentUserId);
    const savedCart = localStorage.getItem(userKey);

    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error('Cart loading error:', error);
        return [];
      }
    }

    // Check for unkeyed legacy cart to migrate
    const legacyCart = localStorage.getItem('grocery_cart');
    if (legacyCart) {
      try {
        const parsed = JSON.parse(legacyCart);
        localStorage.setItem(userKey, legacyCart);
        localStorage.removeItem('grocery_cart');
        return parsed;
      } catch {
        return [];
      }
    }

    return [];
  });

  // Switch cart when authenticated user changes
  useEffect(() => {
    activeUserRef.current = currentUserId;

    if (currentUserId) {
      const userKey = getCartStorageKey(currentUserId);
      const savedCart = localStorage.getItem(userKey);

      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch {
          setCartItems([]);
        }
      } else {
        const legacyCart = localStorage.getItem('grocery_cart');
        if (legacyCart) {
          try {
            const parsed = JSON.parse(legacyCart);
            setCartItems(parsed);
            localStorage.setItem(userKey, legacyCart);
            localStorage.removeItem('grocery_cart');
          } catch {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    } else {
      // User logged out: clear guest cart and reset active cart state to empty
      localStorage.removeItem('grocery_cart_guest');
      setCartItems([]);
    }
  }, [currentUserId]);

  // Persist cart whenever cartItems changes, but ONLY for the currently active user
  useEffect(() => {
    if (activeUserRef.current === currentUserId) {
      if (currentUserId) {
        const userKey = getCartStorageKey(currentUserId);
        localStorage.setItem(userKey, JSON.stringify(cartItems));
      } else if (cartItems.length > 0) {
        localStorage.setItem('grocery_cart_guest', JSON.stringify(cartItems));
      }
    }
  }, [cartItems, currentUserId]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
              ...item,
              quantity: item.quantity + qty
            }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          price: Number(product.price || 0),
          quantity: qty
        }
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const updateQuantity = (id, quantity) => {
    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            quantity: newQuantity
          }
          : item
      )
    );
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            quantity: item.quantity + 1
          }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
              ...item,
              quantity: item.quantity - 1
            }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (currentUserId) {
      const userKey = getCartStorageKey(currentUserId);
      localStorage.removeItem(userKey);
    }
    localStorage.removeItem('grocery_cart_guest');
    localStorage.removeItem('grocery_cart');
  };

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );

  const deliveryFee = subtotal > 150 ? 0 : 30;

  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);