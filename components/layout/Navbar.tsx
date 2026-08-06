"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/SettingsProvider";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Pages with a dark hero — same floating pill header as the homepage */
const DARK_HERO_PAGES = ["/", "/products", "/about", "/contact"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const s = useSettings();

  const hasDarkHero = DARK_HERO_PAGES.includes(pathname);
  const overHero = hasDarkHero && !scrolled;
  const floating = hasDarkHero && scrolled;
  const onDarkBg = overHero || floating;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed z-50 transition-all duration-500 ease-out",
          floating
            ? "top-3 sm:top-5 inset-x-3 sm:inset-x-6 lg:inset-x-10"
            : "top-0 inset-x-0",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between transition-all duration-500",
            floating
              ? "max-w-5xl px-4 sm:px-6 py-2.5 bg-slate-950/90 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
              : overHero
                ? "max-w-7xl px-4 sm:px-6 lg:px-8 py-5 bg-transparent"
                : "max-w-7xl px-4 sm:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-nav",
          )}
        >
          <Link href="/" className="flex items-center gap-3 shrink-0 min-w-0">
            <img
              src="/firstlogo.png"
              alt="Chico Water logo"
              className={cn(
                "w-auto transition-all duration-500 shrink-0",
                floating ? "h-9" : overHero ? "h-12 sm:h-14" : "h-11",
              )}
            />
            <div className="hidden sm:flex flex-col justify-center min-w-0">
              <span
                className={cn(
                  "font-serif font-semibold leading-tight tracking-tight transition-colors duration-300 truncate",
                  floating ? "text-sm" : "text-base lg:text-[1.05rem]",
                  onDarkBg ? "text-white" : "text-slate-900",
                )}
              >
                {s.business_name || "Chico Water Limited"}
              </span>
              <span
                className={cn(
                  "text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.22em] mt-0.5",
                  onDarkBg ? "text-white/45" : "text-slate-500",
                )}
              >
                Pure Water · Pure Life
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                    onDarkBg
                      ? active
                        ? "text-white bg-white/15"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                      : active
                        ? "text-water-700 bg-water-50"
                        : "text-slate-600 hover:text-water-700 hover:bg-slate-50",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <Link
              href="/track"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-full transition-colors whitespace-nowrap",
                onDarkBg
                  ? "text-white/75 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-water-700 hover:bg-slate-50",
              )}
            >
              Track Order
            </Link>
            <Link
              href="/auth/login"
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-full border transition-all whitespace-nowrap",
                onDarkBg
                  ? "border-white/25 text-white/90 hover:bg-white/10"
                  : "border-slate-200 text-slate-700 hover:border-water-600 hover:text-water-700",
              )}
            >
              Sign In
            </Link>
            <Link
              href="/order"
              className={cn(
                "text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap",
                overHero
                  ? "bg-[#c4a574] text-slate-900 hover:bg-[#d4b584]"
                  : floating
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-water-600 text-white hover:bg-water-700 shadow-soft",
              )}
            >
              Order Now
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "lg:hidden p-2.5 rounded-full transition-colors shrink-0",
              onDarkBg
                ? "text-white hover:bg-white/10"
                : "text-slate-700 hover:bg-slate-100",
            )}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute left-3 right-3 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-fade-in overflow-hidden",
              floating ? "top-20" : "top-24",
            )}
          >
            <div className="px-4 py-5 space-y-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl font-medium text-sm transition-colors",
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                <Link
                  href="/track"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl text-sm"
                >
                  Track Order
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/order"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block text-center font-semibold px-4 py-3 rounded-xl text-sm",
                    floating
                      ? "bg-white text-slate-900"
                      : "bg-[#c4a574] text-slate-900",
                  )}
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
