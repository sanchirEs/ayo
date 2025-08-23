// app/product1_simple/[id]/page.jsx
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import RelatedSlider from "@/components/singleProduct/RelatedSlider";
import SingleProduct12 from "@/components/singleProduct/SingleProduct12";
import api from "@/lib/api"; // <-- import your client

export default async function ProductDetailsPage1({ params }) {
  const { id } = params;

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
      <Header1 />
      <main className="page-wrapper">
        <div className="mb-md-1 pb-md-3" />
        {product ? (
          <SingleProduct12 product={product} />
        ) : (
          <div className="container text-danger">Product not found.</div>
        )}
        <RelatedSlider currentProduct={product} />
      </main>
      <Footer1 />
    </>
  );
}
