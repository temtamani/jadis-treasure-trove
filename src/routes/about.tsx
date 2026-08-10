import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Eye, Handshake, HeartHandshake, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About JadisArt — Our Story, Mission & Values" },
      {
        name: "description",
        content:
          "Meet JadisArt: restorers turned dealers, working with 38 European partners to authenticate and place antiques, vintage design and collectibles.",
      },
      { property: "og:title", content: "About JadisArt — Our Story, Mission & Values" },
      {
        property: "og:description",
        content: "Restorers turned dealers, authenticating antiques and collectibles since day one.",
      },
    ],
  }),
  component: About,
});

const VALUES = [
  {
    icon: Eye,
    title: "Honesty over polish",
    body: "We photograph the chips as carefully as the gilding. Condition reports name every repair.",
  },
  {
    icon: Landmark,
    title: "Scholarship",
    body: "Attribution is research, not guesswork. If we cannot prove it, we say so plainly.",
  },
  {
    icon: HeartHandshake,
    title: "Stewardship",
    body: "We sell to people who will care for a piece, and we help them do it properly.",
  },
  {
    icon: Handshake,
    title: "Fair dealing",
    body: "Transparent pricing for buyers, fair terms for the dealers and makers we work with.",
  },
];

const TRUST = [
  "Independent authentication on every piece before listing",
  "Written condition report and provenance file with each sale",
  "14-day return window on any item that differs from its description",
  "Insured, fine-art crated delivery worldwide",
  "Specialists available by phone, email or private appointment",
];

function About() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-espresso py-28">
        <img
          src="/images/hero.jpg"
          alt=""
          width={1920}
          height={1280}
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover opacity-25"
        />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">About the company</p>
          <h1 className="mt-4 font-display text-5xl text-espresso-foreground sm:text-6xl">
            {COMPANY.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-espresso-foreground/75">
            JadisArt exists because good objects deserve accurate descriptions, and collectors
            deserve to know exactly what they are buying.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border shadow-lift">
          <img
            src="/images/product-bust.jpg"
            alt="A neoclassical marble bust in the JadisArt studio"
            width={1024}
            height={1024}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-gold">Our story</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">From workshop to marketplace</h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            The company started as a restoration workshop in the Marais: three benches, a fume
            cupboard and an unreasonable number of varnish samples. Clients kept asking where they
            could find pieces of the same calibre, and the honest answer was that most of the market
            was opaque.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            So we built the marketplace we wanted to buy from. Every object is inspected in person,
            dated, photographed under consistent light, and listed with a condition report that
            hides nothing. Today JadisArt places furniture, paintings, jewelry, coins, ceramics and
            curiosities into collections across thirty countries.
          </p>
          <Button variant="gold" className="mt-8" asChild>
            <Link to="/marketplace">
              <Sparkles aria-hidden="true" /> See what is available now
            </Link>
          </Button>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="bg-beige/60 py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-10 shadow-soft">
            <Compass className="size-6 text-gold" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl">Our mission</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              To make buying an antique as clear and confident as buying anything else: accurate
              descriptions, verified provenance, fair prices and specialists who answer the phone.
            </p>
          </div>
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-10 shadow-soft [animation-delay:120ms]">
            <Landmark className="size-6 text-gold" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl">Our vision</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A market where historical objects circulate responsibly — properly researched, properly
              restored, and passed on in better condition than we found them.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">What we hold to</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Our values</h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <div
              key={value.title}
              className="animate-fade-up rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
                <value.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-xl">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gradient-espresso py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">Peace of mind</p>
          <h2 className="mt-3 font-display text-4xl text-espresso-foreground sm:text-5xl">
            Why customers trust JadisArt
          </h2>
          <ul className="mx-auto mt-10 space-y-4 text-left">
            {TRUST.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-2xl glass-dark p-5 text-sm text-espresso-foreground/85"
              >
                <span className="mt-1 size-2 shrink-0 rounded-full bg-gradient-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Button variant="gold" size="lg" className="mt-10" asChild>
            <Link to="/contact">Talk to a specialist</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
