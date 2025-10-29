"use client";

import { useEffect, useState } from "react";
import Brands from "@/components/common/brands/Brands";
import Categories from "@/components/homes/home-15/Categories";
import Featured from "@/components/homes/home-15/NewProducts";
import Hero from "@/components/homes/home-15/Hero";
import PopulerProducts from "@/components/homes/home-15/PopulerProducts";
import FlashSaleProducts from "@/components/homes/home-15/FlashSaleProducts";
import DiscountedProducts from "@/components/homes/home-15/DiscountedProducts";
import BrandBanner from "@/components/homes/home-15/BrandBanner";
import PaymentMethod from "@/components/homes/home-15/PaymentMethod";
import api from "@/lib/api";

/**
 * ✅ OPTIMIZED: Single bundled API call (client-side but visible in Network tab)
 * 
 * BEFORE: 7 separate API calls (3 duplicates)
 * AFTER: 1 bundled Redis call
 * 
 * Client-side so you can see it in Network tab and verify it's working!
 */
export default function HomePage15() {
  const [homepageData, setHomepageData] = useState({
    featured: [],
    flashSale: [],
    newArrivals: [],
    discounted: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        console.log('🚀 [CLIENT] Fetching homepage data from Redis...');
        const startTime = Date.now();
        
        // ✅ Single bundled call gets EVERYTHING (including categories!)
        const response = await api.homepage.cached({ 
          sections: 'categories,featured,flash,new,discounted',
          limit: 20,
          categoryLimit: 12,
          include: 'card' 
        });
        
        const duration = Date.now() - startTime;
        
        if (mounted && response?.data) {
          setHomepageData(response.data);
          console.log('✅ [CLIENT] Homepage data loaded in', duration + 'ms');
          console.log('📊 [CLIENT] Data received:', {
            categories: response.data.categories?.length || 0,
            featured: response.data.featured?.length || 0,
            flashSale: response.data.flashSale?.length || 0,
            newArrivals: response.data.newArrivals?.length || 0,
            discounted: response.data.discounted?.length || 0,
            cached: response.performance?.cached,
            responseTime: response.performance?.responseTime
          });
        }
      } catch (error) {
        console.error('❌ [CLIENT] Failed to load homepage data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Safe destructuring with defaults
  const { 
    featured = [], 
    flashSale = [], 
    newArrivals = [], 
    discounted = [], 
    categories = [] 
  } = homepageData;

  return (
    <>
      <div className="theme-15">
        <main>
          {/* Hero Section - Main Banner */}
          <div className="hero-banner-container">
            <Hero />
          </div>

          {/* Brands Section - Брэндүүд
          <div className="mb-2 mb-xl-3 pb-3 pt-2 "></div>
          <Brands /> */}
          
          {/* Features Section - Онцлох үйлчилгээ */}
          {/* <FeaturesSection /> */}
          
          {/* Categories Section - Онцлох ангиллууд */}
          <div className="mb-2 mb-md-4 pb-1 pb-md-3 pt-1 pt-md-2"></div>
          <Categories categories={categories} />
          
          {/* Flash Sale Section - Хямдралтай бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          {!loading && <FlashSaleProducts products={flashSale} />}
          
          {/* Featured Products - Шинэ бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          {!loading && newArrivals?.length > 0 && <Featured products={newArrivals} />}
       
          {/* Brand Product Section - Converse брэнд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <div className="banner-container">
            <BrandBanner image="/assets/images/brandsBg/brands1.webp" />
          </div>
                    
          {/* Popular Products - Тренд бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          {!loading && featured?.length > 0 && <PopulerProducts products={featured} />}
          
          {/* Payment Method Section - Төлбөрийн нөхцөл */}
          <div className="mb-0 mb-xl-3 pb-3 pt-2 pb-xl-5"></div>
          <div className="banner-container">
            <PaymentMethod />
          </div>

          {/* Discounted Products - Хямдралтай бараанууд */}
          {/* <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div> */}
          {!loading && discounted?.length > 0 && <DiscountedProducts products={discounted} />}

          {/* Brand Product Section - Converse брэнд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <div className="banner-container">
            <BrandBanner image="/assets/images/banner/little-drops.webp" />
          </div>
          
          {/* Additional Sections - Нэмэлт хэсгүүд */}
          {/* <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div> */}
          
          {/* Brands Section - Брэндүүд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <Brands />  
          
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
        </main>
      </div>
    </>
  );
}
