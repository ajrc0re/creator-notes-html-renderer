# Creator Notes HTML Renderer

A Lumiverse Spindle extension with **Creator Notes** and **Profile** tabs in both the drawer and floating preview, including native desktop pop-out windows.

## What It Does

The first tab, **Creator Notes**, reads the `creator_notes` field and renders it as real HTML + CSS — images, styled tables, links, embedded stylesheets, all of it.

The second tab, **Profile**, renders the active character's definition as sanitized GitHub-flavored Markdown, using Lumiverse's theme colors and collapsible sections:

- Description, Personality, and Scenario
- System Prompt and Post-History Instructions
- Message Examples and First Message
- Alternate Greetings, each with a three-line preview and **Click to expand**
- Attached World Books, with clickable names that open Lumiverse's Lorebook editor

World book links in a native pop-out open the editor in the main Lumiverse window. Keep the main window open; any permission prompt is shown there as well.

Empty fields show a short placeholder. Tabs and sections remain usable when creator notes are empty. Each placement remembers its selected tab; section expansion survives edits and tab changes, and resets for a different character. Switching characters immediately clears the old content while the new card loads.

The preview updates whenever the character data changes.

## Install

1. Open the **Side Panel** (drawer → Extensions)
2. Click **Add Extension** → **Install from Source**
3. Paste the repo URL or point it at this directory via **Import Local**
4. Enable the extension and grant the `characters` and `UI` permissions. Opening an attached world book also requires `world_books`; existing installs are prompted when a book is first opened.

## Permissions

| Permission | Why |
|---|---|
| `ui_panels` | Mount the float widget (drawer tabs are free) |
| `characters` | Read the active character's creator notes and definition |
| `world_books` | Open an attached world book in the native Lorebook editor |

## Usage

1. Open any character in the character editor
2. Open the **HTML Preview** drawer tab
3. Write HTML + CSS in the creator notes field as normal
4. The preview renders it live; select **Profile** for the character's Markdown definition

### Text Size

The bottom bar of the drawer tab and of the floating widget has **A−** / **A+** buttons (50%–300% in 10% steps) and a **Theme** checkbox.

- The size is remembered **per character**. A character with no saved size starts at the Lumiverse theme font scale.
- It applies to both tabs: the Creator Notes preview is zoomed as a whole (so px-sized text in creator HTML grows too), and the Profile text is scaled.
- **Theme** (a single setting for all characters) makes every character follow the theme's font scale (`--lumiverse-font-scale`) and greys out the buttons; unticking it brings each character's saved size back. Theme scale changes are picked up within ~500 ms.
- The drawer, floating widget, and desktop pop-out share the setting (localStorage) and stay in sync.

### Floating Widget

Click **Float preview** in the drawer tab footer to pop the preview out as a **floating widget** — the same two tabs in a draggable overlay window.

- Drag it anywhere; it snaps to the nearest screen edge when dropped
- Use the expand button in the widget header to toggle fullscreen
- Resize it however you like — native window edges in a desktop pop-out, the in-page resize handles, or the **W × H** strip at the bottom of the widget (**Apply** or Enter; clamped only to a generous 220–7680 × 150–4320 in-page and 160–7680 × 100–4320 in pop-outs; the host may clamp further — see the Lumiverse Desktop note below). The widget's size is tracked live and persisted (plus the host's opt-in `persistGeometry` for position), so it survives widget recreations, character switches, desktop pop-out returns, and app restarts; the strip inputs follow host-driven resizes so Apply never snaps back to a stale value
- Close it with the × button (the drawer tab preview keeps running)
- Hide or reset its position any time via right-click on the widget, or from the Extension UI control panel
- On **Lumiverse Desktop**, the widget can be popped out into a native OS window (system tray → Lumiverse → Floating widgets → Pop out). A pop-out is a *second frontend instance*: Lumiverse loads the whole app — including this extension — in the native window and expects the extension to create its widget there. The extension detects this via the `desktopWidgetExtension` URL parameter — which carries the install's server-assigned runtime UUID, **not** the manifest identifier — and auto-creates the widget at the size the pop-out was opened with, clamped to the extension's sanity bounds (160–7680 × 100–4320). **Note:** Lumiverse Desktop itself currently caps pop-out sizes at 1200 × 900 (`WIDGET_MAX_WIDTH/HEIGHT` in `desktop/src-tauri/src/frontend.rs` and `DESKTOP_WIDGET_MAX_SIZE` in `frontend/src/lib/desktop-floating-widget.ts`). Native edge drags are not capped, but every `setSize` and every widget-catalog republish from the main window clamps the native window back to 1200 × 900, so larger pop-outs need that host limit raised. The runtime UUID is learned from the `data-spindle-extension-root` stamp the host puts on every placement root and persisted to localStorage so pop-out windows (separate WebView, same origin) can match it; if it is unknown, any widget window is treated as ours, which is harmless in a foreign window. The native window provides its own title bar with a return button and OS-style edge resizing, so the in-widget fullscreen/close buttons are hidden in pop-outs; resizing via the strip also updates the native window bounds, and when the widget is returned to the page the preview content is rebuilt and refreshed automatically

Both surfaces share one data pipeline: character switches and edits update the drawer tab and the floating widget together. A desktop pop-out window never renders the chat view (its `ctx.getActiveChat()` is permanently empty), so the main window mirrors the active character id to localStorage and pop-outs resolve through that mirror — the pop-out's poll picks up character switches within ~500 ms. The pop-out host also sizes its container with min-height only (no definite height for `height:100%` chains), so the widget root measures its host container and applies an explicit pixel height, kept in sync via `ResizeObserver` — otherwise the preview iframe collapses to its intrinsic ~300×150 box.

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
  frontend.ts      Drawer tab + floating widget wiring and shared character-state pipeline
  character-view.ts Shared Creator Notes / Profile tab strip and placement state
  profile-view.ts  Collapsible character definition, greeting previews, and world book links
  profile-markdown.ts  Marked + DOMPurify rendering for profile prose
  profile-actions.ts  Native world book editor integration and permission request
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
