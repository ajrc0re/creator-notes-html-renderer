import type {
  SpindleFrontendContext,
  SpindleFloatWidgetHandle,
  CharacterDTO,
} from "lumiverse-spindle-types";
import { createPreviewView, type PreviewState } from "./preview-view";

/** Must match `identifier` in spindle.json — used to scope desktop pop-out events. */
const EXTENSION_ID = "creator_notes_html_renderer";

/** Private Lumiverse Desktop event fired when a native pop-out widget is
 *  returned to the page (remounting its root). Not part of the published
 *  Spindle API; everything must keep working when it never fires. */
const DESKTOP_WIDGET_RETURNED_EVENT = "spindle:desktop-widget-returned";

interface DesktopWidgetReturnedDetail {
  widgetId?: unknown;
  extensionId?: unknown;
}

/** Size clamps for the float widget; the host clamps oversized widgets to the
 *  viewport on mobile anyway, these just keep the inputs sane. */
const FLOAT_MIN_WIDTH = 220;
const FLOAT_MIN_HEIGHT = 150;
const FLOAT_MAX_WIDTH = 1920;
const FLOAT_MAX_HEIGHT = 1200;

function clampInt(raw: string, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

const ICON_EXPAND =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
const ICON_CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

function iconButton(svg: string, label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = svg;
  button.style.cssText =
    "display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:4px;background:transparent;color:inherit;opacity:0.6;cursor:pointer;";
  return button;
}

function configureSizeInput(
  input: HTMLInputElement,
  label: string,
  value: number,
  min: number,
  max: number,
) {
  input.type = "number";
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.title = `${label} in pixels (${min}–${max})`;
  input.setAttribute("aria-label", label);
  input.style.cssText =
    "width:60px;padding:2px 6px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:4px;background:transparent;color:inherit;";
}

export function setup(ctx: SpindleFrontendContext) {
  const tab = ctx.ui.registerDrawerTab({
    id: "html_preview",
    title: "HTML Preview",
    shortName: "Preview",
    description: "Renders HTML and CSS from the creator notes field as a live preview.",
    keywords: ["html", "css", "preview", "creator notes", "render", "float", "widget"],
    headerTitle: "HTML Preview",
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
  });

  const root = tab.root;
  root.style.cssText = "display:flex;flex-direction:column;width:100%;min-width:0;min-height:0;height:100%;";

  // ── Drawer tab: toolbar + preview ──
  const toolbar = document.createElement("div");
  toolbar.style.cssText =
    "display:flex;align-items:center;gap:8px;padding:6px 8px;flex:0 0 auto;border-bottom:1px solid rgba(128,128,128,0.25);";

  const toolbarLabel = document.createElement("span");
  toolbarLabel.textContent = "Creator Notes";
  toolbarLabel.style.cssText = "font-size:12px;opacity:0.6;";
  toolbar.appendChild(toolbarLabel);

  const toolbarSpacer = document.createElement("span");
  toolbarSpacer.style.flex = "1";
  toolbar.appendChild(toolbarSpacer);

  const floatButton = document.createElement("button");
  floatButton.type = "button";
  floatButton.textContent = "Float preview";
  floatButton.title = "Show this preview as a floating widget";
  floatButton.style.cssText =
    "padding:3px 10px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:6px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";
  floatButton.addEventListener("click", () => openFloatWidget());
  toolbar.appendChild(floatButton);

  root.appendChild(toolbar);

  const drawerView = createPreviewView();
  root.appendChild(drawerView.element);

  // ── Shared preview state: one loader, many surfaces ──
  let disposed = false;
  let requestVersion = 0;
  let observedCharacterId: string | null | undefined;
  let latestState: PreviewState | null = null;
  const listeners = new Set<(state: PreviewState) => void>();

  function subscribe(listener: (state: PreviewState) => void): () => void {
    listeners.add(listener);
    if (latestState) listener(latestState);
    return () => listeners.delete(listener);
  }

  function broadcast(state: PreviewState) {
    latestState = state;
    for (const listener of listeners) listener(state);
  }

  async function loadCreatorNotes() {
    if (disposed) return;
    const version = ++requestVersion;
    const { characterId } = ctx.getActiveChat();
    observedCharacterId = characterId;
    if (!characterId) {
      broadcast({
        kind: "placeholder",
        message: "Open a character in the editor to see a live HTML preview of their creator notes.",
      });
      return;
    }

    try {
      const card = await ctx.characters.get(characterId) as CharacterDTO | null;
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId) return;
      const creatorNotes = card?.creator_notes ?? "";
      if (!creatorNotes) {
        broadcast({ kind: "placeholder", message: "Creator notes are empty." });
      } else {
        broadcast({ kind: "html", html: creatorNotes });
      }
    } catch (err) {
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId) return;
      broadcast({ kind: "error", message: `Failed to read creator notes: ${err}` });
    }
  }

  const unsubDrawerView = subscribe(drawerView.render);

  loadCreatorNotes();

  const unsubActivate = tab.onActivate(() => loadCreatorNotes());
  const unsubChatSwitched = ctx.events.on("CHAT_SWITCHED", () => loadCreatorNotes());
  const unsubCharEdited = ctx.events.on("CHARACTER_EDITED", () => loadCreatorNotes());

  // CHAT_SWITCHED can precede character hydration. Read the synchronous public
  // snapshot; only fetch when selection changes, not on every timer tick.
  const selectionTimer = setInterval(() => {
    if (!disposed && ctx.getActiveChat().characterId !== observedCharacterId) {
      void loadCreatorNotes();
    }
  }, 500);

  // ── Floating widget (Lumiverse Desktop float widgets API) ──
  let floatHandle: SpindleFloatWidgetHandle | null = null;
  let floatView: ReturnType<typeof createPreviewView> | null = null;
  let unsubFloatView: (() => void) | null = null;
  let unsubDesktopReturned: (() => void) | null = null;
  let floatSize = { width: 420, height: 560 };

  function mountFloatContent(handle: SpindleFloatWidgetHandle) {
    const wroot = handle.root;
    wroot.style.cssText =
      "display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;font-family:inherit;color:inherit;";
    wroot.replaceChildren();

    const header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;gap:6px;padding:6px 8px;flex:0 0 auto;border-bottom:1px solid rgba(128,128,128,0.25);";

    const title = document.createElement("span");
    title.textContent = "HTML Preview";
    title.style.cssText = "font-size:12px;font-weight:600;opacity:0.7;";
    header.appendChild(title);

    const spacer = document.createElement("span");
    spacer.style.flex = "1";
    header.appendChild(spacer);

    const fullscreenButton = iconButton(ICON_EXPAND, "Toggle fullscreen");
    fullscreenButton.addEventListener("click", () => {
      try {
        handle.setFullscreen(!handle.isFullscreen());
      } catch (_) {
        // Stale handle (e.g. ui_panels revoked) — nothing to do.
      }
    });
    header.appendChild(fullscreenButton);

    const closeButton = iconButton(ICON_CLOSE, "Close preview widget");
    closeButton.addEventListener("click", () => closeFloatWidget());
    header.appendChild(closeButton);

    wroot.appendChild(header);

    floatView = createPreviewView();
    wroot.appendChild(floatView.element);
    if (latestState) floatView.render(latestState);

    // ── Size strip: explicit resize via setSize (the API has no native
    //    drag-resize for float widgets) ──
    const sizeStrip = document.createElement("div");
    sizeStrip.style.cssText =
      "display:flex;align-items:center;gap:6px;padding:6px 8px;flex:0 0 auto;border-top:1px solid rgba(128,128,128,0.25);font-size:12px;";

    const wLabel = document.createElement("span");
    wLabel.textContent = "W";
    wLabel.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(wLabel);

    const widthInput = document.createElement("input");
    configureSizeInput(widthInput, "Widget width", floatSize.width, FLOAT_MIN_WIDTH, FLOAT_MAX_WIDTH);
    sizeStrip.appendChild(widthInput);

    const separator = document.createElement("span");
    separator.textContent = "×";
    separator.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(separator);

    const hLabel = document.createElement("span");
    hLabel.textContent = "H";
    hLabel.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(hLabel);

    const heightInput = document.createElement("input");
    configureSizeInput(heightInput, "Widget height", floatSize.height, FLOAT_MIN_HEIGHT, FLOAT_MAX_HEIGHT);
    sizeStrip.appendChild(heightInput);

    const applyButton = document.createElement("button");
    applyButton.type = "button";
    applyButton.textContent = "Apply";
    applyButton.title = "Resize the widget";
    applyButton.style.cssText =
      "padding:2px 10px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:4px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";
    sizeStrip.appendChild(applyButton);

    function applySize() {
      const width = clampInt(widthInput.value, floatSize.width, FLOAT_MIN_WIDTH, FLOAT_MAX_WIDTH);
      const height = clampInt(heightInput.value, floatSize.height, FLOAT_MIN_HEIGHT, FLOAT_MAX_HEIGHT);
      widthInput.value = String(width);
      heightInput.value = String(height);
      floatSize = { width, height };
      try { handle.setSize(width, height); } catch (_) {
        // Stale handle (e.g. ui_panels revoked) — nothing to do.
      }
    }

    applyButton.addEventListener("click", applySize);
    for (const input of [widthInput, heightInput]) {
      input.addEventListener("keydown", (event) => {
        if ((event as KeyboardEvent).key === "Enter") applySize();
      });
    }

    wroot.appendChild(sizeStrip);
  }

  function listenForDesktopReturn(handle: SpindleFloatWidgetHandle): (() => void) | null {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") return null;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<DesktopWidgetReturnedDetail>).detail;
      if (!detail || detail.widgetId !== handle.widgetId || detail.extensionId !== EXTENSION_ID) return;
      if (floatHandle !== handle) return;
      // The widget root was remounted on return from a native pop-out window:
      // rebuild the content, then pull fresh state from the backend.
      mountFloatContent(handle);
      void loadCreatorNotes();
    };
    window.addEventListener(DESKTOP_WIDGET_RETURNED_EVENT, handler);
    return () => window.removeEventListener(DESKTOP_WIDGET_RETURNED_EVENT, handler);
  }

  function closeFloatWidget() {
    unsubFloatView?.();
    unsubFloatView = null;
    unsubDesktopReturned?.();
    unsubDesktopReturned = null;
    floatView = null;
    if (floatHandle) {
      try { floatHandle.destroy(); } catch (_) {}
      floatHandle = null;
    }
  }

  function openFloatWidget() {
    if (disposed) return;
    if (floatHandle) {
      // Reveal if hidden. A stale handle (ui_panels revoked mid-session removes
      // float widgets and leaves handles dead) falls through to recreate.
      try {
        floatHandle.setVisible(true);
        return;
      } catch (_) {
        floatHandle = null;
        floatView = null;
      }
    }

    let handle: SpindleFloatWidgetHandle;
    try {
      handle = ctx.ui.createFloatWidget({
        width: floatSize.width,
        height: floatSize.height,
        snapToEdge: true,
        tooltip: "Creator notes HTML preview",
      });
    } catch (err) {
      console.warn(`[${EXTENSION_ID}] failed to create float widget:`, err);
      return;
    }

    floatHandle = handle;
    // Subscribe before mounting so the immediate latest-state replay no-ops
    // (floatView is still null); mountFloatContent renders it once instead.
    unsubFloatView = subscribe((state) => floatView?.render(state));
    mountFloatContent(handle);
    unsubDesktopReturned = listenForDesktopReturn(handle);
  }

  return () => {
    disposed = true;
    ++requestVersion;
    clearInterval(selectionTimer);
    closeFloatWidget();
    try { unsubDrawerView(); } catch (_) {}
    try { unsubActivate(); } catch (_) {}
    try { unsubChatSwitched(); } catch (_) {}
    try { unsubCharEdited(); } catch (_) {}
    try { tab.destroy(); } catch (_) {}
  };
}
