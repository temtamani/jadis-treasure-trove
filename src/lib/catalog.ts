/**
 * Shared domain types and constants for the JadisArt marketplace.
 */

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  category: string;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  year: string | null;
  condition: string | null;
  stock_quantity: number;
  images: string[];
  seller_name: string;
  seller_location: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
};

export const CATEGORIES = [
  "Furniture",
  "Decorations",
  "Paintings",
  "Sculptures",
  "Coins",
  "Jewelry",
  "Books",
  "Watches",
  "Ceramics",
  "Other",
] as const;

export const CONDITIONS = [
  "Mint",
  "Excellent",
  "Very good",
  "Good",
  "Fair",
  "Restored",
] as const;

export const COMPANY = {
  name: "JadisArt",
  tagline: "Curators of the beautifully old",
  email: "contact@jadisart.com",
  phone: "+33 1 84 88 20 14",
  address: "18 Rue des Antiquaires, 75003 Paris, France",
  hours: "Tuesday – Saturday, 10:00 – 19:00",
} as const;

export const PLACEHOLDER_IMAGE = "/images/hero.jpg";

/** Formats a price in EUR, or a graceful fallback when the price is hidden. */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "Price on request";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** First image of a product, falling back to a house image. */
export function productImage(product: Pick<Product, "images">): string {
  return product.images?.[0] ?? PLACEHOLDER_IMAGE;
}
