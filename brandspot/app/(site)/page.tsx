import Hero from "../components/home/hero";
import NewArrivals from "../components/home/new-arrivals";
import Brands from "../components/home/brands";
import ShopTheLook from "../components/home/shop-the-look";
import Service from "../components/home/service";
import { getNewArrivals, getBrands, getLooks } from "../lib/queries";

// The catalogue changes whenever an admin saves, and every mutation calls
// revalidatePath("/"), so this can stay static between edits.
export default async function Home() {
  const [products, brands, looks] = await Promise.all([
    getNewArrivals(),
    getBrands(),
    getLooks(),
  ]);

  return (
    <div>
      <Hero />
      {products.length ? <NewArrivals products={products} /> : null}
      {brands.length ? <Brands brands={brands} /> : null}
      {looks.length ? <ShopTheLook looks={looks} /> : null}
      <Service />
    </div>
  );
}
