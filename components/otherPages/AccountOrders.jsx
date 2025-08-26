"use client";

import React, { useState } from "react";
import { useUserOrders } from "@/hooks/useUserOrders";

export default function AccountOrders() {
  const { orders, loading, error, pagination, fetchOrders, cancelOrder } = useUserOrders();
  const [cancellingOrder, setCancellingOrder] = useState(null);

  // Order status translations
  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Хүлээгдэж буй',
      'PROCESSING': 'Боловсруулж буй',
      'SHIPPED': 'Илгээгдсэн',
      'DELIVERED': 'Хүргэгдсэн',
      'CANCELLED': 'Цуцлагдсан'
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const badgeMap = {
      'PENDING': 'bg-warning',
      'PROCESSING': 'bg-info',
      'SHIPPED': 'bg-primary',
      'DELIVERED': 'bg-success',
      'CANCELLED': 'bg-danger'
    };
    return badgeMap[status] || 'bg-secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT'
    }).format(price);
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу?')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      await cancelOrder(orderId);
      alert('Захиалга амжилттай цуцлагдлаа');
    } catch (error) {
      alert('Захиалга цуцлахад алдаа гарлаа: ' + error.message);
    } finally {
      setCancellingOrder(null);
    }
  };

  const handlePageChange = (page) => {
    fetchOrders(page);
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="page-content">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Ачаалж байна...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="page-content my-account__orders-list">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Миний захиалгууд</h4>
          <div className="text-muted">
            Нийт: {pagination.total} захиалга
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            Алдаа гарлаа: {error}
          </div>
        )}

        {orders && orders.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Захиалга №</th>
                    <th>Огноо</th>
                    <th>Төлөв</th>
                    <th>Нийт дүн</th>
                    <th>Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                        {order.orderItems && (
                          <div className="text-muted small">
                            {order.orderItems.length} бараа
                          </div>
                        )}
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <strong>{formatPrice(order.total)}</strong>
                        {order.payment && (
                          <div className="text-muted small">
                            {order.payment.status === 'COMPLETED' ? 'Төлбөр төлөгдсөн' : 'Төлбөр хүлээгдэж буй'}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => window.open(`/account_orders/${order.id}`, '_blank')}
                          >
                            Дэлгэрэнгүй
                          </button>
                          {order.status === 'PENDING' && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrder === order.id}
                            >
                              {cancellingOrder === order.id ? 'Цуцлаж байна...' : 'Цуцлах'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Өмнөх
                    </button>
                  </li>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Дараах
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <div className="mb-3">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h5 className="text-muted">Захиалга байхгүй байна</h5>
            <p className="text-muted">Та одоогоор ямар ч захиалга хийээгүй байна</p>
            <a href="/shop-1" className="btn btn-primary">
              Дэлгүүр рүү очих
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
