/** Light screens get dark status-bar icons, as on a real phone. Takes "#rrggbb". */
export const isLight = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
};

/** Repaint a phone's status bar for the screen now showing. */
export function matchStatus(screen: HTMLElement | null | undefined, top = "#000") {
  if (!screen) return;
  screen.style.setProperty("--top", top);
  screen.querySelector(".dv-status")?.classList.toggle("dv-status--dark", isLight(top));
}
