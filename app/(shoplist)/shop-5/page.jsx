import Footer1 from "@/components/footers/Footer1";

import Header14 from "@/components/headers/Header14";

import Shop5 from "@/components/shoplist/Shop5";

export const metadata = {
  title: "Shop 5 || Uomo eCommerce React Nextjs Template",
  description: "Uomo eCommerce React Nextjs Template",
};
export default function ShopPage5() {
  return (
    <>
              <Header14 />
      <main className="page-wrapper">
        <Shop5 />
      </main>
      <div className="mb-5 pb-xl-5"></div>
      <Footer1 />
    </>
  );
}
