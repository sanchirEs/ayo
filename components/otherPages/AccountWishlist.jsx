"use client";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AccountWishlist() {
  const { wishList, toggleWishlist, addProductToCart, isAddedToCartProducts, setQuickViewItem } = useContextElement();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingProducts, setRemovingProducts] = useState(new Set());
  
  // Fetch wishlist products from backend
  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);
      const response = await api.wishlist.get();
      if (response.success) {
        setWishlistProducts(response.data || []);
      } else {
        setError('Failed to fetch wishlist products');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Error loading wishlist products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  // Refresh wishlist when wishList context changes
  useEffect(() => {
    if (wishList.length !== wishlistProducts.length) {
      fetchWishlistProducts();
    }
  }, [wishList]);

  // Optimistic remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    // Optimistically remove from UI
    setRemovingProducts(prev => new Set(prev).add(productId));
    setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    
    try {
      await toggleWishlist(productId);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      // Revert on error
      fetchWishlistProducts();
    } finally {
      setRemovingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="page-content my-account__wishlist">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-3">Loading wishlist...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9">
        <div className="page-content my-account__wishlist">
          <div className="text-center py-5">
            <div className="text-danger mb-3">{error}</div>
            <button 
              className="btn btn-primary"
              onClick={fetchWishlistProducts}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="page-content my-account__wishlist">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <h4 className="mb-0 me-2" style={{ color: '#6c757d', fontWeight: 'normal' }}>
            Танд хадгалсан
          </h4>
          <span className="text-muted">
            {wishlistProducts.length} бараа байна.
          </span>
        </div>

        {wishlistProducts.length > 0 ? (
          <div
            className="products-grid row row-cols-2 row-cols-lg-3 row-cols-xl-4"
            id="products-grid"
          >
            {wishlistProducts.map((product, i) => (
              <div className="product-card-wrapper" key={product.id || i}>
                <div className={`wishlist-card mb-4 ${removingProducts.has(product.id) ? 'removing' : ''}`}>
                  <div className="position-relative">
                    {/* Product Image */}
                    <div className="wishlist-image-wrapper">
                      <Link href={`/product1_simple/${product.id}`}>
                        <Image
                          loading="lazy"
                          src={product.images?.[0]?.imageUrl || product.imgSrc || '/assets/images/products/product-1.jpg'}
                          width="200"
                          height="200"
                          alt={product.name || product.title || 'Product'}
                          className="wishlist-product-image"
                        />
                      </Link>
                      
                      {/* Remove Button */}
                      <button
                        className="btn-remove-wishlist"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        title="Remove From Wishlist"
                        disabled={removingProducts.has(product.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="wishlist-product-info mt-3">
                      <h6 className="wishlist-product-title mb-2">
                        <Link href={`/product1_simple/${product.id}`}>
                          {product.name || product.title || 'Product Name'}
                        </Link>
                      </h6>
                      <div className="wishlist-product-price">
                        <span className="price-amount">
                          {product.price || product.regularPrice || '0.00'} ₮
                        </span>
                        {product.salePrice && product.salePrice !== product.price && (
                          <span className="price-sale ms-2">
                            {product.salePrice} ₮
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="fs-18 mb-3">No products added to wishlist yet</div>
            {/* <Link href="/shop-1" className="btn btn-primary">
              Continue Shopping
            </Link> */}
          </div>
        )}
      </div>
    </div>
  );
}
