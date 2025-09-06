import Brands from "@/components/common/brands/Brands";
import Blogs from "@/components/homes/home-15/Blogs";
import Categories from "@/components/homes/home-15/Categories";
import Featured from "@/components/homes/home-15/NewProducts";
import Hero from "@/components/homes/home-15/Hero";
import Instagram from "@/components/homes/home-15/Instagram";
import Lookbook from "@/components/homes/home-15/Lookbook";
import PopulerProducts from "@/components/homes/home-15/PopulerProducts";
import FlashSaleProducts from "@/components/homes/home-15/FlashSaleProducts";
import ConditionalDiscountedProducts from "@/components/homes/home-15/ConditionalDiscountedProducts";
import FeaturesSection from "@/components/homes/home-15/FeaturesSection";
import BrandProduct from "@/components/homes/home-15/BrandProduct";
import BrandProduct2 from "@/components/homes/home-15/BrandProduct2";
import NikeBrand from "@/components/homes/home-15/NikeBrand";
import AdidasBrand from "@/components/homes/home-15/AdidasBrand";
import PumaBrand from "@/components/homes/home-15/PumaBrand";
import ReebokBrand from "@/components/homes/home-15/ReebokBrand";
import UnderArmourBrand from "@/components/homes/home-15/UnderArmourBrand";
import NewBalanceBrand from "@/components/homes/home-15/NewBalanceBrand";
import AsicsBrand from "@/components/homes/home-15/AsicsBrand";
import PaymentMethod from "@/components/homes/home-15/PaymentMethod";
import React from "react";
import Banner from "@/components/homes/home-15/Banner";

export const metadata = {
  title: "Нүүр хуудас || Ayo eCommerce",
  description: "Монголын шилдэг онлайн дэлгүүр - Ayo eCommerce",
};

export default function HomePage15() {
  return (
    <>
      <div className="theme-15">
        <main>
          {/* Hero Section - Main Banner */}
          <div className="hero-banner-container">
            <Hero />
          </div>
          
          {/* Features Section - Онцлох үйлчилгээ */}
          {/* <FeaturesSection /> */}
          
          {/* Categories Section - Онцлох ангиллууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <Categories />
          
          {/* Flash Sale Section - Хямдралтай бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <FlashSaleProducts />
          
          {/* Featured Products - Шинэ бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <Featured />
          
       
          {/* Brand Product Section - Converse брэнд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <div className="banner-container">
            <BrandProduct />
          </div>
          

          
          {/* Popular Products - Тренд бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <PopulerProducts />
             {/* Payment Method Section - Төлбөрийн нөхцөл */}
             <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <div className="banner-container">
            <PaymentMethod />
          </div>

          
          
          
          {/* Discounted Products - Хямдралтай бараанууд */}
          {/* <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div> */}
          <ConditionalDiscountedProducts />

          {/* Brand Product Section - Converse брэнд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <div className="banner-container">
            <BrandProduct2 />
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

