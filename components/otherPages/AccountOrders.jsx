"use client";

import React, { useState, useEffect } from "react";
import { useUserOrders } from "@/hooks/useUserOrders";
import api from "@/lib/api";

export default function AccountOrders() {
  const { orders, loading, error, pagination, fetchOrders, cancelOrder } = useUserOrders();
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');





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

  const getStatusBadgeStyle = (status) => {
    const styleMap = {
      'PENDING': { backgroundColor: '#C7D4BA', color: 'white' },
      'PROCESSING': { backgroundColor: '#A9C19A', color: 'white' },
      'SHIPPED': { backgroundColor: '#8BA67A', color: 'white' },
      'DELIVERED': { backgroundColor: '#6B8E5A', color: 'white' },
      'CANCELLED': { backgroundColor: '#495D35', color: 'white' }
    };
    return styleMap[status] || { backgroundColor: '#E5E8E0', color: '#495D35' };
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

  // Filter orders based on active tab
  const filteredOrders = orders ? orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  }) : [];

  // Get order counts for each tab
  const getOrderCount = (status) => {
    if (!orders) return 0;
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
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

        {/* Status Tabs */}
        <div className="mb-4">
          {/* Tab Summary */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {/* <h6 className="mb-1">
                {activeTab === 'all' ? 'Бүх захиалгууд' : `${getStatusText(activeTab)} захиалгууд`}
              </h6> */}
              <small className="text-muted">
                {filteredOrders.length} захиалга олдлоо
              </small>
            </div>
            {/* {activeTab !== 'all' && (
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setActiveTab('all')}
              >
                <i className="fas fa-times me-1"></i>
                Шүүлт цуцлах
              </button>
            )} */}
          </div>
          <ul className="nav nav-tabs flex-wrap" id="orderTabs" role="tablist" style={{ borderBottom: '2px solid #dee2e6' }}>
            <li className="nav-item" role="presentation">
                                              <button
                  className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                  type="button"
                  role="tab"
                  style={{
                    border: 'none',
                    borderBottom: activeTab === 'all' ? '3px solid #495D35' : '3px solid transparent',
                    borderRadius: '0',
                    padding: '12px 16px',
                    fontWeight: activeTab === 'all' ? '600' : '400',
                    color: activeTab === 'all' ? '#495D35' : '#6c757d',
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Бүгд
                  <span className="badge ms-2" style={{ backgroundColor: '#E5E8E0', color: '#495D35' }}>{getOrderCount('all')}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'PENDING' ? 'active' : ''}`}
                onClick={() => setActiveTab('PENDING')}
                type="button"
                role="tab"
                style={{
                  border: 'none',
                  borderBottom: activeTab === 'PENDING' ? '3px solid #495D35' : '3px solid transparent',
                  borderRadius: '0',
                  padding: '12px 16px',
                  fontWeight: activeTab === 'PENDING' ? '600' : '400',
                  color: activeTab === 'PENDING' ? '#495D35' : '#6c757d',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                              >
                  Хүлээгдэж буй
                  <span className="badge ms-2" style={{ backgroundColor: '#C7D4BA', color: 'white' }}>{getOrderCount('PENDING')}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'PROCESSING' ? 'active' : ''}`}
                onClick={() => setActiveTab('PROCESSING')}
                type="button"
                role="tab"
                style={{
                  border: 'none',
                  borderBottom: activeTab === 'PROCESSING' ? '3px solid #495D35' : '3px solid transparent',
                  borderRadius: '0',
                  padding: '12px 16px',
                  fontWeight: activeTab === 'PROCESSING' ? '600' : '400',
                  color: activeTab === 'PROCESSING' ? '#055160' : '#495D35',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                              >
                  Боловсруулж буй
                  <span className="badge ms-2" style={{ backgroundColor: '#A9C19A', color: 'white' }}>{getOrderCount('PROCESSING')}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'SHIPPED' ? 'active' : ''}`}
                onClick={() => setActiveTab('SHIPPED')}
                type="button"
                role="tab"
                style={{
                  border: 'none',
                  borderBottom: activeTab === 'SHIPPED' ? '3px solid #495D35' : '3px solid transparent',
                  borderRadius: '0',
                  padding: '12px 16px',
                  fontWeight: activeTab === 'SHIPPED' ? '600' : '400',
                  color: activeTab === 'SHIPPED' ? '#495D35' : '#6c757d',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                              >
                  Илгээгдсэн
                  <span className="badge ms-2" style={{ backgroundColor: '#8BA67A', color: 'white' }}>{getOrderCount('SHIPPED')}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'DELIVERED' ? 'active' : ''}`}
                onClick={() => setActiveTab('DELIVERED')}
                type="button"
                role="tab"
                style={{
                  border: 'none',
                  borderBottom: activeTab === 'DELIVERED' ? '3px solid #495D35' : '3px solid transparent',
                  borderRadius: '0',
                  padding: '12px 16px',
                  fontWeight: activeTab === 'DELIVERED' ? '600' : '400',
                  color: activeTab === 'DELIVERED' ? '#495D35' : '#6c757d',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                              >
                  Хүргэгдсэн
                  <span className="badge ms-2" style={{ backgroundColor: '#6B8E5A', color: 'white' }}>{getOrderCount('DELIVERED')}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => setActiveTab('CANCELLED')}
                type="button"
                role="tab"
                style={{
                  border: 'none',
                  borderBottom: activeTab === 'CANCELLED' ? '3px solid #495D35' : '3px solid transparent',
                  borderRadius: '0',
                  padding: '12px 16px',
                  fontWeight: activeTab === 'CANCELLED' ? '600' : '400',
                  color: activeTab === 'CANCELLED' ? '#495D35' : '#6c757d',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                              >
                  Цуцлагдсан
                  <span className="badge ms-2" style={{ backgroundColor: '#495D35', color: 'white' }}>{getOrderCount('CANCELLED')}</span>
              </button>
            </li>
          </ul>
        </div>

        {error && (
          <div className="alert alert-danger">
            Алдаа гарлаа: {error}
          </div>
        )}

        {filteredOrders && filteredOrders.length > 0 ? (
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
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.location.href = `/account_orders/${order.id}`}
                      onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = ''}
                    >
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
                        <span className="badge" style={getStatusBadgeStyle(order.status)}>
                          {getStatusText(order.status)}
                        </span>
                        {order.payment && (
                          <div className="text-muted small mt-1" style={{ color: "#495D35" }}>
                            {order.payment.status === 'COMPLETED' ? (
                              <span >
                                <i className="fas fa-check-circle me-1"></i>
                                Төлбөр төлөгдсөн
                              </span>
                            ) : order.payment.status === 'PENDING' ? (
                              <span >
                                <i className="fas fa-clock me-1"></i>
                                Төлбөр хүлээгдэж буй
                              </span>
                            ) : (
                              <span >
                                <i className="fas fa-times-circle me-1"></i>
                                Төлбөр амжилтгүй
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{formatPrice(order.total)}</strong>
                      </td>
                      <td>
                          <button 
                            className="btn btn-sm"
                            style={{
                              border: '1px solid #495D35',
                              color: '#495D35',
                              backgroundColor: 'transparent',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#495D35';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#495D35';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/account_orders/${order.id}`;
                            }}
                          >
                          <i className="fas fa-eye me-1"></i>
                            Дэлгэрэнгүй
                          </button>
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
            <h5 className="text-muted">
              {activeTab === 'all' ? 'Захиалга байхгүй байна' : `${getStatusText(activeTab)} захиалга байхгүй байна`}
            </h5>
            <p className="text-muted">
              {activeTab === 'all' 
                ? 'Та одоогоор ямар ч захиалга хийээгүй байна' 
                : `Танд одоогоор ${getStatusText(activeTab).toLowerCase()} захиалга байхгүй байна`
              }
            </p>
            {activeTab === 'all' && (
            <a href="/shop-1" className="btn btn-primary">
              Дэлгүүр рүү очих
            </a>
            )}
          </div>
        )}
      </div>


    </div>
  );
}
