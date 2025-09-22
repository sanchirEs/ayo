"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function StoreLocationPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("БҮХ ХОТ");

  const districts = [
    "БҮХ ХОТ",
    "Улаанбаатар",
    "Эрдэнэт",
    "Дархан"
  ];

  const companyInfo = {
    company: "AYO COSMETICS",
    phone: "80940575"
  };

  const stores = [
    {
      id: 1,
      name: "ТӨВ САЛБАР / Peace mall /",
      district: "Улаанбаатар",
      address: "УБ их дэлгүүрийн замын эсрэг талд, Computer Land-ийн зүүн хойно, Голомт банкны чанх ард, 58-р байрны 1 давхарт",
      hours: "Даваа-Ням: 11:00-20:00",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "Бүтэн сайн: Амарна",
      image: "/assets/images/stores/maxmall.webp"
    },
    {
      id: 2,
      name: "Соёолж төв",
      district: "Улаанбаатар",
      address: "Замын цагдаагийн зүүн урд, Соёолж молл 5 давхарт, барууи талдаа голын энээнд",
      hours: "Ажиллах цаг: 10:30-20:30",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "Бүтэн сайн өдөр: Амарна",
      image: "/assets/images/stores/tumen-plaza.webp"
    },
    {
      id: 3,
      name: "Ярмаг",
      district: "Улаанбаатар",
      address: "Food city 3давхарт (ярмаг 1р буудал)",
      hours: "Цагийн хуваарь: 11:00-20:00",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "Мягмар амарна",
      image: "/assets/images/stores/solo-mall.webp"
    },
    {
      id: 4,
      name: "ЭРДЭНЭТ ХОТ",
      district: "Эрдэнэт",
      address: "Эрдэнэт, Орхон молл, 3 давхарт",
      hours: "Ажиллах цаг: 10:30-20:00",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "Даваа: Амарна",
      image: "/assets/images/stores/emart.webp"
    },
    {
      id: 5,
      name: "Бөхийн өргөө",
      district: "Улаанбаатар",
      address: "ХААЯамны замын эсрэг талд \"Орчлон коллекс\" төв хаалгаар барууи эргээд шатаар өгсөөд байгаа (1-2давхрын голд)",
      hours: "Ажиллах цаг: 11:00-20:00",
      lunchBreak: "Цайны цаг: 13:30-14:30",
      phone: "80940575",
      closed_day: "4дахь өдөр амарна",
      image: "/assets/images/stores/state-dept.webp"
    },
    {
      id: 6,
      name: "ДАРХАН ХОТ",
      district: "Дархан",
      address: "Шинэ Дархан , Хүслийн хотхоны эсрэг талд, Magnolia хотхоны 1 давхарт",
      hours: "Ажиллах цаг: 11:00-19:30",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "1 дахь өдөр : Амарна",
      image: "/assets/images/stores/central-tower.webp"
    },
    {
      id: 7,
      name: "ХУД 19 салбар",
      district: "Улаанбаатар",
      address: "Хааг: ХУД, 2-р хороо, 19-р хороологол, Хан-Уул шоцонбөр хотхоны 6В байр, төв хаалгаар орооз 2 давхарт, 204 тоот",
      hours: "Ажиллах цаг: 11:00-19:00",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "Баасан: Амарна",
      image: "/assets/images/stores/maxmall.webp"
    },
    {
      id: 8,
      name: "Төмөр зам, Баянгол",
      district: "Улаанбаатар",
      address: "Төмөр зам, Баянгол дүүргийн тамгын газрын хойно, дооро6 GS25-тэй шилэн баригилга, 3 давхарт, 301 тоот",
      hours: "Ажиллах цаг: Өдөр бүр 11:00-20:00",
      lunchBreak: "Цайны цаг: 14:30-15:30",
      phone: "80940575",
      closed_day: "Хагас сайн өдөр: Амарна",
      image: "/assets/images/stores/tumen-plaza.webp"
    },
    {
      id: 9,
      name: "Ярмаг Шүншиг",
      district: "Улаанбаатар",
      address: "Ярмаг Шүншиг3 Худалдааны төв дотор",
      hours: "Ажиллах цаг: Давaa-Бямба: 11:00-20:00",
      lunchBreak: "Цайны цаг: 14:00-15:00",
      phone: "80940575",
      closed_day: "3дахь өдөр : Амарна",
      image: "/assets/images/stores/solo-mall.webp"
    }
  ];

  const filteredStores = selectedDistrict === "БҮХ ХОТ" 
    ? stores 
    : stores.filter(store => store.district === selectedDistrict);

  return (
    <div className="">
      <div className="mb-2 pb-2"></div>
      <section className="store-locations container" style={{ backgroundColor: "#FBFFFC", minHeight: "80vh" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
    
          <h2 className="page-title d-none d-lg-block" style={{ color: '#495D35', fontSize: '32px' }}>Салбаруудын байршил</h2>
          <div className="district-filter">
            <select 
              className="form-select" 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                backgroundColor: "white",
                border: "1px solid #495D35",
                color: "#495D35",
                borderRadius: "8px",
                padding: "8px 12px",
                minWidth: "200px"
              }}
            >
              {districts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDistrict !== "БҮХ ХОТ" && (
          <div className="mb-3">
            <span 
              className="badge" 
              style={{ 
                backgroundColor: "#dc3545", 
                color: "white",
                fontSize: "14px",
                padding: "8px 12px"
              }}
            >
              {selectedDistrict}
            </span>
          </div>
        )}

         <div className="row">
           {filteredStores.map((store) => (
             <div key={store.id} className="col-lg-6 col-12 mb-4">
               <div 
                 className="card" 
                 style={{ 
                   border: "1px solid #e9ecef",
                   borderRadius: "16px",
                   boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                   transition: "all 0.3s ease",
                   overflow: "hidden",
                   cursor: "pointer"
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = "translateY(-2px)";
                   e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = "translateY(0)";
                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                 }}
               >
                 <div className="card-body p-0">
                   <div className="row g-0">
                     {/* Image on the left */}
                     <div className="col-md-4">
                       <div className="store-image" style={{ 
                         height: "220px", 
                         overflow: "hidden",
                         borderRadius: "0"
                       }}>
                         <Image
                           src={store.image}
                           alt={store.name}
                           width={300}
                           height={200}
                           style={{
                             width: "100%",
                             height: "100%",
                             objectFit: "cover"
                           }}
                         />
                       </div>
                     </div>
                     {/* Content on the right */}
                     <div className="col-md-8">
                       <div className="p-4 h-100 d-flex flex-column justify-content-between">
                         <h5 className="card-title mb-3" style={{ color: "#495D35", fontSize: "19px", fontWeight: "600", lineHeight: "1.3" }}>
                           {store.name}
                         </h5>
                         <div className="store-details flex-grow-1">
                           <div className="mb-3">
                             <div className="d-flex align-items-start">
                               <i className="fas fa-map-marker-alt me-2 mt-1" style={{ color: "#6c757d", fontSize: "12px", minWidth: "16px" }}></i>
                               <span style={{ fontSize: "13px", color: "#6c757d", lineHeight: "1.5" }}>
                                 {store.address}
                               </span>
                             </div>
                           </div>
                           <div className="mb-3">
                             <div className="d-flex align-items-start">
                               <i className="fas fa-clock me-2 mt-1" style={{ color: "#6c757d", fontSize: "12px", minWidth: "16px" }}></i>
                               <div style={{ fontSize: "13px", color: "#6c757d", lineHeight: "1.5" }}>
                                 <div className="mb-1" style={{ fontWeight: "500", color: "#495D35" }}>
                                   {store.hours}
                                 </div>
                                 {store.lunchBreak && (
                                   <div style={{ fontSize: "12px", color: "#8a8a8a", fontStyle: "italic" }}>
                                     {store.lunchBreak}
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                          <div className="mb-2">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-phone me-2" style={{ color: "#6c757d", fontSize: "12px", minWidth: "16px" }}></i>
                              <a 
                                href={`tel:${store.phone}`}
                                style={{ 
                                  fontSize: "13px", 
                                  color: "#495D35",
                                  textDecoration: "none",
                                  fontWeight: "600"
                                }}
                              >
                                {store.phone}
                              </a>
                            </div>
                          </div>
                          {store.closed_day && (
                            <div className="mb-0">
                              <div className="d-flex align-items-center">
                                <i className="fas fa-calendar-times me-2" style={{ color: "#dc3545", fontSize: "12px", minWidth: "16px" }}></i>
                                <span style={{ fontSize: "12px", color: "#dc3545", fontWeight: "500" }}>
                                  {store.closed_day}
                                </span>
                              </div>
                            </div>
                          )}
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-5">
            <i className="fas fa-store-slash" style={{ fontSize: "48px", color: "#6c757d", marginBottom: "16px" }}></i>
            <h5 style={{ color: "#6c757d" }}>Энэ дүүрэгт салбар байхгүй байна</h5>
            <p style={{ color: "#6c757d" }}>Өөр дүүрэг сонгоно уу</p>
          </div>
        )}
      </section>
      <div className="mb-5 pb-xl-5"></div>
    </div>
  );
}
