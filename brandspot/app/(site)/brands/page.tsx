import type { Metadata } from "next";
import { getBrands } from "../../lib/queries";
import BrandsIndex from "./brands-index";

export const metadata: Metadata = {
  title: "Brands — brand.spot",
  description: "Every original brand stocked at brand.spot.",
};

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandsIndex brands={brands} />;
}
