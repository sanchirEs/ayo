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
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const addProductToCart = (id) => {
    if (!cartProducts.filter((elm) => elm.id == id)[0]) {
      const item = {
        ...allProducts.filter((elm) => elm.id == id)[0],
        quantity: 1,
      };
      setCartProducts((pre) => [...pre, item]);

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
      console.log('User not logged in or no access token, using local storage for wishlist');
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
        console.log('Authentication error, using local storage for wishlist');
      } else if (error.message.includes('404') || 
                 error.message.includes('Not Found') || 
                 error.message.includes('fetch')) {
        console.log('Wishlist API not available, using local storage');
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
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartList"));
    if (items?.length) {
      setCartProducts(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
  }, [cartProducts]);
  // Load wishlist from backend on component mount
  useEffect(() => {
    const loadWishlist = async () => {
      // Check if user is logged in and has access token
      if (!user || !user.accessToken) {
        console.log('User not logged in or no access token, loading wishlist from local storage');
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
          console.log('Authentication error, using local storage for wishlist');
        } else if (error.message.includes('404') || 
                   error.message.includes('Not Found') || 
                   error.message.includes('fetch')) {
          console.log('Wishlist API not available, using local storage');
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

  const clearCart = () => {
    setCartProducts([]);
    localStorage.removeItem("cartList");
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
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
