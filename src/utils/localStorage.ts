export type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "blue" | "purple" | "green" | "orange" | "pink" | "teal";
export type TransitionType = "none" | "crossfade" | "fade-black" | "slide";
export type ImageFit = "contain" | "cover";
export type SlideshowBackground = "theme" | "black" | "gray" | "white";

export interface ISettings {
  showImagePath?: boolean;
  showImmersiveBackground?: boolean;
  contrastMultiplier?: number;
  themeMode?: ThemeMode;
  accentColor?: AccentColor;
  transition?: TransitionType;
  /** Milliseconds */
  transitionDuration?: number;
  imageFit?: ImageFit;
  slideshowBackground?: SlideshowBackground;
  grayscale?: boolean;
  mirror?: boolean;
  /** Seconds without mouse movement before the controls hide */
  controlsHideDelay?: number;
  hideCursorWhenIdle?: boolean;
  /** Seconds; preselected on the interval screen */
  defaultInterval?: number;
}

export const DEFAULT_SETTINGS: ISettings = {
  themeMode: "dark",
  accentColor: "blue",
  transition: "crossfade",
  transitionDuration: 400,
  imageFit: "contain",
  slideshowBackground: "theme",
  grayscale: false,
  mirror: false,
  controlsHideDelay: 3,
  hideCursorWhenIdle: true,
  defaultInterval: 3,
};

export const getSettings = (): ISettings => {
  const localData = localStorage.getItem("settings");
  return { ...DEFAULT_SETTINGS, ...(localData ? JSON.parse(localData) : {}) };
};

export const setSettings = (settings: ISettings) => {
  localStorage.setItem("settings", JSON.stringify(settings));
};
