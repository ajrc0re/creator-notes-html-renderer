import { sanitize } from "./sanitizer";
import { buildPreviewDocument } from "./preview-document";

export type PreviewState =
  | { kind: "html"; html: string }
  | { kind: "placeholder"; message: string }
  | { kind: "error"; message: string };

export interface PreviewView {
  element: HTMLElement;
  render(state: PreviewState): void;
}

/** A preview surface: fills its container and renders sanitized creator notes
 *  into a sandboxed iframe. Shared by the drawer tab and the float widget. */
export function createPreviewView(): PreviewView {
  const element = document.createElement("div");
  element.style.cssText =
    "flex:1;width:100%;min-width:0;min-height:0;overflow:hidden;";

  function renderMessage(message: string, isError: boolean) {
    const el = document.createElement("p");
    el.style.cssText = "opacity:0.5;padding:12px;margin:0;";
    if (isError) {
      el.style.color = "#f87171";
      el.style.opacity = "1";
    }
    el.textContent = message;
    element.replaceChildren(el);
  }

  return {
    element,
    render(state) {
      if (state.kind !== "html") {
        renderMessage(state.message, state.kind === "error");
        return;
      }
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "");
      iframe.title = "Creator notes HTML preview";
      iframe.style.cssText =
        "display:block;width:100%;min-width:0;height:100%;border:none;background:transparent;";
      iframe.srcdoc = buildPreviewDocument(sanitize(state.html));
      element.replaceChildren(iframe);
    },
  };
}
