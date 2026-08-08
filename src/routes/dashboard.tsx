import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/lib/products";
import { CATEGORIES, CONDITIONS, formatPrice, productImage } from "@/lib/catalog";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard — Publish Antiques | JadisArt" },
      {
        name: "description",
        content:
          "JadisArt seller dashboard: publish new antique listings with photos, pricing, materials, dimensions and condition details.",
      },
      { property: "og:title", content: "Seller Dashboard | JadisArt" },
      { property: "og:description", content: "Publish and manage JadisArt antique listings." },
    ],
  }),
  component: Dashboard,
});

const productSchema = z.object({
  title: z.string().trim().min(3, "Please enter a product title").max(140),
  description: z.string().trim().min(10, "Please describe the piece").max(4000),
});

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [condition, setCondition] = useState<string>(CONDITIONS[1]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl">Seller dashboard</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This area is reserved for JadisArt sellers. Contact us if you would like to list pieces
          with us.
        </p>
        <Button variant="gold" className="mt-6" asChild>
          <Link to="/contact">Contact JadisArt</Link>
        </Button>
      </section>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    const images = values.images
      ? values.images
          .split(/[\n,]/)
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    const { error } = await supabase.from("products").insert({
      title: parsed.data.title,
      description: parsed.data.description,
      price: values.price ? Number(values.price) : null,
      category,
      condition,
      material: values.material?.trim() || null,
      dimensions: values.dimensions?.trim() || null,
      weight: values.weight?.trim() || null,
      year: values.year?.trim() || null,
      stock_quantity: values.stock_quantity ? Number(values.stock_quantity) : 1,
      images,
      seller_name: values.seller_name?.trim() || "JadisArt",
      seller_location: values.seller_location?.trim() || null,
      is_published: true,
      created_by: user.id,
    });
    setSaving(false);

    if (error) {
      toast.error("The listing could not be published.");
      return;
    }
    form.reset();
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success("Listing published to the marketplace.");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.34em] text-gold">Seller area</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Publish an antique</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <form
          onSubmit={submit}
          noValidate
          className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <Label htmlFor="title">Product title *</Label>
              <Input id="title" name="title" className="mt-2" />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" rows={5} className="mt-2" />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description}</p>
              )}
            </div>
            <div>
              <Label htmlFor="images">Image URLs (one per line)</Label>
              <Textarea id="images" name="images" rows={3} className="mt-2" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (EUR)</Label>
                <Input id="price" name="price" type="number" min="0" step="1" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="stock_quantity">Stock quantity</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  defaultValue={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="material">Material</Label>
                <Input id="material" name="material" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" name="dimensions" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="seller_name">Seller name</Label>
                <Input id="seller_name" name="seller_name" defaultValue="JadisArt" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="seller_location">Seller location</Label>
                <Input id="seller_location" name="seller_location" className="mt-2" />
              </div>
            </div>
          </div>
          <Button type="submit" variant="gold" size="lg" className="mt-8 w-full" disabled={saving}>
            {saving ? "Publishing…" : "Publish to marketplace"}
          </Button>
        </form>

        <aside className="h-fit rounded-3xl border border-gold/25 bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl">Live listings</h2>
          <ul className="mt-5 space-y-4">
            {products.slice(0, 8).map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <img
                  src={productImage(product)}
                  alt={product.title}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="size-12 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{product.title}</span>
                  <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
