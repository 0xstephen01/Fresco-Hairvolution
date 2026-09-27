import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Brand";
import { navigate, scrollToId, useRoute } from "@/lib/router";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "top", label: "Home" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

export function Header() {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const overHero = route === "/" && !scrolled;

  useEffect(() => {
    setOpen(false);
  }, [route]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go(id: string) {
    if (id === "top") {
      if (route !== "/") navigate("/");
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    scrollToId(id);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-white/10 bg-background/90 backdrop-blur",
      )}
    >
      <div className="flex h-16 w-full items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => go("top")}
          aria-label="Fresco Hairvolution, home"
          className="mr-auto flex cursor-pointer items-center rounded-xl text-left focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <Logo className="h-9 w-9 sm:h-10 sm:w-10" />
        </button>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className={cn(
                "cursor-pointer text-[11px] font-medium tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                overHero
                  ? "text-white/75 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => scrollToId("book")}
            className={cn(
              "hidden h-9 rounded-lg px-4 text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 sm:inline-flex sm:h-10 sm:px-5",
              overHero
                ? "bg-white text-neutral-950 hover:-translate-y-px hover:bg-white/90"
                : "bg-primary text-primary-foreground hover:-translate-y-px",
            )}
          >
            Book appointment
          </Button>

          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 cursor-pointer lg:hidden",
                  overHero && "text-white hover:bg-white/10 hover:text-white",
                )}
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X /> : <Menu />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 lg:hidden">
              {LINKS.map((link) => (
                <DropdownMenuItem
                  key={link.id}
                  className="h-11 cursor-pointer"
                  onSelect={() => go(link.id)}
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="h-11 cursor-pointer" onSelect={() => scrollToId("book")}>
                Book a home visit
              </DropdownMenuItem>
              <DropdownMenuItem className="h-11 cursor-pointer" onSelect={() => scrollToId("faq")}>
                Questions
              </DropdownMenuItem>
              <DropdownMenuItem className="h-11 cursor-pointer" onSelect={() => navigate("/my-bookings")}>
                My bookings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
