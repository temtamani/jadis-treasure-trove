import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/jadisart-logo.png";
import { CATEGORIES, COMPANY } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="bg-gradient-espresso text-espresso-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={44} height={44} loading="lazy" className="h-10 w-10" />
            <span className="font-display text-2xl tracking-[0.18em]">JADISART</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-espresso-foreground/70">
            A curated marketplace for antiques, vintage design, collectibles and objects with a
            history worth keeping.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.28em] text-gold">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm text-espresso-foreground/75">
            <li>
              <Link to="/marketplace" className="hover:text-gold">
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                About JadisArt
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold">
                Contact &amp; FAQ
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-gold">
                Shopping cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.28em] text-gold">Categories</h3>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-espresso-foreground/75">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  to="/marketplace"
                  search={{ category }}
                  className="hover:text-gold"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.28em] text-gold">Gallery</h3>
          <ul className="mt-5 space-y-4 text-sm text-espresso-foreground/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{COMPANY.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-gold">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-espresso-foreground/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} JadisArt. All rights reserved.</p>
          <p>{COMPANY.hours}</p>
        </div>
      </div>
    </footer>
  );
}
