import { createTheme } from "@mui/material/styles";
import { AccentColor, ISettings } from "./localStorage";

// Each accent has a lighter shade for dark mode and a deeper one for light mode
export const ACCENT_COLORS: Record<AccentColor, { dark: string; light: string }> = {
  blue: { dark: "#90caf9", light: "#1976d2" },
  purple: { dark: "#ce93d8", light: "#9c27b0" },
  green: { dark: "#81c784", light: "#2e7d32" },
  orange: { dark: "#ffb74d", light: "#ed6c02" },
  pink: { dark: "#f48fb1", light: "#d81b60" },
  teal: { dark: "#4db6ac", light: "#00796b" },
};

const BODY_COLORS = {
  dark: { background: "rgb(10, 25, 41)", color: "rgb(227, 247, 255)" },
  light: { background: "#f4f6f8", color: "#1a2027" },
};

const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const resolveMode = (settings: ISettings): "dark" | "light" =>
  settings.themeMode === "system"
    ? prefersDarkQuery.matches
      ? "dark"
      : "light"
    : settings.themeMode ?? "dark";

/** Calls back when the OS switches between light and dark; returns an unsubscribe */
export const onSystemThemeChange = (callback: () => void) => {
  prefersDarkQuery.addEventListener("change", callback);
  return () => prefersDarkQuery.removeEventListener("change", callback);
};

export const buildTheme = (settings: ISettings) => {
  const mode = resolveMode(settings);
  const accent = ACCENT_COLORS[settings.accentColor ?? "blue"] ?? ACCENT_COLORS.blue;

  // The page background lives on <body>, outside React
  document.body.style.background = BODY_COLORS[mode].background;
  document.body.style.color = BODY_COLORS[mode].color;

  return createTheme({
    palette: {
      mode,
      primary: { main: accent[mode] },
    },
  });
};
