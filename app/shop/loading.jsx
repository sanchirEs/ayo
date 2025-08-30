export default function ShopLoading() {
  return (
    <div className="shop-loading">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <div className="loading-text">
        <p>Дэлгүүрийн мэдээлэл ачаалж байна...</p>
      </div>
    </div>
  );
}
