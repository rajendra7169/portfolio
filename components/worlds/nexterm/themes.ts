// A selection of NexTerm's 19 themes, as terminal palettes.
export type NxTheme = { id: string; name: string; light?: boolean; bg: string; fg: string; dim: string; acc: string; ok: string; err: string; warn: string; mag: string; cyan: string };
export const THEMES: NxTheme[] = [
  { id: "tokyo", name: "Tokyo Night", bg: "#1a1b26", fg: "#c0caf5", dim: "#565f89", acc: "#7aa2f7", ok: "#9ece6a", err: "#f7768e", warn: "#e0af68", mag: "#bb9af7", cyan: "#7dcfff" },
  { id: "ocean", name: "Material Ocean", bg: "#0f111a", fg: "#a6accd", dim: "#4b526d", acc: "#82aaff", ok: "#c3e88d", err: "#f07178", warn: "#ffcb6b", mag: "#c792ea", cyan: "#89ddff" },
  { id: "dracula", name: "Dracula", bg: "#282a36", fg: "#f8f8f2", dim: "#6272a4", acc: "#bd93f9", ok: "#50fa7b", err: "#ff5555", warn: "#f1fa8c", mag: "#ff79c6", cyan: "#8be9fd" },
  { id: "nord", name: "Nord", bg: "#2e3440", fg: "#d8dee9", dim: "#616e88", acc: "#88c0d0", ok: "#a3be8c", err: "#bf616a", warn: "#ebcb8b", mag: "#b48ead", cyan: "#8fbcbb" },
  { id: "catppuccin", name: "Catppuccin", bg: "#1e1e2e", fg: "#cdd6f4", dim: "#6c7086", acc: "#89b4fa", ok: "#a6e3a1", err: "#f38ba8", warn: "#f9e2af", mag: "#cba6f7", cyan: "#94e2d5" },
  { id: "gruvbox", name: "Gruvbox", bg: "#282828", fg: "#ebdbb2", dim: "#928374", acc: "#83a598", ok: "#b8bb26", err: "#fb4934", warn: "#fabd2f", mag: "#d3869b", cyan: "#8ec07c" },
  { id: "synthwave", name: "Synthwave '84", bg: "#262335", fg: "#ffffff", dim: "#848bbd", acc: "#36f9f6", ok: "#72f1b8", err: "#fe4450", warn: "#fede5d", mag: "#ff7edb", cyan: "#03edf9" },
  { id: "rosepine", name: "Rosé Pine", bg: "#191724", fg: "#e0def4", dim: "#6e6a86", acc: "#c4a7e7", ok: "#9ccfd8", err: "#eb6f92", warn: "#f6c177", mag: "#ebbcba", cyan: "#9ccfd8" },
  { id: "solarized", name: "Solarized Light", light: true, bg: "#fdf6e3", fg: "#586e75", dim: "#93a1a1", acc: "#268bd2", ok: "#859900", err: "#dc322f", warn: "#b58900", mag: "#d33682", cyan: "#2aa198" },
];
