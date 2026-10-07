import type {
  SpindleFrontendContext,
  SpindleFloatWidgetHandle,
  CharacterDTO,
} from "lumiverse-spindle-types";
import { createPreviewView, type PreviewState } from "./preview-view";

/** Must match `identifier` in spindle.json. */
const EXTENSION_ID = "creator_notes_html_renderer";

/** Lumiverse identifies installed extensions at runtime by a server-assigned
 *  UUID — NOT the manifest identifier, and it changes on every reinstall.
 *  The host stamps that UUID on every placement root it hands us
 *  (`data-spindle-extension-root`), so we read it off our roots and persist
 *  it for pop-out windows to compare against. */
const RUNTIME_ID_ATTRIBUTE = "data-spindle-extension-root";
const RUNTIME_ID_STORAGE_KEY = `${EXTENSION_ID}:runtimeExtensionId`;

function extensionIdFromRoot(root: HTMLElement | null | undefined): string | null {
  try {
    const id = root?.getAttribute?.(RUNTIME_ID_ATTRIBUTE);
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch (_) {
    return null;
  }
}

function getRuntimeExtensionId(): string | null {
  try {
    const id = typeof localStorage === "undefined" ? null : localStorage.getItem(RUNTIME_ID_STORAGE_KEY);
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch (_) {
    return null;
  }
}

function rememberRuntimeExtensionId(root: HTMLElement | null | undefined): string | null {
  const id = extensionIdFromRoot(root);
  if (id) {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(RUNTIME_ID_STORAGE_KEY, id);
    } catch (_) {}
  }
  return id;
}

/** Private Lumiverse Desktop event fired when a native pop-out widget is
 *  returned to the page (remounting its root). Not part of the published
 *  Spindle API; everything must keep working when it never fires. */
const DESKTOP_WIDGET_RETURNED_EVENT = "spindle:desktop-widget-returned";

/** Lumiverse Desktop opens a floating-widget pop-out as a *second frontend
 *  instance* in a native WebView whose URL carries these params. The
 *  extension is loaded in that window too and is expected to create its
 *  widget there; until it does, the window shows "Loading …" forever.
 *  `desktopWidgetExtension` carries the runtime UUID: when we know ours
 *  (learned from a stamped root) we match precisely; otherwise we treat any
 *  widget window as ours — harmless in a foreign window, where the host
 *  filters widgets by its own target extension and would never render ours. */
interface DesktopWidgetTarget {
  width: number;
  height: number;
}

interface DesktopWidgetReturnedDetail {
  widgetId?: unknown;
  extensionId?: unknown;
}

function readDesktopWidgetTarget(): DesktopWidgetTarget | null {
  if (typeof window === "undefined" || typeof window.location === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("desktopWidgetExtension");
    if (!targetId) return null;
    const knownId = getRuntimeExtensionId();
    if (knownId && targetId !== knownId) return null;
    const width = Number(params.get("desktopWidgetWidth"));
    const height = Number(params.get("desktopWidgetHeight"));
    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
    return { width, height };
  } catch (_) {
    return null;
  }
}

interface SizeClamps {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

/** Browser-mode clamps; the host clamps oversized widgets to the viewport on
 *  mobile anyway, these just keep the inputs sane. */
const BROWSER_SIZE_CLAMPS: SizeClamps = {
  minWidth: 220, minHeight: 150, maxWidth: 1920, maxHeight: 1200,
};

/** Desktop pop-out windows resize via setSize and are clamped by Lumiverse
 *  Desktop to these bounds (see DesktopFloatingWidgetHost). */
const DESKTOP_SIZE_CLAMPS: SizeClamps = {
  minWidth: 160, minHeight: 100, maxWidth: 1200, maxHeight: 900,
};

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
  // A desktop pop-out loads the whole frontend — including this extension —
  // in widget mode. There is no drawer and no button to click there, so the
  // widget must be created immediately for the window to find it.
  const desktopWidget = readDesktopWidgetTarget();
  const isWidgetWindow = desktopWidget !== null;
  const sizeClamps = isWidgetWindow ? DESKTOP_SIZE_CLAMPS : BROWSER_SIZE_CLAMPS;

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

  // ── Drawer tab (main window only; a pop-out window renders no drawer) ──
  const teardownSteps: (() => void)[] = [];
  let drawerView: ReturnType<typeof createPreviewView> | null = null;
  let unsubDrawerView: (() => void) | null = null;
  let unsubActivate: (() => void) | null = null;
  let runtimeExtensionId = getRuntimeExtensionId();

  if (!isWidgetWindow) {
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

    drawerView = createPreviewView();
    root.appendChild(drawerView.element);
    unsubDrawerView = subscribe(drawerView.render);
    unsubActivate = tab.onActivate(() => loadCreatorNotes());

    // Learn this install's runtime UUID from the host stamp so pop-out
    // windows (which share localStorage but not this window's roots) can
    // recognize their URL parameter. Rewritten on every load, so it stays
    // correct across reinstalls.
    runtimeExtensionId = rememberRuntimeExtensionId(tab.root) ?? runtimeExtensionId;

    teardownSteps.push(() => {
      try { tab.destroy(); } catch (_) {}
    });
  }

  loadCreatorNotes();

  const unsubChatSwitched = ctx.events.on("CHAT_SWITCHED", () => loadCreatorNotes());
  const unsubCharEdited = ctx.events.on("CHARACTER_EDITED", () => loadCreatorNotes());

  // CHAT_SWITCHED can precede character hydration. Read the synchronous public
  // snapshot; only fetch when selection changes, not on every timer tick.
  const selectionTimer = setInterval(() => {
    if (!disposed && ctx.getActiveChat().characterId !== observedCharacterId) {
      void loadCreatorNotes();
    }
  }, 500);

  // ── Floating widget ──
  let floatHandle: SpindleFloatWidgetHandle | null = null;
  let floatView: ReturnType<typeof createPreviewView> | null = null;
  let unsubFloatView: (() => void) | null = null;
  let unsubDesktopReturned: (() => void) | null = null;
  let floatSize = desktopWidget ?? { width: 420, height: 560 };

  function mountFloatContent(handle: SpindleFloatWidgetHandle) {
    const wroot = handle.root;
    wroot.style.cssText =
      "display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;font-family:inherit;color:inherit;";
    wroot.replaceChildren();

    // In a desktop pop-out the native window provides its own chrome (title
    // bar with a return button, edge resize handles), and destroying the
    // widget from inside would strand the window on "Loading" — so no header
    // buttons there.
    if (!isWidgetWindow) {
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
    }

    floatView = createPreviewView();
    wroot.appendChild(floatView.element);
    if (latestState) floatView.render(latestState);

    // ── Size strip: explicit resize via setSize (the published types carry
    //    no drag-resize option for float widgets) ──
    const sizeStrip = document.createElement("div");
    sizeStrip.style.cssText =
      "display:flex;align-items:center;gap:6px;padding:6px 8px;flex:0 0 auto;border-top:1px solid rgba(128,128,128,0.25);font-size:12px;";

    const wLabel = document.createElement("span");
    wLabel.textContent = "W";
    wLabel.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(wLabel);

    const widthInput = document.createElement("input");
    configureSizeInput(widthInput, "Widget width", floatSize.width, sizeClamps.minWidth, sizeClamps.maxWidth);
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
    configureSizeInput(heightInput, "Widget height", floatSize.height, sizeClamps.minHeight, sizeClamps.maxHeight);
    sizeStrip.appendChild(heightInput);

    const applyButton = document.createElement("button");
    applyButton.type = "button";
    applyButton.textContent = "Apply";
    applyButton.title = "Resize the widget";
    applyButton.style.cssText =
      "padding:2px 10px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:4px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";
    sizeStrip.appendChild(applyButton);

    function applySize() {
      const width = clampInt(widthInput.value, floatSize.width, sizeClamps.minWidth, sizeClamps.maxWidth);
      const height = clampInt(heightInput.value, floatSize.height, sizeClamps.minHeight, sizeClamps.maxHeight);
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
      if (!detail || detail.widgetId !== handle.widgetId) return;
      // detail.extensionId is the runtime UUID, not the manifest identifier.
      if (typeof detail.extensionId === "string" && runtimeExtensionId && detail.extensionId !== runtimeExtensionId) return;
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
    runtimeExtensionId = rememberRuntimeExtensionId(handle.root) ?? runtimeExtensionId;
    unsubDesktopReturned = listenForDesktopReturn(handle);
  }

  if (isWidgetWindow) {
    openFloatWidget();
  }

  return () => {
    disposed = true;
    ++requestVersion;
    clearInterval(selectionTimer);
    closeFloatWidget();
    try { unsubDrawerView?.(); } catch (_) {}
    try { unsubActivate?.(); } catch (_) {}
    try { unsubChatSwitched(); } catch (_) {}
    try { unsubCharEdited(); } catch (_) {}
    for (const step of teardownSteps) {
      try { step(); } catch (_) {}
    }
  };
}
