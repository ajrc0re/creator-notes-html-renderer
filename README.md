# Creator Notes HTML Renderer

A Lumiverse Spindle extension that renders HTML and CSS from a character's creator notes as a live preview widget in the character editor.

## What It Does

When you're editing a character in the Identity tab, this extension shows a **float widget** that reads the `creator_notes` field and renders it as real HTML + CSS — images, styled tables, links, embedded stylesheets, all of it.

The preview updates whenever the character data changes.

## Install

1. Open the **Side Panel** (drawer → Extensions)
2. Click **Add Extension** → **Install from Source**
3. Paste the repo URL or point it at this directory via **Import Local**
4. Enable the extension and grant the `characters` and `UI` permissions

## Permissions

| Permission | Why |
|---|---|
| `ui_panels` | Mount the float widget (drawer tabs are free) |
| `characters` | Read the active character's creator notes |

## Usage

1. Open any character in the character editor
2. Open the **HTML Preview** drawer tab
3. Write HTML + CSS in the creator notes field as normal
4. The preview renders it live

### Floating Widget

Click **Float preview** in the drawer tab toolbar to pop the preview out as a **floating widget** — the same live, sanitized preview in a draggable overlay window.

- Drag it anywhere; it snaps to the nearest screen edge when dropped
- Use the expand button in the widget header to toggle fullscreen
- Resize it from the **W × H** strip at the bottom of the widget: type a width and height and hit **Apply** (or press Enter). Values are clamped to 220–1920 × 150–1200, the applied size is remembered across desktop pop-out returns, and reopening the widget restores it. This is explicit resizing — the float widget API has no native drag-corner resize
- Close it with the × button (the drawer tab preview keeps running)
- Hide or reset its position any time via right-click on the widget, or from the Extension UI control panel
- On **Lumiverse Desktop**, the widget can be popped out into a native OS window (system tray → Lumiverse → Floating widgets → Pop out). A pop-out is a *second frontend instance*: Lumiverse loads the whole app — including this extension — in the native window and expects the extension to create its widget there. The extension detects this via the `desktopWidgetExtension` URL parameter — which carries the install's server-assigned runtime UUID, **not** the manifest identifier — and auto-creates the widget at the size the pop-out was opened with, clamped to the desktop bounds (160–1200 × 100–900). The runtime UUID is learned from the `data-spindle-extension-root` stamp the host puts on every placement root and persisted to localStorage so pop-out windows (separate WebView, same origin) can match it; if it is unknown, any widget window is treated as ours, which is harmless in a foreign window. The native window provides its own title bar with a return button and OS-style edge resizing, so the in-widget fullscreen/close buttons are hidden in pop-outs; resizing via the strip also updates the native window bounds, and when the widget is returned to the page the preview content is rebuilt and refreshed automatically

Both surfaces share one data pipeline: character switches and edits update the drawer tab and the floating widget together.

### What's Supported

- Standard HTML5 elements (divs, tables, images, details/summary, audio/video, etc.)
- Inline `<style>` blocks and `style=""` attributes
- Links with safe protocols (http, https, mailto)
- Images from http/https sources and `data:image/*` URIs
- HTML entities and numeric character references

### What's Blocked

The sanitizer strips:
- `<script>` tags and their contents
- `<svg>`, `<math>`, `<noscript>` (namespace-switching and mXSS vectors)
- `<iframe>`, `<embed>`, `<object>`, `<applet>` (embedded content)
- `<base>`, `<link>` (redirect/external-load vectors)
- `<template>` (complex parsing)
- Event handler attributes (`onclick`, `onerror`, etc.)
- `javascript:` and `vbscript:` URLs (in both HTML and CSS)
- `@import` in CSS (loads external stylesheets)
- `expression()`, `behavior:`, `-moz-binding:` in CSS (JS execution vectors)
- `url()` in CSS pointing to non-image data URIs
- Entity-encoded bypasses — all HTML entities are decoded before sanitizing, so `&#60;script&#62;` is caught just like `<script>`

## Security Model

The extension uses **three layers** of defense:

1. **Entity decoding** — All HTML entities (`&#60;`, `&lt;`, `&#x3C;`, named refs) are resolved to their raw characters *before* the sanitizer runs. This prevents the classic "encode the angle brackets" bypass where entity-encoded tags slip through a regex-only filter but get decoded and executed by the browser.

2. **Allowlist sanitizer** — Tags, attributes, and URL protocols are all allowlisted. Unknown or dangerous tags are stripped (not escaped). Attributes are filtered individually. URLs are validated against a protocol allowlist. CSS inside `<style>` tags and `style=""` attributes gets its own sanitization pass.

3. **Sandboxed iframe** — The rendered output goes into `<iframe sandbox="">` with **no sandbox flags** — no scripts, no forms, no same-origin access, no popups, no top-navigation. Even if something slips past the sanitizer, the iframe's sandbox should prevent it from executing scripts, navigating away, or accessing the parent page.

## Architecture

```
src/
  backend.ts       RPC handler to read character creator notes
  frontend.ts      Drawer tab + floating widget wiring and shared live-state pipeline
  preview-view.ts  Shared preview surface (sanitized iframe) used by both placements
  sanitizer.ts     Three-layer sanitizer (entity decode → tag/attr filter → CSS sanitize)
```

## Development

```bash
bun install
bun run build    # compiles backend.ts + frontend.ts → dist/
```

Then install the extension via the Spindle Panel using **Import Local**, pointing at this directory.

See the [Spindle developer docs](https://docs.lumiverse.chat) for the full API reference.
