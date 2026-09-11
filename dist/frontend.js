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

// src/frontend.ts
function setup(ctx) {
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
  function renderContent(html) {
    const safe = sanitize(html);
    const doc = buildPreviewDocument(safe);
    iframeContainer.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "");
    iframe.title = "Creator notes HTML preview";
    iframe.style.cssText = "display:block;width:100%;min-width:0;height:100%;border:none;background:transparent;";
    iframe.srcdoc = doc;
    iframeContainer.appendChild(iframe);
  }
  function showError(msg) {
    showPlaceholder(msg);
    iframeContainer.firstChild.style.color = "#f87171";
  }
  function showPlaceholder(msg) {
    const message = document.createElement("p");
    message.style.cssText = "opacity:0.5;padding:12px;";
    message.textContent = msg;
    iframeContainer.replaceChildren(message);
  }
  let disposed = false;
  let requestVersion = 0;
  let observedCharacterId;
  async function loadCreatorNotes() {
    if (disposed)
      return;
    const version = ++requestVersion;
    const { characterId } = ctx.getActiveChat();
    observedCharacterId = characterId;
    if (!characterId) {
      showPlaceholder("Open a character in the editor to see a live HTML preview of their creator notes.");
      return;
    }
    try {
      const card = await ctx.characters.get(characterId);
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId)
        return;
      const creatorNotes = card?.creator_notes ?? "";
      if (!creatorNotes) {
        showPlaceholder("Creator notes are empty.");
      } else {
        renderContent(creatorNotes);
      }
    } catch (err) {
      if (disposed || version !== requestVersion || ctx.getActiveChat().characterId !== characterId)
        return;
      showError(`Failed to read creator notes: ${err}`);
    }
  }
  loadCreatorNotes();
  const unsubActivate = tab.onActivate(() => loadCreatorNotes());
  const unsubChatSwitched = ctx.events.on("CHAT_SWITCHED", () => loadCreatorNotes());
  const unsubCharEdited = ctx.events.on("CHARACTER_EDITED", () => loadCreatorNotes());
  const selectionTimer = setInterval(() => {
    if (!disposed && ctx.getActiveChat().characterId !== observedCharacterId) {
      loadCreatorNotes();
    }
  }, 500);
  return () => {
    disposed = true;
    ++requestVersion;
    clearInterval(selectionTimer);
    try {
      unsubActivate();
    } catch (_) {}
    try {
      unsubChatSwitched();
    } catch (_) {}
    try {
      unsubCharEdited();
    } catch (_) {}
    try {
      tab.destroy();
    } catch (_) {}
  };
}
export {
  setup
};
