"use client";

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

    // Create a new object with country set to Mongolia
    const submitData = {
      ...formData,
      country: "Mongolia"
    };

    console.log("submitData", submitData);
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
    <div className="col-lg-9">
      <div className="page-content my-account__address">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Миний хаягууд</h4>
          <button 
            className="btn btn-primary"
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
          <div className="page-content my-account__orders-list">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Хаяг</th>
                  <th>Хот</th>
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
                    <td>{address.city}</td>
                    {/* <td>{address.country}</td> */}
                    <td>{address.mobile}</td>
                   
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(address)}
                          title="Засах"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(address)}
                          title="Устгах"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
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
                                 <div className="modal-body">
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Хаяг 1 *</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.addressLine1}
                         onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                         required
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Хаяг 2</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.addressLine2}
                         onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                       />
                     </div>
                   </div>
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <label className="form-label">Хот *</label>
                       <input
                         type="text"
                         className="form-control"
                         value={formData.city}
                         onChange={(e) => setFormData({...formData, city: e.target.value})}
                         required
                       />
                     </div>
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
                   </div>
                   <div className="row">
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
                 
                 </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
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
