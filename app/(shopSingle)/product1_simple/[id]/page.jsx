// app/product1_simple/[id]/page.jsx
import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct12 from "@/components/singleProduct/SingleProduct12";
import api from "@/lib/api"; // <-- import your client

export default async function ProductDetailsPage1({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // Validate id parameter
  if (!id || isNaN(Number(id))) {
    return (
      <div className="container text-center py-5">
        <h2 className="text-danger">Бүтээгдэхүүн олдсонгүй</h2>
        <p className="text-muted">Хүсэлтэнд алдаа гарлаа.</p>
      </div>
    );
  }

  console.log("id: ", id)

  let product = null;
  try {
    const res = await api.products.getDetail(id); // GET /api/v1/products/:id
    // depending on your backend shape:
    product = res?.data ?? res; // if your BE returns { data: {...} }
    console.log("product: ", product)
  } catch (e) {
    // optional: log/handle
    console.error("Failed to load product:", e);
  }

  return (
    <>
      <div className="mb-md-1 pb-md-3" />
      {product ? (
        <SingleProduct12 product={product} />
      ) : (
        <div className="container text-center py-5">
          <h2 className="text-danger">Бүтээгдэхүүн олдсонгүй</h2>
          <p className="text-muted">Уучлаарай, хүссэн бүтээгдэхүүн олдсонгүй.</p>
        </div>
      )}
      <RelatedSlider currentProduct={product} />
    </>
  );
}
