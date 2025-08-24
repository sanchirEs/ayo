import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";

import Shop4 from "@/components/shoplist/Shop4";

export const metadata = {
  title: "Shop 4 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage4() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Shop4 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
