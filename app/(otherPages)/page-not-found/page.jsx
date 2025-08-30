
import Notfound from "@/components/otherPages/Notfound";

export const metadata = {
  title: "Page Not Found || Ayo eCommerce",
  description: "Ayo eCommerce",
};
export default function PageNotFound() {
  return (
    <>
      <main className="page-wrapper">
        <div className="mb-4 pb-4"></div>
        <Notfound />
      </main>

      <div className="mb-5 pb-xl-5"></div>
    </>
  );
}
