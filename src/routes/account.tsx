import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Heart, LogOut, MessageCircle, Package, ShoppingBag, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { ChatPanel } from "@/components/ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/cart";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/catalog";
import { useOrders, useProfile, useUpdateProfile, useWishlist } from "@/lib/account";

const searchSchema = z.object({
  tab: z.enum(["profile", "orders", "cart", "wishlist", "messages"]).optional(),
});

export const Route = createFileRoute("/account")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "My JadisArt Account — Orders, Wishlist & Messages" },
      {
        name: "description",
        content:
          "Manage your JadisArt profile, review your orders, wishlist, cart and conversations with our customer-service team.",
      },
      { property: "og:title", content: "My JadisArt Account" },
      {
        property: "og:description",
        content: "Your JadisArt profile, orders, wishlist and messages in one place.",
      },
    ],
  }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, loading, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: orders = [] } = useOrders(user?.id);
  const { data: wishlist = [] } = useWishlist(user?.id);
  const { lines, total, removeItem } = useCart();
  const updateProfile = useUpdateProfile(user?.id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </section>
    );
  }

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        first_name: values.first_name?.trim() || null,
        last_name: values.last_name?.trim() || null,
        phone: values.phone?.trim() || null,
        full_name: `${values.first_name ?? ""} ${values.last_name ?? ""}`.trim() || null,
      });
      toast.success("Profile updated.");
    } catch {
      toast.error("Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-gold">My account</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{displayName}</h1>
        </div>
        <Button variant="ghost" onClick={signOut}>
          <LogOut aria-hidden="true" /> Log out
        </Button>
      </div>

      <Tabs defaultValue={search.tab ?? "profile"} className="mt-10">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="profile">
            <User2 className="mr-2 size-4" aria-hidden="true" /> Profile
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2 size-4" aria-hidden="true" /> Orders
          </TabsTrigger>
          <TabsTrigger value="cart">
            <ShoppingBag className="mr-2 size-4" aria-hidden="true" /> Cart
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="mr-2 size-4" aria-hidden="true" /> Wishlist
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="mr-2 size-4" aria-hidden="true" /> Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form
            onSubmit={saveProfile}
            className="max-w-xl rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <h2 className="font-display text-2xl">Profile information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  className="mt-2"
                  defaultValue={profile?.first_name ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  className="mt-2"
                  defaultValue={profile?.last_name ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="acc-email">Email</Label>
                <Input id="acc-email" className="mt-2" value={user.email ?? ""} readOnly disabled />
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-2"
                  defaultValue={profile?.phone ?? ""}
                />
              </div>
            </div>
            <Button type="submit" variant="gold" className="mt-6" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <EmptyState
              text="You have not placed an order yet."
              actionLabel="Browse the collection"
              to="/marketplace"
            />
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg">
                        Order {order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} · {order.city},{" "}
                        {order.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-gold">{formatPrice(order.total)}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
                    {order.order_items?.map((item) => (
                      <li key={item.id}>
                        {item.quantity} × {item.title}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="cart">
          {lines.length === 0 ? (
            <EmptyState
              text="Your cart is empty."
              actionLabel="Browse the collection"
              to="/marketplace"
            />
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-4">
                    <img
                      src={line.image || PLACEHOLDER_IMAGE}
                      alt={line.title}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="size-16 rounded-xl object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{line.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {line.quantity} × {formatPrice(line.price)}
                      </span>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(line.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <span className="font-display text-xl">Total {formatPrice(total)}</span>
                <Button variant="gold" asChild>
                  <Link to="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {wishlist.length === 0 ? (
            <EmptyState
              text="Your wishlist is empty. Use the heart on a piece to save it."
              actionLabel="Browse the collection"
              to="/marketplace"
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <div className="max-w-2xl">
            <ChatPanel />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function EmptyState({
  text,
  actionLabel,
  to,
}: {
  text: string;
  actionLabel: string;
  to: "/marketplace";
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button variant="gold" className="mt-6" asChild>
        <Link to={to}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
