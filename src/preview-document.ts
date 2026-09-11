/** Constrain creator-authored layouts to the iframe's available width. */
export function buildPreviewDocument(safeHtml: string): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root { color-scheme: dark light; }
html, body {
  box-sizing: border-box; margin: 0; padding: 0; width: 100%;
  min-width: 0 !important; max-width: 100% !important;
  min-inline-size: 0 !important; max-inline-size: 100% !important;
  overflow-x: auto !important;
}
body {
  background: #18181b; color: #e4e4e7; white-space: pre-wrap;
  overflow-wrap: anywhere; word-break: break-word;
}
body *, body *::before, body *::after {
  box-sizing: border-box;
  min-width: 0 !important; max-width: 100% !important;
  min-inline-size: 0 !important; max-inline-size: 100% !important;
}
img, picture, video { height: auto !important; object-fit: contain; }
audio, progress, meter { width: 100% !important; }
table { width: 100% !important; table-layout: fixed !important; }
th, td, pre, code, kbd, samp {
  white-space: pre-wrap !important; overflow-wrap: anywhere; word-break: break-word;
}
</style></head><body>${safeHtml}</body></html>`;
}
