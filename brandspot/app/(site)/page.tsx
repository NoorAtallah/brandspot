import Hero from "../components/home/hero";
import NewArrivals from "../components/home/new-arrivals";
import Brands from "../components/home/brands";
import ShopTheLook from "../components/home/shop-the-look";
import Categories from "../components/home/categories";
import Sale from "../components/home/sale";
import Service from "../components/home/service";
import { getNewArrivals, getBrands, getLooks, getCategories, getOnSale } from "../lib/queries";

// The catalogue changes whenever an admin saves, and every mutation calls
// revalidatePath("/"), so this can stay static between edits.
export default async function Home() {
  const [products, categories, brands, looks, onSale] = await Promise.all([
    getNewArrivals(),
    getCategories(),
    getBrands(),
    getLooks(),
    getOnSale(),
  ]);

  return (
    <div>
      <Hero />
      {products.length ? <NewArrivals products={products} /> : null}
      {categories.length ? <Categories categories={categories} /> : null}
      {brands.length ? <Brands brands={brands} /> : null}
      {looks.length ? <ShopTheLook looks={looks} /> : null}
      {onSale.length ? <Sale products={onSale} /> : null}
      <Service />
    </div>
  );
}
