"use client";

import { useState } from "react";
import { sortingOptions } from "@/data/products/productCategories";
import { openModalShopFilter } from "@/utlis/aside";

export default function MobileFilterFooter({ 
  currentSort, 
  onSortChange, 
  totalActiveFilters = 0 
}) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <div className="mobile-filter-footer d-lg-none">
      {/* Fixed bottom footer for mobile */}
      <div 
        className="position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg"
        style={{ 
          zIndex: 1000,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        {/* Filter Button */}
        <button
          className="btn d-flex align-items-center justify-content-center flex-1"
          onClick={openModalShopFilter}
          style={{
            backgroundColor: '#495D35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#3a4a2a';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#495D35';
          }}
        >
          {/* Filter Icon */}
          <svg 
            className="me-2" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M22 3H2l8 9.46V19l4-2v-8.54L22 3z"/>
          </svg>
          ШҮҮЛТ
          {/* Active filters badge */}
          {totalActiveFilters > 0 && (
            <span 
              className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '10px',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translate(50%, -50%)'
              }}
            >
              {totalActiveFilters}
            </span>
          )}
        </button>

        {/* Sort Button */}
        <div className="position-relative flex-1">
          <button
            className="btn w-100 d-flex align-items-center justify-content-center"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            style={{
              backgroundColor: 'white',
              color: '#495D35',
              border: '2px solid #495D35',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
            // onMouseEnter={(e) => {
            //   e.target.style.backgroundColor = '#495D35';
            //   e.target.style.color = 'white';
            // }}
            // onMouseLeave={(e) => {
            //   e.target.style.backgroundColor = 'white';
            //   e.target.style.color = '#495D35';
            // }}
          >
            {/* Sort Icon */}
            <svg 
              className="me-2" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M3 6h18M7 12h10M10 18h4"/>
            </svg>
            ЭРЭМБЭЛЭХ
            {/* Dropdown Arrow */}
            <svg 
              className={`ms-2 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} 
              width="12" 
              height="12" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Sort Dropdown */}
          {showSortDropdown && (
            <div 
              className="position-absolute bottom-100 start-0 end-0 mb-2 bg-white border rounded shadow-lg"
              style={{ 
                zIndex: 1001,
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {sortingOptions.map((option, index) => (
                <button
                  key={index}
                  className="btn btn-link text-decoration-none w-100 text-start"
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  style={{ 
                    border: 'none',
                    borderBottom: index < sortingOptions.length - 1 ? '1px solid #f8f9fa' : 'none',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: currentSort === option.value ? '#495D35' : '#6c757d',
                    backgroundColor: currentSort === option.value ? '#f8f9fa' : 'transparent',
                    fontWeight: currentSort === option.value ? '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentSort !== option.value) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentSort !== option.value) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed footer */}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
