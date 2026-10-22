import { Marked } from "marked";
import createDOMPurify, { type DOMPurify } from "dompurify";

// Match the native profile's Markdown dialect without changing global options.
const markdown = new Marked({ gfm: true, breaks: true, async: false });
let purifier: DOMPurify;
let purifierWindow: Window;

export function renderProfileMarkdown(text: string): string {
  if (!purifier || purifierWindow !== window) {
    purifier = createDOMPurify(window);
    purifierWindow = window;
  }
  return purifier.sanitize(markdown.parse(text) as string, {
    USE_PROFILES: { html: true },
    // Profile prose lives in the host document. Card CSS must stay in the
    // separately sandboxed creator-notes preview.
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
    FORBID_ATTR: ["style", "class", "id", "name"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}
