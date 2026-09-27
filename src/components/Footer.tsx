import { Camera, MessageCircle, Music2, Phone } from "lucide-react";
import { Logo } from "@/components/Brand";
import { useDB } from "@/lib/store";
import { navigate, scrollToId } from "@/lib/router";
import { whatsappLink } from "@/lib/format";

export function Footer() {
  const db = useDB();
  const { settings } = db;
  const wa = whatsappLink(settings.whatsapp, "Hi Fresco, I would like to book a home visit.");

  return (
    <footer id="contact" className="border-t border-white/10 bg-background">
      <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1.5fr] gap-3 sm:gap-6 lg:gap-10">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Fresco Hairvolution, home"
              className="flex cursor-pointer items-center rounded-xl text-left"
            >
              <Logo />
            </button>
            <p className="mt-3 text-[10px] font-semibold tracking-tight sm:mt-5 sm:text-sm">
              Fresco Hairvolution
            </p>
          </div>

          <div>
            <h3 className="caps text-[9px] font-semibold tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
              On this page
            </h3>
            <ul className="mt-3 space-y-2 text-[10px] sm:mt-5 sm:space-y-3 sm:text-sm">
              {[
                { id: "services", label: "Services & prices" },
                { id: "gallery", label: "Recent work" },
                { id: "book", label: "Book a home visit" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(link.id)}
                    className="cursor-pointer text-left text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="caps text-[9px] font-semibold tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
              More
            </h3>
            <ul className="mt-3 space-y-2 text-[10px] sm:mt-5 sm:space-y-3 sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToId("reviews")}
                  className="cursor-pointer text-left text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reviews
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToId("faq")}
                  className="cursor-pointer text-left text-muted-foreground transition-colors hover:text-foreground"
                >
                  Questions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/my-bookings")}
                  className="cursor-pointer text-left text-muted-foreground transition-colors hover:text-foreground"
                >
                  My bookings
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="caps text-[9px] font-semibold tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
              Contact
            </h3>
            <ul className="mt-3 space-y-2 text-[10px] sm:mt-5 sm:space-y-3 sm:text-sm">
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:gap-2"
                >
                  <Phone className="size-3 shrink-0 sm:size-4" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground sm:gap-2"
                >
                  <MessageCircle className="size-3 shrink-0 sm:size-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:gap-2"
                >
                  <Camera className="size-3 shrink-0 sm:size-4" />
                  <span>@{settings.instagram}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://tiktok.com/@${settings.tiktok}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:gap-2"
                >
                  <Music2 className="size-3 shrink-0 sm:size-4" />
                  <span>@{settings.tiktok}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-[9px] text-muted-foreground sm:mt-12 sm:pt-8 sm:text-xs">
          <p>© {new Date().getFullYear()} Fresco Hairvolution, Lagos.</p>
        </div>
      </div>
    </footer>
  );
}
