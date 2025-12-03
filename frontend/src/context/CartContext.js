import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        setWishlistCount(0);
        setLoading(false);
        return;
      }

      // Load cart count
      const cartResponse = await cartAPI.get();
      const cartItems = cartResponse.data.items || [];
      setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));

      // Load wishlist count
      const wishlistResponse = await wishlistAPI.get();
      setWishlistCount(wishlistResponse.data.length || 0);
    } catch (error) {
      console.error('Error loading counts:', error);
      setCartCount(0);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshCounts = () => {
    loadCounts();
  };

  return (
    <CartContext.Provider value={{ cartCount, wishlistCount, refreshCounts, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
