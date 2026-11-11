import type { CharacterDTO } from "lumiverse-spindle-types";
import { createPreviewView, type PreviewState } from "./preview-view";
import { createProfileView, type ProfileActions } from "./profile-view";

export type CharacterState =
  | { kind: "character"; character: CharacterDTO }
  | Exclude<PreviewState, { kind: "html" }>;

const styles = `
.cnhr-view { display:flex;flex-direction:column;flex:1;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;color:var(--lumiverse-text,inherit);font-family:inherit; }
.cnhr-tabs { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:12px 12px 10px;flex-shrink:0;background:color-mix(in srgb,var(--lumiverse-bg-deep,#111114) 96%,var(--lumiverse-primary,#aca2c9) 4%); }
.cnhr-tabs button { appearance:none;min-width:0;border:1px solid var(--lumiverse-primary-015,rgba(172,162,201,.15));border-radius:999px;padding:9px 10px;background:color-mix(in srgb,var(--lumiverse-primary,#aca2c9) 4%,transparent);color:var(--lumiverse-text-dim,#96939e);font-family:inherit;font-size:calc(12px * var(--lumiverse-font-scale,1));font-weight:600;line-height:1.4;cursor:pointer; }
.cnhr-tabs button[aria-selected="true"] { color:var(--lumiverse-primary-text,#d2c8e9);background:color-mix(in srgb,var(--lumiverse-primary,#aca2c9) 18%,transparent);border-color:var(--lumiverse-primary-050,#777087);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--lumiverse-primary,#aca2c9) 28%,transparent); }
.cnhr-tabs button:hover { color:var(--lumiverse-text,#eceaf1);border-color:var(--lumiverse-primary-030,#777087); }
.cnhr-view :is(button,summary):focus-visible { outline:2px solid var(--lumiverse-primary,#aca2c9);outline-offset:3px; }
.cnhr-profile-panel { flex:1;min-height:0;min-width:0;overflow:hidden; }
.cnhr-profile { box-sizing:border-box;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;padding:8px 12px 24px;scrollbar-gutter:stable;font-size:calc(13px * var(--lumiverse-font-scale,1)); }
.cnhr-character-name { font-size:calc(20px * var(--lumiverse-font-scale,1));line-height:1.3;margin:10px 0 18px;font-weight:700;overflow-wrap:anywhere; }
.cnhr-section { margin:0 0 16px; }
.cnhr-section > summary { display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--lumiverse-primary-010,rgba(128,128,128,.16));list-style:none;cursor:pointer;font-weight:600;color:var(--lumiverse-text,#e8e6ed); }
.cnhr-section > summary::-webkit-details-marker,.cnhr-greeting > summary::-webkit-details-marker { display:none; }
.cnhr-section > summary::after { content:'';width:5px;height:5px;margin-left:auto;margin-right:5px;flex-shrink:0;border-right:1.5px solid var(--lumiverse-text-muted,#85818e);border-bottom:1.5px solid var(--lumiverse-text-muted,#85818e);transform:rotate(-45deg); }
.cnhr-section[open] > summary::after { transform:rotate(45deg); }
.cnhr-section-icon { display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:var(--lumiverse-primary-010,rgba(172,162,201,.1));color:var(--lumiverse-primary,#aca2c9);flex-shrink:0; }
.cnhr-prose { padding:12px 0 4px;line-height:1.7;overflow-wrap:anywhere;color:var(--lumiverse-text-muted,#b4b1ba); }
.cnhr-prose > :first-child { margin-top:0; }.cnhr-prose > :last-child { margin-bottom:0; }
.cnhr-prose :is(h1,h2,h3,h4,h5,h6,strong) { color:var(--lumiverse-text,#eceaf1); }.cnhr-prose :is(h1,h2,h3,h4,h5,h6) { line-height:1.4;margin:1em 0 .5em; }
.cnhr-prose h1 { font-size:1.55em; }.cnhr-prose h2 { font-size:1.35em; }.cnhr-prose h3 { font-size:1.15em; }
.cnhr-prose p { margin:0 0 .8em; }.cnhr-prose :is(ul,ol) { padding-left:1.5em; }.cnhr-prose li { margin:.2em 0; }
.cnhr-prose ul > li { list-style:disc; }.cnhr-prose ol > li { list-style:decimal; }
.cnhr-prose a,.cnhr-book-link { color:var(--lumiverse-primary-text,var(--lumiverse-primary,#c4b5e5));text-decoration:underline;text-underline-offset:3px; }
.cnhr-prose img { max-width:100%;height:auto;border-radius:6px; }.cnhr-prose pre { overflow-x:auto;max-width:100%;white-space:pre-wrap;padding:12px;border-radius:6px;background:var(--lumiverse-primary-005,rgba(128,128,128,.08)); }
.cnhr-prose code { font-family:ui-monospace,monospace;font-size:.9em; }.cnhr-prose :not(pre)>code { background:var(--lumiverse-primary-010,rgba(128,128,128,.12));padding:2px 4px;border-radius:3px; }
.cnhr-prose blockquote { border-left:3px solid var(--lumiverse-primary-030,#777087);padding-left:12px;margin:12px 0;color:var(--lumiverse-text-dim,#96929f); }
.cnhr-prose table { width:100%;table-layout:fixed;border-collapse:collapse; }.cnhr-prose :is(td,th) { border:1px solid var(--lumiverse-primary-015,rgba(128,128,128,.2));padding:6px 8px;text-align:left; }
.cnhr-prose hr { border:0;border-top:1px solid var(--lumiverse-primary-015,rgba(128,128,128,.2)); }.cnhr-empty { font-style:italic;color:var(--lumiverse-text-dim,#85818e); }
.cnhr-greetings { padding-top:10px; }.cnhr-greeting { margin-bottom:10px;border:1px solid var(--lumiverse-primary-015,rgba(128,128,128,.18));border-radius:8px;padding:12px; }
.cnhr-greeting > summary { cursor:pointer;list-style:none; }.cnhr-greeting-label { display:block;font-weight:600;margin-bottom:6px; }.cnhr-greeting-preview { display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap;line-height:1.6;overflow-wrap:anywhere;color:var(--lumiverse-text-muted,#b4b1ba); }
.cnhr-greeting-hint { display:block;margin-top:8px;font-size:11px;color:var(--lumiverse-primary-text,#c4b5e5); }.cnhr-greeting[open] .cnhr-greeting-preview,.cnhr-greeting[open] .cnhr-greeting-hint { display:none; }
.cnhr-books { display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding-top:12px; }.cnhr-book-link { border:0;background:none;padding:3px 0;font:inherit;text-align:left;cursor:pointer;overflow-wrap:anywhere;max-width:100%; }.cnhr-book-link:disabled { opacity:.5;cursor:wait; }.cnhr-book-status { font-size:12px;line-height:1.5;color:var(--lumiverse-text-muted,#96929f);margin:0; }
`;

let viewId = 0;

/** Both placements use this exact tab strip and the same character snapshot. */
export function createCharacterView(actions: ProfileActions, storageKey?: string) {
  const element = document.createElement("div");
  element.className = "cnhr-view";
  const style = document.createElement("style");
  style.textContent = styles;
  element.appendChild(style);
  const tabs = document.createElement("div");
  tabs.className = "cnhr-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Character views");
  element.appendChild(tabs);
  const preview = createPreviewView();
  const profilePanel = document.createElement("div");
  profilePanel.className = "cnhr-profile-panel";
  const profile = createProfileView(actions);
  profilePanel.appendChild(profile.element);
  const id = `cnhr-${++viewId}`;
  const panels = [preview.element, profilePanel];
  let selected = 0;
  let state: CharacterState | null = null;
  let profileCharacter: CharacterDTO | null = null;

  function renderProfile() {
    if (state?.kind === "character") {
      if (profileCharacter !== state.character) {
        profile.render(state.character);
        profileCharacter = state.character;
      }
    } else {
      profile.clear();
      profileCharacter = null;
      const message = document.createElement("p");
      message.className = "cnhr-empty";
      message.textContent = state?.message ?? "Loading character…";
      profile.element.appendChild(message);
    }
  }

  function select(index: number) {
    selected = index;
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === selected));
      button.tabIndex = i === selected ? 0 : -1;
      panels[i].style.display = i === selected ? "block" : "none";
    });
    if (selected === 1) renderProfile();
    try { if (storageKey && typeof localStorage !== "undefined") localStorage.setItem(storageKey, String(index)); } catch (_) {}
  }

  const buttons = ["Creator Notes", "Profile"].map((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.id = `${id}-tab-${index}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `${id}-panel-${index}`);
    button.addEventListener("click", () => select(index));
    button.addEventListener("keydown", (event) => {
      const key = (event as KeyboardEvent).key;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
      event.preventDefault();
      const next = key === "Home" ? 0 : key === "End" ? 1 : 1 - selected;
      select(next);
      buttons[next].focus();
    });
    tabs.appendChild(button);
    panels[index].id = `${id}-panel-${index}`;
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", button.id);
    element.appendChild(panels[index]);
    return button;
  });
  let initialTab = 0;
  try { if (storageKey && typeof localStorage !== "undefined" && localStorage.getItem(storageKey) === "1") initialTab = 1; } catch (_) {}
  select(initialTab);

  return {
    element,
    render(next: CharacterState) {
      state = next;
      if (state.kind === "character") {
        const notes = state.character.creator_notes ?? "";
        preview.render(notes ? { kind: "html", html: notes } : { kind: "placeholder", message: "Creator notes are empty." });
      } else {
        preview.render(state);
      }
      if (selected === 1) renderProfile();
      else if (state.kind !== "character") { profile.clear(); profileCharacter = null; }
    },
    /** Scroll whichever tab is showing back to the top. */
    scrollToTop() {
      if (selected === 0) preview.scrollToTop();
      else profile.element.scrollTop = 0;
    },
  };
}
