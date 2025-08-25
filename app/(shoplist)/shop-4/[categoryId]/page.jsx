import Shop4 from "@/components/shoplist/Shop4";

export const metadata = {
  title: "Shop 4 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};

export default async function ShopPage4WithCategory({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categoryId = parseInt(resolvedParams.categoryId);
  
  // URL: /category/123?page=2&limit=12&sort=price-asc
  const page = Number(resolvedSearchParams.page || 1);
  const limit = Number(resolvedSearchParams.limit || 12);
  const sort = String(resolvedSearchParams.sort || "newest");
  
  return (
    <>
      <Shop4 
        categoryId={categoryId}
        initialPage={page}
        initialLimit={limit}
        initialSort={sort}
      />
      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
