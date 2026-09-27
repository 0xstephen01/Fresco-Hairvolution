/** Photo for each service, matched to the seeded catalogue ids. */
export const SERVICE_IMAGES: Record<string, string> = {
  "cut-skin-fade": "/uploads/cut-skin-fade.jpg",
  "cut-taper-fade": "/uploads/cut-taper-fade.jpg",
  "cut-low-cut": "/uploads/cut-low-cut.jpg",
  "cut-afro-trim": "/uploads/cut-afro-trim.jpg",
  "kids-fade": "/uploads/cut-kids-fade.jpg",
  "kids-cut-line": "/uploads/kids-cut-line.jpg",
  "extra-towel": "/uploads/extra-towel.jpg",
  "extra-dye": "/uploads/cut-hair-dye.jpg",
};

export function serviceImage(id: string): string {
  return SERVICE_IMAGES[id] ?? "/uploads/barber-kit.jpg";
}

export const HERO_IMAGE = "/uploads/hero-home-service.jpg";
/** Full-bleed backdrop for the landing hero: the uploaded Fresco photo. */
export const HERO_SHOP_IMAGE = "/uploads/hero.jpg";
export const KIT_IMAGE = "/uploads/barber-kit.jpg";
export const PORTRAIT_IMAGE = "/uploads/93eeb26a-ead4-4743-acf0-db288c868e77.jpg";