import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Headset, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";

/** Floating customer-service launcher, bottom-right on every page. */
export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // The dedicated page already shows the full conversation.
  if (pathname === "/support") return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] animate-fade-up">
          <ChatPanel compact />
        </div>
      )}
      <Button
        variant="gold"
        size="icon"
        aria-expanded={open}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat service client"}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-4 z-50 size-14 rounded-full shadow-lift"
      >
        {open ? <X aria-hidden="true" /> : <Headset aria-hidden="true" />}
      </Button>
    </>
  );
}
