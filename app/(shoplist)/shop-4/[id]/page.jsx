import Footer1 from "@/components/footers/Footer1";

import Header1 from "@/components/headers/Header1";

import Shop4 from "@/components/shoplist/Shop4";

export const metadata = {
  title: "Shop 4 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage4({ params, searchParams }) {
    const { id } = params;
  // URL: /category/123?page=2&limit=12&sort=price-asc
  const page = Number(searchParams.page || 1);
  const limit = Number(searchParams.limit || 12);
  const sort = String(searchParams.sort || "newest");
  return (
    <>
      <Header1 />
      <main className="page-wrapper">
           <Shop4
          categoryId={Number(id)}
          initialPage={page}
          initialLimit={limit}
          initialSort={sort}
        />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
