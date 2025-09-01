"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";

/** Жижиг од */
function Star({ filled, onClick }) {
  return filled ? (
    <svg onClick={onClick} className="review-star" viewBox="0 0 9 9" style={{ cursor: 'pointer' }}>
      <use href="#icon_star" />
    </svg>
  ) : (
    <svg onClick={onClick} className="star-rating__star-icon" width="12" height="12" fill="#ccc" viewBox="0 0 12 12" style={{ cursor: 'pointer' }}>
      <path d="M11.1429 5.04687C11.1429 4.84598 10.9286 4.76562 10.7679 4.73884L7.40625 4.25L5.89955 1.20312C5.83929 1.07589 5.72545 0.928571 5.57143 0.928571C5.41741 0.928571 5.30357 1.07589 5.2433 1.20312L3.73661 4.25L0.375 4.73884C0.207589 4.76562 0 4.84598 0 5.04687C0 5.16741 0.0870536 5.28125 0.167411 5.3683L2.60491 7.73884L2.02902 11.0871C2.02232 11.1339 2.01563 11.1741 2.01563 11.221C2.01563 11.3951 2.10268 11.5558 2.29688 11.5558C2.39063 11.5558 2.47768 11.5223 2.56473 11.4754L5.57143 9.89509L8.57813 11.4754C8.65848 11.5223 8.75223 11.5558 8.84598 11.5558C9.04018 11.5558 9.12054 11.3951 9.12054 11.221C9.12054 11.1741 9.12054 11.1339 9.11384 11.0871L8.53795 7.73884L10.9688 5.3683C11.0558 5.28125 11.1429 5.16741 11.1429 5.04687Z" />
    </svg>
  );
}

export default function Reviews({ productId, productName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // form state
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [deleting, setDeleting] = useState(false);

  const onceRef = useRef(false);
  const listRef = useRef(null);
  const [maxH, setMaxH] = useState(null);

  // reviews ачаалсны дараа эхний 2 мөрийн өндрийг хэмжинэ
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".review-item");
    if (!items.length) return;

    let h = 0;
    const visibleCount = Math.min(2, items.length);
    for (let i = 0; i < visibleCount; i++) {
      h += items[i].offsetHeight;
      // мөр хоорондын завсар (gap) бага зэрэг нэмж өгье
      if (i < visibleCount - 1) h += 16; // 16px орчим зай
    }
    // дотоод padding эсвэл margin байж магадгүй тул жаахан "buffer" нэмнэ
    setMaxH(h + 8);
  }, [reviews]);

  const [editing, setEditing] = useState(false);

  const startEdit = () => {
    if (!myExistingReview) return;
    setMyRating(Number(myExistingReview.rating || 0));
    setMyText(myExistingReview.review || "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setMyRating(0);
    setMyText("");
    setSubmitErr("");
  };

  // --- нэвтэрсэн эсэх ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.user.getProfile(); // protected
        if (!mounted) return;
        // backend { success, data: user } хэлбэр → аль алиныг нь дэмжинэ
        const user = res?.data ?? res;
        setMe({
          id: user?.id ?? user?.userId ?? user?.user?.id ?? null,
          name: user?.firstName
            ? `${user.firstName} ${user.lastName ?? ""}`.trim()
            : user?.username || user?.name || user?.email || "Me",
          avatar: user?.image || null,
        });
      } catch {
        setMe(null);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --- бүтээгдэхүүний review-ууд ---
  const loadReviews = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await api.reviews.getForProduct(productId, { page: 1, limit: 20, sortOrder: "desc" });
      console.log("reviews:", reviews)
      // backend: { success, data: [...], pagination }
      const list =
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.reviews) ? res.reviews :
        Array.isArray(res) ? res : [];
      setReviews(list);
    } catch (e) {
      // Authentication required error-ийг харуулахгүй
      if (e.message?.includes('Authentication required') || e.message?.includes('401')) {
        console.log('Authentication required for reviews, but not showing error');
        setReviews([]);
      } else {
        setLoadErr(e.message || "Сэтгэгдэл ачааллахад алдаа гарлаа.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId || onceRef.current) return;
    onceRef.current = true;
    loadReviews();
    // productId өөрчлөгдөж болно гэж үзвэл onceRef-гүй, productId-г dependency-д хий
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // --- миний review байгаа эсэх ---
  const myExistingReview = useMemo(() => {
    if (!me?.id) return null;
    return reviews.find((r) => r.userId === me.id) || null;
  }, [me, reviews]);

  // --- илгээх ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!me) return setSubmitErr("Нэвтэрч орно уу.");
    if (myRating < 1) return setSubmitErr("Оноо заавал өгнө үү.");

    setSubmitting(true);
    setSubmitErr("");
    try {
      await api.reviews.addOrUpdate(productId, {
        rating: myRating,
        review: myText?.trim() || null,
      });
      await loadReviews();
      setEditing(false);
      setMyRating(0);
      setMyText("");
    } catch (err) {
      // Authentication required error-ийг харуулахгүй
      if (err.message?.includes('Authentication required') || err.message?.includes('401')) {
        setSubmitErr("Нэвтэрч орно уу.");
      } else {
        setSubmitErr(err.message || "Үнэлгээ илгээх үед алдаа гарлаа.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- устгах (миний review) ---
  const handleDeleteMine = async () => {
    if (!myExistingReview) return;
    setDeleting(true);
    try {
      await api.reviews.deleteMy(productId);
      await loadReviews();
    } catch (e) {
      // Authentication required error-ийг харуулахгүй
      if (e.message?.includes('Authentication required') || e.message?.includes('401')) {
        console.log('Authentication required for delete, but not showing error');
      } else {
        alert(e.message || "Устгах үед алдаа гарлаа.");
      }
    } finally {
      setDeleting(false);
      setEditing(false)
      setMyRating(0);
      setMyText("");
      setSubmitErr("");
    }
  };

  return (
    <>
      <div className="reviews-header d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-semibold mb-0 text-dark">Хэрэглэгчдийн сэтгэгдэл</h6>
        <div className="reviews-summary">
          <span className="text-muted small">{reviews.length} сэтгэгдэл</span>
        </div>
      </div>

      {/* Reviews list */}
      <div
        ref={listRef}
        className="reviews-list"
        style={
          reviews.length > 2
            ? { 
                maxHeight: maxH || 0, 
                overflowY: "auto",
                scrollbarWidth: 'thin',
                scrollbarColor: '#e9ecef #f8f9fa'
              }
            : undefined
        }
      >
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Уншиж байна...</span>
            </div>
          </div>
        ) : loadErr ? (
          <div className="alert alert-danger small">{loadErr}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted py-3 small">Одоогоор сэтгэгдэл алга.</div>
        ) : (
          reviews.map((r) => {
            const key = r.id ?? `${r.userId}-${r.productId}`;
            const stars = Math.max(0, Math.min(5, Number(r.rating || 0)));
            const name =
              r.user?.firstName
                ? `${r.user.firstName} ${r.user.lastName ?? ""}`.trim()
                : r.userName || `Хэрэглэгч #${r.userId}`;
            const avatar = r.user?.image || "/assets/images/avatar.jpg";
            const createdAt = r.createdAt ? new Date(r.createdAt).toLocaleDateString('mn-MN') : "";

            return (
              <div key={key} className="review-item d-flex gap-3 py-2" style={{
                borderBottom: '1px solid #f0f0f0',
                minHeight: '60px'
              }}>
                <div className="flex-shrink-0">
                  <Image 
                    loading="lazy" 
                    width={40} 
                    height={40} 
                    src={avatar} 
                    alt={name} 
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="mb-0 small fw-medium">{name}</h6>
                    <div className="d-flex align-items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} filled={i < stars} onClick={() => {}} />
                      ))}
                    </div>
                    <small className="text-muted ms-auto">{createdAt}</small>
                  </div>
                  {r.review && (
                    <div className="review-text">
                      <p className="mb-0 small text-muted">{r.review}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {reviews.length > 2 && !loading && !loadErr && (
        <div className="text-center text-muted mt-2 small" style={{ fontSize: '11px' }}>
          Нийт {reviews.length} сэтгэгдэл — илүүг харахдаа доош гүйлгэнэ үү
        </div>
      )}

      {/* My review form / state */}
      <div className="review-form mt-4 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
        {!authChecked ? (
          <div className="text-center text-muted small">Шалгаж байна...</div>
        ) : !me ? (
          <div className="alert alert-warning small py-2">
            Та нэвтэрч орж байж үнэлгээ өгнө үү.{" "}
            <Link href={`/login_register?redirect=${encodeURIComponent(window.location.pathname)}`} className="text-decoration-underline">
              Нэвтрэх
            </Link>
          </div>
        ) : myExistingReview && !editing ? (
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="alert alert-info small mb-0 py-2">
              Та энэ бараанд үнэлгээ өгсөн байна. Саналаа өөрчлөх бол 
              <span className="m-2 text-dark fw-medium" style={{ cursor: 'pointer' }} onClick={startEdit}>
                энд
              </span> дарна уу.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h6 className="fw-semibold mb-2">
              {editing ? (
                "Өөрийн үнэлгээг шинэчлэх"
              ) : (
                `"${productName || 'Бараа'}"-д анхны үнэлгээг өгөх`
              )}
            </h6>

            <div className="select-star-rating mb-3">
              <label className="me-2 small fw-medium">Таны үнэлгээ *</label>
              <span className="star-rating d-inline-flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={myRating >= i + 1} onClick={() => setMyRating(i + 1)} />
                ))}
              </span>
            </div>

            <div className="mb-3">
              <textarea
                className="form-control form-control-sm"
                placeholder="Таны сэтгэгдэл (сонгох боломжтой)"
                rows={3}
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
                style={{ fontSize: '14px' }}
              />
            </div>

            {submitErr && <div className="text-danger small mb-2">{submitErr}</div>}

            <div className="d-flex flex-column flex-sm-row gap-2">
              <button type="submit" className="btn btn-primary btn-sm flex-fill" style={{backgroundColor:"#495D35"}} disabled={submitting || myRating === 0}>
                {submitting ? (editing ? "Шинэчилж байна..." : "Илгээж байна...") : (editing ? "Шинэчлэх" : "Илгээх")}
              </button>
              {editing && (
                <button type="button" className="btn btn-outline-secondary btn-sm flex-fill" onClick={cancelEdit} disabled={submitting}>
                  Болих
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}
