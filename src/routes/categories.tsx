import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/catalog";
import { categoryIcon } from "@/lib/categories";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Antique Categories — Furniture, Art, Jewelry | JadisArt" },
      {
        name: "description",
        content:
          "Explore JadisArt by category: antique furniture, paintings, sculptures, coins, jewelry, rare books, watches, ceramics and decorative curiosities.",
      },
      { property: "og:title", content: "Antique Categories | JadisArt" },
      {
        property: "og:description",
        content: "Browse authenticated antiques by category at JadisArt.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { data: products = [] } = useProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.34em] text-gold">Collections</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Browse by category</h1>
        <p className="mt-4 text-muted-foreground">
          Each category is curated and authenticated by our specialists, from 18th-century cabinetry
          to rare timepieces.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => {
          const Icon = categoryIcon(category);
          const count = products.filter((product) => product.category === category).length;
          return (
            <Link
              key={category}
              to="/marketplace"
              search={{ category }}
              className="animate-fade-in group rounded-3xl border border-gold/20 bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-gold/50"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <Icon
                className="size-9 text-gold transition-transform duration-500 group-hover:scale-110"
                aria-hidden="true"
              />
              <h2 className="mt-5 font-display text-2xl">{category}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {count} {count === 1 ? "piece" : "pieces"} available
              </p>
              <span className="mt-4 block h-px w-12 bg-gradient-gold transition-all duration-500 group-hover:w-24" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
