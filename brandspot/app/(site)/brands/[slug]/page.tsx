import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand, getProducts } from "../../../lib/queries";
import BrandDetail from "./brand-detail";

type Search = { dept?: string; sort?: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Not found — brand.spot" };
  return { title: `${brand.name} — brand.spot`, description: brand.note_en ?? undefined };
}

export default async function BrandPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Search>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  const brand = await getBrand(slug);
  if (!brand) notFound();

  const products = await getProducts({
    brand: slug,
    dept: sp.dept,
    sort: (sp.sort as "new" | "price-asc" | "price-desc") ?? "new",
  });

  return <BrandDetail brand={brand} products={products} dept={sp.dept} sort={sp.sort ?? "new"} />;
}
