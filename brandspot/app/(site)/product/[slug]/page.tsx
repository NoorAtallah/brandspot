import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getRelated } from "../../../lib/queries";
import ProductDetail from "./product-detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found — brand.spot" };
  return {
    title: `${product.name_en} — brand.spot`,
    description: product.description_en ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product);
  return <ProductDetail product={product} related={related} />;
}
