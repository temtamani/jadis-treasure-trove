import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { COMPANY, WHATSAPP_LINK } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact JadisArt — Talk to Our Antique Specialists" },
      {
        name: "description",
        content:
          "Contact the JadisArt gallery by form, phone, email or WhatsApp. Opening hours, address and answers to the most frequent questions about buying antiques.",
      },
      { property: "og:title", content: "Contact JadisArt — Talk to Our Antique Specialists" },
      {
        property: "og:description",
        content: "Reach the JadisArt team by form, phone, email, WhatsApp or live chat.",
      },
    ],
  }),
  component: Contact,
});

const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address, for example: example@gmail.com").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Please enter a subject").max(150),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});

function Contact() {
  const { t } = useLanguage();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = contactSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] = issue.message;
      setErrors(nextErrors);
      toast.error(t("checkout.correctFields"));
      return;
    }

    setErrors({});
    setSending(true);
    const emailResponse = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone || "",
        subject: parsed.data.subject,
        message: parsed.data.message,
      }),
    });

    if (!emailResponse.ok) {
      setSending(false);
      toast.error(t("contact.sendError"));
      return;
    }

    const { error } = await supabase.from("inquiries").insert({
      kind: "contact",
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: `Subject: ${parsed.data.subject}\n\n${parsed.data.message}`,
    });
    setSending(false);

    if (error) {
      toast.error(t("contact.sendError"));
      return;
    }
    toast.success(t("contact.sent"));
    form.reset();
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-espresso py-20 text-espresso-foreground sm:py-24">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("contact.eyebrow")}</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl lg:text-6xl">
            {t("contact.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-espresso-foreground/75">
            {t("contact.intro")}
          </p>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-10 overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        {/* Company information */}
        <div>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">JadisArt</h2>
          <ul className="mt-8 space-y-6 text-sm">
            <li className="flex gap-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("contact.email")}
                </span>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-gold">
                  {COMPANY.email}
                </a>
              </span>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("contact.phone")}
                </span>
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                  {COMPANY.phone}
                </a>
              </span>
            </li>
            <li className="flex gap-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("contact.address")}
                </span>
                {COMPANY.address}
              </span>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("contact.hours")}
                </span>
                {COMPANY.hours}
              </span>
            </li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-3xl border border-gold/20 bg-espresso shadow-lift">
            <iframe
              title="JadisArt gallery location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.3475%2C48.8570%2C2.3705%2C48.8700&layer=mapnik"
              loading="lazy"
              className="h-64 w-full border-0"
            />
          </div>
        </div>

        {/* Contact form */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-gold/25 bg-gradient-to-br from-card via-card to-beige/30 p-6 shadow-lift sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gold/10 blur-3xl" />
          <h2 className="relative font-display text-3xl">{t("contact.send")}</h2>
          <p className="relative mt-2 text-sm text-muted-foreground">{t("contact.intro")}</p>
          <form onSubmit={submit} className="relative mt-8 space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">{t("checkout.fullName")}</Label>
                <Input id="full_name" name="full_name" maxLength={100} placeholder="John Doe" className="mt-2 transition-shadow focus-visible:ring-gold/60" required />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.full_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={255}
                  placeholder="example@gmail.com"
                  className="mt-2 transition-shadow focus-visible:ring-gold/60"
                  required
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">{t("account.phone")}</Label>
                <Input id="phone" name="phone" type="tel" maxLength={40} placeholder="+212 6 00 00 00 00" className="mt-2 transition-shadow focus-visible:ring-gold/60" />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="subject">{t("contact.subject")}</Label>
                <Input id="subject" name="subject" maxLength={150} placeholder="Antique collection inquiry" className="mt-2 transition-shadow focus-visible:ring-gold/60" required />
                {errors.subject && (
                  <p className="mt-1 text-xs text-destructive">{errors.subject}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="message">{t("contact.message")}</Label>
              <Textarea id="message" name="message" rows={6} maxLength={1000} placeholder="Tell us how we can help..." className="mt-2 transition-shadow focus-visible:ring-gold/60" required />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" variant="gold" size="lg" disabled={sending} className="w-full transition-transform hover:-translate-y-0.5">
              {sending ? t("contact.sending") : t("contact.sendButton")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("contact.inbox")} ({COMPANY.email}).
            </p>
          </form>
        </div>
      </section>

      {/* Besoin d'aide */}
      <section className="bg-beige/60 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl">{t("contact.help")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("contact.helpIntro")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="gold" asChild>
              <a href={`mailto:${COMPANY.email}`}>{t("contact.contactUs")}</a>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/support">
                <MessageCircle aria-hidden="true" /> {t("contact.chat")}
              </Link>
            </Button>
            <Button variant="espresso" asChild>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer noopener">
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl sm:text-4xl">{t("contact.faq")}</h2>
        <Accordion type="single" collapsible className="mt-8">
          {([1, 2, 3, 4] as const).map((number) => (
            <AccordionItem key={number} value={t(`faq.${number}q`)}>
              <AccordionTrigger className="text-left font-display text-lg">{t(`faq.${number}q`)}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {t(`faq.${number}a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
