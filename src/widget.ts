import { sanitize } from "./sanitizer";
import { buildPreviewDocument } from "./preview-document";

export function HtmlPreviewWidget({ html }: { html: string }): string {
  const safe = sanitize(html);

  return `
    <div class="html-preview-root" style="
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      min-width: 0;
      min-height: 0;
      font-family: var(--font-sans, sans-serif);
      color: var(--color-text, #e4e4e7);
      background: var(--color-surface, #18181b);
      border-radius: 8px;
      overflow: hidden;
    ">
      <div class="html-preview-toolbar" style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-bottom: 1px solid var(--color-border, #27272a);
        font-size: 12px;
        opacity: 0.6;
      ">
        <span style="font-weight:600;">HTML Preview</span>
        <span style="flex:1;"></span>
        <span>Creator Notes</span>
      </div>
      <iframe
        class="html-preview-frame"
        sandbox=""
        style="
          flex: 1;
          border: none;
          width: 100%;
          min-width: 0;
          min-height: 0;
          background: var(--color-surface, #18181b);
        "
        title="Creator notes HTML preview"
        srcdoc="${escapeAttr(buildPreviewDocument(safe))}"
      ></iframe>
    </div>
  `;
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
