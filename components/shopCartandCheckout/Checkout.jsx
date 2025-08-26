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
import { useState } from "react";
import Link from "next/link";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useSession } from "next-auth/react";
import api from "@/lib/api";

export default function Checkout() {
  const { cartProducts, totalPrice } = useContextElement();
  const { data: session, status } = useSession();
  const { addresses, loading: addressesLoading, createAddress, updateAddress } = useUserAddresses();
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
  const [paymentData, setPaymentData] = useState(null);
  
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
                  className={`btn w-100 ${
                    addressMode === 'existing' 
                      ? 'btn-primary' 
                      : 'btn-outline-primary'
                  }`}
                  onClick={() => setShowAddressModal(true)}
                  disabled={!session?.user || addresses.length === 0}
                >
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Өмнө оруулсан хаягаасаа сонгох
                  {addresses.length > 0 && (
                    <span className={`badge ms-2 ${
                      addressMode === 'existing' ? 'bg-light text-primary' : 'bg-primary'
                    }`}>{addresses.length}</span>
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
                  className={`btn w-100 ${
                    addressMode === 'new' 
                      ? 'btn-primary' 
                      : 'btn-outline-primary'
                  }`}
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
                  className="btn btn-primary btn-checkout mt-3"
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
              <h3>Таны захиалга</h3>
              <table className="checkout-cart-items">
                <thead>
                  <tr>
                    <th>БҮТЭЭГДЭХҮҮН</th>
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
              <h4 className="mb-3">Төлбөрийн нөхцөл</h4>
              
              <div className="payment-options">
                <div className="form-check payment-option mb-3 p-3 border rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <label
                    className="form-check-label d-flex align-items-center w-100"
                    htmlFor="checkout_payment_method_1"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="payment-icon me-3 d-flex align-items-center justify-content-center" style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <i className="fas fa-university fa-2x text-primary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">Дансаар шилжүүлэх</div>
                      <small className="text-muted">Банкны данс руу төлбөр хийх</small>
                    </div>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_1"
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
                  backgroundColor: '#f8f9fa',
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
                      border: '1px solid #dee2e6'
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
                      <i className="fas fa-qrcode fa-2x text-primary" style={{ display: 'none' }}></i>
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
                      checked={selectedPaymentMethod === 'QPAY_QR'}
                      onChange={() => setSelectedPaymentMethod('QPAY_QR')}
                      style={{ 
                        marginLeft: '10px',
                        transform: 'scale(1.2)'
                      }}
                    />
                  </label>
                </div>

                <div className="form-check payment-option mb-3 p-3 border rounded" style={{ 
                  backgroundColor: '#f8f9fa',
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
                      border: '1px solid #dee2e6'
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
                      <i className="fas fa-wallet fa-2x text-primary" style={{ display: 'none' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">Pocket</div>
                      <small className="text-muted">Pocket-аар төлбөр хийх</small>
                    </div>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="checkout_payment_method"
                      id="checkout_payment_method_3"
                      checked={selectedPaymentMethod === 'STOREPAY'}
                      onChange={() => setSelectedPaymentMethod('STOREPAY')}
                      style={{ 
                        marginLeft: '10px',
                        transform: 'scale(1.2)'
                      }}
                    />
                  </label>
                </div>

                <div className="form-check payment-option mb-3 p-3 border rounded" style={{ 
                  backgroundColor: '#f8f9fa',
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
                      border: '1px solid #dee2e6'
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
                      <i className="fas fa-credit-card fa-2x text-primary" style={{ display: 'none' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">Storepay</div>
                      <small className="text-muted">Storepay-аар төлбөр хийх</small>
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
            <button 
              className="btn btn-primary btn-checkout"
              disabled={isProcessingPayment}
              onClick={async () => {
                try {
                  setIsProcessingPayment(true);
                  
                  // Validate required fields
                  if (!formData.addressLine1 || !formData.city || !formData.phone) {
                    alert('Бүх заавал оруулах талбаруудыг бөглөнө үү!');
                    return;
                  }

                  // Create order with payment
                  const orderData = {
                    items: cartProducts.map(item => ({
                      productId: item.id,
                      quantity: item.quantity
                    })),
                    provider: selectedPaymentMethod === 'QPAY_QR' ? 'QPAY' : 
                             selectedPaymentMethod === 'STOREPAY' ? 'STOREPAY' : 'QPAY',
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

                  // First create order, then handle payment separately
                  const orderResponse = await api.orders.createSimple({
                    items: orderData.items,
                    shippingAddress: orderData.shippingAddress
                  });
                  
                  console.log('Order creation response:', orderResponse);
                  
                  if (orderResponse.success) {
                    // Now create payment for the order
                    try {
                      const paymentResponse = await api.payments.create({
                        orderId: orderResponse.data.order.id,
                        provider: orderData.provider
                      });
                      
                      console.log('Payment creation response:', paymentResponse);
                      
                      if (paymentResponse.success) {
                        setPaymentData(paymentResponse.data);
                        
                        // Handle different payment methods
                        if (selectedPaymentMethod === 'QPAY_QR' && paymentResponse.data.qrImage) {
                          // Show QR code modal
                          alert('QR код амжилттай үүслээ! QR кодыг уншуулж төлбөр хийгнэ үү.');
                          console.log('QR Image:', paymentResponse.data.qrImage);
                        } else if (paymentResponse.data.paymentUrl) {
                          // Redirect to payment URL
                          window.open(paymentResponse.data.paymentUrl, '_blank');
                        }
                        
                        alert('Захиалга амжилттай үүслээ! Төлбөр хийх хуудас руу шилжиж байна.');
                      }
                    } catch (paymentError) {
                      console.error('Payment creation error:', paymentError);
                      alert('Захиалга үүслээ, гэхдээ төлбөр үүсгэхэд алдаа гарлаа: ' + paymentError.message);
                    }
                  }
                } catch (error) {
                  console.error('Payment error details:', {
                    message: error.message,
                    status: error.status,
                    response: error.response,
                    stack: error.stack
                  });
                  alert('Алдаа гарлаа: ' + (error.message || 'Төлбөр хийхэд алдаа гарлаа'));
                } finally {
                  setIsProcessingPayment(false);
                }
              }}
            >
              {isProcessingPayment ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Төлбөр хийж байна...
                </>
              ) : (
                'ЗАХИАЛГА ХИЙХ'
              )}
            </button>
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
             <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
               <h5 className="modal-title">Хаяг сонгох</h5>
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
                       className={`address-item p-3 border rounded mb-2 cursor-pointer transition-all ${
                         selectedAddress?.id === address.id ? 'border-primary' : 'border-light'
                       }`}
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
                   <i className="fas fa-map-marker-alt fa-2x mb-3 text-muted"></i>
                   <div>Хадгалсан хаяг байхгүй байна</div>
                   <small>Шинэ хаяг нэмэхийн тулд дээрх талбаруудыг бөглөнө үү</small>
                 </div>
               )}
             </div>
             <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
               <button
                 type="button"
                 className="btn btn-secondary"
                 onClick={() => setShowAddressModal(false)}
               >
                 Хаах
               </button>
               {selectedAddress && (
                 <button
                   type="button"
                   className="btn btn-primary"
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

     {/* QR Code Payment Modal */}
     {paymentData && selectedPaymentMethod === 'QPAY_QR' && paymentData.qrImage && (
       <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
         <div className="modal-dialog modal-sm">
           <div className="modal-content">
             <div className="modal-header">
               <h5 className="modal-title">QR Кодоор төлөх</h5>
               <button
                 type="button"
                 className="btn-close"
                 onClick={() => setPaymentData(null)}
               ></button>
             </div>
             <div className="modal-body text-center">
               <div className="mb-3">
                 <strong>Төлбөрийн дүн: {paymentData.amount} {paymentData.currency}</strong>
               </div>
               <div className="mb-3">
                 <img 
                   src={paymentData.qrImage} 
                   alt="QR Code" 
                   style={{ maxWidth: '200px', height: 'auto' }}
                 />
               </div>
               <div className="mb-3">
                 <small className="text-muted">
                   QPay апп-аа нээж QR кодыг уншуулна уу
                 </small>
               </div>
               <div className="d-grid gap-2">
                 <button
                   type="button"
                   className="btn btn-primary"
                   onClick={() => {
                     if (paymentData.paymentUrl) {
                       window.open(paymentData.paymentUrl, '_blank');
                     }
                   }}
                 >
                   Веб хуудас руу орох
                 </button>
                 <button
                   type="button"
                   className="btn btn-outline-secondary"
                   onClick={() => setPaymentData(null)}
                 >
                   Хаах
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* QR Modal Backdrop */}
     {paymentData && selectedPaymentMethod === 'QPAY_QR' && paymentData.qrImage && (
       <div 
         className="modal-backdrop fade show" 
         onClick={() => setPaymentData(null)}
       ></div>
     )}
     </>
   );
 }
