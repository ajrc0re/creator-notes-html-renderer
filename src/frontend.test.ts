import { expect, test } from "bun:test";
import { setup } from "./frontend";

interface StubNode {
  tag: string;
  style: Record<string, string>;
  handlers: Record<string, () => void>;
  attrs: Record<string, string>;
  children: StubNode[];
  innerHTML: string;
  textContent: string;
  title: string;
  srcdoc: string;
  type: string;
  firstChild: StubNode | null;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  appendChild(child: StubNode): void;
  replaceChildren(...children: StubNode[]): void;
  addEventListener(type: string, handler: () => void): void;
}

function installDomStub() {
  const saved = globalThis.document;
  const nodes: StubNode[] = [];
  const frames: StubNode[] = [];
  globalThis.document = {
    createElement(tag: string) {
      const node: StubNode = {
        tag, style: {}, handlers: {}, attrs: {}, children: [], innerHTML: "", textContent: "",
        title: "", srcdoc: "", type: "", firstChild: null,
        setAttribute(name, value) { this.attrs[name] = value; },
        getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null; },
        appendChild(child) { this.children.push(child); this.firstChild = child; },
        replaceChildren(...kids) { this.children = kids; this.firstChild = kids[0] ?? null; },
        addEventListener(type, handler) { this.handlers[type] = handler; },
      };
      if (tag === "iframe") frames.push(node);
      nodes.push(node);
      return node;
    },
  } as any;
  return {
    frames,
    nodes,
    buttons: () => nodes.filter((n) => n.tag === "button"),
    restore: () => { globalThis.document = saved as any; },
  };
}

function installLocalStorageStub() {
  const saved = (globalThis as any).localStorage;
  const data = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
    setItem: (key: string, value: string) => { data.set(key, String(value)); },
    removeItem: (key: string) => { data.delete(key); },
    clear: () => { data.clear(); },
  };
  return {
    seed(key: string, value: string) { data.set(key, value); },
    drop(key: string) { data.delete(key); },
    get(key: string) { return data.has(key) ? data.get(key)! : null; },
    restore: () => {
      if (saved === undefined) delete (globalThis as any).localStorage;
      else (globalThis as any).localStorage = saved;
    },
  };
}

function installWindowStub(search?: string) {
  const saved = (globalThis as any).window;
  const listeners: Record<string, (event: unknown) => void> = {};
  (globalThis as any).window = {
    addEventListener(type: string, handler: (event: unknown) => void) { listeners[type] = handler; },
    removeEventListener(type: string) { delete listeners[type]; },
    ...(search !== undefined ? { location: { search } } : {}),
  };
  return {
    listeners,
    restore: () => {
      if (saved === undefined) delete (globalThis as any).window;
      else (globalThis as any).window = saved;
    },
  };
}

function installIntervalStub() {
  const saved = [globalThis.setInterval, globalThis.clearInterval] as const;
  let cleared = false;
  let tick = () => {};
  globalThis.setInterval = ((callback: () => void) => { tick = callback; return 1; }) as any;
  globalThis.clearInterval = (() => { cleared = true; }) as any;
  return {
    get cleared() { return cleared; },
    tick: () => tick(),
    restore: () => { [globalThis.setInterval, globalThis.clearInterval] = saved as any; },
  };
}

function installResizeObserverStub() {
  const saved = (globalThis as any).ResizeObserver;
  const instances: Array<{ callback: () => void; targets: any[] }> = [];
  (globalThis as any).ResizeObserver = class {
    callback: () => void;
    targets: any[] = [];
    constructor(callback: () => void) {
      this.callback = callback;
      instances.push(this);
    }
    observe(target: any) { this.targets.push(target); }
    unobserve() {}
    disconnect() {}
  };
  return {
    fire: (target: any) => {
      const instance = instances.find((i) => i.targets.includes(target));
      if (instance) instance.callback();
    },
    restore: () => {
      if (saved === undefined) delete (globalThis as any).ResizeObserver;
      else (globalThis as any).ResizeObserver = saved;
    },
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function makeFloatWidgetHandle() {
  const root = globalThis.document.createElement("div") as unknown as StubNode;
  // Mimic the host stamping every placement root with the runtime extension UUID.
  root.setAttribute("data-spindle-extension-root", "runtime-uuid-test");
  // Mimic an attached host container with a measurable height.
  (root as any).parentElement = { clientHeight: 480 };
  return {
    root: root as unknown as HTMLElement,
    widgetId: "w1",
    moveTo() {},
    getPosition: () => ({ x: 0, y: 0 }),
    setSize() {},
    setVisible() {},
    isVisible: () => true,
    setFullscreen() {},
    isFullscreen: () => false,
    destroy() {},
    onDragEnd: () => () => {},
  };
}

test("delayed selection recovers, stale replies are ignored, and cleanup stops polling", async () => {
  const dom = installDomStub();
  const storage = installLocalStorageStub();
  const saved = [globalThis.setInterval, globalThis.clearInterval] as const;
  let tick = () => {};
  let cleared = false;
  globalThis.setInterval = ((callback: () => void) => { tick = callback; return 1; }) as any;
  globalThis.clearInterval = (() => { cleared = true; }) as any;
  try {
    let characterId: string | null = "a";
    const events: Record<string, () => void> = {};
    const reads: string[] = [];
    let resolveA!: (value: unknown) => void;
    let cleanup: (() => void) | undefined;
    cleanup = setup({
      ui: { registerDrawerTab: () => ({ root: { style: {}, appendChild() {} },
        onActivate: () => () => {}, destroy() {} }),
        createFloatWidget: makeFloatWidgetHandle },
      getActiveChat: () => ({ characterId }),
      characters: { get(id: string) {
        reads.push(id);
        return id === "a" ? new Promise(resolve => { resolveA = resolve; })
          : Promise.resolve({ creator_notes: "new character" });
      } },
      events: { on(name: string, callback: () => void) { events[name] = callback; return () => {}; } },
    } as any);
    characterId = null;
    events.CHAT_SWITCHED();
    characterId = "b";
    tick();
    await Promise.resolve();
    expect(dom.frames).toHaveLength(1);
    expect(dom.frames[0].srcdoc).toContain("new character");
    // The main window mirrors the active character for pop-out windows.
    expect(storage.get("creator_notes_html_renderer:activeCharacterId")).toBe("b");
    resolveA({ creator_notes: "old character" });
    await Promise.resolve();
    expect(dom.frames).toHaveLength(1);
    tick();
    expect(reads).toEqual(["a", "b"]);
    cleanup();
    expect(cleared).toBe(true);
    characterId = "c";
    tick();
    expect(reads).toEqual(["a", "b"]);
  } finally {
    [globalThis.setInterval, globalThis.clearInterval] = saved as any;
    storage.restore();
    dom.restore();
  }
});

test("float widget renders the preview, survives a desktop pop-out return, and cleans up", async () => {
  const dom = installDomStub();
  const win = installWindowStub();
  const storage = installLocalStorageStub();
  const interval = installIntervalStub();
  let characterId: string | null = "a";
  const events: Record<string, () => void> = {};
  const reads: string[] = [];
  let created = 0;
  let destroyCount = 0;
  const sizes: [number, number][] = [];
  const createdOptions: Record<string, number | boolean | string>[] = [];

  const makeHandle = (options: Record<string, unknown>) => {
    created++;
    createdOptions.push(options as any);
    return {
      ...makeFloatWidgetHandle(),
      setSize(width: number, height: number) { sizes.push([width, height]); },
      destroy() { destroyCount++; },
    };
  };

  let cleanup: (() => void) | undefined;
  try {
    cleanup = setup({
      ui: { registerDrawerTab: () => ({ root: { style: {}, appendChild() {} },
        onActivate: () => () => {}, destroy() {} }),
        createFloatWidget: makeHandle },
      getActiveChat: () => ({ characterId }),
      characters: { get(id: string) {
        reads.push(id);
        return Promise.resolve({ creator_notes: "<b>bold notes</b>" });
      } },
      events: { on(name: string, callback: () => void) { events[name] = callback; return () => {}; } },
    } as any);
    await flush();
    expect(dom.frames).toHaveLength(1); // drawer only

    const floatButton = dom.buttons().find((b) => b.textContent === "Float preview");
    expect(floatButton).toBeDefined();
    floatButton!.handlers.click();
    expect(created).toBe(1);
    expect(dom.frames).toHaveLength(2); // widget rendered latest state immediately
    expect(dom.frames[1].srcdoc).toContain("bold notes");

    // Desktop pop-out returned to the page: rebuild + fresh backend read.
    const returned = win.listeners["spindle:desktop-widget-returned"];
    expect(returned).toBeDefined();
    returned!({ detail: { widgetId: "w1", extensionId: "runtime-uuid-test" } });
    await flush();
    expect(reads).toEqual(["a", "a"]); // fresh read after remount
    expect(dom.frames.length).toBeGreaterThanOrEqual(4); // rebuilt widget + broadcast refresh
    expect(dom.frames[dom.frames.length - 1].srcdoc).toContain("bold notes");

    // Events for other widgets/extensions are ignored.
    returned!({ detail: { widgetId: "other", extensionId: "runtime-uuid-test" } });
    returned!({ detail: { widgetId: "w1", extensionId: "someone_else" } });
    await flush();
    expect(reads).toEqual(["a", "a"]);

    // Size strip: Apply calls setSize with clamped values; Enter submits.
    const inputs = () => dom.nodes.filter((n) => n.tag === "input");
    const applyButton = () => dom.buttons().find((b) => b.textContent === "Apply")!;
    expect(createdOptions[0]).toMatchObject({ width: 420, height: 560 });

    inputs()[0].value = "600";
    inputs()[1].value = "700";
    applyButton().handlers.click();
    expect(sizes).toEqual([[600, 700]]);

    inputs()[0].value = "5000";
    inputs()[1].value = "10";
    applyButton().handlers.click();
    expect(sizes[sizes.length - 1]).toEqual([1920, 150]);
    expect(inputs()[0].value).toBe("1920");
    expect(inputs()[1].value).toBe("150");

    inputs()[0].value = "abc"; // garbage falls back to the current size
    applyButton().handlers.click();
    expect(sizes[sizes.length - 1]).toEqual([1920, 150]);

    inputs()[0].value = "500";
    inputs()[1].handlers.keydown({ key: "Enter" });
    expect(sizes[sizes.length - 1]).toEqual([500, 150]);
    inputs()[1].value = "900";
    inputs()[1].handlers.keydown({ key: "a" }); // non-Enter keys are ignored
    expect(sizes.length).toBe(4);
    inputs()[1].handlers.keydown({ key: "Enter" });
    expect(sizes[sizes.length - 1]).toEqual([500, 900]);

    // The applied size survives a desktop pop-out return (footer remounts).
    returned!({ detail: { widgetId: "w1", extensionId: "runtime-uuid-test" } });
    await flush();
    const remountedInputs = inputs().slice(-2);
    expect(remountedInputs[0].value).toBe("500");
    expect(remountedInputs[1].value).toBe("900");

    // Live updates reach both surfaces while the widget is open.
    const before = dom.frames.length;
    events.CHARACTER_EDITED();
    await flush();
    expect(dom.frames.length).toBe(before + 2);

    // Closing the widget destroys it and detaches the desktop listener.
    const closeButton = dom.buttons().find((b) => b.title === "Close preview widget");
    expect(closeButton).toBeDefined();
    closeButton!.handlers.click();
    expect(destroyCount).toBe(1);
    expect(win.listeners["spindle:desktop-widget-returned"]).toBeUndefined();

    // After close, broadcasts only re-render the drawer view.
    const afterClose = dom.frames.length;
    events.CHARACTER_EDITED();
    await flush();
    expect(dom.frames.length).toBe(afterClose + 1);

    // Reopening creates a fresh widget at the last applied size; teardown destroys it.
    floatButton!.handlers.click();
    expect(created).toBe(2);
    expect(createdOptions[1]).toMatchObject({ width: 500, height: 900 });
    cleanup!();
    expect(destroyCount).toBe(2);
    expect(win.listeners["spindle:desktop-widget-returned"]).toBeUndefined();
    expect(interval.cleared).toBe(true);
  } finally {
    cleanup?.();
    interval.restore();
    storage.restore();
    win.restore();
    dom.restore();
  }
});

test("float widget creation failure (e.g. revoked ui_panels) is tolerated", async () => {
  const dom = installDomStub();
  const interval = installIntervalStub();
  const storage = installLocalStorageStub();
  let characterId: string | null = "a";
  let created = 0;
  let cleanup: (() => void) | undefined;
  try {
    cleanup = setup({
      ui: { registerDrawerTab: () => ({ root: { style: {}, appendChild() {} },
        onActivate: () => () => {}, destroy() {} }),
        createFloatWidget() { created++; throw new Error("ui_panels revoked"); } },
      getActiveChat: () => ({ characterId }),
      characters: { get: () => Promise.resolve({ creator_notes: "notes" }) },
      events: { on: () => () => {} },
    } as any);
    await flush();

    const floatButton = dom.buttons().find((b) => b.textContent === "Float preview");
    expect(() => floatButton!.handlers.click()).not.toThrow();
    expect(created).toBe(1);
    // Drawer preview is unaffected.
    expect(dom.frames).toHaveLength(1);
  } finally {
    cleanup?.();
    interval.restore();
    storage.restore();
    dom.restore();
  }
});

test("desktop pop-out window auto-creates the widget without drawer chrome", async () => {
  const dom = installDomStub();
  const interval = installIntervalStub();
  const storage = installLocalStorageStub();
  const ro = installResizeObserverStub();
  let characterId: string | null = "a";
  let created = 0;
  let destroyCount = 0;
  const sizes: [number, number][] = [];
  const createdOptions: Record<string, unknown>[] = [];
  let registerDrawerTabCalls = 0;

  const makeCtx = () => ({
    ui: {
      registerDrawerTab: () => {
        registerDrawerTabCalls++;
        const root = globalThis.document.createElement("div") as unknown as StubNode;
        // The host stamps every placement root with the runtime extension UUID.
        root.setAttribute("data-spindle-extension-root", "runtime-uuid-live");
        return {
          root: root as unknown as HTMLElement,
          onActivate: () => () => {}, destroy() {},
        };
      },
      createFloatWidget(options: Record<string, unknown>) {
        created++;
        createdOptions.push(options);
        const handle = {
          ...makeFloatWidgetHandle(),
          setSize(width: number, height: number) { sizes.push([width, height]); },
          destroy() { destroyCount++; },
        };
        roots.push(handle.root as unknown as StubNode);
        return handle;
      },
    },
    // A real pop-out window never learns the active chat (ChatView never
    // renders there), so getActiveChat returns null in widget mode.
    getActiveChat: () => ({ characterId: isWidgetPhase ? null : characterId }),
    characters: { get(id: string) {
      reads.push(id);
      return Promise.resolve({ creator_notes: `<b>notes for ${id}</b>` });
    } },
    events: { on: () => () => {} },
  });

  let isWidgetPhase = false;
  const reads: string[] = [];
  const roots: StubNode[] = [];

  try {
    // Phase 1 — main window: no widget params; drawer tab teaches us the
    // runtime UUID via the host stamp, and the active character is mirrored
    // for pop-out windows.
    let win = installWindowStub();
    let cleanup = setup(makeCtx() as any);
    await flush();
    expect(created).toBe(0);
    expect(registerDrawerTabCalls).toBe(1);
    expect(storage.get("creator_notes_html_renderer:runtimeExtensionId"))
      .toBe("runtime-uuid-live");
    expect(storage.get("creator_notes_html_renderer:activeCharacterId")).toBe("a");
    const mainPhaseFrames = dom.frames.length;
    cleanup();
    win.restore();

    // Phase 2 — a pop-out URL for a DIFFERENT extension must not trigger
    // widget mode (the known UUID does not match).
    isWidgetPhase = true;
    win = installWindowStub("?desktopWidgetExtension=someone_else&desktopWidgetWidth=500&desktopWidgetHeight=400");
    cleanup = setup(makeCtx() as any);
    await flush();
    expect(created).toBe(0);
    expect(registerDrawerTabCalls).toBe(2);
    cleanup();
    win.restore();

    // Phase 3 — our own pop-out URL: widget created immediately, no drawer
    // tab, and the active character resolves through the mirror. A previously
    // persisted size wins over the URL's size-at-open, and a post-creation
    // setSize re-asserts it over the host's URL seeding.
    storage.seed("creator_notes_html_renderer:floatSize", JSON.stringify({ width: 600, height: 700 }));
    win = installWindowStub(
      "?desktopWidgetExtension=runtime-uuid-live&desktopWidgetIndex=0" +
      "&desktopWidgetTitle=Creator%20Notes%20HTML%20Renderer&desktopWidgetWidth=500&desktopWidgetHeight=400",
    );
    const drawerPhaseFrames = mainPhaseFrames;
    const drawerPhaseButtons = dom.buttons().length;
    const drawerPhaseInputs = dom.nodes.filter((n) => n.tag === "input").length;
    cleanup = setup(makeCtx() as any);
    expect(created).toBe(1);
    expect(createdOptions[0]).toMatchObject({ width: 600, height: 700, persistGeometry: "html-preview" });
    expect(sizes[0]).toEqual([600, 700]); // post-creation override in pop-outs
    expect(registerDrawerTabCalls).toBe(2); // unchanged from the foreign phase
    // The layout guard gives the root an explicit pixel height from the host
    // container instead of an unresolvable height:100% chain.
    expect(roots[0].style.height).toBe("480px");
    await flush();
    expect(dom.frames).toHaveLength(drawerPhaseFrames + 1);
    expect(dom.frames[dom.frames.length - 1].srcdoc).toContain("notes for a");
    expect(reads).toEqual(["a", "a"]); // phase 1 main window + phase 3 pop-out

    // A character switch in the main window updates the mirror; the pop-out
    // poll picks it up and re-renders.
    storage.seed("creator_notes_html_renderer:activeCharacterId", "b");
    interval.tick();
    await flush();
    expect(reads).toEqual(["a", "a", "b"]);
    expect(dom.frames[dom.frames.length - 1].srcdoc).toContain("notes for b");

    // No in-widget chrome in a pop-out: the native window owns title/close.
    const widgetButtons = dom.buttons().slice(drawerPhaseButtons);
    const titles = widgetButtons.map((b) => b.title);
    expect(titles).not.toContain("Close preview widget");
    expect(titles).not.toContain("Toggle fullscreen");
    expect(widgetButtons.map((b) => b.textContent)).toEqual(["Apply"]);

    // The strip starts at the persisted size; a host-driven resize (native
    // window edges) is tracked live, persisted, and reflected in the inputs.
    const inputs = () => dom.nodes.filter((n) => n.tag === "input").slice(drawerPhaseInputs);
    expect(inputs().map((n) => n.value)).toEqual(["600", "700"]);
    (roots[0] as any).clientWidth = 640;
    (roots[0] as any).clientHeight = 520;
    ro.fire(roots[0]);
    expect(inputs().map((n) => n.value)).toEqual(["640", "520"]);
    expect(storage.get("creator_notes_html_renderer:floatSize")).toBe('{"width":640,"height":520}');

    // Size strip uses the desktop pop-out clamps (160–1200 × 100–900).
    inputs()[0].value = "2000";
    inputs()[1].value = "50";
    widgetButtons[0].handlers.click();
    expect(sizes[1]).toEqual([1200, 100]);

    cleanup();
    expect(destroyCount).toBe(1);
    expect(interval.cleared).toBe(true);
    win.restore();

    // Phase 4 — no persisted UUID (fresh profile / blocked storage): fall
    // back to treating any widget window as ours so the widget still renders,
    // at the last tracked size.
    storage.drop("creator_notes_html_renderer:runtimeExtensionId");
    win = installWindowStub("?desktopWidgetExtension=unknown-id&desktopWidgetWidth=300&desktopWidgetHeight=250");
    cleanup = setup(makeCtx() as any);
    expect(created).toBe(2);
    expect(createdOptions[1]).toMatchObject({ width: 1200, height: 100 });
    expect(sizes[2]).toEqual([1200, 100]);
    await flush();
    expect(dom.frames[dom.frames.length - 1].srcdoc).toContain("notes for b");
    cleanup();
    win.restore();
  } finally {
    ro.restore();
    storage.restore();
    interval.restore();
    dom.restore();
  }
});
