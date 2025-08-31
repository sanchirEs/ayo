"use client";
const countries = [
  "Australia",
  "Canada",
  "United Kingdom",
  "United States",
  "Turkey",
  "Mongolia",
];

// Mongolian provinces/cities
const mongolianProvinces = [
  "Улаанбаатар",
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

import { useContextElement } from "@/context/Context";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import pako from "pako";
import QRCode from "qrcode";

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
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMode, setAddressMode] = useState('new'); // 'new' or 'existing'
  const [hasSelectedExistingAddress, setHasSelectedExistingAddress] = useState(false);
  const [justSavedAddress, setJustSavedAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QPAY');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  
  // Form states
  const [formData, setFormData] = useState({
    country: "Mongolia",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    phone: "",
    userId: session?.user?.userId
  });

  // QR Code Display Component
  const QRCodeDisplay = ({ qrData, paymentMethod }) => {
    const [qrImageSrc, setQrImageSrc] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const processedRef = useRef(null);
    const generatedRef = useRef(false);

    // Memoize qrData to prevent unnecessary re-renders
    const memoizedQrData = useMemo(() => qrData, [qrData]);

    // Process QR data only once
    useEffect(() => {
      if (!memoizedQrData || processedRef.current === memoizedQrData) {
        return;
      }

      processedRef.current = memoizedQrData;
      generatedRef.current = false;

      const processQRData = async () => {
        try {
          setIsLoading(true);
          setError('');

          let processedData = memoizedQrData;

          // If it's already a data URL or external URL
          if (qrData.startsWith('data:') || qrData.startsWith('http')) {
            setQrImageSrc(qrData);
            setIsLoading(false);
            return;
          }

          // If it's GZIP compressed base64
          if (qrData.startsWith('H4sI')) {
            try {
              console.log('Processing GZIP compressed QR data:', qrData.substring(0, 50) + '...');
              
              // Convert base64 to binary
              const binary = atob(qrData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }

              console.log('Binary length:', binary.length);

              // Decompress using pako
              const decompressed = pako.inflate(bytes);
              processedData = String.fromCharCode.apply(null, decompressed);

              console.log('Decompressed string length:', processedData.length);
              console.log('Decompressed string:', processedData.substring(0, 100) + '...');

              // Generate QR code image from the decoded text
              try {
                const qrDataUrl = await QRCode.toDataURL(processedData, {
                  width: 250,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  }
                });

                console.log('Successfully generated QR code image from GZIP data');
                setQrImageSrc(qrDataUrl);
                setIsLoading(false);
                return;
              } catch (qrError) {
                console.error('Failed to generate QR code image:', qrError);
                // Fallback: show the text
                setQrImageSrc(processedData);
                setIsLoading(false);
                return;
              }
            } catch (err) {
              console.error('Failed to process GZIP QR data:', err);
              setError('QR код уншихад алдаа гарлаа');
              setIsLoading(false);
              return;
            }
          }

          // Generate QR code image
          if (processedData.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(processedData)) {
            // This looks like a base64 image, convert to data URL
            const qrDataUrl = `data:image/png;base64,${processedData}`;
            setQrImageSrc(qrDataUrl);
          } else if (processedData.length < 200) {
            // Short text, try to generate QR code
            try {
              const qrDataUrl = await QRCode.toDataURL(processedData, {
                width: 250,
                margin: 2,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              });
              setQrImageSrc(qrDataUrl);
            } catch (err) {
              console.error('Failed to generate QR code image from text:', err);
              // Fallback: show the text
              setQrImageSrc(processedData);
            }
          } else {
            // Long text, show as text (don't try to generate QR code)
            setQrImageSrc(processedData);
          }

          generatedRef.current = true;
        } catch (err) {
          console.error('QR code processing error:', err);
          setError('QR код уншихад алдаа гарлаа');
        } finally {
          setIsLoading(false);
        }
      };

      processQRData();
    }, [memoizedQrData]);

    if (isLoading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">QR код үүсгэж байна...</span>
          </div>
          <div className="mt-2 text-muted">QR код үүсгэж байна...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      );
    }

    if (qrImageSrc) {
      // If it's a data URL, show as image
      if (qrImageSrc.startsWith('data:image')) {
        return (
          <img 
            src={qrImageSrc}
            alt="QR Code" 
            style={{ 
              maxWidth: '250px', 
              height: 'auto', 
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              padding: '10px'
            }}
            onLoad={(e) => {
              // console.log('QR code image loaded successfully');
            }}
            onError={(e) => {
              console.error('QR code image failed to load');
              setError('QR код харагдахгүй байна');
            }}
          />
        );
      }

      // If it's QR code text, show with instructions
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
            {qrImageSrc}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Энэ нь QR кодын текст юм. Та үүнийг QR код үүсгэгч апп-аар уншуулж болно.
          </div>
        </div>
      );
    }

    return (
      <div className="alert alert-warning">
        <i className="fas fa-info-circle me-2"></i>
        QR код үүсгэх боломжгүй байна
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
            
            // Update payment data with new status only if it actually changed
            setPaymentData(prev => {
              if (prev.status === newStatus) {
                return prev; // Return same reference if status didn't change
              }
              return {
              ...prev,
              status: newStatus
              };
            });
            
            // If payment is completed, stop monitoring
            if (newStatus === 'COMPLETED') {
              clearInterval(interval);
              setStatusCheckInterval(null);
              setPaymentStatus('COMPLETED');
              
              // Show success message
              alert('Төлбөр амжилттай төлөгдлөө!');
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
          
          // Update payment data with new status only if it actually changed
          setPaymentData(prev => {
            if (prev.status === newStatus) {
              return prev; // Return same reference if status didn't change
            }
            return {
            ...prev,
            status: newStatus
            };
          });
          
          // If payment is completed, stop monitoring
          if (newStatus === 'COMPLETED') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus('COMPLETED');
            
            // Show success message
            alert('Төлбөр амжилттай төлөгдлөө!');
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

  // Function to handle order creation and payment
  const handleOrderAndPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Validate required fields
      if (!formData.addressLine1 || !formData.city || !formData.phone) {
        alert('Бүх заавал оруулах талбаруудыг бөглөнө үү!');
        return;
      }

      // Validate cart has items
      if (!cartProducts || cartProducts.length === 0) {
        alert('Сагсанд бараа байхгүй байна!');
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartProducts.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          ...(item.variantId && { variantId: item.variantId })
        })),
        provider: selectedPaymentMethod,
        shippingAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          mobile: formData.phone
        }
      };

      console.log('Creating order with payment:', orderData);

      // Create order with integrated payment
      const response = await api.orders.create(orderData);
      
      console.log('Order creation response:', response);
      console.log('Response data:', response.data);
      console.log('Payment data:', response.data?.payment);
      console.log('QR Code in payment:', response.data?.payment?.qrCode);
      console.log('QR Image in payment:', response.data?.payment?.qrImage);
      console.log('Payment URL in payment:', response.data?.payment?.paymentUrl);
      
      if (response.success) {
        const { order, payment } = response.data;
        console.log('Order created with payment:', { order, payment });
        
        // Set payment data for modal
        setPaymentData({
          orderId: order.id,
          paymentId: payment.paymentId,
          paymentMethod: selectedPaymentMethod,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          qrImage: payment.qrCode, // Backend returns qrCode, not qrImage
          qrCode: payment.qrCode,
          paymentUrl: payment.paymentUrl,
          transactionId: payment.transactionId
        });
        
        // Start monitoring payment status if it's pending
        if (payment.status === 'PENDING' && payment.paymentId) {
          startPaymentStatusMonitoring(payment.paymentId);
        }
        
        // Show payment modal
        setShowPaymentModal(true);
        
        // Clear cart after successful order
        clearCart();
      }
    } catch (error) {
      console.error('Order creation error:', error);
      
      // Handle specific payment provider errors
      let errorMessage = 'Захиалга үүсгэхэд алдаа гарлаа';
      
      if (error.message) {
        if (error.message.includes('хамгийн бага дүнгийн шаардлага')) {
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

  // Function to handle payment cancellation
  const handlePaymentCancel = async () => {
    if (paymentData?.paymentId && paymentData.status === 'PENDING') {
      if (confirm('Та төлбөрийг цуцлахдаа итгэлтэй байна уу?')) {
        try {
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
            
            // Ask if user wants to go to orders page
    
              router.push('/account_orders');
            
          } else {
            alert('Төлбөр цуцлахад алдаа гарлаа');
          }
        } catch (error) {
          console.error('Payment cancellation error:', error);
          alert('Төлбөр цуцлахад алдаа гарлаа: ' + error.message);
        }
      }
    } else {
      // Just close modal if no payment to cancel
      setShowPaymentModal(false);
      setPaymentData(null);
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
      
      // Ask if user wants to go to orders page
      if (confirm('Захиалга хуудас руу очих уу?')) {
        router.push('/account_orders');
      }
    }
  };

  // Function to handle "Pay Later" - save order without payment
  const handlePayLater = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Validate required fields
      if (!formData.addressLine1 || !formData.city || !formData.phone) {
        alert('Бүх заавал оруулах талбаруудыг бөглөнө үү!');
        return;
      }

      // Validate cart has items
      if (!cartProducts || cartProducts.length === 0) {
        alert('Сагсанд бараа байхгүй байна!');
        return;
      }

      // Prepare order data without payment
      const orderData = {
        items: cartProducts.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          ...(item.variantId && { variantId: item.variantId })
        })),
        shippingAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          mobile: formData.phone
        }
      };

      console.log('Creating order without payment:', orderData);

      // Create order without payment (PENDING status)
      const response = await api.orders.create(orderData);
      
      if (response.success) {
        const { order } = response.data;
        console.log('Order created without payment:', order);
        
        // Clear cart after successful order
        clearCart();
        
        // Show success message and redirect
        alert('Захиалга амжилттай үүслээ! Захиалгын жагсаалт руу орох уу?');
        
        // Redirect to account orders page
        router.push('/account_orders');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Захиалга үүсгэхэд алдаа гарлаа: ' + (error.message || 'Алдаа гарлаа'));
    } finally {
      setIsProcessingPayment(false);
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
          
          // If payment is completed, stop monitoring
          if (newStatus === 'COMPLETED') {
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval);
              setStatusCheckInterval(null);
            }
            setPaymentStatus('COMPLETED');
              
              // Ask if user wants to go to orders page
              if (confirm('Төлбөр амжилттай! Захиалга хуудас руу очих уу?')) {
                router.push('/account_orders');
              }
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
            
            // If payment is completed, stop monitoring
            if (newStatus === 'COMPLETED') {
              if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
                setStatusCheckInterval(null);
              }
              setPaymentStatus('COMPLETED');
              
              // Ask if user wants to go to orders page
              if (confirm('Төлбөр амжилттай! Захиалга хуудас руу очих уу?')) {
                router.push('/account_orders');
              }
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


  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="checkout-form">
        <div className="billing-info__wrapper">
          <h4>ХАЯГИЙН МЭДЭЭЛЭЛ</h4>
          
          {/* Address Selection Buttons */}
          <div className="address-selection__wrapper mb-4">
            {/* Current Selection Indicator */}
            {addressMode === 'existing' && hasSelectedExistingAddress && (
              <div className={`alert mb-3 ${justSavedAddress ? 'alert-success' : 'alert-info'}`}>
                <i className={`me-2 ${justSavedAddress ? 'fas fa-check-circle' : 'fas fa-map-marker-alt'}`}></i>
                <strong>
                  {justSavedAddress ? 'Шинээр хадгалсан хаяг:' : 'Сонгосон хаяг:'}
                </strong> {selectedAddress?.addressLine1}, {selectedAddress?.city}
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
                {!session?.user && (
                  <small className="text-muted d-block mt-1">Нэвтэрсэн хэрэглэгч л ашиглах боломжтой</small>
                )}
                {session?.user && addresses.length === 0 && (
                  <small className="text-muted d-block mt-1">Хадгалсан хаяг байхгүй байна</small>
                )}
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
                  placeholder="Нэмэлт мэдээлэл (Хаягийн талаар өөр бусад мэдээлэл оруулах боломжтой)"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                />
                <label htmlFor="checkout_street_address_2">Нэмэлт мэдээлэл (Хаягийн талаар өөр бусад мэдээлэл оруулах боломжтой)</label>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-floating my-3">
                <div className={`form-label-fixed hover-container ${
                  showProvinceDropdown ? "js-content_visible" : ""
                }`}>
                  <label htmlFor="checkout_city" className="form-label">
                    Аймаг / Хот *
                  </label>
                  <div className="js-hover__open">
                    <input
                      type="text"
                      className="form-control form-control-lg search-field__actor search-field__arrow-down"
                      id="checkout_city"
                      value={formData.city}
                      readOnly
                      placeholder="Аймаг эсвэл хот сонгоно уу..."
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
                        {mongolianProvinces
                          .filter((province) =>
                            province.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((province, i) => (
                            <li
                              onClick={() => {
                                setFormData({...formData, city: province});
                                setShowProvinceDropdown(false);
                                setSearchQuery("");
                              }}
                              key={i}
                              className="search-suggestion__item js-search-select"
                              style={{ cursor: 'pointer', padding: '8px 12px' }}
                            >
                              {province}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
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
                <label htmlFor="checkout_zipcode">Шуудангийн код *</label>
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
                      <td>${elm.price * elm.quantity}</td>
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
                    <td>${totalPrice && 19}</td>
                    {/* <td>Үнэгүй</td> */}
                  </tr>
                  {/* <tr>
                    <th>НӨАТ</th>
                    <td>${totalPrice && 19}</td>
                  </tr> */}
                  <tr>
                    <th>НИЙТ ДҮН</th>
                    <td>${totalPrice && totalPrice + 19}</td>
                  </tr>
                </tbody>
              </table>
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
                   <i className="fas fa-map-marker-alt fa-2x mb-3" style={{ color: '#495D35' }}></i>
                   <div>Хадгалсан хаяг байхгүй байна</div>
                   <small>Шинэ хаяг нэмэхийн тулд дээрх талбаруудыг бөглөнө үү</small>
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
                       province: selectedAddress.province || "",
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
                  onClick={handlePaymentCancel}
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

                {/* QR Code Section */}
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
                    <ul className="mb-0">
                      <li>QR кодыг уншуулж төлбөр хийх</li>
                      <li>Төлбөр хийсний дараа статус автоматаар шинэчлэгдэнэ</li>
                      <li>Асуудал гарвал "Статус шалгах" товчийг дарна уу</li>
                    </ul>
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
                    
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: '#f7f3d7',
                        borderColor: '#927238',
                        color: '#927238',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f0e8c7';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f7f3d7';
                      }}
                      onClick={handlePaymentCancel}
                    >
                      <i className="fas fa-ban me-2"></i>
                      Төлбөр цуцлах
                    </button>
                    
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: '#e2e3e5',
                        borderColor: '#6c757d',
                        color: '#6c757d',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#d1d3d4';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#e2e3e5';
                      }}
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentData(null);
                        if (statusCheckInterval) {
                          clearInterval(statusCheckInterval);
                          setStatusCheckInterval(null);
                        }
                        router.push('/account_orders');
                      }}
                    >
                      <i className="fas fa-clock me-2"></i>
                      Дараа төлөх
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
         onClick={handlePaymentCancel}
       ></div>
     )}


     </>
   );
 }
