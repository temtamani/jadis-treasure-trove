import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Eye, Handshake, HeartHandshake, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/catalog";
import { useLanguage } from "@/context/language";

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
  { icon: Eye, title: "about.value1.title", body: "about.value1.body" },
  { icon: Landmark, title: "about.value2.title", body: "about.value2.body" },
  { icon: HeartHandshake, title: "about.value3.title", body: "about.value3.body" },
  { icon: Handshake, title: "about.value4.title", body: "about.value4.body" },
] as const;

const TRUST = ["about.trust1", "about.trust2", "about.trust3", "about.trust4", "about.trust5"] as const;

function About() {
  const { t } = useLanguage();

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
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("about.eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl text-espresso-foreground sm:text-6xl">
            {COMPANY.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-espresso-foreground/75">
            {t("about.intro")}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border shadow-lift">
          <img
            src="/images/product-bust.jpg"
            alt={t("about.storyImageAlt")}
            width={1024}
            height={1024}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("about.storyEyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{t("about.storyTitle")}</h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{t("about.story1")}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("about.story2")}</p>
          <Button variant="gold" className="mt-8" asChild>
            <Link to="/marketplace">
              <Sparkles aria-hidden="true" /> {t("about.storyCta")}
            </Link>
          </Button>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="bg-beige/60 py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-10 shadow-soft">
            <Compass className="size-6 text-gold" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl">{t("about.missionTitle")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("about.mission")}
            </p>
          </div>
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-10 shadow-soft [animation-delay:120ms]">
            <Landmark className="size-6 text-gold" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl">{t("about.visionTitle")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("about.vision")}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("about.valuesEyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{t("about.valuesTitle")}</h2>
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
              <h3 className="mt-6 font-display text-xl">{t(value.title)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(value.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gradient-espresso py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("about.trustEyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl text-espresso-foreground sm:text-5xl">
            {t("about.trustTitle")}
          </h2>
          <ul className="mx-auto mt-10 space-y-4 text-start">
            {TRUST.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-2xl glass-dark p-5 text-sm text-espresso-foreground/85"
              >
                <span
                  className="mt-1 size-2 shrink-0 rounded-full bg-gradient-gold"
                  aria-hidden="true"
                />
                {t(item)}
              </li>
            ))}
          </ul>
          <Button variant="gold" size="lg" className="mt-10" asChild>
            <Link to="/contact">{t("about.talk")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
