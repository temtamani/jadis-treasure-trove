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
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Please enter a subject").max(150),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});

const FAQ = [
  {
    q: "How do you authenticate the pieces you sell?",
    a: "Every object is examined by our in-house specialists and, when relevant, by an external expert. A condition report and provenance note travel with each purchase.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. We work with fine-art couriers and ship worldwide with museum-grade crating and full insurance.",
  },
  {
    q: "Can I return an item?",
    a: "You may return any piece within 14 days of delivery if it does not match its description. Items must be returned in their original crating.",
  },
  {
    q: "Do you buy or take antiques on consignment?",
    a: "We do. Send photographs, dimensions and any provenance you have through the form and our acquisitions team will reply within two working days.",
  },
];

function Contact() {
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
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setErrors({});
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      kind: "contact",
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: `Subject: ${parsed.data.subject}\n\n${parsed.data.message}`,
    });
    setSending(false);

    if (error) {
      toast.error("Your message could not be sent. Please try again.");
      return;
    }
    toast.success("Message sent — our team replies within one working day.");
    form.reset();
  };

  return (
    <>
      <section className="bg-gradient-espresso py-20 text-espresso-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">Get in touch</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl lg:text-6xl">
            Contact the JadisArt gallery
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-espresso-foreground/75">
            A question about a piece, a valuation, a delivery? Our specialists answer every message
            personally.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        {/* Company information */}
        <div>
          <h2 className="font-display text-3xl">JadisArt</h2>
          <ul className="mt-8 space-y-6 text-sm">
            <li className="flex gap-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Email
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
                  Phone
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
                  Address
                </span>
                {COMPANY.address}
              </span>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Opening hours
                </span>
                {COMPANY.hours}
              </span>
            </li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-3xl border border-border shadow-soft">
            <iframe
              title="JadisArt gallery location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.3475%2C48.8570%2C2.3705%2C48.8700&layer=mapnik"
              loading="lazy"
              className="h-64 w-full border-0"
            />
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-2xl">Send us a message</h2>
          <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" maxLength={100} className="mt-2" required />
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
                  className="mt-2"
                  required
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" type="tel" maxLength={40} className="mt-2" />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" maxLength={150} className="mt-2" required />
                {errors.subject && (
                  <p className="mt-1 text-xs text-destructive">{errors.subject}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={6} maxLength={1000} className="mt-2" required />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" variant="gold" size="lg" disabled={sending} className="w-full">
              {sending ? "Sending…" : "Send message"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your message is delivered to the JadisArt inbox ({COMPANY.email}).
            </p>
          </form>
        </div>
      </section>

      {/* Besoin d'aide */}
      <section className="bg-beige/60 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl">Besoin d&apos;aide ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Notre équipe JadisArt est à votre disposition pour répondre à vos questions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="gold" asChild>
              <a href={`mailto:${COMPANY.email}`}>Contactez-nous</a>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/support">
                <MessageCircle aria-hidden="true" /> Chat avec le service client
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
        <h2 className="text-center font-display text-3xl sm:text-4xl">Frequent questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left font-display text-lg">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
