// Canonical Pokémon type colors, used for card accents and type badges.
export const TYPE_COLORS = {
  normal: "#9aa3b0",
  fire: "#ff7a3c",
  water: "#4d9bff",
  electric: "#ffcb05",
  grass: "#5fce6a",
  ice: "#73d6e0",
  fighting: "#e0414a",
  poison: "#b25cd6",
  ground: "#e2b24a",
  flying: "#8fa8ff",
  psychic: "#ff6c97",
  bug: "#a9c734",
  rock: "#c7b370",
  ghost: "#7b6bd6",
  dragon: "#6a52f4",
  dark: "#6d6076",
  steel: "#9bb1c4",
  fairy: "#ff9ed1",
};

export const typeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.normal;

// Pick a readable text color (near-black or white) for a given background,
// using WCAG relative luminance so badge labels stay legible on any type color.
export const readableText = (hex) => {
  const c = hex.replace("#", "");
  const channel = (v) => {
    const s = parseInt(v, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum =
    0.2126 * channel(c.slice(0, 2)) +
    0.7152 * channel(c.slice(2, 4)) +
    0.0722 * channel(c.slice(4, 6));
  // Contrast of white vs the color; if it's comfortably high, use white text.
  return (1.05 / (lum + 0.05)) >= 3.2 ? "#ffffff" : "#0b1026";
};
