"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";

function StarIcon({ filled, onClick }) {
  return filled ? (
    <svg onClick={onClick} className="review-star" viewBox="0 0 9 9">
      <use href="#icon_star" />
    </svg>
  ) : (
    <svg
      onClick={onClick}
      className="star-rating__star-icon"
      width="12"
      height="12"
      fill="#ccc"
      viewBox="0 0 12 12"
    >
      <path d="M11.1429 5.04687C11.1429 4.84598 10.9286 4.76562 10.7679 4.73884L7.40625 4.25L5.89955 1.20312C5.83929 1.07589 5.72545 0.928571 5.57143 0.928571C5.41741 0.928571 5.30357 1.07589 5.2433 1.20312L3.73661 4.25L0.375 4.73884C0.207589 4.76562 0 4.84598 0 5.04687C0 5.16741 0.0870536 5.28125 0.167411 5.3683L2.60491 7.73884L2.02902 11.0871C2.02232 11.1339 2.01563 11.1741 2.01563 11.221C2.01563 11.3951 2.10268 11.5558 2.29688 11.5558C2.39063 11.5558 2.47768 11.5223 2.56473 11.4754L5.57143 9.89509L8.57813 11.4754C8.65848 11.5223 8.75223 11.5558 8.84598 11.5558C9.04018 11.5558 9.12054 11.3951 9.12054 11.221C9.12054 11.1741 9.12054 11.1339 9.11384 11.0871L8.53795 7.73884L10.9688 5.3683C11.0558 5.28125 11.1429 5.16741 11.1429 5.04687Z" />
    </svg>
  );
}

export default function Reviews({ productId, productName }) {
  const [reviews, setReviews] = useState([]);         // бусдын + миний review бүгд
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [me, setMe] = useState(null);                 // нэвтэрсэн хэрэглэгч
  const [authChecked, setAuthChecked] = useState(false);

  // form state
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  // миний review байгаа эсэх
  const myExistingReview = useMemo(() => {
    if (!me) return null;
    // бэкендээс ирэх review item хэлбэр: { userId, rating, review, createdAt, ... }
    return reviews.find((r) => r.userId === me.id);
  }, [me, reviews]);

  // профайл (нэвтэрсэн эсэх) шалгах
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.user.getProfile(); // {data:{...}} / {...}
        if (!mounted) return;
        const user = res?.data ?? res; // аль хэлбэр ч бай, user обьект гаргаж ав
        setMe({
          id: user?.id || user?.user?.id,
          name: user?.name || user?.user?.name,
          email: user?.email || user?.user?.email,
          avatar: user?.avatar || null,
        });
      } catch {
        // 401 бол нэвтрээгүй
        setMe(null);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // product reviews татах
  const loadReviews = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await api.reviews.getForProduct(productId, { page: 1, limit: 20 });
      // Backend-ээс ямар structure ирдэг вэ?
      // { data: { reviews: [...], pagination: {...} } } эсвэл { reviews: [...] }
      const list = res?.data?.reviews ?? res?.reviews ?? [];
      setReviews(list);
    } catch (e) {
      setLoadErr(e.message || "Сэтгэгдэл ачааллахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!me) return;              // хамгаалалт
    if (myExistingReview) return; // edit боломжгүй: байгаа тохиолдолд return

    setSubmitting(true);
    setSubmitErr("");
    try {
      await api.reviews.addOrUpdate(productId, {
        rating: myRating,
        review: myText,
      });
      // амжилттай бол дахин ачаагаад form-ыг reset
      await loadReviews();
      setMyRating(0);
      setMyText("");
    } catch (err) {
      setSubmitErr(err.message || "Үнэлгээ илгээх үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="product-single__reviews-title">Reviews</h2>

      {/* Reviews list */}
      <div className="product-single__reviews-list">
        {loading ? (
          <div className="text-secondary">Уншиж байна…</div>
        ) : loadErr ? (
          <div className="text-danger">{loadErr}</div>
        ) : reviews.length === 0 ? (
          <div className="text-secondary">Одоогоор сэтгэгдэл алга.</div>
        ) : (
          reviews.map((elm, i) => {
            const stars = Math.max(0, Math.min(5, Number(elm.rating || 0)));
            const name = elm.user?.name || elm.userName || "Anonymous";
            const avatar =
              elm.user?.avatar ||
              "/assets/images/avatar.jpg"; // fallback
            const createdAt = elm.createdAt
              ? new Date(elm.createdAt).toLocaleDateString()
              : "";
            return (
              <div key={i} className="product-single__reviews-item">
                <div className="customer-avatar">
                  <Image
                    loading="lazy"
                    width={80}
                    height={80}
                    src={avatar}
                    alt={name}
                  />
                </div>
                <div className="customer-review">
                  <div className="customer-name">
                    <h6>{name}</h6>
                    <div className="reviews-group d-flex">
                      {Array.from({ length: stars }).map((_, idx) => (
                        <svg key={idx} className="review-star" viewBox="0 0 9 9">
                          <use href="#icon_star" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="review-date">{createdAt}</div>
                  <div className="review-text">
                    <p>{elm.review || ""}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review form / messages */}
      <div className="product-single__review-form">
        {!authChecked ? (
          <div className="text-secondary">Шалгаж байна…</div>
        ) : !me ? (
          // Нэвтрээгүй хэрэглэгчид
          <div className="alert alert-warning">
            Та нэвтэрч орж байж үнэлгээ өгнө үү.
          </div>
        ) : myExistingReview ? (
          // Нэвтэрсэн ба аль хэдийн review өгсөн → edit хийхгүй, form нууж мэдэгдэл
          <div className="alert alert-info">
            Та энэ бараанд аль хэдийн үнэлгээ өгсөн байна. (Засах боломжгүй)
          </div>
        ) : (
          // Нэвтэрсэн ба review өгөөгүй → form-оо харуулна
          <form onSubmit={handleSubmit}>
            <h5>
              Be the first to review{productName ? ` “${productName}”` : "" }
            </h5>
            <p>Your email address will not be published. Required fields are marked *</p>

            <div className="select-star-rating mb-3">
              <label className="me-2">Your rating *</label>
              <span className="star-rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <React.Fragment key={index}>
                    <StarIcon
                      filled={myRating >= index + 1}
                      onClick={() => setMyRating(index + 1)}
                    />
                  </React.Fragment>
                ))}
              </span>
            </div>

            <div className="mb-4">
              <textarea
                className="form-control form-control_gray"
                placeholder="Your Review"
                cols={30}
                rows={6}
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
              />
            </div>

            {/* ✅ Нэвтэрсэн тул name/email авах шаардлагагүй — form-оос хассан */}

            {submitErr && <div className="text-danger mb-2">{submitErr}</div>}

            <div className="form-action">
              <button type="submit" className="btn btn-primary" disabled={submitting || myRating === 0}>
                {submitting ? "Илгээж байна…" : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
