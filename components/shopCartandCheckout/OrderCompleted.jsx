"use client";

import { useContextElement } from "@/context/Context";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function OrderCompleted() {
  const { cartProducts, totalPrice } = useContextElement();
  const [showDate, setShowDate] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    setShowDate(true);
    
    // Load order details if orderId is provided
    if (orderId) {
      loadOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getById(orderId);
      if (response.success) {
        setOrderDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-complete">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Уншиж байна...</span>
          </div>
          <p className="mt-3">Захиалгын мэдээллийг уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-complete">
      <div className="order-complete__message">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="40" cy="40" r="40" fill="#B9A16B" />
          <path
            d="M52.9743 35.7612C52.9743 35.3426 52.8069 34.9241 52.5056 34.6228L50.2288 32.346C49.9275 32.0446 49.5089 31.8772 49.0904 31.8772C48.6719 31.8772 48.2533 32.0446 47.952 32.346L36.9699 43.3449L32.048 38.4062C31.7467 38.1049 31.3281 37.9375 30.9096 37.9375C30.4911 37.9375 30.0725 38.1049 29.7712 38.4062L27.4944 40.683C27.1931 40.9844 27.0257 41.4029 27.0257 41.8214C27.0257 42.24 27.1931 42.6585 27.4944 42.9598L33.5547 49.0201L35.8315 51.2969C36.1328 51.5982 36.5513 51.7656 36.9699 51.7656C37.3884 51.7656 37.8069 51.5982 38.1083 51.2969L40.385 49.0201L52.5056 36.8996C52.8069 36.5982 52.9743 36.1797 52.9743 35.7612Z"
            fill="white"
          />
        </svg>
        <h3>Таны захиалга амжилттай дууссан!</h3>
        <p>Баярлалаа. Таны захиалга хүлээн авлаа.</p>
      </div>
      
      <div className="order-info">
        <div className="order-info__item">
          <label>Захиалгын дугаар</label>
          <span>{orderDetails?.id || orderId || 'N/A'}</span>
        </div>
        <div className="order-info__item">
          <label>Огноо</label>
          {showDate && (
            <span>
              {orderDetails?.createdAt 
                ? new Date(orderDetails.createdAt).toLocaleDateString('mn-MN')
                : new Date().toLocaleDateString('mn-MN')
              }
            </span>
          )}
        </div>
        <div className="order-info__item">
          <label>Нийт дүн</label>
          <span>{orderDetails?.total || totalPrice}₮</span>
        </div>
        <div className="order-info__item">
          <label>Төлбөрийн арга</label>
          <span>{orderDetails?.payment?.provider || 'QPay'}</span>
        </div>
        {paymentId && (
          <div className="order-info__item">
            <label>Төлбөрийн ID</label>
            <span>{paymentId}</span>
          </div>
        )}
      </div>
      
      <div className="checkout__totals-wrapper">
        <div className="checkout__totals">
          <h3>Захиалгын дэлгэрэнгүй</h3>
          <table className="checkout-cart-items">
            <thead>
              <tr>
                <th>БҮТЭЭГДЭХҮҮН</th>
                <th>ТОО ШИРХЭГ</th>
                <th>ҮНЭ</th>
                <th>НИЙТ</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails?.orderItems?.map((item, i) => (
                <tr key={i}>
                  <td>
                    {item.product?.name || `Бүтээгдэхүүн ${item.productId}`}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.price}₮</td>
                  <td>{(item.price * item.quantity).toFixed(2)}₮</td>
                </tr>
              )) || cartProducts.map((elm, i) => (
                <tr key={i}>
                  <td>
                    {elm.title} x {elm.quantity}
                  </td>
                  <td>{elm.quantity}</td>
                  <td>{elm.price}₮</td>
                  <td>{(elm.price * elm.quantity).toFixed(2)}₮</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="checkout-totals">
            <tbody>
              <tr>
                <th>НИЙТ</th>
                <td>{orderDetails?.total || totalPrice}₮</td>
              </tr>
              <tr>
                <th>ХҮРГЭЛТ</th>
                <td>Үнэгүй</td>
              </tr>
              <tr>
                <th>НИЙТ ТӨЛӨХ ДҮН</th>
                <td>{orderDetails?.total || totalPrice}₮</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Status */}
      {orderDetails?.status && (
        <div className="mt-4">
          <div className={`alert ${
            orderDetails.status === 'PROCESSING' ? 'alert-info' :
            orderDetails.status === 'SHIPPED' ? 'alert-warning' :
            orderDetails.status === 'DELIVERED' ? 'alert-success' :
            'alert-secondary'
          }`}>
            <strong>Захиалгын статус:</strong> {
              orderDetails.status === 'PROCESSING' ? 'Боловсруулж буй' :
              orderDetails.status === 'SHIPPED' ? 'Илгээгдсэн' :
              orderDetails.status === 'DELIVERED' ? 'Хүргэгдсэн' :
              orderDetails.status
            }
          </div>
        </div>
      )}
      
      {/* Shipping Address */}
      {orderDetails?.shippingAddress && (
        <div className="mt-4">
          <h4>Хүргэх хаяг</h4>
          <div className="p-3 bg-light rounded">
            <p className="mb-1">
              <strong>Хаяг:</strong> {orderDetails.shippingAddress.addressLine1}
            </p>
            {orderDetails.shippingAddress.addressLine2 && (
              <p className="mb-1">
                <strong>Нэмэлт мэдээлэл:</strong> {orderDetails.shippingAddress.addressLine2}
              </p>
            )}
            <p className="mb-1">
              <strong>Хот:</strong> {orderDetails.shippingAddress.city}
            </p>
            <p className="mb-1">
              <strong>Утас:</strong> {orderDetails.shippingAddress.mobile}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
