"use client";
import { allProducts } from "@/data/products";
import React, { useEffect } from "react";
import { useContext, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const { user } = useAuth();
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const addProductToCart = async (id, variantId = null) => {
    if (!cartProducts.filter((elm) => elm.id == id)[0]) {
      let item = null;
      
      // First try to get real product data from backend
      try {
        const response = await api.products.get(id);
        if (response?.success && response?.data) {
          item = {
            ...response.data,
            quantity: 1,
            id: response.data.id || id,
          };
        }
      } catch (error) {
        console.log('Failed to fetch product from backend, using static data:', error.message);
      }
      
      // Fallback to static data if backend fails
      if (!item) {
        const staticProduct = allProducts.filter((elm) => elm.id == id)[0];
        if (staticProduct) {
          item = {
            ...staticProduct,
            quantity: 1,
          };
        } else {
          console.error(`Product with id ${id} not found in static data`);
          return;
        }
      }
      
      setCartProducts((pre) => [...pre, item]);

      // Try to sync with backend cart
      try {
        await api.cart.addItem({
          productId: id,
          variantId: variantId,
          quantity: 1,
          sessionId: 'guest_session_' + Math.random().toString(36).substr(2, 9)
        });
      } catch (error) {
        // console.log('Cart sync failed, using local storage:', error.message);
      }

      document
        .getElementById("cartDrawerOverlay")
        .classList.add("page-overlay_visible");
      document.getElementById("cartDrawer").classList.add("aside_visible");
    }
  };
  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };

  const toggleWishlist = async (id) => {
    // Check if user is logged in and has access token
    if (!user || !user.accessToken) {
      // console.log('User not logged in or no access token, using local storage for wishlist');
      // Fallback to local storage if not logged in
      if (wishList.includes(id)) {
        setWishList((pre) => [...pre.filter((elm) => elm != id)]);
      } else {
        setWishList((pre) => [...pre, id]);
      }
      return;
    }

    try {
      if (wishList.includes(id)) {
        // Remove from wishlist
        await api.wishlist.remove(id);
        setWishList((pre) => [...pre.filter((elm) => elm != id)]);
      } else {
        // Add to wishlist
        await api.wishlist.add(id);
        setWishList((pre) => [...pre, id]);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      
      // Handle authentication errors specifically
      if (error.message.includes('Invalid TOKEN') || 
          error.message.includes('Authentication required') ||
          error.message.includes('401') ||
          error.message.includes('403')) {
        // console.log('Authentication error, using local storage for wishlist');
      } else if (error.message.includes('404') || 
                 error.message.includes('Not Found') || 
                 error.message.includes('fetch')) {
        // console.log('Wishlist API not available, using local storage');
      }
      
      // Fallback to local storage if API fails
      if (wishList.includes(id)) {
        setWishList((pre) => [...pre.filter((elm) => elm != id)]);
      } else {
        setWishList((pre) => [...pre, id]);
      }
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  // Load cart from backend on mount, fallback to localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        // First try to load from backend
        const response = await api.cart.get();
        if (response?.success && response?.data && Array.isArray(response.data) && response.data.length > 0) {
          // Map backend cart data to frontend format
          const backendCartItems = response.data.map(item => ({
            ...item,
            // Ensure we have the required fields for frontend
            id: item.productId || item.id,
            quantity: item.quantity || 1,
            price: item.price || 0,
          }));
          setCartProducts(backendCartItems);
          return; // Don't load from localStorage if backend has data
        }
      } catch (error) {
        console.log('Failed to load cart from backend, using localStorage:', error.message);
      }
      
      // Fallback to localStorage if backend fails or has no data
      const items = JSON.parse(localStorage.getItem("cartList"));
      if (items?.length) {
        setCartProducts(items);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
  }, [cartProducts]);
  // Load wishlist from backend on component mount
  useEffect(() => {
    const loadWishlist = async () => {
      // Check if user is logged in and has access token
      if (!user || !user.accessToken) {
        // console.log('User not logged in or no access token, loading wishlist from local storage');
        const items = JSON.parse(localStorage.getItem("wishlist"));
        if (items?.length) {
          setWishList(items);
        }
        return;
      }

      try {
        const response = await api.wishlist.get();
        const wishlistData = response?.data || response || [];
        const wishlistIds = wishlistData.map(item => item.productId || item.id);
        setWishList(wishlistIds);
      } catch (error) {
        console.error('Failed to load wishlist from backend:', error);
        
        // Handle authentication errors specifically
        if (error.message.includes('Invalid TOKEN') || 
            error.message.includes('Authentication required') ||
            error.message.includes('401') ||
            error.message.includes('403')) {
          // console.log('Authentication error, using local storage for wishlist');
        } else if (error.message.includes('404') || 
                   error.message.includes('Not Found') || 
                   error.message.includes('fetch')) {
          // console.log('Wishlist API not available, using local storage');
        }
        
        // Fallback to local storage for any error
        const items = JSON.parse(localStorage.getItem("wishlist"));
        if (items?.length) {
          setWishList(items);
        }
      }
    };

    loadWishlist();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

  const clearCart = async () => {
    setCartProducts([]);
    localStorage.removeItem("cartList");
    
    // Try to clear backend cart
    try {
      await api.cart.clear();
    } catch (error) {
      // console.log('Backend cart clear failed:', error.message);
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    // Update local cart
    setCartProducts(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );

    // Try to sync with backend
    try {
      await api.cart.updateItem(itemId, quantity);
    } catch (error) {
      // console.log('Cart update sync failed:', error.message);
    }
  };

  const removeCartItem = async (itemId) => {
    // Remove from local cart
    setCartProducts(prev => prev.filter(item => item.id !== itemId));

    // Try to sync with backend
    try {
      await api.cart.removeItem(itemId);
    } catch (error) {
      // console.log('Cart remove sync failed:', error.message);
    }
  };

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    toggleWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    clearCart,
    updateCartItemQuantity,
    removeCartItem,
    currentCategory,
    setCurrentCategory,
    currentProduct,
    setCurrentProduct,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
