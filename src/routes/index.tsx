import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Gem,
  Globe2,
  Quote,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { useProducts } from "@/lib/products";
import { CATEGORIES } from "@/lib/catalog";
import { categoryIcon } from "@/lib/categories";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JadisArt — Curated Antiques, Vintage & Collectibles" },
      {
        name: "description",
        content:
          "Discover authenticated antiques, vintage design, paintings, jewelry and rare collectibles at JadisArt, a luxury marketplace for objects with history.",
      },
      { property: "og:title", content: "JadisArt — Curated Antiques, Vintage & Collectibles" },
      {
        property: "og:description",
        content:
          "A luxury marketplace for authenticated antiques, vintage design and rare collectibles.",
      },
    ],
  }),
  component: Home,
});

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Authenticated by specialists",
    body: "Every piece is examined, dated and documented by our in-house experts before it is listed.",
  },
  {
    icon: ScrollText,
    title: "Full provenance",
    body: "Condition reports, restoration history and origin travel with each object you acquire.",
  },
  {
    icon: Truck,
    title: "White-glove delivery",
    body: "Museum-grade crating and insured worldwide shipping, handled by fine-art couriers.",
  },
  {
    icon: Award,
    title: "Fair, transparent pricing",
    body: "No hidden buyer premiums. What you see is what you pay, with valuation notes included.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The console arrived crated like a museum loan. The gilding is even more beautiful in person, and the condition report was scrupulously honest.",
    name: "Élise Moreau",
    role: "Interior architect, Lyon",
  },
  {
    quote:
      "I have bought from auction houses for twenty years. JadisArt is the first dealer that made the whole process feel effortless and completely transparent.",
    name: "Thomas Whitfield",
    role: "Private collector, London",
  },
  {
    quote:
      "Their team traced the provenance of a Murano chandelier back to its original commission. That level of research is exceptional.",
    name: "Sofia Ricci",
    role: "Gallery director, Milan",
  },
];

function Home() {
  const { t, categoryName } = useLanguage();
  const { data: products = [], isLoading } = useProducts();
  const featured = products.filter((product) => product.is_featured).slice(0, 6);
  const showcase = featured.length ? featured : products.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="A candlelit antique gallery with gilded furniture and oil paintings"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-20 size-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-veil" aria-hidden="true" />

        <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-espresso-foreground sm:text-6xl lg:text-7xl">
              {t("home.title.before")} {" "}
              <span className="text-gradient-gold">{t("home.title.gold")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-espresso-foreground/80">
              {t("home.intro")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link to="/marketplace">
                  <Sparkles aria-hidden="true" /> {t("home.browse")}
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/about">{t("home.story")}</Link>
              </Button>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-gold/25 pt-8">
              {[
                { value: "2,400+", label: t("home.piecesPlaced") },
                { value: "38", label: t("home.dealers") },
                { value: "100%", label: t("home.authenticated") },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl text-gold">{stat.value}</dt>
                  <dd className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-espresso-foreground/60">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Featured antiques */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="featured">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("home.featuredEyebrow")}</p>
            <h2 id="featured" className="mt-3 font-display text-4xl sm:text-5xl">
              {t("home.featured")}
            </h2>
          </div>
          <Button variant="goldOutline" asChild>
            <Link to="/marketplace" search={{}}>{t("home.viewAll")}</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[460px] animate-pulse rounded-3xl border border-border bg-muted"
                />
              ))
            : showcase.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
        </div>
      </section>

      {/* Categories */}
      <section className="relative overflow-hidden bg-gradient-espresso py-24 text-espresso-foreground" aria-labelledby="categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("home.categoriesEyebrow")}</p>
            <h2 id="categories" className="mt-3 font-display text-4xl sm:text-5xl">
              {t("home.categories")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-espresso-foreground/65">{t("home.categoriesIntro")}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {CATEGORIES.map((category, index) => {
              const Icon = categoryIcon(category);
              return (
                <Link key={category} to="/marketplace" search={{ category }} aria-label={`${t("home.exploreCategory")}: ${categoryName(category)}`} className="group relative min-h-44 overflow-hidden rounded-lg border border-gold/20 bg-espresso/60 p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:min-h-52 sm:p-7" style={{ animationDelay: `${index * 45}ms` }}>
                  <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/35 bg-ink/25 transition-all duration-500 group-hover:border-gold/70 group-hover:shadow-gold sm:size-20">
                    <Icon className="size-7 text-gold transition-transform duration-500 group-hover:scale-110 sm:size-9" strokeWidth={1.25} aria-hidden="true" />
                  </span>
                  <span className="mt-5 block font-display text-lg leading-tight sm:text-xl">{categoryName(category)}</span>
                  <span className="mx-auto mt-4 block h-px w-8 bg-gold/45 transition-all duration-500 group-hover:w-16 group-hover:bg-gold" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="why">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("home.standard")}</p>
          <h2 id="why" className="mt-3 font-display text-4xl sm:text-5xl">
            {t("home.why")}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, index) => (
            <div
              key={reason.title}
              className="animate-fade-up rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
                <reason.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-xl">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-gradient-espresso py-24" aria-labelledby="about-home">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-gold/25 shadow-lift">
            <img
              src="/images/product-console.jpg"
              alt="An 18th-century gilded French console table"
              width={1024}
              height={1024}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="text-espresso-foreground">
            <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("home.aboutEyebrow")}</p>
            <h2 id="about-home" className="mt-3 font-display text-4xl sm:text-5xl">
              {t("home.aboutTitle")}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-espresso-foreground/75">
              JadisArt began in a narrow Marais workshop where three restorers spent their evenings
              arguing about varnish. That obsession became a company: we buy sparingly, research
              relentlessly and only list a piece when we can tell you exactly what it is.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-espresso-foreground/75">
              Today we work with thirty-eight partner dealers across Europe, placing furniture,
              paintings, jewelry and curiosities into private collections and interiors worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="gold" asChild>
                <Link to="/about">{t("home.readStory")}</Link>
              </Button>
              <Button variant="goldOutline" className="text-gold" asChild>
                <Link to="/contact">
                  <Globe2 aria-hidden="true" /> {t("home.specialist")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="testimonials"
      >
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("home.testimonialsEyebrow")}</p>
          <h2 id="testimonials" className="mt-3 font-display text-4xl sm:text-5xl">
            {t("home.testimonials")}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <figure
              key={testimonial.name}
              className="animate-fade-up rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <Quote className="size-6 text-gold" aria-hidden="true" />
              <blockquote className="mt-5 text-sm leading-relaxed text-muted-foreground">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <span className="block font-display text-lg">{testimonial.name}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {testimonial.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
