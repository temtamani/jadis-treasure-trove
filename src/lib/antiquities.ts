export const ANTIQUITY_CATEGORIES = [
  "Furniture", "Ceramics", "Pottery", "Paintings", "Sculptures", "Jewelry", "Textiles",
  "Coins", "Manuscripts", "Islamic Art", "African Art", "European Art", "Asian Art",
  "Archaeological Objects", "Decorative Arts", "Weapons / Historical Objects", "Other",
] as const;

export const MATERIAL_OPTIONS = [
  "Wood", "Bronze", "Copper", "Silver", "Gold", "Ceramic", "Porcelain", "Glass", "Stone",
  "Marble", "Iron", "Brass", "Leather", "Textile", "Ivory", "Other",
] as const;

export const CURRENCIES = ["MAD", "EUR", "USD", "GBP"] as const;

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function displayPrice(price: number | null, currency = "EUR", priceType = "fixed") {
  if (priceType === "on_request") return "Price on request";
  if (priceType === "contact") return "Contact us";
  if (price === null || Number.isNaN(price)) return "Price on request";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}
