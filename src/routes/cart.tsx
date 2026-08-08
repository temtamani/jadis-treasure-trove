import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — JadisArt" },
      {
        name: "description",
        content:
          "Review the antiques in your JadisArt cart, adjust quantities and continue to a secure checkout.",
      },
      { property: "og:title", content: "Your Cart — JadisArt" },
      { property: "og:description", content: "Review your selected antiques before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, total, count, removeItem, setQuantity } = useCart();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl sm:text-5xl">Shopping cart</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {count === 0 ? "Your cart is currently empty." : `${count} item${count > 1 ? "s" : ""} reserved for you.`}
      </p>

      {lines.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
          <ShoppingBag className="mx-auto size-8 text-gold" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing here yet — browse the collection to find your next piece.
          </p>
          <Button variant="gold" className="mt-6" asChild>
            <Link to="/marketplace">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center"
              >
                <img
                  src={line.image || PLACEHOLDER_IMAGE}
                  alt={line.title}
                  width={120}
                  height={120}
                  loading="lazy"
                  className="h-28 w-full rounded-2xl object-cover sm:w-28"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/product/$id"
                    params={{ id: line.id }}
                    className="font-display text-lg hover:text-gold"
                  >
                    {line.title}
                  </Link>
                  <p className="mt-1 text-sm text-gold">{formatPrice(line.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                  >
                    <Minus aria-hidden="true" />
                  </Button>
                  <span className="w-8 text-center text-sm" aria-live="polite">
                    {line.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    disabled={line.quantity >= line.stock}
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                  >
                    <Plus aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="font-display text-lg">
                    {formatPrice((line.price ?? 0) * line.quantity)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${line.title}`}
                    onClick={() => removeItem(line.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-gold/25 bg-card p-6 shadow-soft">
            <h2 className="font-display text-2xl">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>Quoted after checkout</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-display text-xl">
                <dt>Total</dt>
                <dd className="text-gold">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button variant="gold" size="lg" className="mt-6 w-full" asChild>
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
            <Button variant="ghost" className="mt-2 w-full" asChild>
              <Link to="/marketplace">Continue shopping</Link>
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
