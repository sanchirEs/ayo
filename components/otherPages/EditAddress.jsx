"use client";

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

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { api } from "@/lib/api";

export default function EditAddress() {
  const { data: session } = useSession();
  const { addresses, loading, error, createAddress, updateAddress, deleteAddress } = useUserAddresses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
    mobile: "",
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegionTypeDropdown, setShowRegionTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");




  const resetForm = () => {
    setFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "",
      mobile: "",
      isDefault: false
    });
    setShowRegionTypeDropdown(false);
    setShowLocationDropdown(false);
    setSearchQuery("");
  };

  const handleAddNew = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setFormData({
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      mobile: address.mobile || "",
      isDefault: address.isDefault || false
    });
    setShowEditModal(true);
  };

  const handleDelete = (address) => {
    setSelectedAddress(address);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.addressLine1 || !formData.city || !formData.country || !formData.mobile) {
      alert('Бүх заавал оруулах талбаруудыг бөглөнө үү!');
      setIsSubmitting(false);
      return;
    }   
    
    // Create a new object maintaining our location structure // Create a new object with country set to Mongolia
    const submitData = {
      ...formData,
    };

    // console.log("submitData", submitData);
    try {
      if (showEditModal && selectedAddress) {
        await updateAddress(selectedAddress.id, submitData);
      } else {
        await createAddress(submitData);
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Хаяг хадгалахад алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAddress) return;

    setIsSubmitting(true);
    try {
      await deleteAddress(selectedAddress.id);
      // Close modal and reset state
      setShowDeleteModal(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Хаяг устгахад алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
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
    <div className="col-lg-9 mb-5 mb-md-0">
      <style jsx>{`
        @media (max-width: 768px) {
          .modal {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .modal-dialog {
            margin: 0 !important;
            max-height: 95vh !important;
            width: 95% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            position: fixed !important;
            top: 50% !important;
          }
          .modal-content {
            max-height: 95vh !important;
            margin: 0 !important;
            border-radius: 8px !important;
          }
          .modal-body {
            max-height: 70vh !important;
            overflow-y: auto !important;
            padding: 0.75rem !important;
            min-height: 300px !important;
          }
          .modal-header {
            padding: 0.75rem !important;
            flex-shrink: 0;
            border-bottom: 1px solid #dee2e6 !important;
          }
          .modal-footer {
            padding: 0.75rem !important;
            flex-shrink: 0;
            border-top: 1px solid #dee2e6 !important;
          }
          .form-control {
            font-size: 16px !important;
          }
          .btn {
            font-size: 14px !important;
            padding: 0.5rem 1rem !important;
          }
          .modal-backdrop {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}</style>
      <div className="page-content my-account__address" >
        <div className="d-flex justify-content-between align-items-center mb-3 mb-md-0">
          <h4 className="mb-0">Миний хаягууд</h4>
          <button 
            className="btn btn-primary"
            style={{backgroundColor: "#495D35"}}
            onClick={handleAddNew}
          >
            + Шинэ хаяг нэмэх
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            Алдаа гарлаа: {error}
          </div>
        )}

        {addresses && addresses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="page-content my-account__orders-list d-none d-md-block">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Хаяг</th>
                    <th>Аймаг/Дүүрэг</th>
                    <th>Утас</th>
                    <th>Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.map((address, index) => (
                    <tr key={address.id}>
                      <td>#{address.id}</td>
                      <td>
                        <div>
                          <strong>{address.addressLine1}</strong>
                          {address.addressLine2 && (
                            <div className="text-muted">{address.addressLine2}</div>
                          )}
                        </div>
                      </td>
                      <td>{address.country || address.city}</td>
                      <td>{address.mobile}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            style={{backgroundColor: "#495D35"}}
                            onClick={() => handleEdit(address)}
                            title="Засах"
                          >
                            <svg width="16" height="16" style={{color: "#fff"}} fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            style={{border: "1px solid #495D35"}}
                            onClick={() => handleDelete(address)}
                            title="Устгах"
                          >
                            <svg width="16" height="16" style={{color: "#495D35"}} fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="d-block d-md-none">
              <div className="row g-3">
                {addresses.map((address, index) => (
                  <div key={address.id} className="col-12">
                    <div className="card h-100" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0" style={{ color: '#495D35' }}>
                            Хаяг #{address.id}
                          </h6>
                          {address.isDefault && (
                            <span className="badge" style={{ backgroundColor: '#495D35', color: 'white', fontSize: '0.7rem' }}>
                              Үндсэн
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-2">
                          <strong className="text-dark">{address.addressLine1}</strong>
                          {address.addressLine2 && (
                            <div className="text-muted small mt-1">{address.addressLine2}</div>
                          )}
                        </div>
                        
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted">Байршил:</small>
                            <div className="fw-medium">{address.country || address.city}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Утас:</small>
                            <div className="fw-medium">{address.mobile}</div>
                          </div>
                        </div>
                        
                        {address.postalCode && (
                          <div className="mb-2">
                            <small className="text-muted">Шуудангийн код:</small>
                            <div className="fw-medium">{address.postalCode}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer bg-transparent border-0 p-3">
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm flex-fill"
                            style={{ 
                              backgroundColor: "#495D35", 
                              color: "white",
                              border: "none"
                            }}
                            onClick={() => handleEdit(address)}
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                            Засах
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm flex-fill"
                            style={{ 
                              backgroundColor: "transparent", 
                              color: "#495D35",
                              border: "1px solid #495D35"
                            }}
                            onClick={() => handleDelete(address)}
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                            Устгах
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <div className="mb-3">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h5 className="text-muted">Хаяг байхгүй байна</h5>
            <p className="text-muted">Захиалга хийхийн тулд хаяг нэмнэ үү</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              + Шинэ хаяг нэмэх
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div 
            className="modal-dialog modal-lg modal-dialog-scrollable" 
            style={{ 
              maxHeight: '90vh',
              margin: '10px auto',
              width: '95%'
            }}
          >
            <div 
              className="modal-content" 
              style={{ 
                maxHeight: '90vh'
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  {showEditModal ? 'Хаяг засах' : 'Шинэ хаяг нэмэх'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem', minHeight: '300px' }}>


                                 <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Бүс нутаг *</label>
                       <div className={`form-label-fixed hover-container ${
                         showRegionTypeDropdown ? "js-content_visible" : ""
                       }`}>
                         <div className="js-hover__open">
                           <input
                             type="text"
                             className="form-control search-field__actor search-field__arrow-down"
                             value={formData.city}
                             readOnly
                             placeholder="Улаанбаатар эсвэл хөдөө орон нутаг"
                             onClick={() => setShowRegionTypeDropdown((prev) => !prev)}
                             required
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
                                     setShowLocationDropdown(false);
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
                     
                     {/* Specific Location Selection */}
                     {formData.city && (
                       <div className="col-md-6 mb-3">
                         <label className="form-label">
                           {formData.city === "Улаанбаатар" ? "Дүүрэг *" : "Аймаг *"}
                         </label>
                         <div className={`form-label-fixed hover-container ${
                           showLocationDropdown ? "js-content_visible" : ""
                         }`}>
                           <div className="js-hover__open">
                             <input
                               type="text"
                               className="form-control search-field__actor search-field__arrow-down"
                               value={formData.country}
                               readOnly
                               placeholder={formData.city === "Улаанбаатар" ? "Дүүрэг сонгоно уу..." : "Аймаг сонгоно уу..."}
                               onClick={() => setShowLocationDropdown((prev) => !prev)}
                               required
                             />
                           </div>
                           {showLocationDropdown && (
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
                                         setShowLocationDropdown(false);
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
                     )}
                   </div>

                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Утасны дугаар *</label>
                       <input
                         type="tel"
                         className="form-control"
                         value={formData.mobile}
                         onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                         required
                       />
                     </div>               
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Шуудангийн код</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.postalCode}
                         onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                       />
                     </div>
                     {/* <div className="col-md-6 mb-3">
                       <label className="form-label">Улс *</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.country}
                         onChange={(e) => setFormData({...formData, country: e.target.value})}
                         required
                       />
                     </div> */}
                   </div>
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Хаяг *</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.addressLine1}
                         onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                         required
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Нэмэлт мэдээлэл</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.addressLine2}
                         onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                       />
                     </div>
                   </div>

        
            
                 </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn"
                    style={{border: "1px solid #495D35"}}
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    Цуцлах
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{backgroundColor: "#495D35"}}
                  >
                    {isSubmitting ? 'Хадгалж байна...' : (showEditModal ? 'Хадгалах' : 'Нэмэх')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Хаяг устгах</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Та энэ хаягийг устгахдаа итгэлтэй байна уу?</p>
                {/* {selectedAddress && (
                  <div className="alert alert-info">
                    <strong>{selectedAddress.firstName} {selectedAddress.lastName}</strong><br/>
                    {selectedAddress.address}
                  </div>
                )} */}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Цуцлах
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Устгаж байна...' : 'Устгах'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showAddModal || showEditModal || showDeleteModal) && (
        <div 
          className="modal-backdrop fade show"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setShowDeleteModal(false);
            resetForm();
          }}
        ></div>
      )}
    </div>
  );
}
