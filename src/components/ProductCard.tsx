import { Link } from "@tanstack/react-router";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, productImage, type Product } from "@/lib/catalog";
import { useCart } from "@/context/cart";
import { toast } from "sonner";

/** A single antique presented as a rounded, lifting gallery card. */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();

  return (
    <article
      className="group animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-beige">
          <img
            src={productImage(product)}
            alt={product.title}
            width={1024}
            height={768}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-foreground">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-3 p-6">
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-display text-xl leading-snug text-foreground transition-colors group-hover:text-gold">
            {product.title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <dl className="mt-1 space-y-1 text-xs text-muted-foreground">
          {product.material && (
            <div className="flex gap-2">
              <dt className="uppercase tracking-[0.14em] text-foreground/60">Material</dt>
              <dd className="truncate">{product.material}</dd>
            </div>
          )}
          {product.dimensions && (
            <div className="flex gap-2">
              <dt className="uppercase tracking-[0.14em] text-foreground/60">Size</dt>
              <dd className="truncate">{product.dimensions}</dd>
            </div>
          )}
          {product.weight && (
            <div className="flex gap-2">
              <dt className="uppercase tracking-[0.14em] text-foreground/60">Weight</dt>
              <dd className="truncate">{product.weight}</dd>
            </div>
          )}
        </dl>

        <p className="mt-2 font-display text-2xl text-foreground">{formatPrice(product.price)}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="goldOutline" size="sm" asChild className="flex-1">
            <Link to="/product/$id" params={{ id: product.id }}>
              <Eye aria-hidden="true" /> View details
            </Link>
          </Button>
          <Button
            variant="gold"
            size="sm"
            className="flex-1"
            onClick={() => {
              addItem(product);
              toast.success(`${product.title} added to your cart`);
            }}
          >
            <Plus aria-hidden="true" /> Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}
