import type { Metadata } from "next";
import { getProducts, getFilterOptions, type ProductFilters } from "../../lib/queries";
import ShopClient from "./shop-client";

export const metadata: Metadata = {
  title: "Shop all — brand.spot",
  description: "Every piece in the brand.spot catalogue.",
};

type Search = { [K in keyof ProductFilters]?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;

  const filters: ProductFilters = {
    dept: sp.dept,
    brand: sp.brand,
    category: sp.category,
    q: sp.q,
    sort: (sp.sort as ProductFilters["sort"]) ?? "new",
    sale: sp.sale === "1",
  };

  const [products, options] = await Promise.all([getProducts(filters), getFilterOptions()]);

  return <ShopClient products={products} filters={filters} brands={options.brands} categories={options.categories} />;
}
