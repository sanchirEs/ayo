export default function CategoryLoading() {
  return (
    <div className="category-loading">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <div className="loading-text">
        <p>Ангиллын бүтээгдэхүүнүүд ачаалж байна...</p>
      </div>
    </div>
  );
}
