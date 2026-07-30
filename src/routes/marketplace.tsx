import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products";
import { CATEGORIES } from "@/lib/catalog";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/marketplace")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Marketplace — Browse Antiques & Collectibles | JadisArt" },
      {
        name: "description",
        content:
          "Search, filter and sort the full JadisArt catalogue of antique furniture, paintings, jewelry, coins, watches, ceramics and rare collectibles.",
      },
      { property: "og:title", content: "Marketplace — Browse Antiques & Collectibles | JadisArt" },
      {
        property: "og:description",
        content: "The full JadisArt catalogue of authenticated antiques and collectibles.",
      },
    ],
  }),
  component: Marketplace,
});

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;

const PER_PAGE = 9;

function Marketplace() {
  const search = Route.useSearch();
  const { data: products = [], isLoading } = useProducts();

  const [query, setQuery] = useState(search.q ?? "");
  const [category, setCategory] = useState(search.category ?? "all");
  const [material, setMaterial] = useState("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("newest");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const priceCeiling = useMemo(
    () => Math.max(1000, ...products.map((product) => product.price ?? 0)),
    [products],
  );

  const materials = useMemo(() => {
    const set = new Set(
      products.map((product) => product.material?.split(",")[0]?.trim()).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const limit = maxPrice ?? priceCeiling;

    const result = products.filter((product) => {
      const matchesQuery =
        !needle ||
        [product.title, product.description, product.material, product.category]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(needle));
      const matchesCategory = category === "all" || product.category === category;
      const matchesMaterial =
        material === "all" || (product.material ?? "").toLowerCase().includes(material.toLowerCase());
      const matchesPrice = (product.price ?? 0) <= limit;
      return matchesQuery && matchesCategory && matchesMaterial && matchesPrice;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.created_at.localeCompare(b.created_at);
        case "price-asc":
          return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "price-desc":
          return (b.price ?? -Infinity) - (a.price ?? -Infinity);
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
  }, [products, query, category, material, maxPrice, priceCeiling, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <>
      <section className="bg-gradient-espresso py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">The catalogue</p>
          <h1 className="mt-3 font-display text-5xl text-espresso-foreground sm:text-6xl">
            Marketplace
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-espresso-foreground/70">
            {products.length} authenticated pieces, from Louis XV giltwood to Roman silver. Search
            instantly, filter by material or price, and sort to taste.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        {/* Filters */}
        <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-28">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <SlidersHorizontal className="size-4 text-gold" aria-hidden="true" /> Filters
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <Label htmlFor="filter-category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  resetPage();
                }}
              >
                <SelectTrigger id="filter-category" className="mt-2">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-material">Material</Label>
              <Select
                value={material}
                onValueChange={(value) => {
                  setMaterial(value);
                  resetPage();
                }}
              >
                <SelectTrigger id="filter-material" className="mt-2">
                  <SelectValue placeholder="All materials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All materials</SelectItem>
                  {materials.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-price">
                Max price:{" "}
                <span className="text-gold">
                  €{(maxPrice ?? priceCeiling).toLocaleString("en-GB")}
                </span>
              </Label>
              <Slider
                id="filter-price"
                className="mt-4"
                min={0}
                max={priceCeiling}
                step={100}
                value={[maxPrice ?? priceCeiling]}
                onValueChange={([value]) => {
                  setMaxPrice(value);
                  resetPage();
                }}
              />
            </div>

            <Button
              variant="goldOutline"
              className="w-full"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setMaterial("all");
                setMaxPrice(null);
                setSort("newest");
                resetPage();
              }}
            >
              Reset filters
            </Button>
          </div>
        </aside>

        {/* Results */}
        <section aria-label="Search results">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <label htmlFor="search" className="sr-only">
                Search antiques
              </label>
              <Input
                id="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder="Search by title, material or description…"
                className="h-12 rounded-full pl-11"
              />
            </div>

            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as keyof typeof SORTS);
                resetPage();
              }}
            >
              <SelectTrigger className="h-12 rounded-full sm:w-56" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORTS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} found
          </p>

          <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[460px] animate-pulse rounded-3xl border border-border bg-muted"
                  />
                ))
              : visible.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-gold/40 p-16 text-center">
              <p className="font-display text-2xl">Nothing matches that search</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the price range or clearing the filters.
              </p>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
              <Button
                variant="goldOutline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: pageCount }).map((_, index) => (
                <Button
                  key={index}
                  size="icon"
                  variant={currentPage === index + 1 ? "gold" : "goldOutline"}
                  onClick={() => setPage(index + 1)}
                  aria-current={currentPage === index + 1 ? "page" : undefined}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="goldOutline"
                size="sm"
                disabled={currentPage === pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Next
              </Button>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
