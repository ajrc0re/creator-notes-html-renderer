import { expect, test } from "bun:test";
import { setup } from "./frontend";

test("delayed selection recovers, stale replies are ignored, and cleanup stops polling", async () => {
  const saved = [globalThis.document, globalThis.setInterval, globalThis.clearInterval];
  let tick = () => {};
  let cleared = false;
  const frames: any[] = [];
  globalThis.document = { createElement(tag: string) {
    const node = { style: {}, innerHTML: "", textContent: "", firstChild: null,
      setAttribute() {}, appendChild() {}, replaceChildren(child: any) { this.firstChild = child; } };
    if (tag === "iframe") frames.push(node);
    return node;
  } } as any;
  globalThis.setInterval = ((callback: () => void) => { tick = callback; return 1; }) as any;
  globalThis.clearInterval = (() => { cleared = true; }) as any;
  let characterId: string | null = "a";
  const events: Record<string, () => void> = {};
  const reads: string[] = [];
  let resolveA!: (value: unknown) => void;
  let cleanup: (() => void) | undefined;
  try {
    cleanup = setup({
      ui: { registerDrawerTab: () => ({ root: { style: {}, appendChild() {} },
        onActivate: () => () => {}, destroy() {} }) },
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
    expect(frames).toHaveLength(1);
    expect(frames[0].srcdoc).toContain("new character");
    resolveA({ creator_notes: "old character" });
    await Promise.resolve();
    expect(frames).toHaveLength(1);
    tick();
    expect(reads).toEqual(["a", "b"]);
    cleanup();
    expect(cleared).toBe(true);
    characterId = "c";
    tick();
    expect(reads).toEqual(["a", "b"]);
  } finally {
    cleanup?.();
    [globalThis.document, globalThis.setInterval, globalThis.clearInterval] = saved as any;
  }
});
