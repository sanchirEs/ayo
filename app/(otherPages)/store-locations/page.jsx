"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function StoreLocationPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("БҮХ ДҮҮРЭГ");

  const districts = [
    "БҮХ ДҮҮРЭГ",
    "Баянгол дүүрэг",
    "Сүхбаатар дүүрэг",
    "Хан-Уул дүүрэг",
    "Сонгинохайрхан дүүрэг",
    "Чингэлтэй дүүрэг",
    "Баянзүрх дүүрэг"
  ];

  const stores = [
    {
      id: 1,
      name: "MAXMALL",
      district: "Баянгол дүүрэг",
      address: "Баянгол дүүрэг, 16-р хороо, Энхтайвны өргөн чөлөө Макс молл 1 давхарт",
      hours: "Даваа-Ням: 10:00-21:00",
      phone: "+976 85110943",
      image: "/assets/images/stores/maxmall.webp"
    },
    {
      id: 2,
      name: "TUMEN PLAZA",
      district: "Баянгол дүүрэг",
      address: "Баянгол дүүрэг, 3-р хороо Түмэн плаза худалдааны төвийн 1 давхарт",
      hours: "Даваа-Ням: 11:00-20:00",
      phone: "+976 95145979",
      image: "/assets/images/stores/tumen-plaza.webp"
    },
    {
      id: 3,
      name: "SOLO MALL",
      district: "Баянгол дүүрэг",
      address: "Баянгол дүүрэг, Ард Аюушийн өргөн чөлөө Solo mall 3 давхарт",
      hours: "Даваа-Ням: 10:00-21:00",
      phone: "+976 80774747",
      image: "/assets/images/stores/solo-mall.webp"
    },
    {
      id: 4,
      name: "EMART 10 HOROOLOL",
      district: "Баянгол дүүрэг",
      address: "Баянгол дүүрэг, 10-р хороо Эмарт худалдааны төв",
      hours: "Даваа-Ням: 09:00-22:00",
      phone: "80774747",
      image: "/assets/images/stores/emart.webp"
    },
    {
      id: 5,
      name: "STATE DEPARTMENT STORE",
      district: "Сүхбаатар дүүрэг",
      address: "Сүхбаатар дүүрэг, Сүхбаатарын талбай Улсын их дэлгүүр 2 давхарт",
      hours: "Даваа-Ням: 10:00-20:00",
      phone: "+976 70123456",
      image: "/assets/images/stores/state-dept.webp"
    },
    {
      id: 6,
      name: "CENTRAL TOWER",
      district: "Сүхбаатар дүүрэг",
      address: "Сүхбаатар дүүрэг, Чингис хааны талбай Төв цамхаг 1 давхарт",
      hours: "Даваа-Ням: 09:00-21:00",
      phone: "+976 70123457",
      image: "/assets/images/stores/central-tower.webp"
    }
  ];

  const filteredStores = selectedDistrict === "БҮХ ДҮҮРЭГ" 
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

        {selectedDistrict !== "БҮХ ДҮҮРЭГ" && (
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
               <div className="card" style={{ 
                 border: "1px solid #e9ecef",
                 borderRadius: "12px",
                 boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                 transition: "transform 0.2s ease"
               }}>
                 <div className="card-body p-0">
                   <div className="row g-0">
                     {/* Image on the left */}
                     <div className="col-md-4">
                       <div className="store-image" style={{ 
                         height: "200px", 
                         overflow: "hidden",
                         borderRadius: "12px 0 0 12px"
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
                       <div className="p-3 h-100 d-flex flex-column justify-content-center">
                         <h5 className="card-title mb-2" style={{ color: "#495D35", fontSize: "18px", fontWeight: "600" }}>
                           {store.name}
                         </h5>
                         <div className="store-details">
                           <div className="mb-2">
                             <i className="fas fa-map-marker-alt me-2" style={{ color: "#6c757d", fontSize: "12px" }}></i>
                             <span style={{ fontSize: "13px", color: "#6c757d", lineHeight: "1.4" }}>
                               {store.address}
                             </span>
                           </div>
                           <div className="mb-2">
                             <i className="fas fa-clock me-2" style={{ color: "#6c757d", fontSize: "12px" }}></i>
                             <span style={{ fontSize: "13px", color: "#6c757d" }}>
                               {store.hours}
                             </span>
                           </div>
                           <div className="mb-0">
                             <i className="fas fa-phone me-2" style={{ color: "#6c757d", fontSize: "12px" }}></i>
                             <a 
                               href={`tel:${store.phone}`}
                               style={{ 
                                 fontSize: "13px", 
                                 color: "#495D35",
                                 textDecoration: "none",
                                 fontWeight: "500"
                               }}
                             >
                               {store.phone}
                             </a>
                           </div>
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
