// src/sanitizer.ts
var ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "br",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "img",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "meter",
  "nav",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "section",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]);
var BLOCKED_TAGS = new Set([
  "script",
  "svg",
  "math",
  "noscript",
  "iframe",
  "embed",
  "object",
  "applet",
  "base",
  "link",
  "template",
  "meta"
]);
var ALLOWED_ATTRS = new Set([
  "href",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "style",
  "width",
  "height",
  "target",
  "rel",
  "loading",
  "decoding",
  "colspan",
  "rowspan",
  "span",
  "headers",
  "scope",
  "type",
  "value",
  "placeholder",
  "disabled",
  "readonly",
  "name",
  "for",
  "label",
  "start",
  "reversed",
  "cite",
  "datetime",
  "wrap",
  "open",
  "max",
  "min",
  "low",
  "high",
  "optimum",
  "controls",
  "loop",
  "muted",
  "preload",
  "poster",
  "playsinline"
]);
var URL_ATTRS = new Set(["href", "src", "poster", "data", "action", "formaction"]);
var SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", "data:image/"]);
var RAW_TEXT_ELEMENTS = new Set(["style"]);
var NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  zwnj: "‌",
  zwj: "‍",
  lrm: "‎",
  rlm: "‏",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  hellip: "…",
  prime: "′",
  Prime: "″",
  copy: "©",
  reg: "®",
  trade: "™",
  laquo: "«",
  raquo: "»",
  deg: "°",
  plusmn: "±",
  micro: "µ",
  para: "¶",
  middot: "·",
  frac12: "½",
  times: "×",
  divide: "÷",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  iexcl: "¡",
  curren: "¤",
  brvbar: "¦",
  sect: "§",
  uml: "¨",
  ordf: "ª",
  not: "¬",
  shy: "­",
  macr: "¯",
  ordm: "º",
  sup1: "¹",
  sup2: "²",
  sup3: "³",
  acute: "´",
  cedil: "¸",
  iquest: "¿",
  Agrave: "À",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Auml: "Ä",
  Aring: "Å",
  AElig: "Æ",
  Ccedil: "Ç",
  Egrave: "È",
  Eacute: "É",
  Ecirc: "Ê",
  Euml: "Ë",
  Igrave: "Ì",
  Iacute: "Í",
  Icirc: "Î",
  Iuml: "Ï",
  ETH: "Ð",
  Ntilde: "Ñ",
  Ograve: "Ò",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Ouml: "Ö",
  Oslash: "Ø",
  Ugrave: "Ù",
  Uacute: "Ú",
  Ucirc: "Û",
  Uuml: "Ü",
  Yacute: "Ý",
  THORN: "Þ",
  szlig: "ß",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  eth: "ð",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  thorn: "þ",
  yuml: "ÿ",
  OElig: "Œ",
  oelig: "œ",
  Scaron: "Š",
  scaron: "š",
  Yuml: "Ÿ",
  fnof: "ƒ",
  circ: "ˆ",
  tilde: "˜",
  Alpha: "Α",
  Beta: "Β",
  Gamma: "Γ",
  Delta: "Δ",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Theta: "Θ",
  Iota: "Ι",
  Kappa: "Κ",
  Lambda: "Λ",
  Mu: "Μ",
  Nu: "Ν",
  Xi: "Ξ",
  Omicron: "Ο",
  Pi: "Π",
  Rho: "Ρ",
  Sigma: "Σ",
  Tau: "Τ",
  Upsilon: "Υ",
  Phi: "Φ",
  Chi: "Χ",
  Psi: "Ψ",
  Omega: "Ω",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  rho: "ρ",
  sigmaf: "ς",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  thetasym: "ϑ",
  upsih: "ϒ",
  piv: "ϖ",
  larr: "←",
  uarr: "↑",
  rarr: "→",
  darr: "↓",
  harr: "↔",
  crarr: "↵",
  lArr: "⇐",
  uArr: "⇑",
  rArr: "⇒",
  dArr: "⇓",
  hArr: "⇔",
  forall: "∀",
  part: "∂",
  exist: "∃",
  empty: "∅",
  nabla: "∇",
  isin: "∈",
  notin: "∉",
  ni: "∋",
  prod: "∏",
  sum: "∑",
  minus: "−",
  lowast: "∗",
  radic: "√",
  prop: "∝",
  infin: "∞",
  ang: "∠",
  and: "∧",
  or: "∨",
  cap: "∩",
  cup: "∪",
  int: "∫",
  there4: "∴",
  sim: "∼",
  cong: "≅",
  asymp: "≈",
  ne: "≠",
  equiv: "≡",
  le: "≤",
  ge: "≥",
  sub: "⊂",
  sup: "⊃",
  nsub: "⊄",
  sube: "⊆",
  supe: "⊇",
  oplus: "⊕",
  otimes: "⊗",
  perp: "⊥",
  sdot: "⋅",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  lang: "〈",
  rang: "〉",
  loz: "◊",
  spades: "♠",
  clubs: "♣",
  hearts: "♥",
  diams: "♦"
};
function sanitize(raw) {
  const decoded = decodeEntities(raw);
  const stripped = stripDangerousConstructs(decoded);
  const doc = parseHTML(stripped);
  walkAndFilter(doc, ALLOWED_TAGS, BLOCKED_TAGS, ALLOWED_ATTRS, URL_ATTRS, SAFE_PROTOCOLS);
  return serialize(doc);
}
function decodeEntities(html) {
  let result = html;
  result = result.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    const cp = parseInt(hex, 16);
    return cp > 0 ? String.fromCodePoint(cp) : `�`;
  });
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    const cp = parseInt(dec, 10);
    return cp > 0 ? String.fromCodePoint(cp) : `�`;
  });
  result = result.replace(/&([A-Za-z]+);/g, (full, name) => {
    return NAMED_ENTITIES[name] ?? full;
  });
  return result;
}
function stripDangerousConstructs(html) {
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, "");
  out = out.replace(/<script[^>]*>/gi, "");
  out = out.replace(/<svg[\s\S]*?<\/svg\s*>/gi, "");
  out = out.replace(/<svg[^>]*>/gi, "");
  out = out.replace(/<math[\s\S]*?<\/math\s*>/gi, "");
  out = out.replace(/<math[^>]*>/gi, "");
  out = out.replace(/<noscript[\s\S]*?<\/noscript\s*>/gi, "");
  out = out.replace(/<noscript[^>]*>/gi, "");
  out = out.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  return out;
}
function parseHTML(html) {
  const root = { type: "root", children: [] };
  const stack = [root];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*?)?)(\/?)>/g;
  let last = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m.index > last) {
      const text = html.slice(last, m.index);
      if (text) {
        const parent = stack[stack.length - 1];
        (parent.children ??= []).push({ type: "text", content: text });
      }
    }
    const [, closing, tag, attrStr, selfClose] = m;
    const tagLower = tag.toLowerCase();
    if (closing) {
      if (RAW_TEXT_ELEMENTS.has(tagLower)) {
        const rawEnd = html.indexOf(`</${tagLower}>`, m.index + m[0].length);
        if (rawEnd !== -1) {
          const innerContent = html.slice(m.index + m[0].length, rawEnd);
          const parent = stack[stack.length - 1];
          const el = {
            type: "element",
            tag: tagLower,
            attrs: parseAttrs(attrStr),
            children: [{ type: "text", content: innerContent }]
          };
          (parent.children ??= []).push(el);
          tagRe.lastIndex = rawEnd + `</${tagLower}>`.length;
          last = tagRe.lastIndex;
          continue;
        }
      }
      let i = stack.length - 1;
      while (i > 0 && stack[i].tag !== tagLower)
        i--;
      if (i > 0)
        stack.length = i;
    } else {
      const el = {
        type: "element",
        tag: tagLower,
        attrs: parseAttrs(attrStr),
        children: []
      };
      const parent = stack[stack.length - 1];
      (parent.children ??= []).push(el);
      if (!selfClose && !VOID_TAGS.has(tagLower) && !RAW_TEXT_ELEMENTS.has(tagLower)) {
        stack.push(el);
      } else if (RAW_TEXT_ELEMENTS.has(tagLower)) {
        const closingTag = `</${tagLower}>`;
        const rawEnd = html.indexOf(closingTag, m.index + m[0].length);
        if (rawEnd !== -1) {
          const innerContent = html.slice(m.index + m[0].length, rawEnd);
          el.children = [{ type: "text", content: innerContent }];
          tagRe.lastIndex = rawEnd + closingTag.length;
          last = tagRe.lastIndex;
          continue;
        }
      }
    }
    last = m.index + m[0].length;
  }
  if (last < html.length) {
    const text = html.slice(last);
    if (text) {
      const parent = stack[stack.length - 1];
      (parent.children ??= []).push({ type: "text", content: text });
    }
  }
  return root;
}
var VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function parseAttrs(raw) {
  const attrs = {};
  const re = /([a-zA-Z_][\w:.%-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const key = m[1].toLowerCase();
    if (key.startsWith("on"))
      continue;
    attrs[key] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}
function walkAndFilter(node, allowedTags, blockedTags, allowedAttrs, urlAttrs, safeProtocols) {
  if (node.type !== "element" && node.type !== "root")
    return;
  if (!node.children)
    return;
  node.children = node.children.filter((child) => {
    if (child.type === "text") {
      if (node.type === "element" && node.tag === "style") {
        child.content = sanitizeCSS(child.content ?? "");
      }
      return true;
    }
    if (child.type !== "element")
      return false;
    if (!child.tag || blockedTags.has(child.tag))
      return false;
    if (!allowedTags.has(child.tag))
      return false;
    const filteredAttrs = {};
    if (child.attrs) {
      for (const [k, v] of Object.entries(child.attrs)) {
        if (!allowedAttrs.has(k))
          continue;
        if (k === "style") {
          filteredAttrs[k] = sanitizeCSS(v);
          continue;
        }
        if (urlAttrs.has(k) && !isSafeURL(v, safeProtocols))
          continue;
        filteredAttrs[k] = v;
      }
    }
    child.attrs = filteredAttrs;
    walkAndFilter(child, allowedTags, blockedTags, allowedAttrs, urlAttrs, safeProtocols);
    return true;
  });
}
function sanitizeCSS(css) {
  let out = css;
  out = out.replace(/@import\b[^;]*;?/gi, "");
  out = out.replace(/expression\s*\(/gi, "/* removed */(");
  out = out.replace(/behavior\s*:/gi, "/* removed */:");
  out = out.replace(/-moz-binding\s*:/gi, "/* removed */:");
  out = out.replace(/javascript\s*:/gi, "/* removed */:");
  out = out.replace(/vbscript\s*:/gi, "/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*javascript\s*:/gi, "url($1/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*vbscript\s*:/gi, "url($1/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*data\s*:\s*(?!image\/)/gi, "url($1/* removed */:");
  return out;
}
function isSafeURL(url, safeProtocols) {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("#") || trimmed.startsWith("data:image/"))
    return true;
  try {
    const parsed = new URL(url, "https://placeholder");
    return safeProtocols.has(parsed.protocol);
  } catch {
    return false;
  }
}
function serialize(node) {
  if (node.type === "text")
    return node.content ?? "";
  if (node.type === "root" || !node.tag) {
    return (node.children ?? []).map(serialize).join("");
  }
  const attrs = Object.entries(node.attrs ?? {}).map(([k, v]) => ` ${k}="${escAttr(v)}"`).join("");
  if (VOID_TAGS.has(node.tag))
    return `<${node.tag}${attrs}>`;
  const children = (node.children ?? []).map(serialize).join("");
  return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}
function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// src/preview-document.ts
function buildPreviewDocument(safeHtml) {
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

// src/preview-view.ts
function createPreviewView() {
  const element = document.createElement("div");
  element.style.cssText = "flex:1;width:100%;min-width:0;min-height:0;overflow:hidden;";
  function renderMessage(message, isError) {
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
      iframe.style.cssText = "display:block;width:100%;min-width:0;height:100%;border:none;background:transparent;";
      iframe.srcdoc = buildPreviewDocument(sanitize(state.html));
      element.replaceChildren(iframe);
    }
  };
}

// src/frontend.ts
var EXTENSION_ID = "creator_notes_html_renderer";
var RUNTIME_ID_ATTRIBUTE = "data-spindle-extension-root";
var RUNTIME_ID_STORAGE_KEY = `${EXTENSION_ID}:runtimeExtensionId`;
function extensionIdFromRoot(root) {
  try {
    const id = root?.getAttribute?.(RUNTIME_ID_ATTRIBUTE);
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch (_) {
    return null;
  }
}
function getRuntimeExtensionId() {
  try {
    const id = typeof localStorage === "undefined" ? null : localStorage.getItem(RUNTIME_ID_STORAGE_KEY);
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch (_) {
    return null;
  }
}
function rememberRuntimeExtensionId(root) {
  const id = extensionIdFromRoot(root);
  if (id) {
    try {
      if (typeof localStorage !== "undefined")
        localStorage.setItem(RUNTIME_ID_STORAGE_KEY, id);
    } catch (_) {}
  }
  return id;
}
var DESKTOP_WIDGET_RETURNED_EVENT = "spindle:desktop-widget-returned";
function readDesktopWidgetTarget() {
  if (typeof window === "undefined" || typeof window.location === "undefined")
    return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("desktopWidgetExtension");
    if (!targetId)
      return null;
    const knownId = getRuntimeExtensionId();
    if (knownId && targetId !== knownId)
      return null;
    const width = Number(params.get("desktopWidgetWidth"));
    const height = Number(params.get("desktopWidgetHeight"));
    if (!Number.isFinite(width) || !Number.isFinite(height))
      return null;
    return { width, height };
  } catch (_) {
    return null;
  }
}
var BROWSER_SIZE_CLAMPS = {
  minWidth: 220,
  minHeight: 150,
  maxWidth: 1920,
  maxHeight: 1200
};
var DESKTOP_SIZE_CLAMPS = {
  minWidth: 160,
  minHeight: 100,
  maxWidth: 1200,
  maxHeight: 900
};
function clampInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed))
    return fallback;
  return Math.min(max, Math.max(min, parsed));
}
var ICON_EXPAND = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
var ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
function iconButton(svg, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = svg;
  button.style.cssText = "display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:4px;background:transparent;color:inherit;opacity:0.6;cursor:pointer;";
  return button;
}
function configureSizeInput(input, label, value, min, max) {
  input.type = "number";
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.title = `${label} in pixels (${min}–${max})`;
  input.setAttribute("aria-label", label);
  input.style.cssText = "width:60px;padding:2px 6px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:4px;background:transparent;color:inherit;";
}
function setup(ctx) {
  const desktopWidget = readDesktopWidgetTarget();
  const isWidgetWindow = desktopWidget !== null;
  const sizeClamps = isWidgetWindow ? DESKTOP_SIZE_CLAMPS : BROWSER_SIZE_CLAMPS;
  let disposed = false;
  let requestVersion = 0;
  let observedCharacterId;
  let latestState = null;
  const listeners = new Set;
  function subscribe(listener) {
    listeners.add(listener);
    if (latestState)
      listener(latestState);
    return () => listeners.delete(listener);
  }
  function broadcast(state) {
    latestState = state;
    for (const listener of listeners)
      listener(state);
  }
  async function loadCreatorNotes() {
    if (disposed)
      return;
    const version = ++requestVersion;
    const { characterId } = ctx.getActiveChat();
    observedCharacterId = characterId;
    if (!characterId) {
      broadcast({
        kind: "placeholder",
        message: "Open a character in the editor to see a live HTML preview of their creator notes."
      });
      return;
    }
    try {
      const card = await ctx.characters.get(characterId);
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId)
        return;
      const creatorNotes = card?.creator_notes ?? "";
      if (!creatorNotes) {
        broadcast({ kind: "placeholder", message: "Creator notes are empty." });
      } else {
        broadcast({ kind: "html", html: creatorNotes });
      }
    } catch (err) {
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId)
        return;
      broadcast({ kind: "error", message: `Failed to read creator notes: ${err}` });
    }
  }
  const teardownSteps = [];
  let drawerView = null;
  let unsubDrawerView = null;
  let unsubActivate = null;
  let runtimeExtensionId = getRuntimeExtensionId();
  if (!isWidgetWindow) {
    const tab = ctx.ui.registerDrawerTab({
      id: "html_preview",
      title: "HTML Preview",
      shortName: "Preview",
      description: "Renders HTML and CSS from the creator notes field as a live preview.",
      keywords: ["html", "css", "preview", "creator notes", "render", "float", "widget"],
      headerTitle: "HTML Preview",
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    });
    const root = tab.root;
    root.style.cssText = "display:flex;flex-direction:column;width:100%;min-width:0;min-height:0;height:100%;";
    const toolbar = document.createElement("div");
    toolbar.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 8px;flex:0 0 auto;border-bottom:1px solid rgba(128,128,128,0.25);";
    const toolbarLabel = document.createElement("span");
    toolbarLabel.textContent = "Creator Notes";
    toolbarLabel.style.cssText = "font-size:12px;opacity:0.6;";
    toolbar.appendChild(toolbarLabel);
    const toolbarSpacer = document.createElement("span");
    toolbarSpacer.style.flex = "1";
    toolbar.appendChild(toolbarSpacer);
    const floatButton = document.createElement("button");
    floatButton.type = "button";
    floatButton.textContent = "Float preview";
    floatButton.title = "Show this preview as a floating widget";
    floatButton.style.cssText = "padding:3px 10px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:6px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";
    floatButton.addEventListener("click", () => openFloatWidget());
    toolbar.appendChild(floatButton);
    root.appendChild(toolbar);
    drawerView = createPreviewView();
    root.appendChild(drawerView.element);
    unsubDrawerView = subscribe(drawerView.render);
    unsubActivate = tab.onActivate(() => loadCreatorNotes());
    runtimeExtensionId = rememberRuntimeExtensionId(tab.root) ?? runtimeExtensionId;
    teardownSteps.push(() => {
      try {
        tab.destroy();
      } catch (_) {}
    });
  }
  loadCreatorNotes();
  const unsubChatSwitched = ctx.events.on("CHAT_SWITCHED", () => loadCreatorNotes());
  const unsubCharEdited = ctx.events.on("CHARACTER_EDITED", () => loadCreatorNotes());
  const selectionTimer = setInterval(() => {
    if (!disposed && ctx.getActiveChat().characterId !== observedCharacterId) {
      loadCreatorNotes();
    }
  }, 500);
  let floatHandle = null;
  let floatView = null;
  let unsubFloatView = null;
  let unsubDesktopReturned = null;
  let floatSize = desktopWidget ?? { width: 420, height: 560 };
  function mountFloatContent(handle) {
    const wroot = handle.root;
    wroot.style.cssText = "display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;font-family:inherit;color:inherit;";
    wroot.replaceChildren();
    if (!isWidgetWindow) {
      const header = document.createElement("div");
      header.style.cssText = "display:flex;align-items:center;gap:6px;padding:6px 8px;flex:0 0 auto;border-bottom:1px solid rgba(128,128,128,0.25);";
      const title = document.createElement("span");
      title.textContent = "HTML Preview";
      title.style.cssText = "font-size:12px;font-weight:600;opacity:0.7;";
      header.appendChild(title);
      const spacer = document.createElement("span");
      spacer.style.flex = "1";
      header.appendChild(spacer);
      const fullscreenButton = iconButton(ICON_EXPAND, "Toggle fullscreen");
      fullscreenButton.addEventListener("click", () => {
        try {
          handle.setFullscreen(!handle.isFullscreen());
        } catch (_) {}
      });
      header.appendChild(fullscreenButton);
      const closeButton = iconButton(ICON_CLOSE, "Close preview widget");
      closeButton.addEventListener("click", () => closeFloatWidget());
      header.appendChild(closeButton);
      wroot.appendChild(header);
    }
    floatView = createPreviewView();
    wroot.appendChild(floatView.element);
    if (latestState)
      floatView.render(latestState);
    const sizeStrip = document.createElement("div");
    sizeStrip.style.cssText = "display:flex;align-items:center;gap:6px;padding:6px 8px;flex:0 0 auto;border-top:1px solid rgba(128,128,128,0.25);font-size:12px;";
    const wLabel = document.createElement("span");
    wLabel.textContent = "W";
    wLabel.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(wLabel);
    const widthInput = document.createElement("input");
    configureSizeInput(widthInput, "Widget width", floatSize.width, sizeClamps.minWidth, sizeClamps.maxWidth);
    sizeStrip.appendChild(widthInput);
    const separator = document.createElement("span");
    separator.textContent = "×";
    separator.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(separator);
    const hLabel = document.createElement("span");
    hLabel.textContent = "H";
    hLabel.style.cssText = "opacity:0.5;";
    sizeStrip.appendChild(hLabel);
    const heightInput = document.createElement("input");
    configureSizeInput(heightInput, "Widget height", floatSize.height, sizeClamps.minHeight, sizeClamps.maxHeight);
    sizeStrip.appendChild(heightInput);
    const applyButton = document.createElement("button");
    applyButton.type = "button";
    applyButton.textContent = "Apply";
    applyButton.title = "Resize the widget";
    applyButton.style.cssText = "padding:2px 10px;font-size:12px;font-family:inherit;border:1px solid rgba(128,128,128,0.35);border-radius:4px;background:transparent;color:inherit;opacity:0.7;cursor:pointer;";
    sizeStrip.appendChild(applyButton);
    function applySize() {
      const width = clampInt(widthInput.value, floatSize.width, sizeClamps.minWidth, sizeClamps.maxWidth);
      const height = clampInt(heightInput.value, floatSize.height, sizeClamps.minHeight, sizeClamps.maxHeight);
      widthInput.value = String(width);
      heightInput.value = String(height);
      floatSize = { width, height };
      try {
        handle.setSize(width, height);
      } catch (_) {}
    }
    applyButton.addEventListener("click", applySize);
    for (const input of [widthInput, heightInput]) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter")
          applySize();
      });
    }
    wroot.appendChild(sizeStrip);
  }
  function listenForDesktopReturn(handle) {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function")
      return null;
    const handler = (event) => {
      const detail = event.detail;
      if (!detail || detail.widgetId !== handle.widgetId)
        return;
      if (typeof detail.extensionId === "string" && runtimeExtensionId && detail.extensionId !== runtimeExtensionId)
        return;
      if (floatHandle !== handle)
        return;
      mountFloatContent(handle);
      loadCreatorNotes();
    };
    window.addEventListener(DESKTOP_WIDGET_RETURNED_EVENT, handler);
    return () => window.removeEventListener(DESKTOP_WIDGET_RETURNED_EVENT, handler);
  }
  function closeFloatWidget() {
    unsubFloatView?.();
    unsubFloatView = null;
    unsubDesktopReturned?.();
    unsubDesktopReturned = null;
    floatView = null;
    if (floatHandle) {
      try {
        floatHandle.destroy();
      } catch (_) {}
      floatHandle = null;
    }
  }
  function openFloatWidget() {
    if (disposed)
      return;
    if (floatHandle) {
      try {
        floatHandle.setVisible(true);
        return;
      } catch (_) {
        floatHandle = null;
        floatView = null;
      }
    }
    let handle;
    try {
      handle = ctx.ui.createFloatWidget({
        width: floatSize.width,
        height: floatSize.height,
        snapToEdge: true,
        tooltip: "Creator notes HTML preview"
      });
    } catch (err) {
      console.warn(`[${EXTENSION_ID}] failed to create float widget:`, err);
      return;
    }
    floatHandle = handle;
    unsubFloatView = subscribe((state) => floatView?.render(state));
    mountFloatContent(handle);
    runtimeExtensionId = rememberRuntimeExtensionId(handle.root) ?? runtimeExtensionId;
    unsubDesktopReturned = listenForDesktopReturn(handle);
  }
  if (isWidgetWindow) {
    openFloatWidget();
  }
  return () => {
    disposed = true;
    ++requestVersion;
    clearInterval(selectionTimer);
    closeFloatWidget();
    try {
      unsubDrawerView?.();
    } catch (_) {}
    try {
      unsubActivate?.();
    } catch (_) {}
    try {
      unsubChatSwitched();
    } catch (_) {}
    try {
      unsubCharEdited();
    } catch (_) {}
    for (const step of teardownSteps) {
      try {
        step();
      } catch (_) {}
    }
  };
}
export {
  setup
};
