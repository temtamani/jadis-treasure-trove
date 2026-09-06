import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminProducts } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { displayPrice } from "@/lib/antiquities";
import { productImage } from "@/lib/catalog";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin")({ component: AdminListings });

function AdminListings() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useAdminProducts(isAdmin);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/auth", replace: true });
  }, [loading, user, isAdmin, navigate]);

  const togglePublished = async (product: (typeof products)[number]) => {
    const nextPublished = !product.is_published;
    const { error } = await (supabase.from("products") as any).update({ is_published: nextPublished, status: nextPublished ? "published" : "draft" }).eq("id", product.id);
    if (error) toast.error("The listing could not be updated.");
    else { await queryClient.invalidateQueries({ queryKey: ["admin-products"] }); await queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success(nextPublished ? "Antiquity published." : "Antiquity unpublished."); }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this antiquity permanently?")) return;
    const { error } = await (supabase.from("products") as any).delete().eq("id", id);
    if (error) toast.error("The antiquity could not be deleted.");
    else { await queryClient.invalidateQueries({ queryKey: ["admin-products"] }); await queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Antiquity deleted."); }
  };

  if (loading || !user || !isAdmin) return <section className="mx-auto max-w-5xl px-4 py-24"><div className="h-64 animate-pulse rounded-3xl bg-muted" /></section>;

  return <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.34em] text-gold">Private collection</p><h1 className="mt-3 font-display text-4xl sm:text-5xl">Antiquity listings</h1><p className="mt-3 text-sm text-muted-foreground">Create, edit, publish, and manage the JadisArt collection.</p></div><Button variant="gold" asChild><Link to="/admin/add-antiquity"><Plus /> Add New Antiquity</Link></Button></div>
    {isLoading ? <div className="mt-10 h-64 animate-pulse rounded-3xl bg-muted" /> : <div className="mt-10 overflow-hidden rounded-3xl border border-gold/20 bg-card shadow-soft"><div className="hidden grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground md:grid"><span>Name</span><span>Category</span><span>Price</span><span>Status</span><span>Actions</span></div><div className="divide-y divide-border">{products.map((product) => <div key={product.id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr_auto] md:items-center"><div className="flex min-w-0 items-center gap-3"><img src={productImage(product)} alt="" className="size-14 rounded-xl object-cover" /><div className="min-w-0"><p className="truncate font-medium">{product.title}</p><p className="text-xs text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</p></div></div><span className="text-sm text-muted-foreground">{product.category}</span><span className="text-sm">{displayPrice(product.price, product.currency, product.price_type)}</span><span className={`w-fit rounded-full px-2.5 py-1 text-xs ${product.is_published ? "bg-emerald-500/10 text-emerald-700" : "bg-gold/10 text-gold-foreground"}`}>{product.is_published ? "Published" : "Draft"}</span><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><a href={`/admin/add-antiquity?edit=${product.id}`}><Pencil /> Edit</a></Button><Button size="sm" variant="ghost" onClick={() => togglePublished(product)}>{product.is_published ? <EyeOff /> : <Eye />} {product.is_published ? "Unpublish" : "Publish"}</Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(product.id)} aria-label={`Delete ${product.title}`}><Trash2 /></Button></div></div>)}</div>{products.length === 0 && <p className="px-5 py-16 text-center text-sm text-muted-foreground">No antiquities have been created yet.</p>}</div>}
  </section>;
}
