import Brands from "@/components/common/brands/Brands";
import Footer14 from "@/components/footers/Footer14";
import Header14 from "@/components/headers/Header14";
import Blogs from "@/components/homes/home-15/Blogs";
import Categories from "@/components/homes/home-15/Categories";
import Featured from "@/components/homes/home-15/NewProducts";
import Hero from "@/components/homes/home-15/Hero";
import Instagram from "@/components/homes/home-15/Instagram";
import Lookbook from "@/components/homes/home-15/Lookbook";
import PopulerProducts from "@/components/homes/home-15/PopulerProducts";
import FlashSaleProducts from "@/components/homes/home-15/FlashSaleProducts";
import DiscountedProducts from "@/components/homes/home-15/DiscountedProducts";
import FeaturesSection from "@/components/homes/home-15/FeaturesSection";
import BrandProduct from "@/components/homes/home-15/BrandProduct";
import PaymentMethod from "@/components/homes/home-15/PaymentMethod";
import React from "react";
import Banner from "@/components/homes/home-15/Banner";

export const metadata = {
  title: "Нүүр хуудас || Uomo eCommerce",
  description: "Монголын шилдэг онлайн дэлгүүр - Uomo eCommerce",
};

export default function HomePage15() {
  return (
    <>
      <div className="theme-15">
        <main>
          {/* Hero Section - Main Banner */}
          <Hero />
          
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
          <BrandProduct />
          
          {/* Popular Products - Тренд бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <PopulerProducts />
             {/* Payment Method Section - Төлбөрийн нөхцөл */}
             <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <PaymentMethod />

          
          
          
          {/* Discounted Products - Хямдралтай бараанууд */}
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <DiscountedProducts />
          <div className="mb-4 mb-xl-5 pb-3 pt-2 pb-xl-5"></div>
          <Banner />
          
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

