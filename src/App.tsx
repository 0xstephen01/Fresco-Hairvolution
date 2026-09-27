import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Landing } from "@/pages/Landing";
import { MyBookings } from "@/pages/MyBookings";
import { BookingConfirmed } from "@/pages/BookingConfirmed";
import { Admin } from "@/pages/Admin";
import { HeroPreview } from "@/pages/HeroPreview";
import { Setup } from "@/pages/Setup";
import { useRoute } from "@/lib/router";
import { hydrate } from "@/lib/store";

export default function App() {
  const route = useRoute();

  useEffect(() => {
    if (!window.location.hash) window.location.hash = "/";
  }, []);

  useEffect(() => {
    void hydrate();
  }, []);

  if (route.startsWith("/admin")) {
    return <Admin />;
  }

  if (route === "/preview") {
    return <HeroPreview />;
  }

  if (route === "/setup") {
    return <Setup />;
  }

  let page = <Landing />;
  if (route.startsWith("/booking/")) {
    page = <BookingConfirmed bookingId={route.slice("/booking/".length)} />;
  } else if (route === "/my-bookings") {
    page = <MyBookings />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        {page}
      </div>
      <Footer />
    </div>
  );
}