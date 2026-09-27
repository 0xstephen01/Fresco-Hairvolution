import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Gallery } from "@/components/landing/Gallery";
import { AboutFresco } from "@/components/landing/AboutFresco";
import { Reviews } from "@/components/landing/Reviews";
import { BookingForm } from "@/components/landing/BookingForm";
import { Faq } from "@/components/landing/Faq";

export function Landing() {
  return (
    <>
      <Hero />
      <AboutFresco />
      <Services />
      <Gallery />
      <Reviews />
      <BookingForm />
      <Faq />
    </>
  );
}
