"use client";
import React from "react";

export default function FeaturesSection() {
  const features = [
    {
      icon: "🚚",
      title: "Хүргэлт",
      description: "Улаанбаатар хотод 24 цагийн дотор хүргэлт",
      color: "primary"
    },
    {
      icon: "🔄",
      title: "Буцаалт",
      description: "14 хоногийн дотор үнэгүй буцаалт",
      color: "success"
    },
    {
      icon: "💳",
      title: "Төлбөр",
      description: "QPAY, Pocket, Storepay төлбөр",
      color: "warning"
    },
    {
      icon: "🛡️",
      title: "Найдвартай",
      description: "100% найдвартай бараанууд",
      color: "info"
    }
  ];

  return (
    <section className="features-section py-5 bg-light">
      <div className="container">
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col-6 col-md-3 mb-4">
              <div className="feature-card text-center p-4 h-100 bg-white rounded-3 shadow-sm">
                <div className="feature-icon mb-3">
                  <span className="display-4">{feature.icon}</span>
                </div>
                <h5 className="feature-title fw-bold mb-2">{feature.title}</h5>
                <p className="feature-description text-muted small mb-0">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}





