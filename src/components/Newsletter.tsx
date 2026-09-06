import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/language";

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email must be under 255 characters" });

/** Newsletter capture band used on the home page. */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const { t } = useLanguage();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(t("validation.email"));
      return;
    }
    setPending(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.toLowerCase() });
    setPending(false);

    if (error && !error.message.includes("duplicate")) {
      toast.error(t("newsletter.error"));
      return;
    }
    toast.success(t("newsletter.success"));
    setEmail("");
  };

  return (
    <section className="bg-gradient-espresso py-20" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("newsletter.eyebrow")}</p>
        <h2
          id="newsletter-heading"
          className="mt-4 font-display text-4xl text-espresso-foreground sm:text-5xl"
        >
          {t("newsletter.title")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-espresso-foreground/70">
          {t("newsletter.body")}
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            {t("newsletter.email")}
          </label>
          <Input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            className="h-12 rounded-full border-gold/30 bg-espresso-foreground/8 text-espresso-foreground placeholder:text-espresso-foreground/40"
          />
          <Button type="submit" variant="gold" size="lg" disabled={pending}>
            <Send aria-hidden="true" /> {pending ? t("newsletter.joining") : t("newsletter.join")}
          </Button>
        </form>
      </div>
    </section>
  );
}
