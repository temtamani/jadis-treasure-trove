import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Check, GripVertical, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { AntiquityDetails } from "@/lib/catalog";
import { ANTIQUITY_CATEGORIES, CURRENCIES, MATERIAL_OPTIONS, displayPrice, slugify } from "@/lib/antiquities";

export const Route = createFileRoute("/admin/add-antiquity")({
  component: AddAntiquity,
});

type FormState = {
  title: string; category: string; customCategory: string; subcategory: string; description: string; shortDescription: string;
  price: string; currency: string; priceType: string; availability: string; origin: string; country: string; region: string;
  period: string; approximateDate: string; century: string; artistMaker: string; culture: string; style: string;
  height: string; width: string; depth: string; dimensionUnit: string; weightValue: string; weightUnit: string;
  provenance: string; authenticity: string; certificate: string; inventoryNumber: string; collection: string; acquisitionDate: string;
  location: string; shipping: string; insuranceValue: string; restoration: string; specialNotes: string; internalNotes: string;
  seoTitle: string; seoDescription: string; seoKeywords: string; slug: string;
};

const initialForm: FormState = {
  title: "", category: "Furniture", customCategory: "", subcategory: "", description: "", shortDescription: "", price: "", currency: "EUR", priceType: "fixed", availability: "Available",
  origin: "", country: "", region: "", period: "", approximateDate: "", century: "", artistMaker: "", culture: "", style: "", height: "", width: "", depth: "", dimensionUnit: "cm", weightValue: "", weightUnit: "kg", provenance: "", authenticity: "", certificate: "", inventoryNumber: "", collection: "", acquisitionDate: "", location: "", shipping: "", insuranceValue: "", restoration: "", specialNotes: "", internalNotes: "", seoTitle: "", seoDescription: "", seoKeywords: "", slug: "",
};

const requiredSchema = z.object({ title: z.string().trim().min(3, "Add an antiquity title."), description: z.string().trim().min(10, "Add a detailed description."), category: z.string().min(1, "Choose a category.") });

function AddAntiquity() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [materials, setMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const editId = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("edit") ?? "";

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/admin/login", replace: true });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!editId || !isAdmin) return;
    (async () => {
      const { data, error } = await (supabase.from("products") as any).select("*").eq("id", editId).maybeSingle();
      if (error || !data) return;
      const details = (data.details ?? {}) as AntiquityDetails;
      setForm((current) => ({ ...current, title: data.title ?? "", category: ANTIQUITY_CATEGORIES.includes(data.category) ? data.category : "Other", customCategory: ANTIQUITY_CATEGORIES.includes(data.category) ? "" : data.category ?? "", subcategory: data.subcategory ?? "", description: data.description ?? "", shortDescription: data.short_description ?? "", price: data.price?.toString() ?? "", currency: data.currency ?? "EUR", priceType: data.price_type ?? "fixed", availability: data.condition ?? "", ...Object.fromEntries(Object.entries(details).filter(([key]) => key in current)) as Partial<FormState>, slug: data.slug ?? "" }));
      setMaterials(details.materials ?? (data.material ? data.material.split(", ") : []));
      setPreviews(data.images ?? []);
    })();
  }, [editId, isAdmin]);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const generatedSlug = useMemo(() => form.slug || slugify(form.title), [form.slug, form.title]);
  const previewPrice = displayPrice(form.price ? Number(form.price) : null, form.currency, form.priceType);

  const onFiles = (selected: FileList | null) => {
    if (!selected) return;
    const accepted = Array.from(selected).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (accepted.length !== selected.length) toast.error("Use JPG, PNG, or WebP images only.");
    setFiles((current) => [...current, ...accepted]);
    setPreviews((current) => [...current, ...accepted.map((file) => URL.createObjectURL(file))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((current) => current.filter((_, item) => item !== index));
    setPreviews((current) => current.filter((_, item) => item !== index));
    setCoverIndex((current) => current === index ? 0 : current > index ? current - 1 : current);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= previews.length) return;
    setFiles((current) => {
      if (index >= current.length || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setPreviews((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    if (coverIndex === index) setCoverIndex(nextIndex);
    else if (coverIndex === nextIndex) setCoverIndex(index);
  };

  const addMaterial = (material: string) => {
    const value = material === "Other" ? customMaterial.trim() : material;
    if (value && !materials.includes(value)) setMaterials((current) => [...current, value]);
    if (material === "Other") setCustomMaterial("");
  };

  const save = async (publish: boolean) => {
    const parsed = requiredSchema.safeParse({ ...form, category: form.category === "Other" ? form.customCategory : form.category });
    if (publish && !parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      toast.error("Complete the required fields before publishing.");
      return;
    }
    if (!user) return;
    setErrors({});
    setSaving(true);
    try {
      const imageUrls: string[] = [...previews];
      for (const [index, file] of files.entries()) {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const upload = await supabase.storage.from("antiquity-images").upload(path, file, { contentType: file.type, upsert: false });
        if (upload.error) throw upload.error;
        const signed = await supabase.storage
          .from("antiquity-images")
          .createSignedUrl(upload.data.path, 60 * 60 * 24 * 3650);
        if (signed.error) throw signed.error;
        imageUrls.push(signed.data.signedUrl);
        if (index === coverIndex) imageUrls.unshift(imageUrls.pop()!);
      }
      const details: AntiquityDetails = {
        materials, origin: form.origin, country: form.country, region: form.region, period: form.period, approximateDate: form.approximateDate, century: form.century, artistMaker: form.artistMaker, culture: form.culture, style: form.style, height: form.height, width: form.width, depth: form.depth, dimensionUnit: form.dimensionUnit, weightValue: form.weightValue, weightUnit: form.weightUnit, provenance: form.provenance, authenticity: form.authenticity, certificate: form.certificate, inventoryNumber: form.inventoryNumber, collection: form.collection, acquisitionDate: form.acquisitionDate, location: form.location, shipping: form.shipping, insuranceValue: form.insuranceValue, restoration: form.restoration, specialNotes: form.specialNotes, internalNotes: form.internalNotes, seoTitle: form.seoTitle, seoDescription: form.seoDescription, seoKeywords: form.seoKeywords,
      };
      const row = {
        title: form.title.trim(), description: form.description.trim(), short_description: form.shortDescription.trim() || null, category: form.category === "Other" ? form.customCategory.trim() || "Other" : form.category, subcategory: form.subcategory.trim() || null, price: form.priceType === "fixed" && form.price ? Number(form.price) : null, currency: form.currency, price_type: form.priceType, status: publish ? "published" : "draft", is_published: publish, images: imageUrls, material: materials.join(", ") || null, dimensions: [form.height, form.width, form.depth].filter(Boolean).join(" × ") || null, weight: form.weightValue ? `${form.weightValue} ${form.weightUnit}` : null, year: form.approximateDate || form.century || null, condition: form.availability, stock_quantity: 1, seller_name: "JadisArt Gallery", seller_location: form.location || null, created_by: user.id, slug: generatedSlug || null, details,
      };
      const result = editId
        ? await (supabase.from("products") as any).update(row).eq("id", editId).select("id").single()
        : await (supabase.from("products") as any).insert(row).select("id").single();
      const { data, error } = result;
      if (error) throw error;
      toast.success(publish ? "Antiquity successfully published." : "Draft saved privately.");
      if (publish && data?.id) navigate({ to: "/product/$id", params: { id: data.id } });
      else if (editId) navigate({ to: "/admin" });
    } catch (error) {
      console.error(error);
      toast.error("The antiquity could not be saved. Check your storage and database configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || !isAdmin) return <section className="mx-auto max-w-5xl px-4 py-24"><div className="h-64 animate-pulse rounded-3xl bg-muted" /></section>;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><Link to="/admin" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"><ArrowLeft className="size-4" /> Listings</Link><p className="mt-5 text-xs uppercase tracking-[0.34em] text-gold">Private collection</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{editId ? "Edit Antiquity" : "Add New Antiquity"}</h1><p className="mt-3 max-w-2xl text-sm text-muted-foreground">Create a detailed listing for an authentic piece in the JadisArt collection.</p></div>
        <div className="flex gap-2"><Button variant="ghost" onClick={() => navigate({ to: "/admin" })}>Cancel</Button><Button variant="goldOutline" disabled={saving} onClick={() => save(false)}><Save /> Save Draft</Button><Button variant="gold" disabled={saving} onClick={() => save(true)}>{saving ? <Loader2 className="animate-spin" /> : <Check />} Publish Antiquity</Button></div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <FormSection title="Basic information"><div className="grid gap-5 sm:grid-cols-2"><Field label="Antiquity name / title" required error={errors.title}><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Antique Moroccan Brass Lantern" /></Field><Field label="Category" required error={errors.category}><Select value={form.category} onValueChange={(value) => update("category", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ANTIQUITY_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>{form.category === "Other" && <Field label="Custom category"><Input value={form.customCategory} onChange={(e) => update("customCategory", e.target.value)} placeholder="Enter a category" /></Field>}<Field label="Subcategory"><Input value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} placeholder="Lighting, tableware, portrait..." /></Field><Field label="Short description" className="sm:col-span-2"><Input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="A concise collector-facing summary" /></Field><Field label="Description" required error={errors.description} className="sm:col-span-2"><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the object's history, craftsmanship, and significance..." rows={6} /></Field></div></FormSection>

          <FormSection title="Materials"><div className="flex flex-wrap gap-2">{MATERIAL_OPTIONS.map((item) => <Button key={item} type="button" size="sm" variant={materials.includes(item) || (item === "Other" && customMaterial) ? "gold" : "goldOutline"} onClick={() => item === "Other" ? undefined : addMaterial(item)}>{item}</Button>)}</div><div className="mt-4 flex gap-2"><Input value={customMaterial} onChange={(e) => setCustomMaterial(e.target.value)} placeholder="Add a custom material" /><Button type="button" variant="outline" onClick={() => addMaterial("Other")}><Plus /></Button></div><div className="mt-3 flex flex-wrap gap-2">{materials.map((item) => <span key={item} className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs">{item}<button type="button" className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => setMaterials((current) => current.filter((value) => value !== item))}>×</button></span>)}</div></FormSection>

          <FormSection title="Detailed object information"><div className="grid gap-5 sm:grid-cols-2"><Field label="Origin"><Input value={form.origin} onChange={(e) => update("origin", e.target.value)} /></Field><Field label="Country"><Input value={form.country} onChange={(e) => update("country", e.target.value)} /></Field><Field label="Region"><Input value={form.region} onChange={(e) => update("region", e.target.value)} /></Field><Field label="Period / Era"><Input value={form.period} onChange={(e) => update("period", e.target.value)} placeholder="Late 19th century" /></Field><Field label="Approximate date"><Input value={form.approximateDate} onChange={(e) => update("approximateDate", e.target.value)} placeholder="c. 1880" /></Field><Field label="Century"><Input value={form.century} onChange={(e) => update("century", e.target.value)} /></Field><Field label="Artist / Maker"><Input value={form.artistMaker} onChange={(e) => update("artistMaker", e.target.value)} /></Field><Field label="Culture"><Input value={form.culture} onChange={(e) => update("culture", e.target.value)} /></Field><Field label="Style"><Input value={form.style} onChange={(e) => update("style", e.target.value)} /></Field><Field label="Condition"><Input value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="Excellent, restored" /></Field></div><div className="mt-5 grid gap-5 sm:grid-cols-4"><Field label="Height"><Input value={form.height} onChange={(e) => update("height", e.target.value)} /></Field><Field label="Width"><Input value={form.width} onChange={(e) => update("width", e.target.value)} /></Field><Field label="Depth"><Input value={form.depth} onChange={(e) => update("depth", e.target.value)} /></Field><Field label="Unit"><Input value={form.dimensionUnit} onChange={(e) => update("dimensionUnit", e.target.value)} /></Field></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Weight"><Input value={form.weightValue} onChange={(e) => update("weightValue", e.target.value)} /></Field><Field label="Weight unit"><Input value={form.weightUnit} onChange={(e) => update("weightUnit", e.target.value)} /></Field></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><LongField label="Provenance" value={form.provenance} onChange={(value) => update("provenance", value)} /><LongField label="Authenticity information" value={form.authenticity} onChange={(value) => update("authenticity", value)} /><LongField label="Certificate information" value={form.certificate} onChange={(value) => update("certificate", value)} /><Field label="Inventory / reference number"><Input value={form.inventoryNumber} onChange={(e) => update("inventoryNumber", e.target.value)} /></Field></div></FormSection>

          <FormSection title="Images"><label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }} className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5 px-6 py-10 text-center hover:bg-gold/10"><ImagePlus className="size-8 text-gold" /><span className="mt-3 font-medium">Upload Images</span><span className="mt-1 text-xs text-muted-foreground">JPG, JPEG, PNG or WebP. Select multiple files or drag them here.</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} /></label>{previews.length > 0 && <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{previews.map((preview, index) => <div key={preview} className={`group relative overflow-hidden rounded-xl border ${coverIndex === index ? "border-gold ring-2 ring-gold/30" : "border-border"}`}><img src={preview} alt={`Upload ${index + 1}`} className="aspect-square w-full object-cover" /><div className="absolute inset-x-1 bottom-1 flex justify-between gap-1"><button type="button" onClick={() => setCoverIndex(index)} className="rounded bg-black/70 px-2 py-1 text-[10px] text-white">{coverIndex === index ? "Cover" : "Make cover"}</button><button type="button" onClick={() => removeImage(index)} className="rounded bg-black/70 p-1 text-white"><Trash2 className="size-3" /></button></div><GripVertical className="absolute right-2 top-2 size-4 text-white drop-shadow" /></div>)}</div>}</FormSection>

          <FormSection title="Pricing & availability"><div className="grid gap-5 sm:grid-cols-4"><Field label="Price"><Input value={form.price} onChange={(e) => update("price", e.target.value)} type="number" min="0" /></Field><Field label="Currency"><Select value={form.currency} onValueChange={(value) => update("currency", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field><Field label="Price type" className="sm:col-span-2"><Select value={form.priceType} onValueChange={(value) => update("priceType", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fixed">Fixed price</SelectItem><SelectItem value="on_request">Price on request</SelectItem><SelectItem value="contact">Contact us</SelectItem></SelectContent></Select></Field></div></FormSection>

          <FormSection title="Additional information"><div className="grid gap-5 sm:grid-cols-2"><Field label="Collection"><Input value={form.collection} onChange={(e) => update("collection", e.target.value)} /></Field><Field label="Acquisition date"><Input type="date" value={form.acquisitionDate} onChange={(e) => update("acquisitionDate", e.target.value)} /></Field><Field label="Location"><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></Field><Field label="Insurance value"><Input value={form.insuranceValue} onChange={(e) => update("insuranceValue", e.target.value)} /></Field><LongField label="Shipping information" value={form.shipping} onChange={(value) => update("shipping", value)} /><LongField label="Restoration information" value={form.restoration} onChange={(value) => update("restoration", value)} /><LongField label="Special notes" value={form.specialNotes} onChange={(value) => update("specialNotes", value)} /><LongField label="Internal notes (private)" value={form.internalNotes} onChange={(value) => update("internalNotes", value)} /></div></FormSection>

          <FormSection title="SEO information"><div className="grid gap-5 sm:grid-cols-2"><Field label="SEO title"><Input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} /></Field><Field label="URL slug"><Input value={form.slug || generatedSlug} onChange={(e) => update("slug", e.target.value)} /></Field><LongField label="SEO description" value={form.seoDescription} onChange={(value) => update("seoDescription", value)} /><LongField label="SEO keywords" value={form.seoKeywords} onChange={(value) => update("seoKeywords", value)} /></div></FormSection>
        </div>

        <aside className="sticky top-24 rounded-[1.75rem] border border-gold/25 bg-gradient-espresso p-5 text-espresso-foreground shadow-lift lg:p-6"><p className="text-xs uppercase tracking-[0.3em] text-gold">Live preview</p><div className="mt-5 overflow-hidden rounded-2xl border border-gold/20 bg-black/20">{previews[coverIndex] ? <img src={previews[coverIndex]} alt="Preview" className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center text-sm text-espresso-foreground/50">Your cover image will appear here</div>}<div className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-gold">{form.category}{form.subcategory ? ` · ${form.subcategory}` : ""}</p><h2 className="mt-3 font-display text-3xl">{form.title || "Untitled antiquity"}</h2><p className="mt-3 text-sm text-espresso-foreground/70">{form.shortDescription || form.description || "Your description will appear here."}</p><dl className="mt-5 space-y-2 border-t border-gold/20 pt-4 text-sm"><PreviewRow label="Materials" value={materials.join(", ")} /><PreviewRow label="Origin" value={[form.origin, form.country].filter(Boolean).join(", ")} /><PreviewRow label="Period" value={form.period || form.approximateDate} /><PreviewRow label="Dimensions" value={[form.height, form.width, form.depth].filter(Boolean).join(" × ")} /><PreviewRow label="Condition" value={form.availability} /></dl><p className="mt-6 font-display text-2xl text-gold">{previewPrice}</p></div></div></aside>
      </div>
    </section>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-3xl border border-gold/20 bg-card p-5 shadow-soft sm:p-7"><h2 className="font-display text-2xl">{title}</h2><div className="mt-6">{children}</div></section>; }
function Field({ label, required, error, className, children }: { label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) { return <div className={className}><Label>{label}{required && <span className="ml-1 text-gold">*</span>}</Label>{children}{error && <p className="mt-1 text-xs text-destructive">{error}</p>}</div>; }
function LongField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <Field label={label}><Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} /></Field>; }
function PreviewRow({ label, value }: { label: string; value?: string }) { return value ? <div className="flex justify-between gap-4"><dt className="text-espresso-foreground/55">{label}</dt><dd className="text-right">{value}</dd></div> : null; }
