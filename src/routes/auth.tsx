import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In to Your JadisArt Account" },
      {
        name: "description",
        content:
          "Sign in to JadisArt with Google or email to follow your orders, wishlist and conversations with our antique specialists.",
      },
      { property: "og:title", content: "Sign In to Your JadisArt Account" },
      { property: "og:description", content: "Access your JadisArt account, orders and wishlist." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(1, "Please enter your password").max(72),
});

function GoogleButton({ label, busyLabel }: { label: string; busyLabel: string }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    window.location.assign("/account");
  };
  return (
    <Button variant="goldOutline" className="w-full" onClick={onClick} disabled={busy} type="button">
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1h-9.18v2.96h5.27c-.23 1.4-1.63 4.1-5.27 4.1a5.94 5.94 0 0 1 0-11.88c1.7 0 2.84.72 3.5 1.34l2.38-2.3C16.5 3.9 14.6 3 12.17 3a9 9 0 1 0 0 18c5.2 0 8.64-3.65 8.64-8.8 0-.6-.06-1.05-.46-1.1Z"
        />
      </svg>
      {busy ? busyLabel : label}
    </Button>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account", replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = t(`validation.${String(issue.path[0])}` as never);
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.welcomeBack"));
    navigate({ to: "/admin" });
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.34em] text-gold">{t("auth.account")}</p>
        <h1 className="mt-3 font-display text-4xl">{t("auth.welcome")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("auth.intro")}
        </p>
      </div>

      <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <GoogleButton label={t("auth.google")} busyLabel={t("auth.connecting")} />
            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> {t("auth.or")} <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={handleSignIn} noValidate className="space-y-4">
              <div>
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" name="email" type="email" defaultValue="temtamania@gmail.com" className="mt-2" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="si-password">{t("auth.password")}</Label>
                <div className="relative mt-2">
                  <Input
                    id="si-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-gold"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                {busy ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>
          </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("auth.help")}{" "}
        <Link to="/support" className="text-gold underline-offset-4 hover:underline">
          {t("auth.chat")}
        </Link>
      </p>
    </section>
  );
}
