"use client";

import React, { useState, useEffect } from "react";
import { useUserOrders } from "@/hooks/useUserOrders";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function AccountOrders() {
  const { orders, loading, error, pagination, fetchOrders, cancelOrder } = useUserOrders();
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const searchParams = useSearchParams();

  // Check for payment data in URL parameters
  useEffect(() => {
    console.log('AccountOrders useEffect triggered');
    console.log('Search params:', searchParams.toString());
    
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    const paymentMethod = searchParams.get('paymentMethod');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');
    const qrCode = searchParams.get('qrCode');
    const paymentUrl = searchParams.get('paymentUrl');
    const transactionId = searchParams.get('transactionId');

    if (orderId && paymentId) {
      console.log('Payment data found in URL params:');
      console.log('- Order ID:', orderId);
      console.log('- Payment ID:', paymentId);
      console.log('- Payment Method:', paymentMethod);
      console.log('- Amount:', amount);
      console.log('- Currency:', currency);
      console.log('- Status:', status);
      console.log('- QR Code:', qrCode);
      console.log('- Payment URL:', paymentUrl);
      console.log('- Transaction ID:', transactionId);

      const payment = {
        paymentId,
        orderId,
        paymentMethod,
        amount,
        currency,
        status,
        qrCode,
        paymentUrl,
        transactionId
      };
      
      console.log('Setting payment data:', payment);
      setPaymentData(payment);
      setShowPaymentModal(true);
      
      // Start monitoring payment status if it's pending
      if (status === 'PENDING' && paymentId) {
        startPaymentStatusMonitoring(paymentId);
      }
      
      // Clear URL parameters
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, '', url);
    }
  }, [searchParams]);

  // Payment status monitoring
  const startPaymentStatusMonitoring = (paymentId) => {
    let checkCount = 0;
    const maxChecks = 12; // 1 minute (12 * 5 seconds)
    
    const interval = setInterval(async () => {
      try {
        checkCount++;
        console.log(`Checking payment status for: ${paymentId} (attempt ${checkCount}/${maxChecks})`);
        
        // First try to check with provider (more accurate)
        try {
          const checkResponse = await api.payments.checkWithProvider(paymentId);
          
          if (checkResponse.success && checkResponse.data) {
            const payment = checkResponse.data;
            const newStatus = payment.status;
            console.log('Provider payment status updated:', newStatus);
            console.log('Payment data:', payment);
            
            // Update payment data with new status
            setPaymentData(prev => ({
              ...prev,
              status: newStatus
            }));
            
            // If payment is completed, stop monitoring and refresh orders
            if (newStatus === 'COMPLETED') {
              clearInterval(interval);
              setStatusCheckInterval(null);
              setPaymentStatus('COMPLETED');
              
              // Show success message
              alert('Төлбөр амжилттай төлөгдлөө!');
              
              // Refresh orders list
              fetchOrders();
              return;
            } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
              clearInterval(interval);
              setStatusCheckInterval(null);
              setPaymentStatus(newStatus);
              return;
            }
          }
        } catch (providerError) {
          console.log('Provider check failed, trying local status check:', providerError.message);
        }
        
        // Fallback to local status check
        const response = await api.payments.getStatus(paymentId);
        
        if (response.success && response.data) {
          const payment = response.data;
          const newStatus = payment.status;
          console.log('Local payment status updated:', newStatus);
          console.log('Payment data:', payment);
          
          // Update payment data with new status
          setPaymentData(prev => ({
            ...prev,
            status: newStatus
          }));
          
          // If payment is completed, stop monitoring and refresh orders
          if (newStatus === 'COMPLETED') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus('COMPLETED');
            
            // Show success message
            alert('Төлбөр амжилттай төлөгдлөө!');
            
            // Refresh orders list
            fetchOrders();
          } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus(newStatus);
          }
        }
        
        // Stop monitoring after max attempts
        if (checkCount >= maxChecks) {
          console.log('Max payment status checks reached, stopping monitoring');
          clearInterval(interval);
          setStatusCheckInterval(null);
        }
      } catch (error) {
        console.error('Payment status check error:', error);
        
        // If it's a 404 error, the payment might not exist yet, so continue monitoring
        if (error.message && error.includes('404')) {
          console.log('Payment not found yet, continuing to monitor...');
        } else {
          // For other errors, stop monitoring after a few attempts
          console.error('Payment status check failed, stopping monitoring');
          clearInterval(interval);
          setStatusCheckInterval(null);
        }
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Function to handle payment for existing order
  const handlePaymentForOrder = async (order) => {
    try {
      setIsProcessingPayment(true);
      
      // Create payment for existing order
      const paymentData = {
        orderId: order.id,
        provider: 'QPAY', // Default to QPAY
        amount: order.total,
        currency: 'MNT'
      };

      console.log('Creating payment for order:', paymentData);

      const response = await api.payments.create(paymentData);
      
      if (response.success) {
        const result = response.data;
        console.log('Payment created:', result);
        
        // Extract payment and provider response
        const payment = result.payment;
        const providerResponse = result.providerResponse;
        
        // Set payment data for modal
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
        
        // Start monitoring payment status if it's pending
        if (payment.status === 'PENDING' && payment.paymentId) {
          startPaymentStatusMonitoring(payment.paymentId);
        }
        
        // Show payment modal
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      alert('Алдаа гарлаа: ' + (error.message || 'Төлбөр үүсгэхэд алдаа гарлаа'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to handle payment completion
  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    
    // Refresh orders list
    fetchOrders();
  };

  // Function to handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

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

  // Function to cancel payment
  const handleCancelPayment = async () => {
    if (paymentData?.paymentId) {
      try {
        if (confirm('Та төлбөрийг цуцлахдаа итгэлтэй байна уу?')) {
          const response = await api.payments.cancel(paymentData.paymentId);
          
          if (response.success) {
            // Update payment data with cancelled status
            setPaymentData(prev => ({
              ...prev,
              status: 'CANCELLED'
            }));
            
            // Stop monitoring
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval);
              setStatusCheckInterval(null);
            }
            
            setPaymentStatus('CANCELLED');
            alert('Төлбөр амжилттай цуцлагдлаа.');
            
            // Refresh orders list
            fetchOrders();
          } else {
            alert('Төлбөр цуцлахад алдаа гарлаа');
          }
        }
      } catch (error) {
        console.error('Payment cancellation error:', error);
        alert('Төлбөр цуцлахад алдаа гарлаа: ' + error.message);
      }
    }
  };

  // Function to manually check payment status
  const handleManualStatusCheck = async () => {
    if (paymentData?.paymentId) {
      try {
        // First try to check with provider
        const checkResponse = await api.payments.checkWithProvider(paymentData.paymentId);
        
        if (checkResponse.success && checkResponse.data) {
          const payment = checkResponse.data;
          const newStatus = payment.status;
          
          // Update payment data with new status
          setPaymentData(prev => ({
            ...prev,
            status: newStatus
          }));
          
          // Show status message
          const statusText = {
            'PENDING': 'Хүлээгдэж буй',
            'COMPLETED': 'Амжилттай',
            'FAILED': 'Амжилтгүй',
            'CANCELLED': 'Цуцлагдсан'
          };
          
          alert(`Төлбөрийн статус: ${statusText[newStatus] || newStatus}`);
          
          // If payment is completed, stop monitoring and refresh orders
          if (newStatus === 'COMPLETED') {
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval);
              setStatusCheckInterval(null);
            }
            setPaymentStatus('COMPLETED');
            fetchOrders();
          }
        } else {
          // Fallback to local status check
          const response = await api.payments.getStatus(paymentData.paymentId);
          
          if (response.success && response.data) {
            const payment = response.data;
            const newStatus = payment.status;
            
            // Update payment data with new status
            setPaymentData(prev => ({
              ...prev,
              status: newStatus
            }));
            
            // Show status message
            const statusText = {
              'PENDING': 'Хүлээгдэж буй',
              'COMPLETED': 'Амжилттай',
              'FAILED': 'Амжилтгүй',
              'CANCELLED': 'Цуцлагдсан'
            };
            
            alert(`Төлбөрийн статус: ${statusText[newStatus] || newStatus}`);
            
            // If payment is completed, stop monitoring and refresh orders
            if (newStatus === 'COMPLETED') {
              if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
                setStatusCheckInterval(null);
              }
              setPaymentStatus('COMPLETED');
              fetchOrders();
            }
          } else {
            alert('Статус шалгахад алдаа гарлаа');
          }
        }
      } catch (error) {
        console.error('Manual status check error:', error);
        alert('Статус шалгахад алдаа гарлаа: ' + error.message);
      }
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
                        {order.payment && (
                          <div className="text-muted small mt-1">
                            {order.payment.status === 'COMPLETED' ? (
                              <span className="text-success">
                                <i className="fas fa-check-circle me-1"></i>
                                Төлбөр төлөгдсөн
                              </span>
                            ) : order.payment.status === 'PENDING' ? (
                              <span className="text-warning">
                                <i className="fas fa-clock me-1"></i>
                                Төлбөр хүлээгдэж буй
                              </span>
                            ) : (
                              <span className="text-danger">
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
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => window.open(`/account_orders/${order.id}`, '_blank')}
                          >
                            Дэлгэрэнгүй
                          </button>
                          
                          {/* Payment button for pending payments */}
                          {order.payment && order.payment.status === 'PENDING' && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handlePaymentForOrder(order)}
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

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ 
            maxHeight: '90vh', 
            margin: '1.75rem auto',
            maxWidth: '600px'
          }}>
            <div className="modal-content" style={{ 
              maxHeight: '90vh',
              borderRadius: '8px'
            }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title">
                  <i className="fas fa-credit-card me-2"></i>
                  Төлбөр хийх
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handlePaymentCancel}
                ></button>
              </div>
              <div className="modal-body" style={{ 
                maxHeight: '80vh', 
                overflowY: 'auto',
                padding: '1rem'
              }}>
                {/* Payment Status */}
                {paymentStatus && (
                  <div className={`alert mb-3 ${
                    paymentStatus === 'COMPLETED' ? 'alert-success' :
                    paymentStatus === 'FAILED' ? 'alert-danger' :
                    paymentStatus === 'CANCELLED' ? 'alert-warning' :
                    'alert-info'
                  }`}>
                    <i className={`me-2 ${
                      paymentStatus === 'COMPLETED' ? 'fas fa-check-circle' :
                      paymentStatus === 'FAILED' ? 'fas fa-times-circle' :
                      paymentStatus === 'CANCELLED' ? 'fas fa-ban' :
                      'fas fa-clock'
                    }`}></i>
                    <strong>Төлбөрийн статус:</strong> {
                      paymentStatus === 'COMPLETED' ? 'Амжилттай' :
                      paymentStatus === 'FAILED' ? 'Амжилтгүй' :
                      paymentStatus === 'CANCELLED' ? 'Цуцлагдсан' :
                      paymentStatus === 'PENDING' ? 'Хүлээгдэж буй' :
                      paymentStatus
                    }
                  </div>
                )}

                {/* Order Information */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      Захиалгын мэдээлэл
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Захиалгын дугаар:</strong><br/>#{paymentData.orderId}</p>
                        <p><strong>Төлбөрийн дугаар:</strong><br/>{paymentData.paymentId}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Төлбөрийн дүн:</strong><br/>{paymentData.amount} {paymentData.currency}</p>
                        <p><strong>Төлбөрийн төрөл:</strong><br/>{paymentData.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                {(paymentData.qrImage || paymentData.qrCode) && (
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="fas fa-qrcode me-2"></i>
                        QR Кодоор төлөх
                      </h6>
                    </div>
                    <div className="card-body text-center">
                      <img 
                        src={paymentData.qrImage || paymentData.qrCode} 
                        alt="QR Code" 
                        style={{ 
                          maxWidth: '250px', 
                          height: 'auto', 
                          border: '2px solid #dee2e6',
                          borderRadius: '8px',
                          padding: '10px'
                        }}
                        onError={(e) => {
                          console.error('QR code image failed to load:', e.target.src);
                          // Try to show a fallback or error message
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.innerHTML = '<p class="text-danger">QR код харагдахгүй байна</p>';
                          e.target.parentNode.appendChild(errorDiv);
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
                    <div className="card-header bg-light">
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
                        Төлбөр хийх
                      </a>
                      <div className="mt-2">
                        <small className="text-muted">
                          Шинэ цонхонд төлбөрийн хуудас нээгдэнэ
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction ID */}
                {paymentData.transactionId && (
                  <div className="alert alert-info">
                    <strong>Транзакцийн дугаар:</strong> {paymentData.transactionId}
                  </div>
                )}

                {/* Instructions */}
                {paymentData.status === 'PENDING' && (
                  <div className="alert alert-info">
                    <h6><i className="fas fa-info-circle me-2"></i>Заавар:</h6>
                    <ul className="mb-0">
                      <li>QR кодыг уншуулж эсвэл веб хуудас руу орох</li>
                      <li>Төлбөр хийсний дараа статус автоматаар шинэчлэгдэнэ</li>
                      <li>Асуудал гарвал "Статус шалгах" товчийг дарна уу</li>
                    </ul>
                  </div>
                )}
                
                {paymentData.status === 'COMPLETED' && (
                  <div className="alert alert-success">
                    <h6><i className="fas fa-check-circle me-2"></i>Амжилттай!</h6>
                    <p className="mb-0">Төлбөр амжилттай төлөгдлөө.</p>
                  </div>
                )}
                
                {(paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED') && (
                  <div className="alert alert-warning">
                    <h6><i className="fas fa-exclamation-triangle me-2"></i>Анхааруулга:</h6>
                    <p className="mb-0">Төлбөр {paymentData.status === 'FAILED' ? 'амжилтгүй' : 'цуцлагдсан'} байна. Дахин оролдох бол "Статус шалгах" товчийг дарна уу.</p>
                  </div>
                )}

                {/* Status Monitoring Info */}
                <div className={`alert ${
                  paymentData.status === 'COMPLETED' ? 'alert-success' :
                  paymentData.status === 'FAILED' ? 'alert-danger' :
                  paymentData.status === 'CANCELLED' ? 'alert-warning' :
                  'alert-info'
                }`}>
                  <i className={`me-2 ${
                    paymentData.status === 'COMPLETED' ? 'fas fa-check-circle' :
                    paymentData.status === 'FAILED' ? 'fas fa-times-circle' :
                    paymentData.status === 'CANCELLED' ? 'fas fa-ban' :
                    'fas fa-clock'
                  }`}></i>
                  <strong>Төлбөрийн статус:</strong> {
                    paymentData.status === 'PENDING' ? 'Хүлээгдэж буй' :
                    paymentData.status === 'COMPLETED' ? 'Амжилттай' :
                    paymentData.status === 'FAILED' ? 'Амжилтгүй' :
                    paymentData.status === 'CANCELLED' ? 'Цуцлагдсан' :
                    paymentData.status
                  }
                  {paymentData.status === 'PENDING' && (
                    <>
                      <br/>
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Төлбөрийн статус автоматаар шалгагдаж байна (5 секунд тутамд)
                      </small>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handlePaymentCancel}
                >
                  <i className="fas fa-times me-2"></i>
                  Хаах
                </button>
                
                {paymentData.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-info"
                      onClick={handleManualStatusCheck}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      Статус шалгах
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={handleCancelPayment}
                    >
                      <i className="fas fa-ban me-2"></i>
                      Төлбөр цуцлах
                    </button>
                  </>
                )}
                
                {paymentData.status === 'COMPLETED' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handlePaymentComplete}
                  >
                    <i className="fas fa-check me-2"></i>
                    Хаах
                  </button>
                )}
                
                {(paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED') && (
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={handleManualStatusCheck}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Статус шалгах
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal Backdrop */}
      {showPaymentModal && (
        <div 
          className="modal-backdrop fade show" 
          onClick={handlePaymentCancel}
        ></div>
      )}
    </div>
  );
}
