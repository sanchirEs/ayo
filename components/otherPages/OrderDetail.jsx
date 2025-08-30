"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function OrderDetail({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const router = useRouter();

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.orders.getById(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Захиалгын мэдээлэл олдсонгүй');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Захиалгын мэдээлэл ачаалахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Helper functions
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

  // Function to handle payment for existing order
  const handlePaymentForOrder = async () => {
    try {
      setIsProcessingPayment(true);
      
      const paymentData = {
        orderId: order.id,
        provider: 'QPAY',
        amount: order.total,
        currency: 'MNT'
      };

      const response = await api.payments.create(paymentData);
      
      if (response.success) {
        const result = response.data;
        const payment = result.payment;
        const providerResponse = result.providerResponse;
        
        setPaymentData({
          orderId: order.id,
          paymentId: payment.id,
          paymentMethod: 'QPAY',
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          qrImage: providerResponse?.qrImage,
          qrCode: providerResponse?.qrCode,
          paymentUrl: providerResponse?.paymentUrl,
          transactionId: payment.providerTransactionId
        });
        
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      alert('Алдаа гарлаа: ' + (error.message || 'Төлбөр үүсгэхэд алдаа гарлаа'));
    } finally {
      setIsProcessingPayment(false);
    }
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

  if (error) {
    return (
      <div className="col-lg-9">
        <div className="page-content">
          <div className="alert alert-danger">
            {error}
          </div>
          <button 
            className="btn"
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
            onClick={() => router.back()}
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="col-lg-9">
        <div className="page-content">
          <div className="alert alert-warning">
            Захиалга олдсонгүй
          </div>
          <button 
            className="btn"
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
            onClick={() => router.back()}
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="page-content">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">Захиалга #{order.id}</h4>
            <p className="text-muted mb-0">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button 
            className="btn"
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
            onClick={() => router.back()}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Буцах
          </button>
        </div>

        {/* Order Status */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h6 className="mb-2">Захиалгын төлөв</h6>
                <span className="badge fs-6" style={getStatusBadgeStyle(order.status)}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="col-md-6 text-md-end">
                <h6 className="mb-2">Нийт дүн</h6>
                <h4 className="mb-0" style={{ color: '#495D35' }}>{formatPrice(order.total)}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {order.payment && (
          <div className="card mb-4">
            <div className="card-header" style={{ backgroundColor: '#F4F7F5', borderBottom: '1px solid #E9ECEF' }}>
              <h6 className="mb-0" style={{ color: '#495D35' }}>
                <i className="fas fa-credit-card me-2"></i>
                Төлбөрийн мэдээлэл
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Төлбөрийн төрөл:</strong> {order.payment.provider || 'QPAY'}</p>
                  <p><strong>Төлбөрийн статус:</strong></p>
                  {order.payment.status === 'COMPLETED' ? (
                    <span className="badge" style={{ backgroundColor: '#6B8E5A', color: 'white' }}>
                      <i className="fas fa-check-circle me-1"></i>
                      Төлбөр төлөгдсөн
                    </span>
                  ) : order.payment.status === 'PENDING' ? (
                    <span className="badge" style={{ backgroundColor: '#C7D4BA', color: 'white' }}>
                      <i className="fas fa-clock me-1"></i>
                      Төлбөр хүлээгдэж буй
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: '#495D35', color: 'white' }}>
                      <i className="fas fa-times-circle me-1"></i>
                      Төлбөр амжилтгүй
                    </span>
                  )}
                </div>
                <div className="col-md-6 text-md-end">
                  {order.payment.status === 'PENDING' && (
                    <button 
                      className="btn"
                      style={{
                        border: '1px solid #495D35',
                        color: 'white',
                        backgroundColor: '#495D35',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isProcessingPayment) {
                          e.target.style.backgroundColor = '#6B8E5A';
                          e.target.style.borderColor = '#6B8E5A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isProcessingPayment) {
                          e.target.style.backgroundColor = '#495D35';
                          e.target.style.borderColor = '#495D35';
                        }
                      }}
                      onClick={handlePaymentForOrder}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Төлбөр...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card me-1"></i>
                          Төлбөр төлөх
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card mb-4">
          <div className="card-header" style={{ backgroundColor: '#F4F7F5', borderBottom: '1px solid #E9ECEF' }}>
            <h6 className="mb-0" style={{ color: '#495D35' }}>
              <i className="fas fa-shopping-bag me-2"></i>
              Захиалгын бараанууд
            </h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                                 <thead style={{ backgroundColor: '#495D35', color: 'white' }}>
                  <tr>
                    <th style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Бараа</th>
                    <th style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Үнэ</th>
                    <th style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Тоо ширхэг</th>
                    <th className="text-end" style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Нийт</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems && order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product && item.product.images && item.product.images[0] && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                            />
                          )}
                          <div>
                            <h6 className="mb-1">{item.product?.name || 'Бараа'}</h6>
                            {item.variant && (
                              <small className="text-muted">
                                {item.variant.name}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-credit-card me-2"></i>
                    QPay төлбөр хийх
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPaymentModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* QR Code Section */}
                  {(paymentData.qrImage || paymentData.qrCode) && (
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-qrcode me-2"></i>
                          QR Кодоор төлөх
                        </h6>
                      </div>
                      <div className="card-body text-center">
                        <img 
                          src={paymentData.qrImage || paymentData.qrCode} 
                          alt="QPay QR Code" 
                          style={{ 
                            maxWidth: '250px', 
                            height: 'auto', 
                            border: '2px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '10px'
                          }}
                        />
                        <div className="mt-3">
                          <small className="text-muted">
                            <i className="fas fa-mobile-alt me-1"></i>
                            QPay апп-аа нээж QR кодыг уншуулна уу
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment URL Section */}
                  {paymentData.paymentUrl && (
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-external-link-alt me-2"></i>
                          Веб хуудас руу орох
                        </h6>
                      </div>
                      <div className="card-body text-center">
                        <a 
                          href={paymentData.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-lg"
                        >
                          <i className="fas fa-external-link-alt me-2"></i>
                          QPay төлбөр хийх
                        </a>
                        <div className="mt-2">
                          <small className="text-muted">
                            Шинэ цонхонд QPay төлбөрийн хуудас нээгдэнэ
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Хаах
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal Backdrop */}
        {showPaymentModal && (
          <div 
            className="modal-backdrop fade show" 
            onClick={() => setShowPaymentModal(false)}
          ></div>
        )}
      </div>
    </div>
  );
}
