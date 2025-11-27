// app/lib/themes.ts

// Tüm tema ID'lerin
export const FREE_TEMPLATES = [
  "classic",
  "modern",
  "minimal",
  "pinkModern",
] as const;

export const PREMIUM_TEMPLATES = [
  "tealWave",
  "navyBlueModern",
  "amberRibbon",
  "graphiteGrid",
  "auroraSplit",
  "slateLine"
] as const;

export type FreeTemplateId = (typeof FREE_TEMPLATES)[number];
export type PremiumTemplateId = (typeof PREMIUM_TEMPLATES)[number];
export type TemplateId = FreeTemplateId | PremiumTemplateId;

// Premium mu?
export const isPremiumTemplate = (id: string): boolean =>
  PREMIUM_TEMPLATES.includes(id as PremiumTemplateId);

// (İleride lazım olabilir) Kullanıcıya gözükecek isim
export const TEMPLATE_DISPLAY_NAMES: Record<TemplateId, string> = {
  classic: "Klasik",
  modern: "Modern",
  minimal: "Minimal",
  pinkModern: "Pembe Modern",

  tealWave: "Teal Wave",
  navyBlueModern: "Açık Mavi Modern",
  amberRibbon: "Amber Ribbon",
  graphiteGrid: "Graphite Grid",
  auroraSplit: "Aurora Split",
  slateLine: "Slate Line",
};
