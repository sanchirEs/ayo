"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import Link from 'next/link';

export default function OrderManagement() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      loadOrders();
    }
  }, [status, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = selectedStatus ? { status: selectedStatus } : {};
      const response = await api.orders.getMyOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders || response.data || []);
      } else {
        setError('Захиалга авахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError('Захиалга авахад алдаа гарлаа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу?')) {
      return;
    }

    try {
      const response = await api.orders.cancelOrder(orderId);
      if (response.success) {
        alert('Захиалга амжилттай цуцлагдлаа');
        loadOrders(); // Reload orders
      } else {
        alert('Захиалга цуцлахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Захиалга цуцлахад алдаа гарлаа: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { class: 'bg-warning', text: 'Хүлээгдэж буй' },
      'CONFIRMED': { class: 'bg-info', text: 'Баталгаажсан' },
      'PROCESSING': { class: 'bg-primary', text: 'Боловсруулж байна' },
      'SHIPPED': { class: 'bg-success', text: 'Хүргэгдсэн' },
      'DELIVERED': { class: 'bg-success', text: 'Хүргэгдсэн' },
      'CANCELLED': { class: 'bg-danger', text: 'Цуцлагдсан' },
      'REFUNDED': { class: 'bg-secondary', text: 'Буцаагдсан' }
    };

    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      'PENDING': { class: 'bg-warning', text: 'Хүлээгдэж буй' },
      'COMPLETED': { class: 'bg-success', text: 'Төлөгдсөн' },
      'FAILED': { class: 'bg-danger', text: 'Амжилтгүй' },
      'CANCELLED': { class: 'bg-secondary', text: 'Цуцлагдсан' }
    };

    const config = statusConfig[paymentStatus] || { class: 'bg-secondary', text: paymentStatus };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (status === 'loading') {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Уншиж байна...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="alert alert-warning">
        <h4>Нэвтрэх шаардлагатай</h4>
        <p>Захиалгын жагсаалтыг харахын тулд эхлээд нэвтэрнэ үү.</p>
        <Link href="/login_register" className="btn btn-primary">
          Нэвтрэх
        </Link>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Миний захиалгууд</h2>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">Бүх статус</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="CONFIRMED">Баталгаажсан</option>
            <option value="PROCESSING">Боловсруулж байна</option>
            <option value="SHIPPED">Хүргэгдсэн</option>
            <option value="DELIVERED">Хүргэгдсэн</option>
            <option value="CANCELLED">Цуцлагдсан</option>
          </select>
          <button
            className="btn btn-outline-primary"
            onClick={loadOrders}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Шинэчлэх
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Уншиж байна...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
          <h4>Захиалга байхгүй байна</h4>
          <p className="text-muted">Таны захиалгын жагсаалт хоосон байна.</p>
          <Link href="/shop-1" className="btn btn-primary">
            Дэлгүүрээ үзэх
          </Link>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Захиалга #{order.id}</h6>
                  {getStatusBadge(order.status)}
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <small className="text-muted">Огноо:</small>
                    <div>{new Date(order.createdAt).toLocaleDateString('mn-MN')}</div>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">Төлбөрийн статус:</small>
                    <div>{getPaymentStatusBadge(order.payment?.status || 'PENDING')}</div>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">Нийт дүн:</small>
                    <div className="fw-bold">₮{order.total?.toLocaleString()}</div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">Бүтээгдэхүүн:</small>
                    <div>
                      {order.orderItems?.length > 0 ? (
                        <div>
                          {order.orderItems.slice(0, 2).map((item, index) => (
                            <div key={index} className="small">
                              {item.product?.name || `Бүтээгдэхүүн #${item.productId}`} x {item.quantity}
                            </div>
                          ))}
                          {order.orderItems.length > 2 && (
                            <div className="small text-muted">
                              +{order.orderItems.length - 2} бусад
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="small text-muted">Мэдээлэл байхгүй</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-flex gap-2">
                    <Link
                      href={`/account_orders/${order.id}`}
                      className="btn btn-sm btn-outline-primary flex-fill"
                    >
                      Дэлгэрэнгүй
                    </Link>
                    {order.status === 'PENDING' && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Цуцлах
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





