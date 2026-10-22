import { expect, test } from "bun:test";
import { JSDOM } from "jsdom";
import type { CharacterDTO } from "lumiverse-spindle-types";
import { createCharacterView } from "./character-view";
import { createProfileActions } from "./profile-actions";
import { renderProfileMarkdown } from "./profile-markdown";
import { setup } from "./frontend";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

async function withDom(run: () => void | Promise<void>) {
  const saved = [globalThis.document, globalThis.window, globalThis.localStorage];
  const dom = new JSDOM("<!DOCTYPE html><body></body>", { url: "http://localhost/" });
  Object.assign(globalThis, { document: dom.window.document, window: dom.window, localStorage: dom.window.localStorage });
  try { await run(); } finally {
    Object.assign(globalThis, { document: saved[0], window: saved[1], localStorage: saved[2] });
    dom.window.close();
  }
}

function card(id = "a", overrides: Partial<CharacterDTO> = {}): CharacterDTO {
  return {
    id, name: `Character ${id}`, creator_notes: "", description: "# Description\n\n**Bold** and *italic*.\n\n- One\n- Two",
    personality: "Kind", scenario: "A quiet room", system_prompt: "Stay in character", post_history_instructions: "Remember the scene",
    mes_example: "```text\n{{char}}: Hello\n```", first_mes: "**Hello**, {{user}}!", alternate_greetings: ["One\nTwo\nThree\nFour\nFive"],
    tags: [], creator: "", image_id: null, world_book_ids: ["book-a"], extensions: {}, created_at: 0, updated_at: 0, ...overrides,
  };
}

const actions = {
  listWorldBooks: async () => [{ id: "book-a", name: "The Ark" }],
  openWorldBook: async (_id: string) => {},
  openEmbeddedLorebook: async (_characterId: string) => {},
};

function clickTab(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((item) => item.textContent === label)!;
  button.click();
  return button;
}

function section(root: HTMLElement, title: string): HTMLDetailsElement {
  return [...root.querySelectorAll<HTMLDetailsElement>(".cnhr-section")].find((item) => item.querySelector("summary")?.textContent === title)!;
}

test("profile renders all definition fields when notes are empty, expands greetings, and opens named world books", async () => withDom(async () => {
  const opened: string[] = [];
  const view = createCharacterView({ ...actions, openWorldBook: async (id) => { opened.push(id); } });
  document.body.appendChild(view.element);
  view.render({ kind: "character", character: card() });
  expect(view.element.textContent).toContain("Creator notes are empty.");
  const profileTab = clickTab(view.element, "Profile");
  expect(profileTab.getAttribute("aria-selected")).toBe("true");
  expect(view.element.querySelectorAll(".cnhr-section")).toHaveLength(9);
  expect(section(view.element, "Description").querySelector("h1")?.textContent).toBe("Description");
  expect(section(view.element, "Description").querySelector("strong")?.textContent).toBe("Bold");
  expect(section(view.element, "Description").querySelectorAll("li")).toHaveLength(2);
  expect(section(view.element, "Post-History Instructions").textContent).toContain("Remember the scene");
  expect(section(view.element, "Message Examples").querySelector("pre code")?.textContent).toContain("{{char}}: Hello");
  expect(section(view.element, "First Message").querySelector("strong")?.textContent).toBe("Hello");
  const greeting = view.element.querySelector<HTMLDetailsElement>(".cnhr-greeting")!;
  expect(greeting.open).toBe(false);
  expect(greeting.querySelector(".cnhr-greeting-hint")?.textContent).toBe("Click to expand");
  expect(greeting.querySelector(".cnhr-greeting-preview")?.textContent).toBe("One\nTwo\nThree\nFour\nFive");
  expect(view.element.querySelector("style")?.textContent).toContain("-webkit-line-clamp:3");
  greeting.open = true;
  expect(greeting.querySelector(".cnhr-prose")?.innerHTML).toContain("Five");
  await flush();
  const book = view.element.querySelector<HTMLButtonElement>(".cnhr-book-link")!;
  expect(book.textContent).toBe("The Ark");
  book.click();
  await flush();
  expect(opened).toEqual(["book-a"]);
}));

test("Markdown supports tables and code while isolating card HTML and unsafe URLs", async () => withDom(() => {
  const html = renderProfileMarkdown('# Title\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n> Quote\n\n`<script>alert(1)</script>`\n\n[Safe](https://example.com) [Bad](javascript:alert%281%29)\n\n<style>body{display:none}</style><img src=x onerror=alert(1)><svg onload=alert(1)></svg><script>alert(1)</script><p style="position:fixed" class="cnhr-view" id="host">Text</p>');
  const root = document.createElement("div");
  root.innerHTML = html;
  expect(root.querySelector("table td")?.textContent).toBe("1");
  expect(root.querySelector("blockquote")?.textContent).toContain("Quote");
  expect(root.querySelector("code")?.textContent).toBe("<script>alert(1)</script>");
  expect(root.querySelector("a")?.getAttribute("href")).toBe("https://example.com");
  expect(root.querySelector("script,style,svg,[onerror],[onload],[style],[class],[id]")).toBeNull();
  expect(html).not.toContain('href="javascript:');
}));

test("tab and section selection survives edits and remounts, and a new character resets sections", async () => withDom(async () => {
  const view = createCharacterView(actions, "test:floatTab");
  document.body.appendChild(view.element);
  view.render({ kind: "character", character: card() });
  clickTab(view.element, "Profile");
  section(view.element, "Description").open = true;
  await flush();
  clickTab(view.element, "Creator Notes");
  clickTab(view.element, "Profile");
  expect(section(view.element, "Description").open).toBe(true);
  view.render({ kind: "character", character: card("a", { description: "Updated" }) });
  expect(section(view.element, "Description").open).toBe(true);
  expect(section(view.element, "Description").textContent).toContain("Updated");
  const remounted = createCharacterView(actions, "test:floatTab");
  remounted.render({ kind: "character", character: card() });
  expect(remounted.element.querySelector('[aria-selected="true"]')?.textContent).toBe("Profile");
  view.render({ kind: "character", character: card("b") });
  expect(section(view.element, "Description").open).toBe(false);
  expect(view.element.querySelector("h2")?.textContent).toBe("Character b");
}));

test("tab keyboard controls and empty field placeholders work", async () => withDom(() => {
  const view = createCharacterView(actions);
  document.body.appendChild(view.element);
  view.render({ kind: "character", character: card("a", { description: "", alternate_greetings: [], world_book_ids: [] }) });
  const notes = view.element.querySelector<HTMLButtonElement>('[role="tab"]')!;
  notes.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  expect(document.activeElement?.textContent).toBe("Profile");
  expect(section(view.element, "Description").textContent).toContain("No description defined");
  expect(section(view.element, "Alternate Greetings").textContent).toContain("No alternate greetings");
  expect(section(view.element, "Attached World Books").textContent).toContain("No world books attached");
  document.activeElement!.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Home", bubbles: true }));
  expect(document.activeElement?.textContent).toBe("Creator Notes");
}));

test("both placements update the full profile, clear old cards immediately, and reject stale reads", async () => withDom(async () => {
  const savedInterval = [globalThis.setInterval, globalThis.clearInterval];
  globalThis.setInterval = (() => 1) as any;
  globalThis.clearInterval = (() => {}) as any;
  let cleanup: (() => void) | undefined;
  try {
    let characterId: string | null = "a";
    let resolveB!: (value: CharacterDTO) => void;
    const events: Record<string, () => void> = {};
    const drawerRoot = document.createElement("div");
    const floatRoot = document.createElement("div");
    document.body.append(drawerRoot, floatRoot);
    cleanup = setup({
      ui: {
        registerDrawerTab: () => ({ root: drawerRoot, onActivate: () => () => {}, destroy() {} }),
        createFloatWidget: () => ({ root: floatRoot, widgetId: "test", setSize() {}, destroy() {}, setVisible() {} }),
      },
      getActiveChat: () => ({ characterId }),
      characters: { get: (id: string) => id === "b" ? new Promise((resolve) => { resolveB = resolve; }) : Promise.resolve(card(id)) },
      events: { on: (name: string, callback: () => void) => { events[name] = callback; return () => {}; } },
      worldBooks: { list: actions.listWorldBooks },
    } as any);
    await flush();
    [...drawerRoot.querySelectorAll("button")].find((button) => button.textContent === "Float preview")!.click();
    clickTab(drawerRoot, "Profile");
    clickTab(floatRoot, "Profile");
    expect(drawerRoot.querySelector("h2")?.textContent).toBe("Character a");
    expect(floatRoot.querySelector("h2")?.textContent).toBe("Character a");
    characterId = "b";
    events.CHAT_SWITCHED();
    expect(drawerRoot.querySelector("h2")).toBeNull();
    expect(floatRoot.querySelector("h2")).toBeNull();
    expect(floatRoot.textContent).toContain("Loading character");
    characterId = "c";
    events.CHAT_SWITCHED();
    await flush();
    resolveB(card("b"));
    await flush();
    expect(drawerRoot.querySelector("h2")?.textContent).toBe("Character c");
    expect(floatRoot.querySelector("h2")?.textContent).toBe("Character c");
    characterId = null;
    events.CHAT_SWITCHED();
    expect(floatRoot.querySelector("h2")).toBeNull();
  } finally {
    cleanup?.();
    [globalThis.setInterval, globalThis.clearInterval] = savedInterval as any;
  }
}));

test("native lorebook action requests only the required grant and reports denied permission", async () => {
  const calls: unknown[] = [];
  const context = {
    host: { surfaces: { invoke: (...args: unknown[]) => { calls.push(args); } } },
    worldBooks: { list: async () => [{ id: "book-a", name: "The Ark" }] },
    permissions: {
      getGranted: async () => ["characters"],
      request: async (permissions: string[]) => { calls.push(permissions); return ["characters", "world_books"]; },
    },
  };
  const native = createProfileActions(context as any);
  expect(await native.listWorldBooks()).toEqual([{ id: "book-a", name: "The Ark" }]);
  await native.openWorldBook("book-a");
  expect(calls).toEqual([["world_books"], [{ kind: "modal", id: "world_book_editor" }, { id: "book-a" }]]);
  context.permissions.request = async () => [];
  await expect(native.openWorldBook("book-a")).rejects.toThrow("permission is required");
  expect(calls).toHaveLength(2);
  native.dispose();
});

test("desktop lorebook clicks open in the main window and pending requests stop on teardown", async () => withDom(async () => {
  const channels = new Set<any>();
  (window as any).BroadcastChannel = class {
    onmessage: ((event: { data: unknown }) => void) | null = null;
    constructor(_name: string) { channels.add(this); }
    postMessage(data: unknown) {
      for (const other of channels) if (other !== this) queueMicrotask(() => { if (channels.has(other)) other.onmessage?.({ data }); });
    }
    close() { channels.delete(this); }
  };
  window.focus = () => {};
  const opened: unknown[] = [];
  const main = createProfileActions({
    host: { surfaces: { invoke: (...args: unknown[]) => { opened.push(args); } } },
    permissions: { getGranted: async () => ["world_books"] },
  } as any, "main");
  const popout = createProfileActions({
    host: { surfaces: { invoke: () => { throw new Error("Cannot render editors in a popout"); } } },
  } as any, "popout");
  try {
    await popout.openWorldBook("book-a");
    expect(opened).toEqual([[{ kind: "modal", id: "world_book_editor" }, { id: "book-a" }]]);
    main.dispose();
    const interrupted = popout.openWorldBook("book-b");
    popout.dispose();
    await expect(interrupted).rejects.toThrow("extension was reloaded");
    expect(channels.size).toBe(0);
  } finally { main.dispose(); popout.dispose(); }
}));
