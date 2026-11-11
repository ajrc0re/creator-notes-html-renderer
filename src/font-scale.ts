/** Per-character text size for the Creator Notes and Profile views.
 *
 *  The manual size is remembered per character. "Follow theme" is a single
 *  global switch: when on, every character uses the Lumiverse theme's font
 *  scale (`--lumiverse-font-scale`) and the +/- buttons are disabled. */

const STORAGE_PREFIX = "creator_notes_html_renderer:fontScale";
const FOLLOW_THEME_KEY = `${STORAGE_PREFIX}:followTheme`;

export const FONT_SCALE_MIN = 0.5;
export const FONT_SCALE_MAX = 3;
export const FONT_SCALE_STEP = 0.1;

export function clampFontScale(scale: number): number {
  if (!Number.isFinite(scale)) return 1;
  const rounded = Math.round(scale * 100) / 100;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, rounded));
}

/** The theme's font multiplier as the host applies it to the page. */
export function readThemeFontScale(): number {
  try {
    if (typeof document === "undefined" || typeof getComputedStyle !== "function") return 1;
    for (const el of [document.documentElement, document.body]) {
      if (!el) continue;
      const raw = getComputedStyle(el).getPropertyValue("--lumiverse-font-scale").trim();
      const value = Number.parseFloat(raw);
      if (Number.isFinite(value) && value > 0) return value;
    }
  } catch (_) {}
  return 1;
}

function storageGet(key: string): string | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch (_) {}
}

export function isFontScaleStorageKey(key: string | null | undefined): boolean {
  return typeof key === "string" && key.startsWith(STORAGE_PREFIX);
}

export function readFollowTheme(): boolean {
  return storageGet(FOLLOW_THEME_KEY) === "1";
}

export function writeFollowTheme(follow: boolean) {
  storageSet(FOLLOW_THEME_KEY, follow ? "1" : "0");
}

/** The saved manual size for a character, or null if none was ever set. */
export function readCharacterFontScale(characterId: string): number | null {
  const value = Number.parseFloat(storageGet(`${STORAGE_PREFIX}:char:${characterId}`) ?? "");
  return Number.isFinite(value) ? clampFontScale(value) : null;
}

export function writeCharacterFontScale(characterId: string, scale: number) {
  storageSet(`${STORAGE_PREFIX}:char:${characterId}`, String(clampFontScale(scale)));
}

export interface FontScaleState {
  /** The multiplier to render with. */
  scale: number;
  followTheme: boolean;
  /** Whether the +/- buttons can act (a character is shown and follow is off). */
  adjustable: boolean;
}

/** Resolve the effective scale for a character. With no saved size, a
 *  character starts at the theme scale so nothing changes until the user
 *  presses +/-. */
export function resolveFontScale(characterId: string | null): FontScaleState {
  const theme = clampFontScale(readThemeFontScale());
  const followTheme = readFollowTheme();
  if (followTheme || !characterId) {
    return { scale: theme, followTheme, adjustable: !followTheme && !!characterId };
  }
  return { scale: readCharacterFontScale(characterId) ?? theme, followTheme, adjustable: true };
}

export interface FontControls {
  element: HTMLElement;
  update(state: FontScaleState): void;
}

const CONTROL_BUTTON_CSS =
  "min-width:26px;padding:2px 6px;font-size:12px;font-family:inherit;line-height:1.2;border:1px solid rgba(128,128,128,0.35);border-radius:4px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";

/** A compact "A− 100% A+ [x] Theme" group for the bottom bars. */
export function createFontControls(handlers: {
  step(delta: number): void;
  setFollowTheme(follow: boolean): void;
}): FontControls {
  const element = document.createElement("div");
  element.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-size:12px;";

  const decrease = document.createElement("button");
  decrease.type = "button";
  decrease.textContent = "A−";
  decrease.title = "Decrease text size for this character";
  decrease.setAttribute("aria-label", "Decrease text size");
  decrease.style.cssText = CONTROL_BUTTON_CSS;
  decrease.addEventListener("click", () => handlers.step(-FONT_SCALE_STEP));

  const value = document.createElement("span");
  value.style.cssText = "min-width:38px;text-align:center;opacity:0.6;font-variant-numeric:tabular-nums;";
  value.setAttribute("aria-live", "polite");

  const increase = document.createElement("button");
  increase.type = "button";
  increase.textContent = "A+";
  increase.title = "Increase text size for this character";
  increase.setAttribute("aria-label", "Increase text size");
  increase.style.cssText = CONTROL_BUTTON_CSS;
  increase.addEventListener("click", () => handlers.step(FONT_SCALE_STEP));

  const followLabel = document.createElement("label");
  followLabel.title = "Use the Lumiverse theme font scale for every character";
  followLabel.style.cssText = "display:inline-flex;align-items:center;gap:3px;margin-left:4px;opacity:0.7;cursor:pointer;white-space:nowrap;";
  const follow = document.createElement("input");
  follow.type = "checkbox";
  follow.setAttribute("aria-label", "Follow theme font scale");
  follow.style.cssText = "margin:0;cursor:pointer;";
  follow.addEventListener("change", () => handlers.setFollowTheme(follow.checked));
  const followText = document.createElement("span");
  followText.textContent = "Theme";
  followLabel.appendChild(follow);
  followLabel.appendChild(followText);

  element.appendChild(decrease);
  element.appendChild(value);
  element.appendChild(increase);
  element.appendChild(followLabel);

  return {
    element,
    update(state) {
      value.textContent = `${Math.round(state.scale * 100)}%`;
      follow.checked = state.followTheme;
      const atMin = state.scale <= FONT_SCALE_MIN + 1e-9;
      const atMax = state.scale >= FONT_SCALE_MAX - 1e-9;
      decrease.disabled = !state.adjustable || atMin;
      increase.disabled = !state.adjustable || atMax;
      for (const button of [decrease, increase]) {
        button.style.opacity = button.disabled ? "0.3" : "0.7";
        button.style.cursor = button.disabled ? "default" : "pointer";
      }
    },
  };
}
