"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function OrderDetail({ orderId }) {
  // CSS styles for timer and payment modal
  const modalStyles = {
    timerDisplay: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '15px'
    },
    timerLabel: {
      fontWeight: '600',
      color: '#495D35',
      fontSize: '1rem'
    },
    timeLeft: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#28a745',
      padding: '8px 16px',
      backgroundColor: '#f8fff9',
      borderRadius: '8px',
      border: '2px solid #28a745',
      boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)'
    },
    timeLeftExpired: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#dc3545',
      padding: '8px 16px',
      backgroundColor: '#fff8f8',
      borderRadius: '8px',
      border: '2px solid #dc3545',
      boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
    }
  };

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
        const response = await api.orders.getOrderDetails(orderId);
        // console.log("response in order detail: ", response);
        
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

  // State for payment modal
  const [timeLeft, setTimeLeft] = useState(null);

  // Function to calculate time left
  const calculateTimeLeft = (expiresAt) => {
    if (!expiresAt) return null;
    
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const difference = expiry - now;
    
    if (difference > 0) {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      return 'Хугацаа дууссан';
    }
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
        // console.log("res in order detail: ", response);
      if (response.success) {
        const result = response.data;
        const payment = result.payment;
        // console.log("payment in order detail: ", payment);
        // console.log("result in order detail: ", result);
        
        const paymentDataToSet = {
          orderId: order.id,
          paymentId: payment.id,
          paymentMethod: 'QPAY',
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          qrImage: result.qrImage,
          qrCode: result.qrImage, // Use qrImage as qrCode fallback
          paymentUrl: result.paymentUrl,
          transactionId: result.transactionId,
          expiresAt: payment.expiresAt
        };
        
        // console.log("Setting payment data:", paymentDataToSet);
        setPaymentData(paymentDataToSet);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      alert('Алдаа гарлаа: ' + (error.message || 'Төлбөр үүсгэхэд алдаа гарлаа'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to refresh payment (create new QR code)
  const handleRefreshPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Close current modal
      setShowPaymentModal(false);
      
      // Create new payment
      await handlePaymentForOrder();
    } catch (error) {
      console.error('Payment refresh error:', error);
      alert('Төлбөр дахин үүсгэхэд алдаа гарлаа');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Effect to update timer
  useEffect(() => {
    if (!paymentData?.expiresAt) return;
    
    const timer = setInterval(() => {
      const timeLeftValue = calculateTimeLeft(paymentData.expiresAt);
      setTimeLeft(timeLeftValue);
      
      if (timeLeftValue === 'Хугацаа дууссан') {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [paymentData?.expiresAt]);

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
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-3"><strong>Төлбөрийн төрөл:</strong> {order.payment.provider || 'QPAY'}</span>
                    <span><strong>Төлбөрийн статус:</strong></span>
                    {order.payment.status === 'COMPLETED' ? (
                      <span className="badge ms-2" style={{ backgroundColor: '#6B8E5A', color: 'white' }}>
                        <i className="fas fa-check-circle me-1"></i>
                        Төлбөр төлөгдсөн
                      </span>
                    ) : order.payment.status === 'PENDING' ? (
                      <span className="badge ms-2" style={{ backgroundColor: '#C7D4BA', color: 'white' }}>
                        <i className="fas fa-clock me-1"></i>
                        Төлбөр хүлээгдэж буй
                      </span>
                    ) : (
                      <span className="badge ms-2" style={{ backgroundColor: '#495D35', color: 'white' }}>
                        <i className="fas fa-times-circle me-1"></i>
                        Төлбөр амжилтгүй
                      </span>
                    )}
                  </div>
                </div>
                {/* <div className="col-md-6 text-md-end">
                  {order.payment.status === 'PENDING' && order.status === 'PENDING' && (
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
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card mb-4">
          <div className="card-header" style={{ backgroundColor: '#F4F7F5', borderBottom: '1px solid #E9ECEF' }}>
            <h6 className="mb-0" style={{ color: '#495D35' }}>
              <i className="fas fa-shopping-bag me-2"></i>
              Захиалгын бүтээгдэхүүнүүд
            </h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                                 <thead style={{ backgroundColor: '#495D35', color: 'white' }}>
                  <tr>
                    <th style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Бүтээгдэхүүн</th>
                    <th style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Үнэ</th>
                    <th style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Тоо</th>
                    <th className="text-end" style={{ color: 'white', borderColor: '#495D35', backgroundColor: '#495D35' }}>Нийт</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems && order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product && item.product.ProductImages && item.product.ProductImages.length > 0 && (
                            <img 
                              src={item.product.ProductImages[0].imageUrl} 
                              alt={item.product.ProductImages[0].altText || item.product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px', borderRadius: '8px' }}
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
          <div className="modal fade show" style={{ display: 'block', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} tabIndex="-1">
            <div className="modal-dialog modal-lg" style={{ 
              maxHeight: '80vh', 
              margin: '1.75rem auto',
              maxWidth: '600px',
              display: 'flex',
              alignItems: 'center',
              minHeight: 'auto'
            }}>
              <div className="modal-content" style={{ 
                maxHeight: '80vh',
                borderRadius: '8px',
                width: '100%',
                boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                border: 'none',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                opacity: '1'
              }}>
                <div className="modal-header" style={{ 
                  borderBottom: '1px solid #dee2e6',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease'
                }}>
                  <h5 className="modal-title" style={{ color: '#495D35', fontWeight: '600' }}>
                    <i className="fas fa-credit-card me-2"></i>
                    QPay төлбөр хийх
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPaymentModal(false)}
                    style={{ fontSize: '1.2rem' }}
                  ></button>
                </div>
                <div className="modal-body" style={{ 
                  maxHeight: '60vh', 
                  overflowY: 'auto',
                  padding: '1.5rem',
                  minHeight: 'auto',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Order Information */}
                  <div className="mb-4" style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="row g-3" style={{ transition: 'all 0.3s ease' }}>
                      <div className="col-md-6" style={{ transition: 'all 0.3s ease' }}>
                        <div style={{ fontSize: '0.9rem', transition: 'all 0.3s ease' }}>
                          <span style={{ color: '#6c757d', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.3s ease' }}>Захиалгын дугаар:</span>
                          <div style={{ color: '#212529', fontWeight: '600', marginTop: '4px', fontSize: '1rem', transition: 'all 0.3s ease' }}>#{paymentData.orderId}</div>
                        </div>
                      </div>
                      <div className="col-md-6" style={{ transition: 'all 0.3s ease' }}>
                        <div style={{ fontSize: '0.9rem', transition: 'all 0.3s ease' }}>
                          <div style={{ color: '#6c757d', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.3s ease' }}>Төлбөрийн дүн:</div>
                          <div style={{ color: '#212529', fontWeight: '600', marginTop: '4px', fontSize: '1rem', transition: 'all 0.3s ease' }}>{paymentData.amount} {paymentData.currency}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {paymentData.qrImage && (
                    <div className="text-center mb-4" style={{ transition: 'all 0.3s ease' }}>
                      <h6 className="mb-3" style={{ 
                        color: '#495D35', 
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="fas fa-qrcode me-2" style={{ transition: 'all 0.3s ease' }}></i>
                        QR Код уншуулах
                      </h6>
                      <div className="card-body text-center" style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease'
                      }}>
                        <img 
                          src={paymentData.qrImage} 
                          alt="QPay QR Code" 
                          style={{ 
                            maxWidth: '280px', 
                            height: 'auto', 
                            border: '3px solid #f8f9fa',
                            borderRadius: '12px',
                            padding: '15px',
                            backgroundColor: '#ffffff',
                            transition: 'all 0.3s ease'
                          }}
                          onError={(e) => {
                            console.error('QR Image failed to load:', paymentData.qrImage);
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => {
                            // console.log('QR Image loaded successfully:', paymentData.qrImage);
                          }}
                        />
                        
                        {/* Timer Section */}
                        {timeLeft && (
                          <div className="mt-4 mb-3" style={{ transition: 'all 0.3s ease' }}>
                            <div style={modalStyles.timerDisplay}>
                              <span style={modalStyles.timerLabel}>Хугацаа: </span>
                              <span style={timeLeft === 'Хугацаа дууссан' ? modalStyles.timeLeftExpired : modalStyles.timeLeft}>
                                {timeLeft}
                              </span>
                            </div>
                            
                            {timeLeft === 'Хугацаа дууссан' && (
                              <button 
                                onClick={handleRefreshPayment}
                                className="btn btn-warning btn-sm mt-3"
                                disabled={isProcessingPayment}
                                style={{
                                  borderRadius: '8px',
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.875rem',
                                  backgroundColor: '#ffc107',
                                  borderColor: '#ffc107',
                                  color: '#212529',
                                  fontWeight: '500',
                                  border: 'none',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isProcessingPayment) {
                                    e.target.style.backgroundColor = '#e0a800';
                                    e.target.style.transform = 'translateY(-1px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isProcessingPayment) {
                                    e.target.style.backgroundColor = '#ffc107';
                                    e.target.style.transform = 'translateY(0)';
                                  }
                                }}
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" style={{ transition: 'all 0.3s ease' }}></span>
                                    Дахин үүсгэж байна...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-sync-alt me-2" style={{ transition: 'all 0.3s ease' }}></i>
                                    Дахин үүсгэх
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-4" style={{ transition: 'all 0.3s ease' }}>
                          <small className="text-muted" style={{ 
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                          }}>
                            <i className="fas fa-mobile-alt me-1"></i>
                            QPay апп-аа нээж QR кодыг уншуулна уу
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment URL Section */}
                  {paymentData.paymentUrl && (
                    <div className="card mb-4" style={{
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className="card-header bg-light" style={{
                        backgroundColor: '#f8f9fa !important',
                        borderBottom: '1px solid #e9ecef',
                        borderRadius: '12px 12px 0 0',
                        padding: '1rem 1.5rem',
                        transition: 'all 0.3s ease'
                      }}>
                        <h6 className="mb-0" style={{ 
                          color: '#495D35', 
                          fontWeight: '600',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}>
                          <i className="fas fa-external-link-alt me-2" style={{ transition: 'all 0.3s ease' }}></i>
                          Веб хуудас руу орох
                        </h6>
                      </div>
                      <div className="card-body text-center" style={{ 
                        padding: '1.5rem',
                        transition: 'all 0.3s ease'
                      }}>
                        <a 
                          href={paymentData.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-lg"
                          style={{
                            borderRadius: '8px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            backgroundColor: '#495D35',
                            borderColor: '#495D35',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="fas fa-external-link-alt me-2"></i>
                          QPay төлбөр хийх
                        </a>
                        <div className="mt-3" style={{ transition: 'all 0.3s ease' }}>
                          <small className="text-muted" style={{ 
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                          }}>
                            Шинэ цонхонд QPay төлбөрийн хуудас нээгдэнэ
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="alert alert-info" style={{
                    backgroundColor: '#e7f3ff',
                    borderColor: '#b3d9ff',
                    color: '#0c5460',
                    borderRadius: '12px',
                    border: '1px solid #b3d9ff',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <h6 style={{ 
                      color: '#0c5460', 
                      fontWeight: '600',
                      marginBottom: '1rem',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="fas fa-info-circle me-2" style={{ transition: 'all 0.3s ease' }}></i>Заавар:
                    </h6>
                    <ul className="mb-0" style={{ 
                      paddingLeft: '1.5rem',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}>
                      <li style={{ marginBottom: '0.5rem', transition: 'all 0.3s ease' }}>QPay апп-аа нээнэ үү</li>
                      <li style={{ marginBottom: '0.5rem', transition: 'all 0.3s ease' }}>QR кодыг уншуулна уу</li>
                      <li style={{ marginBottom: '0.5rem', transition: 'all 0.3s ease' }}>Төлбөрийн дүнг баталгаажуулна уу</li>
                      <li style={{ marginBottom: '0.5rem', transition: 'all 0.3s ease' }}>PIN код оруулна уу</li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer" style={{ 
                  borderTop: '1px solid #e4e4e4',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#faf9f8',
                  borderRadius: '0 0 8px 8px',
                  transition: 'all 0.3s ease'
                }}>
                  <div className="d-flex justify-content-between align-items-center w-100" style={{ transition: 'all 0.3s ease' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: '#e2e3e5',
                        borderColor: '#6c757d',
                        color: '#6c757d',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#d1d3d4';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#e2e3e5';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      onClick={() => setShowPaymentModal(false)}
                    >
                      <i className="fas fa-times me-2" style={{ transition: 'all 0.3s ease' }}></i>
                      Хаах
                    </button>
                    
                    {/* Refresh payment button when expired */}
                    {timeLeft === 'Хугацаа дууссан' && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          backgroundColor: '#f7f3d7',
                          borderColor: '#927238',
                          color: '#927238',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0e8c7';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f7f3d7';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={handleRefreshPayment}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" style={{ transition: 'all 0.3s ease' }}></span>
                            Дахин үүсгэж байна...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sync-alt me-2" style={{ transition: 'all 0.3s ease' }}></i>
                            Дахин төлбөр үүсгэх
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1040,
              backdropFilter: 'blur(2px)',
              transition: 'all 0.3s ease'
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
