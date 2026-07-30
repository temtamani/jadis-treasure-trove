import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, User2, X, LayoutDashboard, LogOut } from "lucide-react";
import logo from "@/assets/jadisart-logo.png";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-gradient-espresso/95 glass-dark">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3" aria-label="JadisArt home">
          <img
            src={logo}
            alt="JadisArt monogram"
            width={48}
            height={48}
            className="h-11 w-11 transition-transform duration-500 group-hover:rotate-6"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-[0.18em] text-espresso-foreground">
              JADISART
            </span>
            <span className="mt-1 text-[0.6rem] uppercase tracking-[0.32em] text-gold">
              Antiques &amp; Curiosities
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative text-sm uppercase tracking-[0.16em] transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-gradient-gold after:transition-all after:duration-300 ${
                pathname === item.to
                  ? "text-gold after:w-full"
                  : "text-espresso-foreground/80 hover:text-gold after:w-0 hover:after:w-full"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="goldOutline" size="sm" className="hidden text-gold sm:inline-flex" asChild>
              <Link to="/dashboard">
                <LayoutDashboard aria-hidden="true" /> Dashboard
              </Link>
            </Button>
          )}

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Sign out"
              className="text-espresso-foreground hover:bg-gold/15 hover:text-gold"
            >
              <LogOut aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-espresso-foreground hover:bg-gold/15 hover:text-gold"
            >
              <Link to="/auth" aria-label="Sign in">
                <User2 aria-hidden="true" />
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative text-espresso-foreground hover:bg-gold/15 hover:text-gold"
          >
            <Link to="/cart" aria-label={`Shopping cart, ${count} items`}>
              <ShoppingBag aria-hidden="true" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-gold px-1 text-[0.65rem] font-semibold text-gold-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-espresso-foreground hover:bg-gold/15 hover:text-gold lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          className="animate-fade-in border-t border-gold/20 bg-gradient-espresso px-4 pb-6 pt-2 lg:hidden"
          aria-label="Mobile"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block border-b border-gold/10 py-3 text-sm uppercase tracking-[0.18em] text-espresso-foreground/85 hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="block py-3 text-sm uppercase tracking-[0.18em] text-gold"
            >
              Dashboard
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
