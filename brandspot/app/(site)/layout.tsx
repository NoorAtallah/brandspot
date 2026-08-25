import { getBrands } from "../lib/queries";
import Nav from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import CartDrawer from "../components/cart/cart-drawer";

/** Storefront chrome. The admin lives outside this group, so it gets none of it. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const brands = await getBrands();

  return (
    <>
      <Nav />
      {children}
      <Footer brands={brands} />
      <CartDrawer />
    </>
  );
}
