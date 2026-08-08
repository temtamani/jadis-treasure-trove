import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create Your JadisArt Account" },
      {
        name: "description",
        content:
          "Sign in to JadisArt with Google or email to follow your orders, wishlist and conversations with our antique specialists.",
      },
      { property: "og:title", content: "Sign In or Create Your JadisArt Account" },
      { property: "og:description", content: "Access your JadisArt account, orders and wishlist." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  first_name: z.string().trim().min(2, "Please enter your first name").max(60),
  last_name: z.string().trim().min(2, "Please enter your last name").max(60),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().min(6, "Please enter your phone number").max(40),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(1, "Please enter your password").max(72),
});

function GoogleButton({ label }: { label: string }) {
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
      {busy ? "Connecting…" : label}
    </Button>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account", replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
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
    toast.success("Welcome back to JadisArt.");
    navigate({ to: "/account" });
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: parsed.data.first_name,
          last_name: parsed.data.last_name,
          full_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
          phone: parsed.data.phone,
        },
      },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }

    if (data.session) {
      await supabase.from("profiles").upsert({
        id: data.session.user.id,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        full_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
        phone: parsed.data.phone,
      });
      setBusy(false);
      toast.success("Your JadisArt account is ready.");
      navigate({ to: "/account" });
      return;
    }

    setBusy(false);
    toast.success("Check your inbox to confirm your email address.");
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.34em] text-gold">JadisArt account</p>
        <h1 className="mt-3 font-display text-4xl">Welcome</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Follow your orders, wishlist and conversations with our specialists.
        </p>
      </div>

      <Tabs defaultValue="signin" className="mt-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <GoogleButton label="Continue with Google" />
            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={handleSignIn} noValidate className="space-y-4">
              <div>
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" name="email" type="email" className="mt-2" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="si-password">Password</Label>
                <Input id="si-password" name="password" type="password" className="mt-2" />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="signup">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <GoogleButton label="Continue with Google" />
            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={handleSignUp} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="su-first">First name</Label>
                  <Input id="su-first" name="first_name" className="mt-2" />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="su-last">Last name</Label>
                  <Input id="su-last" name="last_name" className="mt-2" />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" name="email" type="email" className="mt-2" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="su-phone">Phone number</Label>
                <Input id="su-phone" name="phone" type="tel" className="mt-2" />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="su-password">Password</Label>
                <Input id="su-password" name="password" type="password" className="mt-2" />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                {busy ? "Creating account…" : "Create my account"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Need help?{" "}
        <Link to="/support" className="text-gold underline-offset-4 hover:underline">
          Chat with customer service
        </Link>
      </p>
    </section>
  );
}
