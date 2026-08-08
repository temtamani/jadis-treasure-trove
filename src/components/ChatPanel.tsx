import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSupportMessages, type SupportMessage } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AGENT_NAME = "JadisArt · Service Client";

const AGENT_REPLIES = [
  "Bonjour, avec plaisir. Comment pouvons-nous vous aider ?",
  "Merci pour votre message. Un conseiller vous répond dans quelques instants.",
  "Nous vérifions cette pièce pour vous et revenons vers vous très vite.",
];

function timestamp(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Conversation UI shared by the floating widget and the full customer-service page. */
export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: remote = [] } = useSupportMessages(user?.id);
  const [guestThread, setGuestThread] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = user ? remote : guestThread;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setDraft("");
    const reply = AGENT_REPLIES[Math.min(messages.length / 2, AGENT_REPLIES.length - 1) | 0];

    if (!user) {
      const now = new Date().toISOString();
      setGuestThread((current) => [
        ...current,
        { id: `${now}-u`, sender: "user", body, created_at: now },
        { id: `${now}-a`, sender: "agent", body: reply, created_at: now },
      ]);
      return;
    }

    setSending(true);
    try {
      await supabase.from("support_messages").insert({ user_id: user.id, sender: "user", body });
      await supabase
        .from("support_messages")
        .insert({ user_id: user.id, sender: "agent", body: reply });
      await queryClient.invalidateQueries({ queryKey: ["support-messages", user.id] });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-gold/25 bg-card shadow-lift">
      <header className="flex items-center gap-3 border-b border-gold/20 bg-gradient-espresso px-4 py-3 text-espresso-foreground">
        <span className="relative flex size-10 items-center justify-center rounded-full bg-gradient-gold font-display text-lg text-gold-foreground">
          J
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-espresso bg-emerald-400"
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{AGENT_NAME}</p>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300">En ligne</p>
        </div>
      </header>

      <div
        className={`flex-1 space-y-3 overflow-y-auto bg-beige/40 px-4 py-4 ${compact ? "max-h-80" : "min-h-[24rem]"}`}
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="rounded-2xl border border-gold/20 bg-card px-4 py-3 text-sm text-muted-foreground">
            Bonjour et bienvenue chez JadisArt. Posez-nous votre question, notre équipe vous répond
            rapidement.
          </div>
        )}
        {messages.map((message) => {
          const mine = message.sender === "user";
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
                    mine
                      ? "rounded-br-md bg-gradient-gold text-gold-foreground"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                  }`}
                >
                  {message.body}
                </div>
                <p
                  className={`mt-1 text-[0.65rem] text-muted-foreground ${mine ? "text-right" : ""}`}
                >
                  {mine ? "Vous" : AGENT_NAME} · {timestamp(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-card p-3">
        <label htmlFor="chat-input" className="sr-only">
          Votre message
        </label>
        <Input
          id="chat-input"
          value={draft}
          maxLength={1000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Écrivez votre message…"
          className="rounded-full"
        />
        <Button type="submit" variant="gold" size="icon" className="rounded-full" disabled={sending}>
          <Send aria-hidden="true" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </form>

      {!user && (
        <p className="border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <Link to="/auth" className="text-gold underline-offset-4 hover:underline">
            Connectez-vous
          </Link>{" "}
          pour conserver l&apos;historique de vos conversations.
        </p>
      )}
    </div>
  );
}
