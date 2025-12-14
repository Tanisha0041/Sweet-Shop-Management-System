import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sweet } from './types';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';

/**
 * Cart item interface
 */
interface CartItem {
  sweet: Sweet;
  quantity: number;
}

/**
 * Cart context interface
 */
interface CartContextType {
  cart: CartItem[];
  addToCart: (sweet: Sweet) => void;
  removeFromCart: (sweetId: string) => void;
  updateQuantity: (sweetId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

// Create cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart provider component
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (sweet: Sweet) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sweet.id === sweet.id);
      if (existing) {
        return prev.map((item) =>
          item.sweet.id === sweet.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { sweet, quantity: 1 }];
    });
  };

  const removeFromCart = (sweetId: string) => {
    setCart((prev) => prev.filter((item) => item.sweet.id !== sweetId));
  };

  const updateQuantity = (sweetId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sweetId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.sweet.id === sweetId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((total, item) => total + Number(item.sweet.price) * item.quantity, 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * Hook to use cart context
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

/**
 * Protected route component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Main layout component with navbar and cart sidebar
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
  };

  const handleCloseSuccess = () => {
    setOrderPlaced(false);
    setIsCartOpen(false);
  };

  return (
    <div className="app">
      <Navbar />
      
      {/* Cart Button - Fixed */}
      <button 
        className="cart-float-btn" 
        onClick={() => setIsCartOpen(true)}
      >
        Cart ({getCartCount()})
      </button>

      {/* Cart Sidebar Overlay */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            X
          </button>
        </div>

        {orderPlaced ? (
          <div className="order-success">
            <div className="order-success-icon">Done!</div>
            <h2>Order Placed!</h2>
            <p>Thank you for your order. Your sweets will be prepared fresh!</p>
            <p className="order-number">
              Order #: {Math.random().toString(36).substring(2, 8).toUpperCase()}
            </p>
            <button className="btn btn-primary" onClick={handleCloseSuccess}>
              Continue Shopping
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">Empty</div>
            <p>Your cart is empty</p>
            <p>Add some delicious sweets!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.sweet.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.sweet.imageUrl ? (
                      <img src={item.sweet.imageUrl} alt={item.sweet.name} />
                    ) : (
                      'Sweet'
                    )}
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.sweet.name}</div>
                    <div className="cart-item-price">
                      Rs.{Number(item.sweet.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="cart-item-qty">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.sweet.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.sweet.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.sweet.id)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              {/* Bill Summary */}
              <div className="bill-container">
                <div className="bill-header">
                  <h3>Order Summary</h3>
                </div>
                <div className="bill-body">
                  {cart.map((item) => (
                    <div key={item.sweet.id} className="bill-item">
                      <span className="bill-item-name">{item.sweet.name}</span>
                      <span className="bill-item-qty">x{item.quantity}</span>
                      <span className="bill-item-price">
                        Rs.{(Number(item.sweet.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="bill-total">
                    <span>Total</span>
                    <span>Rs.{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={handlePlaceOrder}
              >
                Place Order - Rs.{getCartTotal().toFixed(2)}
              </button>
            </div>
          </>
        )}
      </div>

      <main className="main-content">{children}</main>
    </div>
  );
};

/**
 * App routes component
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

/**
 * Main App component
 */
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
