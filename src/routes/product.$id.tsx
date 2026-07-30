import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, MessageSquare, ShieldCheck, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProduct } from "@/lib/products";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/catalog";
import { useCart } from "@/context/cart";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Antique Details | JadisArt" },
      {
        name: "description",
        content:
          "Full description, materials, dimensions, weight, condition and seller details for this authenticated antique at JadisArt.",
      },
      { property: "og:title", content: "Antique Details | JadisArt" },
      {
        property: "og:description",
        content: "Provenance, condition and specifications for this authenticated antique.",
      },
    ],
  }),
  component: ProductDetails,
});

const inquirySchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});

function ProductDetails() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="h-[520px] animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">This piece is no longer available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It may have found a new home. Browse the rest of the collection.
        </p>
        <Button variant="gold" className="mt-8" asChild>
          <Link to="/marketplace">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const gallery = product.images?.length ? product.images : [PLACEHOLDER_IMAGE];

  const specs = [
    ["Category", product.category],
    ["Material", product.material],
    ["Dimensions", product.dimensions],
    ["Weight", product.weight],
    ["Year", product.year],
    ["Condition", product.condition],
    ["Availability", `${product.stock_quantity} in stock`],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  const onInquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = inquirySchema.safeParse({
      full_name: form.get("full_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      message: form.get("message"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      product_id: product.id,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      kind: "seller",
    });
    setSending(false);

    if (error) {
      toast.error("Your message could not be sent. Please try again.");
      return;
    }
    toast.success("Message sent — a specialist will reply within one business day.");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to marketplace
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="animate-fade-in">
          <div className="overflow-hidden rounded-3xl border border-border bg-beige shadow-lift">
            <img
              src={gallery[active]}
              alt={product.title}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={image + index}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`size-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                    active === index ? "border-gold shadow-gold" : "border-border opacity-70"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    width={160}
                    height={160}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="animate-fade-up">
          <span className="rounded-full bg-beige px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-foreground/70">
            {product.category}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">{product.title}</h1>
          <p className="mt-4 font-display text-3xl text-gold">{formatPrice(product.price)}</p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="mt-8 grid gap-x-8 gap-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-3xl glass p-6">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <ShieldCheck className="size-4 text-gold" aria-hidden="true" /> Seller
            </h2>
            <p className="mt-3 text-sm text-foreground">{product.seller_name}</p>
            {product.seller_location && (
              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-gold" aria-hidden="true" />
                {product.seller_location}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Verified dealer. Condition report and provenance documentation supplied with every
              purchase.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="gold"
              size="lg"
              onClick={() => {
                addItem(product);
                toast.success(`${product.title} added to your cart`);
              }}
            >
              <ShoppingBag aria-hidden="true" /> Add to cart
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="goldOutline" size="lg">
                  <MessageSquare aria-hidden="true" /> Contact seller
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Contact the seller</DialogTitle>
                  <DialogDescription>
                    Your message about “{product.title}” goes straight to the JadisArt team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onInquiry} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full name</Label>
                    <Input id="full_name" name="full_name" required maxLength={100} className="mt-1.5" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" name="phone" type="tel" maxLength={40} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" rows={4} required maxLength={1000} className="mt-1.5" />
                  </div>
                  <Button type="submit" variant="gold" className="w-full" disabled={sending}>
                    {sending ? "Sending…" : "Send message"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
