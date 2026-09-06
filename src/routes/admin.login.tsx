import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Private Access — JadisArt Gallery" },
      { name: "description", content: "Private access for the JadisArt gallery team." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Private Access — JadisArt" },
      { property: "og:description", content: "Private access for the JadisArt gallery team." },
    ],
  }),
  component: AdminLogin,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(6, "Enter your password.").max(200),
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInError || !data.user) {
        setError("Incorrect email or password.");
        return;
      }
      // Authorisation is decided by the database, never by the secret code.
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!roles?.some((row) => row.role === "admin")) {
        await supabase.auth.signOut();
        setError("This account does not have gallery administration access.");
        return;
      }
      navigate({ to: "/admin", replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-gold/25 bg-card p-7 shadow-lift sm:p-9">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground">
            <KeyRound aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs uppercase tracking-[0.34em] text-gold">JadisArt</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Private access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Reserved for the gallery team. Please sign in to manage the collection.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <div className="relative mt-2">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ps-9"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative mt-2">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="ps-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {submitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
      </div>
    </section>
  );
}
