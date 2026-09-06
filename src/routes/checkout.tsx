import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/catalog";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/language";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — JadisArt" },
      {
        name: "description",
        content:
          "Confirm your delivery details and review your JadisArt order before our specialists arrange insured, white-glove shipping.",
      },
      { property: "og:title", content: "Checkout — JadisArt" },
      { property: "og:description", content: "Confirm your JadisArt order and delivery details." },
    ],
  }),
  component: Checkout,
});

const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  address: z.string().trim().min(4, "Please enter your street address").max(200),
  city: z.string().trim().min(2, "Please enter your city").max(100),
  postal_code: z.string().trim().min(2, "Please enter your postal code").max(20),
  country: z.string().trim().min(2, "Please enter your country").max(100),
});

function Checkout() {
  const { lines, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const { t } = useLanguage();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.error(t("checkout.signInRequired"));
      return;
    }
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error(t("checkout.correctFields"));
      return;
    }
    setErrors({});
    setPlacing(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        address: parsed.data.address,
        city: parsed.data.city,
        postal_code: parsed.data.postal_code,
        country: parsed.data.country,
        total,
      })
      .select("id")
      .single();

    if (error || !order) {
      setPlacing(false);
      toast.error(t("checkout.orderError"));
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.id,
        title: line.title,
        price: line.price,
        quantity: line.quantity,
      })),
    );
    setPlacing(false);

    if (itemsError) {
      toast.error(t("checkout.itemsError"));
      return;
    }

    clear();
    toast.success(t("checkout.confirmed"));
    navigate({ to: "/account", search: { tab: "orders" } });
  };

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl">{t("checkout.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t("checkout.empty")}</p>
        <Button variant="gold" className="mt-6" asChild>
          <Link to="/marketplace">{t("account.browse")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl sm:text-5xl">{t("checkout.title")}</h1>

      {!user && (
        <div className="mt-6 rounded-2xl border border-gold/30 bg-beige/60 p-4 text-sm">
          <Link to="/auth" className="text-gold underline-offset-4 hover:underline">
            {t("checkout.signIn")}
          </Link>{" "}
          {t("checkout.signInHint")}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={submit}
          noValidate
          className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <h2 className="font-display text-2xl">{t("checkout.delivery")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {(
              [
                ["full_name", t("checkout.fullName"), "text"],
                ["email", t("newsletter.email"), "email"],
                ["phone", t("account.phone"), "tel"],
                ["address", t("checkout.address"), "text"],
                ["city", t("checkout.city"), "text"],
                ["postal_code", t("checkout.postal"), "text"],
                ["country", t("checkout.country"), "text"],
              ] as const
            ).map(([name, label, type]) => (
              <div key={name} className={name === "address" ? "sm:col-span-2" : undefined}>
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  type={type}
                  className="mt-2"
                  defaultValue={name === "email" ? (user?.email ?? "") : ""}
                />
                {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}
              </div>
            ))}
          </div>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="mt-8 w-full"
            disabled={placing || !user}
          >
            {placing ? t("checkout.confirming") : t("checkout.confirm")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("checkout.payment")}
          </p>
        </form>

        <aside className="h-fit rounded-3xl border border-gold/25 bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl">{t("cart.summary")}</h2>
          <ul className="mt-5 space-y-4 text-sm">
            {lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span className="min-w-0">
                  <span className="block truncate">{line.title}</span>
                  <span className="text-xs text-muted-foreground">{t("checkout.quantity")} {line.quantity}</span>
                </span>
                <span>{formatPrice((line.price ?? 0) * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between border-t border-border pt-4 font-display text-xl">
            <span>{t("account.total")}</span>
            <span className="text-gold">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
