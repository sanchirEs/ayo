"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { openModalUserlogin } from "@/utlis/aside";

const steps = [
  {
    id: 1,
    href: "/shop_cart",
    number: "01",
    title: "Сагс",
    description: "Бүтээгдэхүүний жагсаалт",
  },
  {
    id: 2,
    href: "/shop_checkout",
    number: "02",
    title: "Худалдаж авах",
    description: "Захиалгаа баталгаажуулах",
  },
];

export default function ChectoutSteps() {
  const [activePathIndex, setactivePathIndex] = useState(0);
  const pathname = usePathname();
  const { user } = useAuth();
  
  useEffect(() => {
    const activeTab = steps.filter((elm) => elm.href == pathname)[0];
    const activeTabIndex = steps.indexOf(activeTab);
    setactivePathIndex(activeTabIndex);
  }, [pathname]);

  // Step дээр дарахад нэвтрээгүй үед login modal харуулах
  const handleStepClick = (e, step) => {
    // Хэрэв нэвтрээгүй бөгөөд 2-р step (checkout) дээр даравал
    if (!user && step.id === 2) {
      e.preventDefault();
      openModalUserlogin();
    }
    // Бусад тохиолдолд ердийн байдлаар шилжинэ
  };
  
  return (
    <div className="checkout-steps">
      {steps.map((elm, i) => (
        <Link
          key={i}
          href={elm.href}
          className={`checkout-steps__item  ${
            activePathIndex >= i ? "active" : ""
          }`}
          onClick={(e) => handleStepClick(e, elm)}
        >
          <span className="checkout-steps__item-number">{elm.number}</span>
          <span className="checkout-steps__item-title">
            <span>{elm.title}</span>
            <em>{elm.description}</em>
          </span>
        </Link>
      ))}
    </div>
  );
}
