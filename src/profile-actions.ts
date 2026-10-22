import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import type { ProfileActions } from "./profile-view";

// These supported host APIs were added after this extension's pinned types.
interface ProfileHostContext extends SpindleFrontendContext {
  worldBooks?: {
    list(): Promise<Array<{ id: string; name: string }> | { data: Array<{ id: string; name: string }> }>;
  };
  host?: {
    surfaces: {
      invoke(ref: { kind: "modal"; id: "world_book_editor" }, params: { id: string }): void | Promise<void>;
    };
  };
}

export function createProfileActions(
  context: SpindleFrontendContext,
  mode: "main" | "popout" | "other" = "main",
): ProfileActions & { dispose(): void } {
  const ctx = context as ProfileHostContext;
  // Desktop widget windows omit ModalContainer, so native editors and their
  // permission prompts must be opened by the extension in the main window.
  const Channel = typeof window !== "undefined" ? window.BroadcastChannel : undefined;
  let channel: BroadcastChannel | null = null;
  try { if (mode !== "other" && Channel) channel = new Channel("creator_notes_html_renderer:worldBooks"); } catch (_) {}
  const pending = new Map<string, { resolve(): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();
  let disposed = false;

  async function openInMainWindow(id: string) {
    if (disposed) throw new Error("The extension was reloaded. Please try again.");
    if (!ctx.host?.surfaces) throw new Error("Update Lumiverse to open attached world books.");
    const granted = await ctx.permissions.getGranted();
    if (!granted.includes("world_books")) {
      const updated = await ctx.permissions.request(["world_books"], {
        reason: "Open an attached world book from the character profile in Lumiverse's Lorebook editor.",
      });
      if (!updated.includes("world_books")) throw new Error("World Books permission is required to open the editor.");
    }
    if (disposed) throw new Error("The extension was reloaded. Please try again.");
    await ctx.host.surfaces.invoke({ kind: "modal", id: "world_book_editor" }, { id });
  }

  if (channel) channel.onmessage = async ({ data }) => {
    if (disposed || !data || typeof data !== "object" || typeof data.requestId !== "string") return;
    if (mode === "main" && data.type === "open" && typeof data.id === "string" && data.id.length > 0 && data.id.length <= 200) {
      try {
        try { window.focus(); } catch (_) {}
        await openInMainWindow(data.id);
        if (!disposed) channel?.postMessage({ type: "result", requestId: data.requestId });
      } catch (error) {
        if (!disposed) channel?.postMessage({ type: "result", requestId: data.requestId, error: String(error) });
      }
    } else if (mode === "popout" && data.type === "result") {
      const request = pending.get(data.requestId);
      if (!request) return;
      pending.delete(data.requestId);
      clearTimeout(request.timer);
      if (typeof data.error === "string") request.reject(new Error(data.error));
      else request.resolve();
    }
  };

  return {
    async listWorldBooks() {
      if (!ctx.worldBooks) throw new Error("This Lumiverse version cannot list world books.");
      const result = await ctx.worldBooks.list();
      return Array.isArray(result) ? result : result.data;
    },
    async openWorldBook(id) {
      if (disposed) throw new Error("The extension was reloaded. Please try again.");
      if (mode !== "popout") return openInMainWindow(id);
      if (!channel) throw new Error("Open this world book from the main Lumiverse window.");
      const requestId = crypto.randomUUID();
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error("The main Lumiverse window did not respond. Open it and try again."));
        }, 120_000);
        pending.set(requestId, { resolve, reject, timer });
        try { channel.postMessage({ type: "open", requestId, id }); } catch (error) {
          pending.delete(requestId);
          clearTimeout(timer);
          reject(error);
        }
      });
    },
    dispose() {
      disposed = true;
      channel?.close();
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error("The extension was reloaded. Please try again."));
      }
      pending.clear();
    },
  };
}
