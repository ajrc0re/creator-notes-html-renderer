import { sanitize } from "./sanitizer";
import { buildPreviewDocument } from "./preview-document";
import type { SpindleFrontendContext, CharacterDTO } from "lumiverse-spindle-types";

export function setup(ctx: SpindleFrontendContext) {
  const tab = ctx.ui.registerDrawerTab({
    id: "html_preview",
    title: "HTML Preview",
    shortName: "Preview",
    description: "Renders HTML and CSS from the creator notes field as a live preview.",
    keywords: ["html", "css", "preview", "creator notes", "render"],
    headerTitle: "HTML Preview",
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
  });

  const root = tab.root;
  root.style.cssText = "display:flex;flex-direction:column;width:100%;min-width:0;min-height:0;height:100%;";

  const iframeContainer = document.createElement("div");
  iframeContainer.style.cssText = "flex:1;width:100%;min-width:0;min-height:0;overflow:hidden;";
  root.appendChild(iframeContainer);

  function renderContent(html: string) {
    const safe = sanitize(html);
    const doc = buildPreviewDocument(safe);
    iframeContainer.innerHTML = '';
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "");
    iframe.title = "Creator notes HTML preview";
    iframe.style.cssText = "display:block;width:100%;min-width:0;height:100%;border:none;background:transparent;";
    iframe.srcdoc = doc;
    iframeContainer.appendChild(iframe);
  }

  function showError(msg: string) {
    showPlaceholder(msg);
    (iframeContainer.firstChild as HTMLElement).style.color = "#f87171";
  }

  function showPlaceholder(msg: string) {
    const message = document.createElement("p");
    message.style.cssText = "opacity:0.5;padding:12px;";
    message.textContent = msg;
    iframeContainer.replaceChildren(message);
  }

  let disposed = false;
  let requestVersion = 0;
  let observedCharacterId: string | null | undefined;

  async function loadCreatorNotes() {
    if (disposed) return;
    const version = ++requestVersion;
    const { characterId } = ctx.getActiveChat();
    observedCharacterId = characterId;
    if (!characterId) {
      showPlaceholder("Open a character in the editor to see a live HTML preview of their creator notes.");
      return;
    }

    try {
      const card = await ctx.characters.get(characterId) as CharacterDTO | null;
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId) return;
      const creatorNotes = card?.creator_notes ?? "";
      if (!creatorNotes) {
        showPlaceholder("Creator notes are empty.");
      } else {
        renderContent(creatorNotes);
      }
    } catch (err) {
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId) return;
      showError(`Failed to read creator notes: ${err}`);
    }
  }

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

  return () => {
    disposed = true;
    ++requestVersion;
    clearInterval(selectionTimer);
    try { unsubActivate(); } catch (_) {}
    try { unsubChatSwitched(); } catch (_) {}
    try { unsubCharEdited(); } catch (_) {}
    try { tab.destroy(); } catch (_) {}
  };
}
