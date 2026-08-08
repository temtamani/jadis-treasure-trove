import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { COMPANY, WHATSAPP_LINK } from "@/lib/catalog";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Customer Service Chat — JadisArt" },
      {
        name: "description",
        content:
          "Chat live with the JadisArt customer-service team about a piece, a delivery or a valuation, or reach us by email, phone or WhatsApp.",
      },
      { property: "og:title", content: "Customer Service Chat — JadisArt" },
      {
        property: "og:description",
        content: "Live chat with the JadisArt customer-service team.",
      },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.34em] text-gold">Service client</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Besoin d&apos;aide ?</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Notre équipe JadisArt est à votre disposition pour répondre à vos questions sur une pièce,
          une livraison, une estimation ou une commande en cours.
        </p>
        <div className="mt-8 space-y-3">
          <Button variant="goldOutline" asChild className="w-full justify-start">
            <a href={`mailto:${COMPANY.email}`}>
              <Mail aria-hidden="true" /> Contactez-nous par email
            </a>
          </Button>
          <Button variant="espresso" asChild className="w-full justify-start">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer noopener">
              <MessageCircle aria-hidden="true" /> WhatsApp
            </a>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link to="/contact">Formulaire de contact</Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">{COMPANY.hours}</p>
      </div>

      <div className="min-h-[32rem]">
        <ChatPanel />
      </div>
    </section>
  );
}
