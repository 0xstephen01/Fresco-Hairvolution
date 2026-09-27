import { useEffect, useState } from "react";

function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function useRoute(): string {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(to: string): void {
  const path = to.startsWith("/") ? to : `/${to}`;
  if (window.location.hash.replace(/^#/, "") === path) return;
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (window.location.hash !== "#/") {
    window.location.hash = "/";
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }
}