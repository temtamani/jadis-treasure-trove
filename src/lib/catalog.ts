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
  // PLACEHOLDERS — replace with the real JadisArt details when available.
  email: "contact@jadisart.com", // JADISART_EMAIL
  phone: "+33 1 84 88 20 14", // JADISART_PHONE
  whatsapp: "+33184882014", // JADISART_WHATSAPP (digits only, international format)
  address: "18 Rue des Antiquaires, 75003 Paris, France",
  hours: "Tuesday – Saturday, 10:00 – 19:00",
} as const;

/** WhatsApp deep link with a pre-filled message. */
export const WHATSAPP_LINK = `https://wa.me/${COMPANY.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Bonjour JadisArt, j'aurais besoin d'aide.",
)}`;


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
