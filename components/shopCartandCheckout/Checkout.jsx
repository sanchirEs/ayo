"use client";
const countries = [
  "Australia",
  "Canada",
  "United Kingdom",
  "United States",
  "Turkey",
  "Mongolia",
];

// Region types
const regionTypes = [
  "Улаанбаатар",
  "Хөдөө орон нутаг"
];

// Mongolian provinces (excluding Ulaanbaatar)
const mongolianProvinces = [
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Орхон",
  "Өвөрхангай",
  "Өмнөговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий"
];

// Ulaanbaatar districts
const ulaanbaatarDistricts = [
  "Баянгол дүүрэг",
  "Баянзүрх дүүрэг", 
  "Сүхбаатар дүүрэг",
  "Хан-Уул дүүрэг",
  "Чингэлтэй дүүрэг",
  "Сонгинохайрхан дүүрэг",
  "Багануур дүүрэг",
  "Багахангай дүүрэг",
  "Налайх дүүрэг"
];

import { useContextElement } from "@/context/Context";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import pako from "pako";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";

export default function Checkout() {
  const { cartProducts, totalPrice, clearCart } = useContextElement();
  const { data: session, status } = useSession();
  const { addresses, loading: addressesLoading, createAddress, updateAddress } = useUserAddresses();
  const router = useRouter();
  
  const [selectedRegion, setSelectedRegion] = useState("");
  const [idDDActive, setIdDDActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showRegionTypeDropdown, setShowRegionTypeDropdown] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMode, setAddressMode] = useState('new'); // 'new' or 'existing'
  const [hasSelectedExistingAddress, setHasSelectedExistingAddress] = useState(false);
  const [justSavedAddress, setJustSavedAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  
  // Form states
  const [formData, setFormData] = useState({
    country: "", // Will store the specific district/province
    addressLine1: "",
    addressLine2: "",
    city: "", // Will store region type (Улаанбаатар or Хөдөө орон нутаг)
    postalCode: "",
    phone: "",
    userId: session?.user?.userId
  });

  // QR Code Display Component - Simple and efficient without state
  const QRCodeDisplay = ({ qrData, paymentMethod }) => {
    // Process QR data synchronously without state
    const processQRData = (data) => {
      if (!data) return null;

      // If it's already a data URL or external URL, return as is
      if (data.startsWith('data:') || data.startsWith('http')) {
        return data;
      }

      // If it's GZIP compressed base64
      if (data.startsWith('H4sI')) {
        try {
          // console.log('Processing GZIP compressed QR data:', data.substring(0, 50) + '...');
          
          // Convert base64 to binary
          const binary = atob(data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          // Decompress using pako
          const decompressed = pako.inflate(bytes);
          const processedData = String.fromCharCode.apply(null, decompressed);

          // console.log('Decompressed string length:', processedData.length);
          return processedData;
        } catch (err) {
          console.error('Failed to process GZIP QR data:', err);
          return data; // Return original data as fallback
        }
      }

      // Return data as is for other cases
      return data;
    };

    const processedData = processQRData(qrData);

    if (!processedData) {
      return (
        <div className="alert alert-warning">
          <i className="fas fa-info-circle me-2"></i>
          QR код үүсгэх боломжгүй байна
        </div>
      );
    }

    // If it's a data URL, show as image
    if (processedData.startsWith('data:image')) {
      return (
        <img 
          src={processedData}
          alt="QR Code" 
          style={{ 
            maxWidth: '250px', 
            height: 'auto', 
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
      );
    }

    // If it's a base64 image, convert to data URL
    if (processedData.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(processedData)) {
      const qrDataUrl = `data:image/png;base64,${processedData}`;
      return (
        <img 
          src={qrDataUrl}
          alt="QR Code" 
          style={{ 
            maxWidth: '250px', 
            height: 'auto', 
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
      );
    }

    // For text data, use QRCodeSVG component (no state needed)
    if (processedData.length < 200) {
      return (
        <div style={{ textAlign: 'center' }}>
          <QRCodeSVG
            value={processedData}
            size={250}
            style={{ 
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
        </div>
      );
    }

    // For long text, show as text with instructions
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        margin: '10px 0'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          <strong>QR Кодын текст:</strong>
        </div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          wordBreak: 'break-all',
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          {processedData}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Энэ нь QR кодын текст юм. Та үүнийг QR код үүсгэгч апп-аар уншуулж болно.
        </div>
      </div>
    );
  };

  const getPaymentAppName = (paymentMethod) => {
    switch (paymentMethod) {
      case 'QPAY':
        return 'QPay';
      case 'POCKET':
        return 'Pocket';
      case 'STOREPAY':
        return 'Storepay';
      default:
        return 'Төлбөрийн';
    }
  };  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Correct payment status monitoring as per SAGA documentation
  const startPaymentStatusMonitoring = (paymentId) => {
    // console.log('Starting payment status monitoring for:', paymentId);
    
    let checkCount = 0;
    const maxAttempts = 60; // 3 minutes with 3-second intervals (as per documentation)
    
    const interval = setInterval(async () => {
      try {
        checkCount++;
        // console.log(`Payment status check: ${paymentId} (attempt ${checkCount}/${maxAttempts})`);
        
        // Check payment status as per documentation
        const response = await api.payments.getStatus(paymentId);
        
        if (response.success && response.data) {
          const payment = response.data;
          const newStatus = payment.status;
          // console.log('Payment status updated:', newStatus);
          
          // Update payment data
          setPaymentData(prev => ({
            ...prev,
            status: newStatus,
            ...(payment.transactionId && { transactionId: payment.transactionId }),
            ...(payment.paymentUrl && { paymentUrl: payment.paymentUrl }),
            ...(payment.qrCode && { qrCode: payment.qrCode, qrImage: payment.qrCode })
          }));
          
          // Handle payment completion
          if (newStatus === 'COMPLETED') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus('COMPLETED');
            alert('Төлбөр амжилттай төлөгдлөө! Захиалга баталгаажлаа!');
            return;
          } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus(newStatus);
            return;
          }
        }
        
        // Stop monitoring after max attempts
        if (checkCount >= maxAttempts) {
          // console.log('Payment status monitoring: max attempts reached');
          clearInterval(interval);
          setStatusCheckInterval(null);
        }
      } catch (error) {
        console.error('Payment status check error:', error);
        
        // If it's a 404 error, the payment might not exist yet, so continue monitoring
        if (error.message && error.message.includes('404')) {
          // console.log('Payment not found yet, continuing to monitor...');
        } else {
          // For other errors, stop monitoring after a few attempts
          if (checkCount >= 3) {
            console.error('Payment status check failed, stopping monitoring');
            clearInterval(interval);
            setStatusCheckInterval(null);
          }
        }
      }
    }, 3000); // Check every 3 seconds as per documentation

    setStatusCheckInterval(interval);
  };

  // Legacy SAGA progress tracking (kept for backward compatibility)
  const startSagaProgressTracking = (sagaId) => {
    // console.log('Starting SAGA progress tracking for:', sagaId);
    
    // Track SAGA progress every 10 seconds for up to 5 minutes
    const interval = setInterval(async () => {
      try {
        const sagaData = await api.utils.trackSagaProgress(sagaId, (progress) => {
          // console.log('SAGA Progress:', progress);
          
          // Only stop tracking on failure, not completion
          if (progress.status === 'FAILED') {
            // console.log('SAGA failed:', progress);
            clearInterval(interval);
          }
          // Don't stop on COMPLETED - SAGA completion doesn't mean payment is done
        });
        
        if (!sagaData) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('SAGA progress tracking error:', error);
        clearInterval(interval);
      }
    }, 10000); // Check every 10 seconds
    
    // Stop tracking after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };


  // Function to handle order creation and payment using Orders SAGA
  const handleOrderAndPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Validate required fields
      if (!formData.addressLine1 || !formData.city || !formData.country || !formData.phone) {
        alert('Бүх заавал оруулах талбаруудыг бөглөнө үү!');
        return;
      }

      // Validate cart has items
      if (!cartProducts || cartProducts.length === 0) {
        alert('Сагсанд бараа байхгүй байна!');
        return;
      }

      // Prepare order data for SAGA pattern
      const orderData = {
        items: cartProducts.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          ...(item.variantId && { variantId: item.variantId })
        })),
        provider: selectedPaymentMethod,
        currency: 'MNT', // Default currency
        ...(appliedCoupon && { couponCode: appliedCoupon.code }),
        shippingAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          mobile: formData.phone
        },
        paymentMetadata: {
          description: `Захиалга #${Date.now()}`,
          ...(selectedPaymentMethod === 'STOREPAY' && { mobileNumber: formData.phone })
        }
      };

      // console.log('Creating order with SAGA pattern:', orderData);

      // Check system health before creating order
      try {
        const healthCheck = await api.system.health(true);
        if (!healthCheck.success || healthCheck.data?.status !== 'healthy') {
          // console.warn('System health check failed:', healthCheck);
          // Continue anyway, but log the warning
        }
      } catch (healthError) {
        // console.warn('System health check error:', healthError);
        // Continue anyway
      }

      // Generate unique identifiers for SAGA (for future use when backend supports custom headers)
      const requestId = api.utils.generateRequestId();
      const idempotencyKey = api.utils.generateIdempotencyKey();

      // Create order using Orders SAGA pattern
      // Note: Custom headers disabled by default to avoid CORS issues
      const response = await api.orders.createWithSaga(orderData, {
        idempotencyKey,
        requestId,
        deviceType: 'web',
        source: 'web',
        useCustomHeaders: false // Set to true when backend supports custom headers
      });
      
      // console.log('Order creation response:', response);
      // console.log('Response data:', response.data);
      // console.log('Payment data:', response.data?.payment);
      // console.log('Order data:', response.data?.order);
      
      if (response.success) {
        const { order, payment, sagaId } = response.data;
        // console.log('Order created successfully:', { order, payment, sagaId });
        
        // Set payment data for modal (SAGA format)
        setPaymentData({
          sagaId: sagaId,
          orderId: order.id,
          paymentId: payment.paymentId,
          paymentMethod: selectedPaymentMethod,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          qrImage: payment.qrCode, // SAGA returns qrCode
          qrCode: payment.qrCode,
          paymentUrl: payment.paymentUrl,
          transactionId: payment.transactionId,
          expiresAt: payment.expiresAt
        });
        
        // Start monitoring payment status if it's pending
        if (payment.status === 'PENDING' && payment.paymentId) {
          // Use correct payment status monitoring as per SAGA documentation
          startPaymentStatusMonitoring(payment.paymentId);
        }
        
        // Show payment modal
        setShowPaymentModal(true);
        
        // Clear cart after successful order
        clearCart();
      }
    } catch (error) {
      console.error('Order creation error:', error);
      
      // Handle specific payment provider and SAGA errors
      let errorMessage = 'Захиалга үүсгэхэд алдаа гарлаа';
      
      if (error.message) {
        // SAGA-specific errors
        if (error.message.includes('SAGA Execution Failed')) {
          errorMessage = `Захиалгын системийн алдаа: ${error.message}. Дахин оролдоно уу.`;
        } else if (error.message.includes('SAGA timeout')) {
          errorMessage = `Захиалгын системийн цаг дууссан. Дахин оролдоно уу.`;
        } else if (error.message.includes('Insufficient stock')) {
          errorMessage = `Агуулахын алдаа: ${error.message}`;
        } else if (error.message.includes('Provider Unavailable')) {
          errorMessage = `Төлбөрийн системийн алдаа: ${error.message}. Өөр төлбөрийн арга сонгоно уу.`;
        } else if (error.message.includes('Rate Limited')) {
          errorMessage = `Хэт олон захиалга. Түр хүлээгээд дахин оролдоно уу.`;
        } else if (error.message.includes('Validation failed')) {
          errorMessage = `Мэдээлэл буруу: ${error.message}`;
        } else if (error.message.includes('Authentication required')) {
          errorMessage = `Нэвтрэх шаардлагатай. Дахин нэвтэрнэ үү.`;
        } else if (error.message.includes('хамгийн бага дүнгийн шаардлага')) {
          errorMessage = `Төлбөрийн алдаа: ${error.message}`;
        } else if (error.message.includes('Pocket Zero')) {
          errorMessage = `Pocket төлбөрийн алдаа: ${error.message}`;
        } else if (error.message.includes('Storepay')) {
          errorMessage = `Storepay төлбөрийн алдаа: ${error.message}`;
        } else if (error.message.includes('QPAY')) {
          errorMessage = `QPay төлбөрийн алдаа: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`${errorMessage}`);
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
    
    // Redirect to account orders page
    router.push('/account_orders');
  };



  // Manual status check as per SAGA documentation
  const handleManualStatusCheck = async () => {
    if (paymentData?.paymentId) {
      try {
        // console.log('Manual status check for payment:', paymentData.paymentId);
        
        // Check payment status as per documentation
        const response = await api.payments.getStatus(paymentData.paymentId);
        
        if (response.success && response.data) {
          const payment = response.data;
          const newStatus = payment.status;
          
          // Update payment data with new status
          setPaymentData(prev => ({
            ...prev,
            status: newStatus,
            ...(payment.transactionId && { transactionId: payment.transactionId }),
            ...(payment.paymentUrl && { paymentUrl: payment.paymentUrl }),
            ...(payment.qrCode && { qrCode: payment.qrCode, qrImage: payment.qrCode })
          }));
          
          // Show status message
          const statusText = {
            'PENDING': 'Хүлээгдэж буй',
            'COMPLETED': 'Амжилттай',
            'FAILED': 'Амжилтгүй',
            'CANCELLED': 'Цуцлагдсан'
          };
          
          alert(`Төлбөрийн статус: ${statusText[newStatus] || newStatus}`);
          
          // If payment is completed, stop monitoring and redirect
          if (newStatus === 'COMPLETED') {
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval);
              setStatusCheckInterval(null);
            }
            setPaymentStatus('COMPLETED');
            
            if (confirm('Төлбөр амжилттай! Захиалга баталгаажлаа! Захиалга хуудас руу очих уу?')) {
              router.push('/account_orders');
            }
          }
        } else {
          alert('Статус шалгахад алдаа гарлаа');
        }
      } catch (error) {
        console.error('Manual status check error:', error);
        alert('Статус шалгахад алдаа гарлаа: ' + error.message);
      }
    }
  };


  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="checkout-form">
        <div className="billing-info__wrapper">
          <h4 className="mb-3">ХАЯГИЙН МЭДЭЭЛЭЛ</h4>
          
          {/* Address Selection Buttons */}
          <div className="address-selection__wrapper mb-4">
            {/* Current Selection Indicator */}
            {addressMode === 'existing' && hasSelectedExistingAddress && (
              <div className={`alert mb-3 ${justSavedAddress ? 'alert-success' : 'alert-info'}`}>
                <i className={`me-2 ${justSavedAddress ? 'fas fa-check-circle' : 'fas fa-map-marker-alt'}`}></i>
                <strong>
                  {justSavedAddress ? 'Шинээр хадгалсан хаяг:' : 'Сонгосон хаяг:'}
                </strong> {selectedAddress?.addressLine1}, {selectedAddress?.country}
                {justSavedAddress && (
                  <span className="ms-2 badge bg-success">Шинэ</span>
                )}
              </div>
            )}
            
            <div className="row">
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn w-100"
                  style={{
                    border: '1px solid #495D35',
                    color: addressMode === 'existing' ? 'white' : '#495D35',
                    backgroundColor: addressMode === 'existing' ? '#495D35' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (addressMode !== 'existing') {
                      e.target.style.backgroundColor = '#495D35';
                      e.target.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (addressMode !== 'existing') {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#495D35';
                    }
                  }}
                  onClick={() => setShowAddressModal(true)}
                  disabled={!session?.user || addresses.length === 0}
                >
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Өмнө оруулсан хаягаасаа сонгох
                  {addresses.length > 0 && (
                    <span className="badge ms-2" style={{
                      backgroundColor: addressMode === 'existing' ? 'white' : '#495D35',
                      color: addressMode === 'existing' ? '#495D35' : 'white'
                    }}>{addresses.length}</span>
                  )}
                </button>
                {/* {!session?.user && (
                  <small className="text-muted d-block mt-1">Нэвтэрсэн хэрэглэгч л ашиглах боломжтой</small>
                )} */}
                {/* {session?.user && addresses.length === 0 && (
                  <small className="text-muted d-block mt-1">Хадгалсан хаяг байхгүй байна</small>
                )} */}
              </div>
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn w-100"
                  style={{
                    border: '1px solid #495D35',
                    color: addressMode === 'new' ? 'white' : '#495D35',
                    backgroundColor: addressMode === 'new' ? '#495D35' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (addressMode !== 'new') {
                      e.target.style.backgroundColor = '#495D35';
                      e.target.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (addressMode !== 'new') {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#495D35';
                    }
                  }}
                  onClick={() => {
                    setFormData({
                      country: "Mongolia",
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      postalCode: "",
                      phone: "",
                      userId: session?.user?.userId
                    });
                    setIsEditingAddress(false);
                    setSelectedAddress(null);
                    setAddressMode('new');
                    setHasSelectedExistingAddress(false);
                    setJustSavedAddress(false);
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Шинэ хаяг оруулах
                </button>
                {/* <small className="text-muted d-block mt-1">Шинэ хаягийн мэдээлэл оруулна уу</small> */}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="form-floating my-3">
                <input
                  type="text"
                  className="form-control"
                  id="checkout_phone"
                  placeholder="Утасны дугаар *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <label htmlFor="checkout_phone">Утасны дугаар *</label>
              </div>
            </div>
             {/* Region Type Selection */}
             <div className="col-md-12">
              <div className="form-floating my-3">
                <div className={`form-label-fixed hover-container ${
                  showRegionTypeDropdown ? "js-content_visible" : ""
                }`}>
                  <label htmlFor="checkout_region_type" className="form-label">
                    Бүс нутаг *
                  </label>
                  <div className="js-hover__open">
                    <input
                      type="text"
                      className="form-control form-control-lg search-field__actor search-field__arrow-down"
                      id="checkout_region_type"
                      value={formData.city}
                      readOnly
                      placeholder="Улаанбаатар эсвэл хөдөө орон нутаг сонгоно уу..."
                      onClick={() => setShowRegionTypeDropdown((prev) => !prev)}
                    />
                  </div>
                  {showRegionTypeDropdown && (
                    <div className="filters-container js-hidden-content mt-2">
                      <ul className="search-suggestion list-unstyled">
                        {regionTypes.map((regionType, i) => (
                          <li
                            onClick={() => {
                              setFormData({...formData, city: regionType, country: ""});
                              setShowRegionTypeDropdown(false);
                              setShowProvinceDropdown(false);
                            }}
                            key={i}
                            className="search-suggestion__item js-search-select"
                            style={{ cursor: 'pointer', padding: '8px 12px' }}
                          >
                            {regionType}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specific Location Selection */}
            {formData.city && (
              <div className="col-md-12">
                <div className="form-floating my-3">
                  <div className={`form-label-fixed hover-container ${
                    showProvinceDropdown ? "js-content_visible" : ""
                  }`}>
                    <label htmlFor="checkout_location" className="form-label">
                      {formData.city === "Улаанбаатар" ? "Дүүрэг *" : "Аймаг *"}
                    </label>
                    <div className="js-hover__open">
                      <input
                        type="text"
                        className="form-control form-control-lg search-field__actor search-field__arrow-down"
                        id="checkout_location"
                        value={formData.country}
                        readOnly
                        placeholder={formData.city === "Улаанбаатар" ? "Дүүрэг сонгоно уу..." : "Аймаг сонгоно уу..."}
                        onClick={() => setShowProvinceDropdown((prev) => !prev)}
                      />
                    </div>
                    {showProvinceDropdown && (
                      <div className="filters-container js-hidden-content mt-2">
                        <div className="search-field__input-wrapper">
                          <input
                            type="text"
                            className="search-field__input form-control form-control-sm bg-lighter border-lighter"
                            placeholder="Хайх..."
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                            }}
                          />
                        </div>
                        <ul className="search-suggestion list-unstyled">
                          {(formData.city === "Улаанбаатар" ? ulaanbaatarDistricts : mongolianProvinces)
                            .filter((location) =>
                              location.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((location, i) => (
                              <li
                                onClick={() => {
                                  setFormData({...formData, country: location});
                                  setShowProvinceDropdown(false);
                                  setSearchQuery("");
                                }}
                                key={i}
                                className="search-suggestion__item js-search-select"
                                style={{ cursor: 'pointer', padding: '8px 12px' }}
                              >
                                {location}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="col-md-12">
              <div className="form-floating mt-3 mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="checkout_street_address"
                  placeholder="Гудамж, байрны хаяг *"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                />
                <label htmlFor="checkout_street_address">Гудамж, байрны хаяг *</label>
              </div>
              <div className="form-floating mt-3 mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="checkout_street_address_2"
                  placeholder="Нэмэлт мэдээлэл"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                />
                <label htmlFor="checkout_street_address_2">Нэмэлт мэдээлэл</label>
              </div>
            </div>
           
            <div className="col-md-12">
              <div className="form-floating my-3">
                <input
                  type="text"
                  className="form-control"
                  id="checkout_zipcode"
                  placeholder="Шуудангийн код *"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                />
                <label htmlFor="checkout_zipcode">Шуудангийн код</label>
              </div>
            </div>
            {/* <div className="col-md-12">
              <div className="form-floating my-3">
                <input
                  type="text"
                  className="form-control"
                  id="checkout_province"
                  placeholder="Дүүрэг *"
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                />
                <label htmlFor="checkout_province">Дүүрэг *</label>
              </div>
            </div> */}
          
            {/* Save Address Button */}
            {session?.user && (
              <div className="col-md-12">
                <button
                  type="button"
                  className="btn btn-checkout mt-3"
                  style={{
                    border: '1px solid #495D35',
                    color: 'white',
                    backgroundColor: '#495D35',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSavingAddress) {
                      e.target.style.backgroundColor = '#6B8E5A';
                      e.target.style.borderColor = '#6B8E5A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavingAddress) {
                      e.target.style.backgroundColor = '#495D35';
                      e.target.style.borderColor = '#495D35';
                    }
                  }}
                  disabled={isSavingAddress}
                  onClick={async () => {
                    try {
                      setIsSavingAddress(true);
                      
                      // Check if user is properly authenticated
                      if (!session?.user?.userId) {
                        alert('Та эхлээд нэвтэрнэ үү!');
                        return;
                      }

                      // Validate required fields
                      if (!formData.addressLine1 || !formData.city || !formData.phone) {
                        alert('Бүх заавал оруулах талбаруудыг бөглөнө үү!');
                        return;
                      }

                      if (isEditingAddress && selectedAddress) {
                        // Update existing address
                        await updateAddress(selectedAddress.id, {
                          addressLine1: formData.addressLine1,
                          addressLine2: formData.addressLine2,
                          city: formData.city,
                          postalCode: formData.postalCode,
                          country: formData.country,
                          mobile: formData.phone
                        });
                      } else {
                        // Create new address
                        const newAddress = await createAddress({
                          addressLine1: formData.addressLine1,
                          addressLine2: formData.addressLine2,
                          city: formData.city,
                          postalCode: formData.postalCode,
                          country: formData.country,
                          mobile: formData.phone
                        });
                        
                        // After creating new address, select it and switch to existing mode
                        if (newAddress) {
                          setSelectedAddress(newAddress);
                          setAddressMode('existing');
                          setHasSelectedExistingAddress(true);
                          setIsEditingAddress(true);
                          setJustSavedAddress(true);
                          
                          // Reset the flag after 3 seconds
                          setTimeout(() => {
                            setJustSavedAddress(false);
                          }, 3000);
                        }
                      }
                      alert('Хаяг амжилттай хадгалагдлаа!');
                    } catch (error) {
                      console.error('Address save error:', error);
                      if (error.message.includes('not authenticated') || error.message.includes('Authentication required')) {
                        alert('Та эхлээд нэвтэрнэ үү!');
                      } else {
                        alert('Алдаа гарлаа: ' + error.message);
                      }
                    } finally {
                      setIsSavingAddress(false);
                    }
                  }}
                >
                  {isSavingAddress ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Хадгалж байна...
                    </>
                  ) : (
                    isEditingAddress ? 'Хаяг шинэчлэх' : 'Хаяг хадгалах'
                  )}
                </button>
              </div>
            )}
          </div>
         
        </div>
        <div className="checkout__totals-wrapper">
          <div className="sticky-content">
            <div className="checkout__totals">
              <h3 style={{ color: '#495D35' }}>Таны захиалга</h3>
              <table className="checkout-cart-items">
                <thead >
                  <tr>
                    <th >БҮТЭЭГДЭХҮҮН</th>
                    <th>НИЙТ</th>
                  </tr>
                </thead>
                <tbody>
                  {cartProducts.map((elm, i) => (
                    <tr key={i}>
                      <td>
                        {elm.title} x {elm.quantity}
                      </td>
                      <td>{elm.price * elm.quantity}₮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="checkout-totals">
                <tbody>
                  {/* <tr>
                    <th>НИЙТ</th>
                    <td>${totalPrice}</td>
                  </tr> */}
                  <tr>
                    <th>ХҮРГЭЛТ</th>
                    <td>{totalPrice && 6000}₮</td>
                    {/* <td>Үнэгүй</td> */}
                  </tr>
                  {/* <tr>
                    <th>НӨАТ</th>
                    <td>${totalPrice && 19}</td>
                  </tr> */}
                  <tr>
                    <th>НИЙТ ДҮН</th>
                    <td>{totalPrice && totalPrice + 6000}₮</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Coupon Code Section */}
            <div className="checkout__coupon mb-4">
              <h4 className="mb-3" style={{ color: '#495D35' }}>Хөнгөлөлтийн код</h4>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Хөнгөлөлтийн код оруулах"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                  }}
                />
                <button
                  type="button"
                  className="btn"
                  style={{
                    border: '1px solid #495D35',
                    color: 'white',
                    backgroundColor: '#495D35',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={async () => {
                    if (!couponCode.trim()) {
                      setCouponError('Хөнгөлөлтийн код оруулна уу');
                      return;
                    }
                    
                    try {
                      // Here you would call your coupon validation API
                      // For now, we'll simulate a successful coupon
                      setAppliedCoupon({
                        code: couponCode,
                        discount: 10,
                        type: 'percentage'
                      });
                      setCouponError('');
                      setCouponCode('');
                    } catch (error) {
                      setCouponError('Хөнгөлөлтийн код буруу эсвэл хугацаа дууссан байна');
                    }
                  }}
                >
                  Хэрэглэх
                </button>
              </div>
              
              {couponError && (
                <div className="alert alert-danger mt-2">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {couponError}
                </div>
              )}
              
              {appliedCoupon && (
                <div className="alert alert-success mt-2">
                  <i className="fas fa-check-circle me-2"></i>
                  Хөнгөлөлтийн код амжилттай хэрэглэгдлээ: {appliedCoupon.code}
                  <button
                    type="button"
                    className="btn-close ms-2"
                    onClick={() => setAppliedCoupon(null)}
                  ></button>
                </div>
              )}
            </div>

            <div className="checkout__payment-methods">
              <h4 className="mb-3" style={{ color: '#495D35' }}>Төлбөрийн нөхцөл</h4>
              
              <div className="payment-options">
                
                
                

                <div className="form-check payment-option mb-3 p-3 border rounded" style={{ 
                  backgroundColor: '#F4F7F5',
                  borderColor: '#E9ECEF',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <label
                    className="form-check-label d-flex align-items-center w-100"
                    htmlFor="checkout_payment_method_2"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="payment-icon me-3 d-flex align-items-center justify-content-center" style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E9ECEF'
                    }}>
                      <img 
                        src="/assets/images/payment/qr.png" 
                        alt="QR Code" 
                        style={{ width: '35px', height: '35px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <i className="fas fa-qrcode fa-2x" style={{ display: 'none', color: '#495D35' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">QR Кодоор төлөх</div>
                      <small className="text-muted">QR кодыг уншуулж төлбөр хийх</small>
                    </div>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_2"
                      checked={selectedPaymentMethod === 'QPAY'}
                      onChange={() => setSelectedPaymentMethod('QPAY')}
                      style={{ 
                        marginLeft: '10px',
                        transform: 'scale(1.2)'
                      }}
                    />
                  </label>
                </div>

                <div className="form-check payment-option mb-3 p-3 border rounded" style={{ 
                  backgroundColor: '#F4F7F5',
                  borderColor: '#E9ECEF',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <label
                    className="form-check-label d-flex align-items-center w-100"
                    htmlFor="checkout_payment_method_3"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="payment-icon me-3 d-flex align-items-center justify-content-center" style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E9ECEF'
                    }}>
                      <img 
                        src="/assets/images/payment/pocket.png" 
                        alt="Pocket" 
                        style={{ width: '35px', height: '35px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <i className="fas fa-wallet fa-2x" style={{ display: 'none', color: '#495D35' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">Pocket</div>
                      <small className="text-muted">Pocket-аар төлбөр хийх</small>
                      {/* <small className="text-warning d-block">Хамгийн бага: 1,000₮</small> */}
                    </div>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_3"
                      checked={selectedPaymentMethod === 'POCKET'}
                      onChange={() => setSelectedPaymentMethod('POCKET')}
                      style={{ 
                        marginLeft: '10px',
                        transform: 'scale(1.2)'
                      }}
                    />
                  </label>
                </div>

                <div className="form-check payment-option mb-3 p-3 border rounded" style={{ 
                  backgroundColor: '#F4F7F5',
                  borderColor: '#E9ECEF',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <label
                    className="form-check-label d-flex align-items-center w-100"
                    htmlFor="checkout_payment_method_4"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="payment-icon me-3 d-flex align-items-center justify-content-center" style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E9ECEF'
                    }}>
                      <img 
                        src="/assets/images/payment/storepay.png" 
                        alt="Storepay" 
                        style={{ width: '35px', height: '35px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <i className="fas fa-credit-card fa-2x" style={{ display: 'none', color: '#495D35' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">Storepay</div>
                      <small className="text-muted">Storepay-аар төлбөр хийх</small>
                      {/* <small className="text-warning d-block">Хамгийн бага: 1,000₮</small> */}
                    </div>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_4"
                      checked={selectedPaymentMethod === 'STOREPAY'}
                      onChange={() => setSelectedPaymentMethod('STOREPAY')}
                      style={{ 
                        marginLeft: '10px',
                        transform: 'scale(1.2)'
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="policy-text mt-3">
                Таны хувийн мэдээллийг захиалга боловсруулах, вэбсайтын туршлагыг дэмжих, 
                болон бусад зорилгоор ашиглана. Дэлгэрэнгүй мэдээллийг
                <Link href="/terms" target="_blank" className="mx-1">
                  нууцлалын бодлогоос
                </Link>
                уншина уу.
              </div>
            </div>
            {/* <div className="d-flex flex-column gap-2"> */}
              <button 
                className="btn btn-checkout"
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
                disabled={isProcessingPayment}
                onClick={handleOrderAndPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Захиалга үүсгэж байна...
                  </>
                ) : (
                  'ЗАХИАЛГА ХИЙХ'
                )}
              </button>
{/*               
              <button 
                className="btn btn-outline-secondary"
                style={{
                  border: '1px solid #6c757d',
                  color: '#6c757d',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isProcessingPayment) {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessingPayment) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6c757d';
                  }
                }}
                disabled={isProcessingPayment}
                onClick={handlePayLater}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Захиалга үүсгэж байна...
                  </>
                ) : (
                  <>
                    <i className="fas fa-clock me-2"></i>
                    Дараа төлөх
                  </>
                )}
              </button>
              
              <div className="text-center">
                <small className="text-muted">
                  "Дараа төлөх" дээр дарахад захиалга хадгалагдаж, 
                  захиалгын жагсаалт дээр төлбөр төлөх боломжтой
                </small>
              </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>
    </form>

     {/* Address Selection Modal */}
     {showAddressModal && (
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
             <div className="modal-header" style={{ 
               borderBottom: '1px solid #E9ECEF',
               backgroundColor: '#F4F7F5'
             }}>
               <h5 className="modal-title" style={{ color: '#495D35' }}>Хаяг сонгох</h5>
               <button
                 type="button"
                 className="btn-close"
                 onClick={() => setShowAddressModal(false)}
               ></button>
             </div>
             <div className="modal-body" style={{ 
               maxHeight: '80vh', 
               overflowY: 'auto',
               padding: '1rem'
             }}>
               {addressesLoading ? (
                 <div className="text-center py-3">
                   <div className="spinner-border" role="status">
                     <span className="visually-hidden">Уншиж байна...</span>
                   </div>
                 </div>
               ) : addresses.length > 0 ? (
                 <div className="address-list">
                   {addresses.map((address) => (
                     <div 
                       key={address.id} 
                       className="address-item p-3 border rounded mb-2 cursor-pointer transition-all"
                       style={{
                         borderColor: selectedAddress?.id === address.id ? '#495D35' : '#E9ECEF',
                         backgroundColor: selectedAddress?.id === address.id ? '#F4F7F5' : 'white',
                         borderWidth: selectedAddress?.id === address.id ? '2px' : '1px'
                       }}
                       onClick={() => setSelectedAddress(address)}
                     >
                       <div className="d-flex justify-content-between align-items-start">
                         <div style={{ flex: 1 }}>
                           <strong className="d-block mb-1">{address.addressLine1}</strong>
                           {address.addressLine2 && (
                             <div className="text-muted small mb-1">{address.addressLine2}</div>
                           )}
                           <div className="text-muted small mb-1">
                             {address.city}, {address.postalCode}
                           </div>
                           <div className="text-muted small mb-1">{address.country}</div>
                           <div className="text-muted small">Утас: {address.mobile}</div>
                         </div>
                         <div className="form-check ms-3">
                           <input
                             className="form-check-input"
                             type="radio"
                             name="selectedAddress"
                             id={`address-${address.id}`}
                             checked={selectedAddress?.id === address.id}
                             onChange={() => setSelectedAddress(address)}
                           />
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-4 text-muted">
                   {/* <i className="fas fa-map-marker-alt fa-2x mb-3" style={{ color: '#495D35' }}></i>
                   <div>Хадгалсан хаяг байхгүй байна</div>
                   <small>Шинэ хаяг нэмэхийн тулд дээрх талбаруудыг бөглөнө үү</small> */}
                 </div>
               )}
             </div>
             <div className="modal-footer" style={{ 
               borderTop: '1px solid #E9ECEF',
               backgroundColor: '#F4F7F5'
             }}>
               <button
                 type="button"
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
                 onClick={() => setShowAddressModal(false)}
               >
                 Хаах
               </button>
               {selectedAddress && (
                 <button
                   type="button"
                   className="btn"
                   style={{
                     border: '1px solid #495D35',
                     color: 'white',
                     backgroundColor: '#495D35',
                     transition: 'all 0.3s ease'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.backgroundColor = '#6B8E5A';
                     e.target.style.borderColor = '#6B8E5A';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.backgroundColor = '#495D35';
                     e.target.style.borderColor = '#495D35';
                   }}
                   onClick={() => {
                     // Fill form with selected address
                     setFormData({
                       firstName: selectedAddress.firstName || "",
                       lastName: selectedAddress.lastName || "",
                       companyName: selectedAddress.companyName || "",
                       country: selectedAddress.country,
                       addressLine1: selectedAddress.addressLine1,
                       addressLine2: selectedAddress.addressLine2 || "",
                       city: selectedAddress.city,
                       postalCode: selectedAddress.postalCode,
                       phone: selectedAddress.mobile,
                       email: formData.email
                     });
                     setIsEditingAddress(true);
                     setAddressMode('existing');
                     setHasSelectedExistingAddress(true);
                     setShowAddressModal(false);
                   }}
                 >
                   Энэ хаягийг ашиглах
                 </button>
               )}
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Modal Backdrop */}
     {showAddressModal && (
       <div 
         className="modal-backdrop fade show" 
         onClick={() => setShowAddressModal(false)}
       ></div>
     )}

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
                  onClick={() => {
                    setShowPaymentModal(false);
                    if (paymentData?.orderId) {
                      router.push(`/account_orders/${paymentData.orderId}`);
                    }
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ 
                maxHeight: '80vh', 
                overflowY: 'auto',
                padding: '1rem'
              }}>
                {/* Order Information */}
                <div className="mb-3" style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: 'none'
                }}>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: '#6c757d', fontWeight: '500' }}>Захиалгын дугаар:</span>
                        <div style={{ color: '#212529', fontWeight: '600', marginTop: '2px' }}>#{paymentData.orderId}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: '#6c757d', fontWeight: '500' }}>Төлбөрийн дүн:</span>
                        <div style={{ color: '#212529', fontWeight: '600', marginTop: '2px' }}>{paymentData.amount} {paymentData.currency}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section - Only show once when payment data is available */}
                {(paymentData.qrImage || paymentData.qrCode) && (
                  <div className="text-center">
                    <h6 className="mb-2">
                        <i className="fas fa-qrcode me-2"></i>
                        QR Код уншуулах
                      </h6>
                    <div className="card-body text-center">
                      <QRCodeDisplay 
                        qrData={paymentData?.qrImage || paymentData?.qrCode}
                        paymentMethod={paymentData?.paymentMethod}
                      />
                      <div className="mt-3">
                        <small className="text-muted">
                          <i className="fas fa-mobile-alt me-1"></i>
                          {getPaymentAppName(paymentData.paymentMethod)} апп-аа нээж QR кодыг уншуулна уу
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment URL Section */}
                {/* {paymentData.paymentUrl && (
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
                )} */}

                {/* Transaction ID */}
                {/* {paymentData.transactionId && (
                  <div className="alert alert-info">
                    <strong>Транзакцийн дугаар:</strong> {paymentData.transactionId}
                  </div>
                )} */}

                {/* Payment Status */}
                {/* <div className={`alert ${
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
                </div> */}

                {/* Instructions */}
                {paymentData.status === 'PENDING' && (
                  <div className="alert alert-info">
                    <h6><i className="fas fa-info-circle me-2"></i>Заавар:</h6>
                    {paymentData.paymentMethod === 'STOREPAY' ? (
                      <div>
                        <p className="mb-2" style={{ fontWeight: '600', color: '#495D35' }}>
                          Төлбөрийн нэхэмжлэх Storepay -руу илгээсэн тул та эхний төлөлтөө хийж захиалгаа баталгаажуулна уу.
                        </p>
                        <ul className="mb-0">
                          <li>Storepay апп-аа нээж төлбөр хийх</li>
                          <li>Төлбөр хийсний дараа статус автоматаар шинэчлэгдэнэ</li>
                          <li>Асуудал гарвал "Статус шалгах" товчийг дарна уу</li>
                        </ul>
                      </div>
                    ) : (
                      <ul className="mb-0">
                        <li>QR кодыг уншуулж төлбөр хийх</li>
                        <li>Төлбөр хийсний дараа статус автоматаар шинэчлэгдэнэ</li>
                        <li>Асуудал гарвал "Статус шалгах" товчийг дарна уу</li>
                      </ul>
                    )}
                  </div>
                )}
                
                {paymentData.status === 'COMPLETED' && (
                  <div className="alert alert-success">
                    <h6><i className="fas fa-check-circle me-2"></i>Амжилттай!</h6>
                    <p className="mb-0">Төлбөр амжилттай төлөгдлөө. Захиалгын жагсаалт руу орох бол дээрх товчийг дарна уу.</p>
                  </div>
                )}
                
                {(paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED') && (
                  <div className="alert alert-warning">
                    <h6><i className="fas fa-exclamation-triangle me-2"></i>Анхааруулга:</h6>
                    <p className="mb-0">Төлбөр {paymentData.status === 'FAILED' ? 'амжилтгүй' : 'цуцлагдсан'} байна. Дахин оролдох бол "Статус шалгах" товчийг дарна уу.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ 
                borderTop: '1px solid #e4e4e4',
                padding: '1rem 1.5rem',
                backgroundColor: '#faf9f8'
              }}>
         
                {paymentData.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: '#cde9f6',
                        borderColor: '#4780aa',
                        color: '#4780aa',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b8d9f0';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#cde9f6';
                      }}
                      onClick={handleManualStatusCheck}
                    >
                      <i className="fas fa-sync-alt me-2"></i>
                      Статус шалгах
                    </button>
                    
                  </>
                )}
                
                {paymentData.status === 'COMPLETED' && (
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: '#def2d7',
                      borderColor: '#5b7052',
                      color: '#5b7052',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#d0e8c5';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#def2d7';
                    }}
                    onClick={handlePaymentComplete}
                  >
                    <i className="fas fa-check me-2"></i>
                    Захиалгын жагсаалт руу орох
                  </button>
                )}
                
                {(paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED') && (
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: '#cde9f6',
                      borderColor: '#4780aa',
                      color: '#4780aa',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#b8d9f0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#cde9f6';
                    }}
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

     {/* Modal Backdrop */}
     {showPaymentModal && (
       <div 
         className="modal-backdrop fade show" 
         onClick={() => {
           setShowPaymentModal(false);
           if (paymentData?.orderId) {
             router.push(`/account_orders?orderId=${paymentData.orderId}`);
           }
         }}
       ></div>
     )}


     </>
   );
 }
