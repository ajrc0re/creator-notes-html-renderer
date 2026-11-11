/** Constrain creator-authored layouts to the iframe's available width.
 *  `fontScale` zooms the whole document: creator notes usually size text in
 *  px, which a root font-size change would not reach. */
export function buildPreviewDocument(safeHtml: string, fontScale = 1): string {
  const scale = Number.isFinite(fontScale) && fontScale > 0 ? fontScale : 1;
  const zoom = scale === 1 ? "" : `\nhtml { zoom: ${scale}; }`;
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
}${zoom}
</style></head><body>${safeHtml}</body></html>`;
}
