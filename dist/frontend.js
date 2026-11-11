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

// node_modules/marked/lib/marked.esm.js
function B() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var y = B();
function V(a) {
  y = a;
}
var M = { exec: () => null };
function D(a) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), i = e[n];
    return i || (i = a(n), e[n] = i), i;
  };
}
function h(a, e = "") {
  let t = typeof a == "string" ? a : a.source, n = { replace: (i, r) => {
    let o = typeof r == "string" ? r : r.source;
    return o = o.replace(x.caret, "$1"), t = t.replace(i, o), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var ze = ((a = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + a);
  } catch {
    return false;
  }
})();
var x = { codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, endingSpaceTabChar: /[ \t]$/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, leadingSpaceTab: /^[ \t]+/, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/, numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (a) => new RegExp(`^( {0,3}${a})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: D((a) => new RegExp(`^ {0,${a}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: D((a) => new RegExp(`^ {0,${a}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)), fencesBeginRegex: D((a) => new RegExp(`^ {0,${a}}(?:\`\`\`|~~~)`)), headingBeginRegex: D((a) => new RegExp(`^ {0,${a}}#`)), htmlBeginRegex: D((a) => new RegExp(`^ {0,${a}}(?:</?(?:${Q})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")), blockquoteBeginRegex: D((a) => new RegExp(`^ {0,${a}}>`)) };
var Ee = /^(?:[ \t]*(?:\n|$))+/;
var Me = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var Ce = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var N = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var Ie = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var Y = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var fe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var me = h(fe).replace(/bull/g, Y).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var Be = h(fe).replace(/bull/g, Y).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var ee = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
var De = /^[^\n]+/;
var te = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var qe = h(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", te).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var Ze = h(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, Y).getRegex();
var Q = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var ne = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var ve = h("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))", "i").replace("comment", ne).replace("tag", Q).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var xe = (a) => h(ee).replace("hr", N).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", a).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", Q).getRegex();
var He = xe(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
var Ge = xe(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
var Ne = h(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ge).getRegex();
var re = { blockquote: Ne, code: Me, def: qe, fences: Ce, heading: Ie, hr: N, html: ve, lheading: me, list: Ze, newline: Ee, paragraph: He, table: M, text: De };
var de = h("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", N).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", Q).getRegex();
var Qe = { ...re, lheading: Be, table: de, paragraph: h(ee).replace("hr", N).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", de).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", Q).getRegex() };
var je = { ...re, html: h(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", ne).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: M, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: h(ee).replace("hr", N).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", me).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Fe = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ue = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var be = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
var Ke = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var S = /[\p{P}\p{S}]/u;
var q = /[\s\p{P}\p{S}]/u;
var j = /[^\s\p{P}\p{S}]/u;
var Xe = h(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, q).getRegex();
var We = /[\p{Pi}\p{Ps}"']/u;
var Re = /(?!~)[\p{P}\p{S}]/u;
var Ve = /(?!~)[\s\p{P}\p{S}]/u;
var Je = /(?:[^\s\p{P}\p{S}]|~)/u;
var Ye = h(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", ze ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var Te = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
var et = h(Te, "u").replace(/punct/g, S).getRegex();
var tt = h(Te, "u").replace(/punct/g, Re).getRegex();
var nt = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/;
var rt = h(nt, "u").replace(/openQuote/g, We).replace(/punct/g, S).getRegex();
var Oe = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var st = h(Oe, "gu").replace(/notPunctSpace/g, j).replace(/punctSpace/g, q).replace(/punct/g, S).getRegex();
var it = h(Oe, "gu").replace(/notPunctSpace/g, Je).replace(/punctSpace/g, Ve).replace(/punct/g, Re).getRegex();
var ot = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)";
var at = h(ot, "gu").replace(/notPunctSpace/g, j).replace(/punctSpace/g, q).replace(/punct/g, S).getRegex();
var lt = h("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, j).replace(/punctSpace/g, q).replace(/punct/g, S).getRegex();
var ut = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)";
var pt = h(ut, "gu").replace(/notPunctSpace/g, j).replace(/punctSpace/g, q).replace(/punct/g, S).getRegex();
var ct = h(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, S).getRegex();
var ht = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var dt = h(ht, "gu").replace(/notPunctSpace/g, j).replace(/punctSpace/g, q).replace(/punct/g, S).getRegex();
var kt = h(/\\(punct)/, "gu").replace(/punct/g, S).getRegex();
var gt = h(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, S).getRegex();
var ft = h(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var mt = h(ne).replace("(?:-->|$)", "-->").getRegex();
var xt = h("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", mt).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var we = /\[(?:\\[\s\S]|[^\[\]\\])*\]/;
var K = h(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", we).getRegex();
var bt = h(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", K).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var Rt = h(/^!?\[(label)\]\[(ref)\]/).replace("label", K).replace("ref", te).getRegex();
var Tt = h(/^!?\[(ref)\](?:\[\])?/).replace("ref", te).getRegex();
var ke = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/;
var Ot = h(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", we).getRegex();
var wt = h("reflink|nolink(?!\\()", "g").replace("reflink", h(/^!?\[(label)\]\[(ref)\]/).replace("label", Ot).replace("ref", ke).getRegex()).replace("nolink", h(/^!?\[(ref)\](?:\[\])?/).replace("ref", ke).getRegex()).getRegex();
var ge = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var Pt = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/;
var yt = h(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, Pt).getRegex();
var se = { _backpedal: M, anyPunctuation: kt, anyPunctuationOutsideCode: gt, autolink: ft, blockSkip: Ye, br: be, code: Ue, del: M, delLDelim: M, delRDelim: M, emStrongLDelim: et, emStrongRDelimAst: st, emStrongRDelimUnd: lt, escape: Fe, link: bt, nolink: Tt, punctuation: Xe, reflink: Rt, reflinkSearch: wt, tag: xt, text: Ke, url: M };
var St = { ...se, emStrongLDelim: rt, emStrongRDelimAst: at, emStrongRDelimUnd: pt, link: h(/^!?\[(label)\]\((.*?)\)/).replace("label", K).getRegex(), reflink: h(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", K).getRegex() };
var J = { ...se, emStrongRDelimAst: it, emStrongLDelim: tt, delLDelim: ct, delRDelim: dt, url: h(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", yt).replace("protocol", ge).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: h(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", ge).replace(/emailProtocol/g, /(?:mailto|xmpp):/).getRegex() };
var _t = { ...J, br: h(be).replace("{2,}", "*").getRegex(), text: h(J.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var F = { normal: re, gfm: Qe, pedantic: je };
var Z = { normal: se, gfm: J, breaks: _t, pedantic: St };
var $t = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var Pe = (a) => $t[a];
function w(a, e) {
  if (e) {
    if (x.escapeTest.test(a))
      return a.replace(x.escapeReplace, Pe);
  } else if (x.escapeTestNoEncode.test(a))
    return a.replace(x.escapeReplaceNoEncode, Pe);
  return a;
}
function ye(a) {
  return x.numericCharacterReference.test(a) ? a.replace(x.numericCharacterReferenceOrAmpersand, (e, t, n) => {
    if (t === undefined && n === undefined)
      return "&amp;";
    let i = t === undefined ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
    return i === 0 || i > 1114111 || i >= 55296 && i <= 57343 ? "�" : i === 38 ? "&amp;" : String.fromCodePoint(i);
  }) : a;
}
function ie(a) {
  try {
    a = encodeURI(a).replace(x.percentDecode, "%");
  } catch {
    return null;
  }
  return a;
}
function oe(a, e) {
  let t = a.replace(x.findPipe, (r, o, s) => {
    let l = false, u = o;
    for (;--u >= 0 && s[u] === "\\"; )
      l = !l;
    return l ? "|" : " |";
  }), n = t.split(x.splitPipe), i = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
    if (n.length > e)
      n.splice(e);
    else
      for (;n.length < e; )
        n.push("");
  for (;i < n.length; i++)
    n[i] = n[i].trim().replace(x.slashPipe, "|");
  return n;
}
function A(a, e, t) {
  let n = a.length;
  if (n === 0)
    return "";
  let i = 0;
  for (;i < n; ) {
    let r = a.charAt(n - i - 1);
    if (r === e && !t)
      i++;
    else if (r !== e && t)
      i++;
    else
      break;
  }
  return a.slice(0, n - i);
}
function ae(a) {
  let e = a.split(`
`), t = e.length - 1;
  for (;t >= 0 && x.blankLine.test(e[t]); )
    t--;
  return e.length - t <= 2 ? a : e.slice(0, t + 1).join(`
`);
}
function v(a) {
  return a.trim().toLowerCase().toUpperCase().toLowerCase();
}
function le(a, e) {
  if (a.indexOf(e[0]) === -1 && a.indexOf(e[1]) === -1)
    return -1;
  let t = 0;
  for (let n = 0;n < a.length; n++)
    if (a[n] === "\\")
      n++;
    else if (a[n] === e[0])
      t++;
    else if (a[n] === e[1] && (t--, t < 0))
      return n;
  return t > 0 ? -2 : -1;
}
function X(a, e = 0) {
  let t = e, n = "";
  for (let i of a)
    if (i === "\t") {
      let r = 4 - t % 4;
      n += " ".repeat(r), t += r;
    } else
      n += i, t++;
  return n;
}
function Se(a, e, t, n, i) {
  let r = e.href, o = e.title || null, s = a[1].replace(i.other.outputLinkReplace, "$1"), l = a[0].charAt(0) === "!", u = n.state.inLink, c = n.state.linkEmitted, p = n.state.inRawBlock;
  n.state.inLink = true, n.state.linkEmitted = false;
  let d = n.inlineTokens(s), g = n.state.linkEmitted;
  if (n.state.linkEmitted = c, n.state.inLink = u, !l) {
    if (g) {
      n.state.inRawBlock = p;
      return;
    }
    n.state.linkEmitted = true;
  }
  return { type: l ? "image" : "link", raw: t, href: r, title: o, text: s, tokens: d };
}
function Lt(a, e, t) {
  let n = a.match(t.other.indentCodeCompensation);
  if (n === null)
    return e;
  let i = n[1];
  return e.split(`
`).map((r) => {
    let o = r.match(t.other.beginningSpace);
    if (o === null)
      return r;
    let [s] = o;
    return r.slice(Math.min(s.length, i.length));
  }).join(`
`);
}
function _e(a, e, t, n) {
  if (!e.includes("<"))
    return false;
  for (let i = 0;i < e.length; i++) {
    if (e[i] === "\\") {
      i++;
      continue;
    }
    if (e[i] === "`") {
      let s = n.inline.code.exec(e.slice(i));
      if (s) {
        i += s[0].length - 1;
        continue;
      }
    }
    if (e[i] !== "<")
      continue;
    let r = a.slice(t + i), o = n.inline.tag.exec(r) || n.inline.autolink.exec(r);
    if (o) {
      if (o[0].length > e.length - i)
        return true;
      i += o[0].length - 1;
    }
  }
  return false;
}
var _ = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || y;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : ae(t[0]), i = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: i };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], i = Lt(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: i };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let i = A(n, "#");
        (this.options.pedantic || !i || this.rules.other.endingSpaceTabChar.test(i)) && (n = i.trim());
      }
      return { type: "heading", raw: A(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t)
      return { type: "hr", raw: A(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = A(t[0], `
`).split(`
`), i = "", r = "", o = [];
      for (;n.length > 0; ) {
        let s = false, l = [], u;
        for (u = 0;u < n.length; u++)
          if (this.rules.other.blockquoteStart.test(n[u]))
            l.push(n[u]), s = true;
          else if (!s)
            l.push(n[u]);
          else
            break;
        n = n.slice(u);
        let c = l.join(`
`), p = c.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        i = i ? `${i}
${c}` : c, r = r ? `${r}
${p}` : p;
        let d = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(p, o, true), this.lexer.state.top = d, n.length === 0)
          break;
        let g = o.at(-1);
        if (g?.type === "code" || g?.type === "heading" || g?.type === "hr" || g?.type === "html")
          break;
        if (g?.type === "blockquote") {
          let k = g, P = n.join(`
`), R = k.raw + `
` + P.replace(this.rules.other.blockquoteSetextReplace2, ""), m = this.blockquote(R);
          o[o.length - 1] = m;
          let E = R.substring(m.raw.length).replace(/^\n/, ""), b = E ? E.split(`
`).length : 0, H = b ? n.slice(0, -b) : n;
          H.length > 0 && (i = `${i}
${H.join(`
`)}`), r = r.substring(0, r.length - k.text.length) + m.text;
          break;
        } else if (g?.type === "list") {
          let k = g, P = k.raw + `
` + n.join(`
`), R = this.list(P);
          o[o.length - 1] = R, i = i.substring(0, i.length - g.raw.length) + R.raw, r = r.substring(0, r.length - k.raw.length) + R.raw, n = P.substring(o.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: i, tokens: o, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = e, i = () => n.length - e.length, r = t[1].trim(), o = r.length > 1, s = { type: "list", raw: "", ordered: o, start: o ? +r.slice(0, -1) : "", loose: false, items: [] };
      r = o ? `\\d{1,9}\\${r.slice(-1)}` : `\\${r}`, this.options.pedantic && (r = o ? r : "[*+-]");
      let l = this.rules.other.listItemRegex(r), u = false;
      for (;e; ) {
        let p = false, d = "";
        if (!(t = l.exec(e)) || this.rules.block.hr.test(e))
          break;
        let g = i();
        e = e.substring(t[0].length);
        let k = t[2].split(`
`, 1)[0], P = t[1].length, R = this.options.pedantic ? X(k, P) : k.replace(this.rules.other.leadingSpaceTab, (W) => X(W, P)), m = e.split(`
`, 1)[0], E = !R.trim(), b = 0;
        if (this.options.pedantic ? (b = 2, d = R.trimStart()) : E ? b = P + 1 : (b = R.search(this.rules.other.nonSpaceChar), b = b > 4 ? 1 : b, d = R.slice(b), b += P), E && this.rules.other.blankLine.test(m) && (e = e.substring(m.length + 1), p = true), !p) {
          let W = this.rules.other.nextBulletRegex(b), ue = this.rules.other.hrRegex(b), pe = this.rules.other.fencesBeginRegex(b), ce = this.rules.other.headingBeginRegex(b), $e = this.rules.other.htmlBeginRegex(b), Le = this.rules.other.blockquoteBeginRegex(b);
          for (;e; ) {
            let he = e.split(`
`, 1)[0], G;
            if (m = he, this.options.pedantic ? (m = m.replace(this.rules.other.listReplaceNesting, "  "), G = m) : G = m.replace(this.rules.other.leadingSpaceTab, (Ae) => X(Ae)), pe.test(m) || ce.test(m) || $e.test(m) || Le.test(m) || W.test(m) || ue.test(m))
              break;
            if (G.search(this.rules.other.nonSpaceChar) >= b || !m.trim())
              d += `
` + G.slice(b);
            else {
              if (E || R.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || pe.test(R) || ce.test(R) || ue.test(R))
                break;
              d += `
` + m;
            }
            E = !m.trim(), e = e.substring(he.length + 1), R = G.slice(b);
          }
        }
        let H = n.slice(g, i());
        s.loose || (u ? s.loose = true : this.rules.other.doubleBlankLine.test(H) && (u = true)), s.items.push({ type: "list_item", raw: H, task: !!this.options.gfm && this.rules.other.listIsTask.test(d), loose: false, text: d, tokens: [] });
      }
      let c = s.items.at(-1);
      if (c)
        c.raw = c.raw.trimEnd(), c.text = c.text.trimEnd();
      else
        return;
      s.raw = n.slice(0, i()).trimEnd();
      for (let p of s.items)
        if (this.lexer.state.top = false, p.tokens = this.lexer.blockTokens(p.text, []), !s.loose) {
          let d = p.tokens.filter((k) => k.type === "space"), g = d.length > 0 && d.some((k) => this.rules.other.anyLine.test(k.raw));
          s.loose = g;
        }
      for (let p of s.items) {
        let d = p.tokens[0];
        if (p.task && (d?.type === "text" || d?.type === "paragraph")) {
          p.text = p.text.replace(this.rules.other.listReplaceTask, ""), d.raw = d.raw.replace(this.rules.other.listReplaceTask, ""), d.text = d.text.replace(this.rules.other.listReplaceTask, "");
          for (let k = this.lexer.inlineQueue.length - 1;k >= 0; k--)
            if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[k].src)) {
              this.lexer.inlineQueue[k].src = this.lexer.inlineQueue[k].src.replace(this.rules.other.listReplaceTask, "");
              break;
            }
          let g = this.rules.other.listTaskCheckbox.exec(p.raw);
          if (g) {
            let k = { type: "checkbox", raw: g[0] + " ", checked: g[0] !== "[ ]" };
            p.checked = k.checked, s.loose ? p.tokens[0] && ["paragraph", "text"].includes(p.tokens[0].type) && "tokens" in p.tokens[0] && p.tokens[0].tokens ? (p.tokens[0].raw = k.raw + p.tokens[0].raw, p.tokens[0].text = k.raw + p.tokens[0].text, p.tokens[0].tokens.unshift(k)) : p.tokens.unshift({ type: "paragraph", raw: k.raw, text: k.raw, tokens: [k] }) : p.tokens.unshift(k);
          }
        } else
          p.task && (p.task = false);
      }
      if (s.loose)
        for (let p of s.items) {
          p.loose = true;
          for (let d of p.tokens)
            d.type === "text" && (d.type = "paragraph");
        }
      return s;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = ae(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      if (!this.rules.other.startAngleBracket.test(t[2]) && le(t[2], "()") !== -1)
        return;
      let n = v(t[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: A(t[0], `
`), href: i, title: r };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    let n = oe(t[1]), i = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], o = { type: "table", raw: A(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === i.length) {
      for (let s of i)
        this.rules.other.tableAlignRight.test(s) ? o.align.push("right") : this.rules.other.tableAlignCenter.test(s) ? o.align.push("center") : this.rules.other.tableAlignLeft.test(s) ? o.align.push("left") : o.align.push(null);
      for (let s = 0;s < n.length; s++)
        o.header.push({ text: n[s], tokens: this.lexer.inline(n[s]), header: true, align: o.align[s] });
      for (let s of r)
        o.rows.push(oe(s, o.header.length).map((l, u) => ({ text: l, tokens: this.lexer.inline(l), header: false, align: o.align[u] })));
      return o;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: A(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t)
      return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t)
      return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    if (this.lexer.state.linkParenPossible === false)
      return;
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[0].charAt(0) === "!" ? 2 : 1;
      if (!this.options.pedantic && _e(e, t[1], n, this.rules))
        return;
      let i = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(i)) {
        if (!this.rules.other.endAngleBracket.test(i))
          return;
        let s = A(i.slice(0, -1), "\\");
        if ((i.length - s.length) % 2 === 0)
          return;
      } else {
        let s = le(t[2], "()");
        if (s === -2)
          return;
        if (s > -1) {
          let u = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
          t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, u).trim(), t[3] = "";
        }
      }
      let r = t[2], o = "";
      if (this.options.pedantic) {
        let s = this.rules.other.pedanticHrefTitle.exec(r);
        s && (r = s[1], o = s[3]);
      } else
        o = t[3] ? t[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(i) ? r = r.slice(1) : r = r.slice(1, -1)), Se(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: o && o.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let i = n[0].charAt(0) === "!" ? 2 : 1;
      if (!this.options.pedantic && _e(e, n[1], i, this.rules))
        return;
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), o = t[v(r)];
      if (!o) {
        let s = n[0].charAt(0);
        return { type: "text", raw: s, text: s };
      }
      return Se(n, o, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let i = this.rules.inline.emStrongLDelim.exec(e);
    if (!i || !i[1] && !i[2] && !i[3] && !i[4] || i[4] && n.match(this.rules.other.unicodeAlphaNumeric))
      return;
    if (!(i[1] || i[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let o = [...i[0]].length - 1, s, l, u = o, c = 0, p = i[0][0], d = n === p, g = p === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (g.lastIndex = 0, t = t.slice(-1 * e.length + o);(i = g.exec(t)) !== null; ) {
        if (s = i[1] || i[2] || i[3] || i[4] || i[5] || i[6], !s)
          continue;
        if (l = [...s].length, i[3] || i[4]) {
          u += l;
          continue;
        } else if (i[5] || i[6]) {
          if (o % 3 && !((o + l) % 3)) {
            c += l;
            continue;
          }
          if (d)
            break;
        }
        if (u -= l, u > 0)
          continue;
        l = Math.min(l, l + u + c);
        let k = [...i[0]][0].length, P = e.slice(0, o + i.index + k + l);
        if (Math.min(o, l) % 2) {
          let m = P.slice(1, -1);
          return { type: "em", raw: P, text: m, tokens: this.lexer.inlineTokens(m) };
        }
        let R = P.slice(2, -2);
        return { type: "strong", raw: P, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), i = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return i && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t)
      return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let i = this.rules.inline.delLDelim.exec(e);
    if (!i)
      return;
    if (!(i[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let o = [...i[0]].length - 1, s, l, u = o, c = this.rules.inline.delRDelim;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + o);(i = c.exec(t)) !== null; ) {
        if (s = i[1] || i[2] || i[3] || i[4] || i[5] || i[6], !s || (l = [...s].length, l !== o))
          continue;
        if (i[3] || i[4]) {
          u += l;
          continue;
        }
        if (u -= l, u > 0)
          continue;
        l = Math.min(l, l + u);
        let p = [...i[0]][0].length, d = e.slice(0, o + i.index + p + l), g = d.slice(o, -o);
        return { type: "del", raw: d, text: g, tokens: this.lexer.inlineTokens(g) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, i;
      return t[2] === "@" ? (n = t[1], i = "mailto:" + n) : (n = t[1], i = n), { type: "link", raw: t[0], text: n, href: i, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, i;
      if (t[2] === "@")
        n = t[0], i = "mailto:" + n;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        n = t[0], t[1] === "www." ? i = "http://" + t[0] : i = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: i, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: n ? t[0] : ye(t[0]), escaped: n };
    }
  }
};
var T = class a {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = Object.create(null), this.options = e || y, this.options.tokenizer = this.options.tokenizer || new _, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, linkEmitted: false, linkParenPossible: true, top: true };
    let t = { other: x, block: F.normal, inline: Z.normal };
    this.options.pedantic ? (t.block = F.pedantic, t.inline = Z.pedantic) : this.options.gfm && (t.block = F.gfm, this.options.breaks ? t.inline = Z.breaks : t.inline = Z.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: F, inline: Z };
  }
  static lex(e, t) {
    return new a(t).lex(e);
  }
  static lexInline(e, t) {
    return new a(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(x.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0;t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(x.tabCharGlobal, "    ").replace(x.spaceLine, ""));
    let i = 1 / 0;
    for (;e; ) {
      if (e.length < i)
        i = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r;
      if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false))
        continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        r.raw.length === 1 && s !== undefined ? s.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let o = e;
      if (this.options.extensions?.startBlock) {
        let s = 1 / 0, l = e.slice(1), u;
        this.options.extensions.startBlock.forEach((c) => {
          u = c.call({ lexer: this }, l), typeof u == "number" && u >= 0 && (s = Math.min(s, u));
        }), s < 1 / 0 && s >= 0 && (o = e.substring(0, s + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(o))) {
        let s = t.at(-1);
        n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = o.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  linkInText(e) {
    if (!e.includes("["))
      return false;
    let t = this.tokenizer.rules.inline.link;
    for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))
      if (t.test(n[0]) && e.charAt(n.index - 1) !== "!")
        return true;
    for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
      let i = n[0], r = i.lastIndexOf("[");
      if (!(i.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, v(i.slice(r + 1, -1)))) && !(r > 1 && this.linkInText(i.slice(1, r - 1))))
        return true;
    }
    return false;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = this.state.linkParenPossible;
    this.state.linkParenPossible = n && e.includes(")");
    try {
      return this.#e(e, t);
    } finally {
      this.state.linkParenPossible = n;
    }
  }
  #e(e, t) {
    let n = e;
    if (this.tokens.links && e.includes("[")) {
      let s = this.tokenizer.rules.inline.reflinkSearch, l = (u) => {
        let c = u.lastIndexOf("[");
        if (!Object.hasOwn(this.tokens.links, v(u.slice(c + 1, -1))))
          return u;
        if (c > 1 && u.charAt(0) !== "!") {
          let p = u.slice(1, c - 1);
          if (this.linkInText(p))
            return "[" + p.replace(s, l) + "][" + "a".repeat(u.length - c - 2) + "]";
        }
        return "[" + "a".repeat(u.length - 2) + "]";
      };
      n = n.replace(s, l);
    }
    n = n.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (s, l, u) => u ? "+".repeat(s.length) : l ? l + s.slice(l.length, -l.length).replace(/`/g, "+") + l : s), n = n.replace(this.tokenizer.rules.inline.blockSkip, (s, l, u) => {
      let c = u ? u.length : 0;
      return s.slice(0, c) + "[" + "a".repeat(s.length - c - 2) + "]";
    }), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let i = false, r = "", o = 1 / 0;
    for (;e; ) {
      if (e.length < o)
        o = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      i || (r = ""), i = false;
      let s;
      if (this.options.extensions?.inline?.some((u) => (s = u.call({ lexer: this }, e, t)) ? (e = e.substring(s.raw.length), t.push(s), true) : false))
        continue;
      if (s = this.tokenizer.escape(e)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.tag(e)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.link(e)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(s.raw.length);
        let u = t.at(-1);
        s.type === "text" && u?.type === "text" ? (u.raw += s.raw, u.text += s.text) : t.push(s);
        continue;
      }
      if (s = this.tokenizer.emStrong(e, n, r)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.codespan(e)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.br(e)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.del(e, n, r)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (s = this.tokenizer.autolink(e)) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      if (!this.state.inLink && (s = this.tokenizer.url(e))) {
        e = e.substring(s.raw.length), t.push(s);
        continue;
      }
      let l = e;
      if (this.options.extensions?.startInline) {
        let u = 1 / 0, c = e.slice(1), p;
        this.options.extensions.startInline.forEach((d) => {
          p = d.call({ lexer: this }, c), typeof p == "number" && p >= 0 && (u = Math.min(u, p));
        }), u < 1 / 0 && u >= 0 && (l = e.substring(0, u + 1));
      }
      if (s = this.tokenizer.inlineText(l)) {
        e = e.substring(s.raw.length), s.raw.slice(-1) !== "_" && (r = s.raw.slice(-1)), i = true;
        let u = t.at(-1);
        u?.type === "text" ? (u.raw += s.raw, u.text += s.text) : t.push(s);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent)
      console.error(t);
    else
      throw new Error(t);
  }
};
var $ = class {
  options;
  parser;
  constructor(e) {
    this.options = e || y;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let i = (t || "").match(x.notSpaceStart)?.[0], r = e ? e.replace(x.endingNewline, "") + `
` : "";
    return i ? '<pre><code class="language-' + w(i) + '">' + (n ? r : w(r, true)) + `</code></pre>
` : "<pre><code>" + (n ? r : w(r, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let { ordered: t, start: n } = e, i = "";
    for (let s = 0;s < e.items.length; s++) {
      let l = e.items[s];
      i += this.listitem(l);
    }
    let r = t ? "ol" : "ul", o = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + o + `>
` + i + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0;r < e.header.length; r++)
      n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let i = "";
    for (let r = 0;r < e.rows.length; r++) {
      let o = e.rows[r];
      n = "";
      for (let s = 0;s < o.length; s++)
        n += this.tablecell(o[s]);
      i += this.tablerow({ text: n });
    }
    return i && (i = `<tbody>${i}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + i + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${w(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, text: n, tokens: i, autolink: r }) {
    let o = r ? w(n, true) : this.parser.parseInline(i), s = ie(e);
    if (s === null)
      return o;
    e = w(s, r);
    let l = '<a href="' + e + '"';
    return t && (l += ' title="' + w(t) + '"'), l += ">" + o + "</a>", l;
  }
  image({ href: e, title: t, text: n, tokens: i }) {
    i && (n = this.parser.parseInline(i, this.parser.textRenderer));
    let r = ie(e);
    if (r === null)
      return w(n);
    e = r;
    let o = `<img src="${w(e)}" alt="${w(n)}"`;
    return t && (o += ` title="${w(t)}"`), o += ">", o;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : ("escaped" in e) && e.escaped ? e.text : w(e.text);
  }
};
var z = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var O = class a {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || y, this.options.renderer = this.options.renderer || new $, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new z;
  }
  static parse(e, t) {
    return new a(t).parse(e);
  }
  static parseInline(e, t) {
    return new a(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0;n < e.length; n++) {
      let i = e[n];
      if (this.options.extensions?.renderers?.[i.type]) {
        let o = i, s = this.options.extensions.renderers[o.type].call({ parser: this }, o);
        if (s !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(o.type)) {
          t += s || "";
          continue;
        }
      }
      let r = i;
      switch (r.type) {
        case "space": {
          t += this.renderer.space(r);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r);
          break;
        }
        case "code": {
          t += this.renderer.code(r);
          break;
        }
        case "table": {
          t += this.renderer.table(r);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r);
          break;
        }
        case "list": {
          t += this.renderer.list(r);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r);
          break;
        }
        case "html": {
          t += this.renderer.html(r);
          break;
        }
        case "def": {
          t += this.renderer.def(r);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r);
          break;
        }
        case "text": {
          t += this.renderer.text(r);
          break;
        }
        default: {
          let o = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent)
            return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let i = 0;i < e.length; i++) {
      let r = e[i];
      if (this.options.extensions?.renderers?.[r.type]) {
        let s = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (s !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          n += s || "";
          continue;
        }
      }
      let o = r;
      switch (o.type) {
        case "escape": {
          n += t.text(o);
          break;
        }
        case "html": {
          n += t.html(o);
          break;
        }
        case "link": {
          n += t.link(o);
          break;
        }
        case "image": {
          n += t.image(o);
          break;
        }
        case "checkbox": {
          n += t.checkbox(o);
          break;
        }
        case "strong": {
          n += t.strong(o);
          break;
        }
        case "em": {
          n += t.em(o);
          break;
        }
        case "codespan": {
          n += t.codespan(o);
          break;
        }
        case "br": {
          n += t.br(o);
          break;
        }
        case "del": {
          n += t.del(o);
          break;
        }
        case "text": {
          n += t.text(o);
          break;
        }
        default: {
          let s = 'Token with "' + o.type + '" type was not found.';
          if (this.options.silent)
            return console.error(s), "";
          throw new Error(s);
        }
      }
    }
    return n;
  }
};
var L = class {
  options;
  block;
  constructor(e) {
    this.options = e || y;
  }
  static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer(e = this.block) {
    return e ? T.lex : T.lexInline;
  }
  provideParser(e = this.block) {
    return e ? O.parse : O.parseInline;
  }
};
function C(a, e) {
  if (Array.isArray(e))
    for (let t = 0;t < e.length; t++)
      a.push(e[t]);
  else
    a.push(e);
}
var U = class {
  defaults = B();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = O;
  Renderer = $;
  TextRenderer = z;
  Lexer = T;
  Tokenizer = _;
  Hooks = L;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let i of e)
      switch (C(n, t.call(this, i)), i.type) {
        case "table": {
          let r = i;
          for (let o of r.header)
            C(n, this.walkTokens(o.tokens, t));
          for (let o of r.rows)
            for (let s of o)
              C(n, this.walkTokens(s.tokens, t));
          break;
        }
        case "list": {
          let r = i;
          C(n, this.walkTokens(r.items, t));
          break;
        }
        default: {
          let r = i;
          this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((o) => {
            let s = r[o].flat(1 / 0);
            C(n, this.walkTokens(s, t));
          }) : r.tokens && C(n, this.walkTokens(r.tokens, t));
        }
      }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let i = { ...n };
      if (i.async = this.defaults.async || i.async || false, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name)
          throw new Error("extension name required");
        if ("renderer" in r) {
          let o = t.renderers[r.name];
          o ? t.renderers[r.name] = function(...s) {
            let l = r.renderer.apply(this, s);
            return l === false && (l = o.apply(this, s)), l;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          let o = t[r.level];
          o ? o.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), i.extensions = t), n.renderer) {
        let r = this.defaults.renderer || new $(this.defaults);
        for (let o in n.renderer) {
          if (!(o in r))
            throw new Error(`renderer '${o}' does not exist`);
          if (["options", "parser"].includes(o))
            continue;
          let s = o, l = n.renderer[s], u = r[s];
          r[s] = (...c) => {
            let p = l.apply(r, c);
            return p === false && (p = u.apply(r, c)), p || "";
          };
        }
        i.renderer = r;
      }
      if (n.tokenizer) {
        let r = this.defaults.tokenizer || new _(this.defaults);
        for (let o in n.tokenizer) {
          if (!(o in r))
            throw new Error(`tokenizer '${o}' does not exist`);
          if (["options", "rules", "lexer"].includes(o))
            continue;
          let s = o, l = n.tokenizer[s], u = r[s];
          r[s] = (...c) => {
            let p = l.apply(r, c);
            return p === false && (p = u.apply(r, c)), p;
          };
        }
        i.tokenizer = r;
      }
      if (n.hooks) {
        let r = this.defaults.hooks || new L;
        for (let o in n.hooks) {
          if (!(o in r))
            throw new Error(`hook '${o}' does not exist`);
          if (["options", "block"].includes(o))
            continue;
          let s = o, l = n.hooks[s], u = r[s];
          L.passThroughHooks.has(o) ? r[s] = (c) => {
            if (this.defaults.async && L.passThroughHooksRespectAsync.has(o))
              return (async () => {
                let d = await l.call(r, c);
                return u.call(r, d);
              })();
            let p = l.call(r, c);
            return u.call(r, p);
          } : r[s] = (...c) => {
            if (this.defaults.async)
              return (async () => {
                let d = await l.apply(r, c);
                return d === false && (d = await u.apply(r, c)), d;
              })();
            let p = l.apply(r, c);
            return p === false && (p = u.apply(r, c)), p;
          };
        }
        i.hooks = r;
      }
      if (n.walkTokens) {
        let r = this.defaults.walkTokens, o = n.walkTokens;
        i.walkTokens = function(s) {
          let l = [];
          return l.push(o.call(this, s)), r && C(l, r.call(this, s)), l;
        };
      }
      this.defaults = { ...this.defaults, ...i };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return T.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return O.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, i) => {
      let r = { ...i }, o = { ...this.defaults, ...r }, s = this.onError(!!o.silent, !!o.async);
      if (this.defaults.async === true && r.async === false)
        return s(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return s(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return s(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (o.hooks && (o.hooks.options = o, o.hooks.block = e), o.async)
        return (async () => {
          let l = o.hooks ? await o.hooks.preprocess(n) : n, c = await (o.hooks ? await o.hooks.provideLexer(e) : e ? T.lex : T.lexInline)(l, o), p = o.hooks ? await o.hooks.processAllTokens(c) : c;
          o.walkTokens && await Promise.all(this.walkTokens(p, o.walkTokens));
          let g = await (o.hooks ? await o.hooks.provideParser(e) : e ? O.parse : O.parseInline)(p, o);
          return o.hooks ? await o.hooks.postprocess(g) : g;
        })().catch(s);
      try {
        o.hooks && (n = o.hooks.preprocess(n));
        let u = (o.hooks ? o.hooks.provideLexer(e) : e ? T.lex : T.lexInline)(n, o);
        o.hooks && (u = o.hooks.processAllTokens(u)), o.walkTokens && this.walkTokens(u, o.walkTokens);
        let p = (o.hooks ? o.hooks.provideParser(e) : e ? O.parse : O.parseInline)(u, o);
        return o.hooks && (p = o.hooks.postprocess(p)), p;
      } catch (l) {
        return s(l);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let i = "<p>An error occurred:</p><pre>" + w(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(i) : i;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
};
var I = new U;
function f(a, e) {
  return I.parse(a, e);
}
f.options = f.setOptions = function(a) {
  return I.setOptions(a), f.defaults = I.defaults, V(f.defaults), f;
};
f.getDefaults = B;
f.defaults = y;
function At(...a) {
  return I.use(...a), f.defaults = I.defaults, V(f.defaults), f;
}
f.use = At;
f.walkTokens = function(a, e) {
  return I.walkTokens(a, e);
};
f.parseInline = I.parseInline;
f.Parser = O;
f.parser = O.parse;
f.Renderer = $;
f.TextRenderer = z;
f.Lexer = T;
f.lexer = T.lex;
f.Tokenizer = _;
f.Hooks = L;
f.parse = f;
var Rn = f.options;
var Tn = f.setOptions;
var On = f.walkTokens;
var wn = f.parseInline;
var yn = O.parse;
var Sn = T.lex;

// node_modules/dompurify/dist/purify.es.mjs
/*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE */
function _OverloadYield(e, d) {
  this.v = e, this.k = d;
}
function _arrayLikeToArray(r, a) {
  (a == null || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a);e < a; e++)
    n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r))
    return r;
}
function _iterableToArrayLimit(r, l) {
  var t = r == null ? null : typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, l === 0) {
        if (Object(t) !== t)
          return;
        f = false;
      } else
        for (;!(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true)
          ;
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if (typeof r == "string")
      return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return t === "Object" && r.constructor && (t = r.constructor.name), t === "Map" || t === "Set" ? Array.from(r) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : undefined;
  }
}
function AsyncGenerator(e) {
  var t, n;
  function resume(t, n) {
    try {
      var r = e[t](n), o = r.value, u = o instanceof _OverloadYield;
      Promise.resolve(u ? o.v : o).then(function(n) {
        if (u) {
          var i = t === "return" && o.k ? t : "next";
          if (!o.k || n.done)
            return resume(i, n);
          n = e[i](n).value;
        }
        settle(!!r.done, n);
      }, function(e) {
        resume("throw", e);
      });
    } catch (e) {
      settle(2, e);
    }
  }
  function settle(e, r) {
    e === 2 ? t.reject(r) : t.resolve({
      value: r,
      done: e
    }), (t = t.next) ? resume(t.key, t.arg) : n = null;
  }
  this._invoke = function(e, r) {
    return new Promise(function(o, u) {
      var i = {
        key: e,
        arg: r,
        resolve: o,
        reject: u,
        next: null
      };
      n ? n = n.next = i : (t = n = i, resume(e, r));
    });
  }, typeof e.return != "function" && (this.return = undefined);
}
AsyncGenerator.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, AsyncGenerator.prototype.next = function(e) {
  return this._invoke("next", e);
}, AsyncGenerator.prototype.throw = function(e) {
  return this._invoke("throw", e);
}, AsyncGenerator.prototype.return = function(e) {
  return this._invoke("return", e);
};
var entries = Object.entries;
var setPrototypeOf = Object.setPrototypeOf;
var isFrozen = Object.isFrozen;
var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var freeze = Object.freeze;
var seal = Object.seal;
var create = Object.create;
var _ref = typeof Reflect !== "undefined" && Reflect;
var apply = _ref.apply;
var construct = _ref.construct;
if (!freeze)
  freeze = function freeze(x) {
    return x;
  };
if (!seal)
  seal = function seal(x) {
    return x;
  };
if (!apply)
  apply = function apply(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2;_key < _len; _key++)
      args[_key - 2] = arguments[_key];
    return func.apply(thisArg, args);
  };
if (!construct)
  construct = function construct(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;_key2 < _len2; _key2++)
      args[_key2 - 1] = arguments[_key2];
    return new Func(...args);
  };
var arrayForEach = unapply(Array.prototype.forEach);
Array.prototype.indexOf;
var arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
var arrayPop = unapply(Array.prototype.pop);
var arrayPush = unapply(Array.prototype.push);
var arraySlice = unapply(Array.prototype.slice);
var arraySplice = unapply(Array.prototype.splice);
var arrayIsArray = Array.isArray;
var setCreate = unconstruct(Set);
var setAdd = unapply(Set.prototype.add);
var setHas = unapply(Set.prototype.has);
var stringToLowerCase = unapply(String.prototype.toLowerCase);
var stringToString = unapply(String.prototype.toString);
var stringMatch = unapply(String.prototype.match);
var stringReplace = unapply(String.prototype.replace);
var stringIndexOf = unapply(String.prototype.indexOf);
var stringTrim = unapply(String.prototype.trim);
var numberToString = unapply(Number.prototype.toString);
var booleanToString = unapply(Boolean.prototype.toString);
var bigintToString = typeof BigInt === "undefined" ? null : unapply(BigInt.prototype.toString);
var symbolToString = typeof Symbol === "undefined" ? null : unapply(Symbol.prototype.toString);
var objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
var objectToString = unapply(Object.prototype.toString);
var regExpTest = unapply(RegExp.prototype.test);
var typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
  return function(thisArg) {
    if (thisArg instanceof RegExp)
      thisArg.lastIndex = 0;
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1;_key3 < _len3; _key3++)
      args[_key3 - 1] = arguments[_key3];
    return apply(func, thisArg, args);
  };
}
function unconstruct(Func) {
  return function() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0;_key4 < _len4; _key4++)
      args[_key4] = arguments[_key4];
    return construct(Func, args);
  };
}
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf)
    setPrototypeOf(set, null);
  if (!arrayIsArray(array))
    return set;
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === "string") {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        if (!isFrozen(array))
          array[l] = lcElement;
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
function cleanArray(array) {
  for (let index = 0;index < array.length; index++)
    if (!objectHasOwnProperty(array, index))
      array[index] = null;
  return array;
}
function clone(object) {
  const newObject = create(null);
  for (const _ref2 of entries(object)) {
    var _ref3 = _slicedToArray(_ref2, 2);
    const property = _ref3[0];
    const value = _ref3[1];
    if (objectHasOwnProperty(object, property)) {
      if (arrayIsArray(value))
        newObject[property] = cleanArray(value);
      else if (value && typeof value === "object" && value.constructor === Object)
        newObject[property] = clone(value);
      else
        newObject[property] = value;
    }
  }
  return newObject;
}
function stringifyValue(value) {
  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return numberToString(value);
    case "boolean":
      return booleanToString(value);
    case "bigint":
      return bigintToString ? bigintToString(value) : "0";
    case "symbol":
      return symbolToString ? symbolToString(value) : "Symbol()";
    case "undefined":
      return objectToString(value);
    case "function":
    case "object": {
      if (value === null)
        return objectToString(value);
      const valueAsRecord = value;
      const valueToString = lookupGetter(valueAsRecord, "toString");
      if (typeof valueToString === "function") {
        const stringified = valueToString(valueAsRecord);
        return typeof stringified === "string" ? stringified : objectToString(stringified);
      }
      return objectToString(value);
    }
    default:
      return objectToString(value);
  }
}
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get)
        return unapply(desc.get);
      if (typeof desc.value === "function")
        return unapply(desc.value);
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}
function lookupAccessor(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc)
      return desc.get ? unapply(desc.get) : null;
    object = getPrototypeOf(object);
  }
  return null;
}
function isRegex(value) {
  try {
    regExpTest(value, "");
    return true;
  } catch (_unused) {
    return false;
  }
}
var html$1 = freeze([
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "nobr",
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
  "search",
  "section",
  "select",
  "shadow",
  "slot",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]);
var svg$1 = freeze([
  "svg",
  "a",
  "altglyph",
  "altglyphdef",
  "altglyphitem",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "enterkeyhint",
  "exportparts",
  "filter",
  "font",
  "g",
  "glyph",
  "glyphref",
  "hkern",
  "image",
  "inputmode",
  "line",
  "lineargradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "part",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "style",
  "switch",
  "symbol",
  "text",
  "textpath",
  "title",
  "tref",
  "tspan",
  "view",
  "vkern"
]);
var svgFilters = freeze([
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence"
]);
var svgDisallowed = freeze([
  "animate",
  "color-profile",
  "cursor",
  "discard",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignobject",
  "hatch",
  "hatchpath",
  "mesh",
  "meshgradient",
  "meshpatch",
  "meshrow",
  "missing-glyph",
  "script",
  "set",
  "solidcolor",
  "unknown",
  "use"
]);
var mathMl$1 = freeze([
  "math",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mi",
  "mlabeledtr",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "mprescripts"
]);
var mathMlDisallowed = freeze([
  "maction",
  "maligngroup",
  "malignmark",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "mstack",
  "msline",
  "msrow",
  "semantics",
  "annotation",
  "annotation-xml",
  "mprescripts",
  "none"
]);
var text = freeze(["#text"]);
var html = freeze([
  "accept",
  "action",
  "align",
  "alt",
  "autocapitalize",
  "autocomplete",
  "autopictureinpicture",
  "autoplay",
  "background",
  "bgcolor",
  "border",
  "capture",
  "cellpadding",
  "cellspacing",
  "checked",
  "cite",
  "class",
  "clear",
  "color",
  "cols",
  "colspan",
  "command",
  "commandfor",
  "controls",
  "controlslist",
  "coords",
  "crossorigin",
  "datetime",
  "decoding",
  "default",
  "dir",
  "disabled",
  "disablepictureinpicture",
  "disableremoteplayback",
  "download",
  "draggable",
  "enctype",
  "enterkeyhint",
  "exportparts",
  "face",
  "for",
  "headers",
  "height",
  "hidden",
  "high",
  "href",
  "hreflang",
  "id",
  "inert",
  "inputmode",
  "integrity",
  "ismap",
  "kind",
  "label",
  "lang",
  "list",
  "loading",
  "loop",
  "low",
  "max",
  "maxlength",
  "media",
  "method",
  "min",
  "minlength",
  "multiple",
  "muted",
  "name",
  "nonce",
  "noshade",
  "novalidate",
  "nowrap",
  "open",
  "optimum",
  "part",
  "pattern",
  "placeholder",
  "playsinline",
  "popover",
  "popovertarget",
  "popovertargetaction",
  "poster",
  "preload",
  "pubdate",
  "radiogroup",
  "readonly",
  "rel",
  "required",
  "rev",
  "reversed",
  "role",
  "rows",
  "rowspan",
  "spellcheck",
  "scope",
  "selected",
  "shape",
  "size",
  "sizes",
  "slot",
  "span",
  "srclang",
  "start",
  "src",
  "srcset",
  "step",
  "style",
  "summary",
  "tabindex",
  "title",
  "translate",
  "type",
  "usemap",
  "valign",
  "value",
  "width",
  "wrap",
  "xmlns"
]);
var svg = freeze([
  "accent-height",
  "accumulate",
  "additive",
  "alignment-baseline",
  "amplitude",
  "ascent",
  "attributename",
  "attributetype",
  "azimuth",
  "basefrequency",
  "baseline-shift",
  "begin",
  "bias",
  "by",
  "class",
  "clip",
  "clippathunits",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cx",
  "cy",
  "d",
  "dx",
  "dy",
  "diffuseconstant",
  "direction",
  "display",
  "divisor",
  "dominant-baseline",
  "dur",
  "edgemode",
  "elevation",
  "end",
  "exponent",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "filterunits",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "fx",
  "fy",
  "g1",
  "g2",
  "glyph-name",
  "glyphref",
  "gradientunits",
  "gradienttransform",
  "height",
  "href",
  "id",
  "image-rendering",
  "in",
  "in2",
  "intercept",
  "k",
  "k1",
  "k2",
  "k3",
  "k4",
  "kerning",
  "keypoints",
  "keysplines",
  "keytimes",
  "lang",
  "lengthadjust",
  "letter-spacing",
  "kernelmatrix",
  "kernelunitlength",
  "lighting-color",
  "local",
  "marker-end",
  "marker-mid",
  "marker-start",
  "markerheight",
  "markerunits",
  "markerwidth",
  "maskcontentunits",
  "maskunits",
  "max",
  "mask",
  "mask-type",
  "media",
  "method",
  "mode",
  "min",
  "name",
  "numoctaves",
  "offset",
  "operator",
  "opacity",
  "order",
  "orient",
  "orientation",
  "origin",
  "overflow",
  "paint-order",
  "path",
  "pathlength",
  "patterncontentunits",
  "patterntransform",
  "patternunits",
  "pointer-events",
  "points",
  "preservealpha",
  "preserveaspectratio",
  "primitiveunits",
  "r",
  "rx",
  "ry",
  "radius",
  "refx",
  "refy",
  "repeatcount",
  "repeatdur",
  "restart",
  "result",
  "rotate",
  "scale",
  "seed",
  "shape-rendering",
  "slope",
  "specularconstant",
  "specularexponent",
  "spreadmethod",
  "startoffset",
  "stddeviation",
  "stitchtiles",
  "stop-color",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke",
  "stroke-width",
  "style",
  "surfacescale",
  "systemlanguage",
  "tabindex",
  "tablevalues",
  "targetx",
  "targety",
  "transform",
  "transform-origin",
  "text-anchor",
  "text-decoration",
  "text-orientation",
  "text-rendering",
  "textlength",
  "type",
  "u1",
  "u2",
  "unicode",
  "values",
  "vector-effect",
  "viewbox",
  "visibility",
  "version",
  "vert-adv-y",
  "vert-origin-x",
  "vert-origin-y",
  "width",
  "word-spacing",
  "wrap",
  "writing-mode",
  "xchannelselector",
  "ychannelselector",
  "x",
  "x1",
  "x2",
  "xmlns",
  "y",
  "y1",
  "y2",
  "z",
  "zoomandpan"
]);
var mathMl = freeze([
  "accent",
  "accentunder",
  "align",
  "bevelled",
  "close",
  "columnalign",
  "columnlines",
  "columnspacing",
  "columnspan",
  "denomalign",
  "depth",
  "dir",
  "display",
  "displaystyle",
  "encoding",
  "fence",
  "frame",
  "height",
  "href",
  "id",
  "largeop",
  "length",
  "linethickness",
  "lquote",
  "lspace",
  "mathbackground",
  "mathcolor",
  "mathsize",
  "mathvariant",
  "maxsize",
  "minsize",
  "movablelimits",
  "notation",
  "numalign",
  "open",
  "rowalign",
  "rowlines",
  "rowspacing",
  "rowspan",
  "rspace",
  "rquote",
  "scriptlevel",
  "scriptminsize",
  "scriptsizemultiplier",
  "selection",
  "separator",
  "separators",
  "stretchy",
  "subscriptshift",
  "supscriptshift",
  "symmetric",
  "voffset",
  "width",
  "xmlns"
]);
var xml = freeze([
  "xlink:href",
  "xml:id",
  "xlink:title",
  "xml:space",
  "xmlns:xlink"
]);
var MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
var ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
var TMPLIT_EXPR = seal(/\${[\w\W]*/g);
var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
var ARIA_ATTR = seal(/^aria-[\-\w]+$/);
var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
var DOCTYPE_NAME = seal(/^html$/i);
var CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
var COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
var FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
var SELF_CLOSING_TAG = seal(/\/>/i);
var NODE_TYPE = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  entityNode: 6,
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
};
var LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, [
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
]));
var getGlobal = function getGlobal() {
  return typeof window === "undefined" ? null : window;
};
var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function")
    return null;
  let suffix = null;
  const ATTR_NAME = "data-tt-policy-suffix";
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME))
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  const policyName = "dompurify" + (suffix ? "#" + suffix : "");
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    console.warn("TrustedTypes policy " + policyName + " could not be created.");
    return null;
  }
};
var _createHooksMap = function _createHooksMap() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
var _resolveSetOption = function _resolveSetOption(cfg, key, fallback, options) {
  return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
};
var _resolveObjectOption = function _resolveObjectOption(cfg, key, makeFallback) {
  const value = objectHasOwnProperty(cfg, key) ? cfg[key] : undefined;
  return value && typeof value === "object" ? clone(value) : makeFallback();
};
function createDOMPurify() {
  let window2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
  const DOMPurify = (root) => createDOMPurify(root);
  DOMPurify.version = "3.4.17";
  DOMPurify.removed = [];
  if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let document2 = window2.document;
  const originalDocument = document2;
  const currentScript = originalDocument.currentScript;
  window2.DocumentFragment;
  const { HTMLTemplateElement, Node, Element, NodeFilter } = window2;
  window2.NamedNodeMap === undefined && (window2.NamedNodeMap || window2.MozNamedAttrMap);
  window2.HTMLFormElement;
  const { DOMParser, trustedTypes } = window2;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
  const remove = lookupGetter(ElementPrototype, "remove");
  const removeAttributeNode = lookupGetter(ElementPrototype, "removeAttributeNode");
  const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
  const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
  const getParentNode = lookupGetter(ElementPrototype, "parentNode");
  const getShadowRoot = lookupGetter(ElementPrototype, "shadowRoot");
  const getAttributes = lookupGetter(ElementPrototype, "attributes");
  const getNodeType = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeType") : null;
  const getNodeName = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeName") : null;
  const getOwnerDocument = Node && Node.prototype ? lookupGetter(Node.prototype, "ownerDocument") : null;
  const _readNodeType = function _readNodeType(node) {
    return getNodeType ? getNodeType(node) : node.nodeType;
  };
  const _readNodeName = function _readNodeName(node) {
    return getNodeName ? getNodeName(node) : node.nodeName;
  };
  const getNamespaceURI = lookupAccessor(ElementPrototype, "namespaceURI");
  const _readNamespaceURI = function _readNamespaceURI(element) {
    return getNamespaceURI ? getNamespaceURI(element) : element.namespaceURI;
  };
  if (typeof HTMLTemplateElement === "function") {
    const template = document2.createElement("template");
    if (template.content && template.content.ownerDocument)
      document2 = template.content.ownerDocument;
  }
  let trustedTypesPolicy;
  let emptyHTML = "";
  let defaultTrustedTypesPolicy;
  let defaultTrustedTypesPolicyResolved = false;
  let IN_TRUSTED_TYPES_POLICY = 0;
  const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy() {
    if (IN_TRUSTED_TYPES_POLICY > 0)
      throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  };
  const _createTrustedHTML = function _createTrustedHTML(html) {
    _assertNotInTrustedTypesPolicy();
    IN_TRUSTED_TYPES_POLICY++;
    try {
      return trustedTypesPolicy.createHTML(html);
    } finally {
      IN_TRUSTED_TYPES_POLICY--;
    }
  };
  const _createTrustedScriptURL = function _createTrustedScriptURL(scriptUrl) {
    _assertNotInTrustedTypesPolicy();
    IN_TRUSTED_TYPES_POLICY++;
    try {
      return trustedTypesPolicy.createScriptURL(scriptUrl);
    } finally {
      IN_TRUSTED_TYPES_POLICY--;
    }
  };
  const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy() {
    if (!defaultTrustedTypesPolicyResolved) {
      defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      defaultTrustedTypesPolicyResolved = true;
    }
    return defaultTrustedTypesPolicy;
  };
  const _document = document2, { implementation, createNodeIterator, createDocumentFragment, getElementsByTagName } = _document;
  const importNode = originalDocument.importNode;
  let hooks = _createHooksMap();
  DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== undefined;
  const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
  let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [
    ...html$1,
    ...svg$1,
    ...svgFilters,
    ...mathMl$1,
    ...text
  ]);
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [
    ...html,
    ...svg,
    ...mathMl,
    ...xml
  ]);
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  let FORBID_TAGS = null;
  let FORBID_ATTR = null;
  const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
    tagCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    }
  }));
  let ALLOW_ARIA_ATTR = true;
  let ALLOW_DATA_ATTR = true;
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  let SAFE_FOR_TEMPLATES = false;
  let SAFE_FOR_XML = true;
  let WHOLE_DOCUMENT = false;
  let SET_CONFIG = false;
  let SET_CONFIG_ALLOWED_TAGS = null;
  let SET_CONFIG_ALLOWED_ATTR = null;
  let FORCE_BODY = false;
  let RETURN_DOM = false;
  let RETURN_DOM_FRAGMENT = false;
  let RETURN_TRUSTED_TYPE = false;
  let SANITIZE_DOM = true;
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
  let KEEP_CONTENT = true;
  let IN_PLACE = false;
  let IN_PLACE_VISITED = null;
  let USE_PROFILES = {};
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, [
    "audio",
    "video",
    "img",
    "source",
    "image",
    "track"
  ]);
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
    "alt",
    "class",
    "for",
    "id",
    "label",
    "name",
    "pattern",
    "placeholder",
    "role",
    "summary",
    "title",
    "value",
    "style",
    "xmlns"
  ]);
  const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [
    MATHML_NAMESPACE,
    SVG_NAMESPACE,
    HTML_NAMESPACE
  ], stringToString);
  const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext"
  ]);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
  const DEFAULT_HTML_INTEGRATION_POINTS = freeze(["annotation-xml"]);
  let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
    "title",
    "style",
    "font",
    "a",
    "script"
  ]);
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
  const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
  let transformCaseFunc = null;
  let CONFIG = null;
  const formElement = document2.createElement("form");
  const isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  const _parseConfig = function _parseConfig() {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg)
      return;
    if (!cfg || typeof cfg !== "object")
      cfg = {};
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
    ALLOWED_TAGS = _resolveSetOption(cfg, "ALLOWED_TAGS", DEFAULT_ALLOWED_TAGS, { transform: transformCaseFunc });
    ALLOWED_ATTR = _resolveSetOption(cfg, "ALLOWED_ATTR", DEFAULT_ALLOWED_ATTR, { transform: transformCaseFunc });
    ALLOWED_NAMESPACES = _resolveSetOption(cfg, "ALLOWED_NAMESPACES", DEFAULT_ALLOWED_NAMESPACES, { transform: stringToString });
    URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, "ADD_URI_SAFE_ATTR", DEFAULT_URI_SAFE_ATTRIBUTES, {
      transform: transformCaseFunc,
      base: DEFAULT_URI_SAFE_ATTRIBUTES
    });
    DATA_URI_TAGS = _resolveSetOption(cfg, "ADD_DATA_URI_TAGS", DEFAULT_DATA_URI_TAGS, {
      transform: transformCaseFunc,
      base: DEFAULT_DATA_URI_TAGS
    });
    FORBID_CONTENTS = _resolveSetOption(cfg, "FORBID_CONTENTS", DEFAULT_FORBID_CONTENTS, { transform: transformCaseFunc });
    FORBID_TAGS = _resolveSetOption(cfg, "FORBID_TAGS", clone({}), { transform: transformCaseFunc });
    FORBID_ATTR = _resolveSetOption(cfg, "FORBID_ATTR", clone({}), { transform: transformCaseFunc });
    USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === "object" ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
    RETURN_DOM = cfg.RETURN_DOM || false;
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
    FORCE_BODY = cfg.FORCE_BODY || false;
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
    IN_PLACE = cfg.IN_PLACE || false;
    IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI;
    NAMESPACE = typeof cfg.NAMESPACE === "string" ? cfg.NAMESPACE : HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(cfg, "MATHML_TEXT_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS));
    HTML_INTEGRATION_POINTS = _resolveObjectOption(cfg, "HTML_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS));
    const customElementHandling = _resolveObjectOption(cfg, "CUSTOM_ELEMENT_HANDLING", () => create(null));
    CUSTOM_ELEMENT_HANDLING = create(null);
    if (objectHasOwnProperty(customElementHandling, "tagNameCheck") && isRegexOrFunction(customElementHandling.tagNameCheck))
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck;
    if (objectHasOwnProperty(customElementHandling, "attributeNameCheck") && isRegexOrFunction(customElementHandling.attributeNameCheck))
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck;
    if (objectHasOwnProperty(customElementHandling, "allowCustomizedBuiltInElements") && typeof customElementHandling.allowCustomizedBuiltInElements === "boolean")
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements;
    seal(CUSTOM_ELEMENT_HANDLING);
    if (SAFE_FOR_TEMPLATES)
      ALLOW_DATA_ATTR = false;
    if (RETURN_DOM_FRAGMENT)
      RETURN_DOM = true;
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = create(null);
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    EXTRA_ELEMENT_HANDLING.tagCheck = null;
    EXTRA_ELEMENT_HANDLING.attributeCheck = null;
    if (objectHasOwnProperty(cfg, "ADD_TAGS")) {
      if (typeof cfg.ADD_TAGS === "function")
        EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      else if (arrayIsArray(cfg.ADD_TAGS)) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS)
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }
    if (objectHasOwnProperty(cfg, "ADD_ATTR")) {
      if (typeof cfg.ADD_ATTR === "function")
        EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      else if (arrayIsArray(cfg.ADD_ATTR)) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR)
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }
    if (objectHasOwnProperty(cfg, "ADD_FORBID_CONTENTS") && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS)
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
    }
    if (KEEP_CONTENT)
      ALLOWED_TAGS["#text"] = true;
    if (WHOLE_DOCUMENT)
      addToSet(ALLOWED_TAGS, [
        "html",
        "head",
        "body"
      ]);
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ["tbody"]);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function")
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function")
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const previousTrustedTypesPolicy = trustedTypesPolicy;
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      try {
        emptyHTML = _createTrustedHTML("");
      } catch (error) {
        trustedTypesPolicy = previousTrustedTypesPolicy;
        throw error;
      }
    } else if (cfg.TRUSTED_TYPES_POLICY === null) {
      trustedTypesPolicy = undefined;
      emptyHTML = "";
    } else {
      if (trustedTypesPolicy === undefined)
        trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
      if (trustedTypesPolicy && typeof emptyHTML === "string")
        emptyHTML = _createTrustedHTML("");
    }
    if (freeze)
      freeze(cfg);
    CONFIG = cfg;
  };
  const ALL_SVG_TAGS = addToSet({}, [
    ...svg$1,
    ...svgFilters,
    ...svgDisallowed
  ]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  const _checkSvgNamespace = function _checkSvgNamespace(tagName, parent, parentTagName) {
    if (parent.namespaceURI === HTML_NAMESPACE)
      return tagName === "svg";
    if (parent.namespaceURI === MATHML_NAMESPACE)
      return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
    return Boolean(ALL_SVG_TAGS[tagName]);
  };
  const _checkMathMlNamespace = function _checkMathMlNamespace(tagName, parent, parentTagName) {
    if (parent.namespaceURI === HTML_NAMESPACE)
      return tagName === "math";
    if (parent.namespaceURI === SVG_NAMESPACE)
      return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
    return Boolean(ALL_MATHML_TAGS[tagName]);
  };
  const _checkHtmlNamespace = function _checkHtmlNamespace(tagName, parent, parentTagName) {
    if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName])
      return false;
    if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName])
      return false;
    return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
  };
  const _checkValidNamespace = function _checkValidNamespace(element) {
    const elementNamespace = _readNamespaceURI(element);
    const tagName = stringToLowerCase(_readNodeName(element));
    const parentNode = getParentNode(element);
    let parent;
    let parentTagName;
    if (parentNode && _readNodeType(parentNode) === NODE_TYPE.element) {
      parent = { namespaceURI: _readNamespaceURI(parentNode) };
      parentTagName = stringToLowerCase(_readNodeName(parentNode));
    } else {
      parent = { namespaceURI: NAMESPACE };
      parentTagName = "template";
    }
    if (!ALLOWED_NAMESPACES[elementNamespace])
      return false;
    if (elementNamespace === SVG_NAMESPACE)
      return _checkSvgNamespace(tagName, parent, parentTagName);
    if (elementNamespace === MATHML_NAMESPACE)
      return _checkMathMlNamespace(tagName, parent, parentTagName);
    if (elementNamespace === HTML_NAMESPACE)
      return _checkHtmlNamespace(tagName, parent, parentTagName);
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[elementNamespace])
      return true;
    return false;
  };
  const _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, { element: node });
    try {
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
      if (!getParentNode(node))
        throw typeErrorCreate("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  };
  const _stripAttributeNode = function _stripAttributeNode(element, attribute, name) {
    try {
      removeAttributeNode(element, attribute);
    } catch (_) {
      try {
        element.removeAttribute(name);
      } catch (_) {}
    }
  };
  const _neutralizeRoot = function _neutralizeRoot(root) {
    _neutralizeSubtree(root);
    const childNodes = getChildNodes(root);
    if (childNodes)
      arrayForEach(arraySlice(childNodes), (child) => {
        try {
          remove(child);
        } catch (_) {}
      });
    const attributes = _readNodeType(root) === NODE_TYPE.element ? getAttributes(root) : null;
    if (attributes)
      for (let i = attributes.length - 1;i >= 0; --i) {
        const attribute = attributes[i];
        const name = attribute && attribute.name;
        if (typeof name === "string")
          _stripAttributeNode(root, attribute, name);
      }
  };
  const _removeAttribute = function _removeAttribute(name, element, attr) {
    if (!attr)
      try {
        attr = element.getAttributeNode(name);
      } catch (_) {
        attr = null;
      }
    arrayPush(DOMPurify.removed, {
      attribute: attr || null,
      from: element
    });
    try {
      if (attr)
        removeAttributeNode(element, attr);
      else
        element.removeAttribute(name);
    } catch (_) {
      try {
        element.removeAttribute(name);
      } catch (_) {}
    }
    if (name === "is") {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT)
        try {
          _forceRemove(element);
        } catch (_) {}
      else
        try {
          element.setAttribute(name, "");
        } catch (_) {}
    }
  };
  const _stripDisallowedAttributes = function _stripDisallowedAttributes(element) {
    const attributes = getAttributes(element);
    if (!attributes)
      return;
    for (let i = attributes.length - 1;i >= 0; --i) {
      const attribute = attributes[i];
      const name = attribute && attribute.name;
      if (typeof name !== "string" || ALLOWED_ATTR[transformCaseFunc(name)])
        continue;
      _stripAttributeNode(element, attribute, name);
    }
  };
  const _walkTree = function _walkTree(root, visit) {
    let intoShadow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const stack = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (visit(node) === false)
        continue;
      if (intoShadow && _readNodeType(node) === NODE_TYPE.element) {
        const shadowRoot = getShadowRoot(node);
        if (_isDocumentFragment(shadowRoot))
          stack.push(shadowRoot);
      }
      const childNodes = getChildNodes(node);
      if (childNodes)
        for (let i = childNodes.length - 1;i >= 0; --i)
          stack.push(childNodes[i]);
    }
  };
  const _neutralizeSubtree = function _neutralizeSubtree(root) {
    _walkTree(root, (node) => {
      if (_readNodeType(node) === NODE_TYPE.element)
        _stripDisallowedAttributes(node);
    });
  };
  const _collectLiveNodes = function _collectLiveNodes(root) {
    const nodes = [];
    _walkTree(root, (node) => {
      nodes.push(node);
    }, true);
    return nodes;
  };
  const _neutralizeEscapedElements = function _neutralizeEscapedElements(root, before) {
    const reachable = setCreate();
    arrayForEach(_collectLiveNodes(root), (node) => {
      if (_readNodeType(node) === NODE_TYPE.element)
        setAdd(reachable, node);
    });
    arrayForEach(before, (node) => {
      if (_readNodeType(node) === NODE_TYPE.element && !setHas(reachable, node))
        _stripDisallowedAttributes(node);
    });
  };
  const _neutralizeDiscarded = function _neutralizeDiscarded(root, before) {
    let rootRemoved = false;
    arrayForEach(DOMPurify.removed, (entry) => {
      if (entry.element) {
        rootRemoved = rootRemoved || entry.element === root;
        _neutralizeSubtree(entry.element);
      }
    });
    _neutralizeEscapedElements(root, before);
    return rootRemoved;
  };
  const MAX_UNVISITED_ROUNDS = 8;
  const _sanitizeUnvisitedNodes = function _sanitizeUnvisitedNodes(root, before) {
    const visited = IN_PLACE_VISITED;
    let original = null;
    const getOriginal = () => {
      if (!original) {
        original = setCreate();
        arrayForEach(before, (beforeNode) => {
          setAdd(original, beforeNode);
        });
      }
      return original;
    };
    for (let round = 0;; round++) {
      const live = _collectLiveNodes(root);
      const containers = [root];
      let pending = false;
      arrayForEach(live, (node) => {
        if (_readNodeType(node) === NODE_TYPE.documentFragment)
          arrayPush(containers, node);
        else if (!pending && !setHas(visited, node))
          pending = setHas(getOriginal(), node);
      });
      if (!pending)
        return;
      if (round >= MAX_UNVISITED_ROUNDS)
        throw typeErrorCreate("the tree kept changing during in-place sanitization; refusing to return it");
      arrayForEach(containers, (container, index) => {
        _sanitizeUnvisitedIn(container, index > 0, root, getOriginal());
      });
    }
  };
  const _sanitizeUnvisitedIn = function _sanitizeUnvisitedIn(container, inShadow, root, original) {
    const iterator = _createNodeIterator(container);
    let node;
    while (node = iterator.nextNode()) {
      if (!setHas(original, node) || setHas(IN_PLACE_VISITED, node))
        continue;
      if (inShadow)
        _executeHooks(hooks.uponSanitizeShadowNode, node, null);
      _sanitizeElements(node, root);
      _sanitizeAttributes(node, root);
      if (_isDocumentFragment(node.content))
        _sanitizeShadowDOM2(node.content);
    }
  };
  const _markVisited = function _markVisited(node) {
    if (IN_PLACE_VISITED)
      setAdd(IN_PLACE_VISITED, node);
  };
  const _isPatchLinkageAttribute = function _isPatchLinkageAttribute(lcName, lcTag) {
    if (!SAFE_FOR_XML)
      return false;
    if (lcName === "patchsrc")
      return true;
    return lcName === "for" && lcTag !== "label" && lcTag !== "output";
  };
  const _neutralizePatchLinkage = function _neutralizePatchLinkage(root) {
    if (!SAFE_FOR_XML)
      return;
    _walkTree(root, (node) => {
      const nodeType = _readNodeType(node);
      if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node.data)) {
        try {
          remove(node);
        } catch (_) {}
        return false;
      }
      if (nodeType === NODE_TYPE.element) {
        const element = node;
        const lcTag = transformCaseFunc(_readNodeName(node));
        try {
          if (element.hasAttribute && element.hasAttribute("patchsrc"))
            element.removeAttribute("patchsrc");
          if (element.hasAttribute && element.hasAttribute("for") && _isPatchLinkageAttribute("for", lcTag))
            element.removeAttribute("for");
        } catch (_) {}
      }
      return true;
    });
  };
  const _initDocument = function _initDocument(dirty) {
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY)
      dirty = "<remove></remove>" + dirty;
    else {
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
    const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
    if (NAMESPACE === HTML_NAMESPACE)
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, "template", null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {}
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace)
      body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    if (NAMESPACE === HTML_NAMESPACE)
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  const _createNodeIterator = function _createNodeIterator(root) {
    const doc = getOwnerDocument ? getOwnerDocument(root) : root.ownerDocument;
    return createNodeIterator.call(doc || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
  };
  const _stripTemplateExpressions = function _stripTemplateExpressions(value) {
    value = stringReplace(value, MUSTACHE_EXPR$1, " ");
    value = stringReplace(value, ERB_EXPR$1, " ");
    value = stringReplace(value, TMPLIT_EXPR$1, " ");
    return value;
  };
  const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node) {
    var _node$querySelectorAl;
    _scrubOwnCharacterData(node);
    const templates = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === undefined ? undefined : _node$querySelectorAl.call(node, "template");
    if (templates)
      arrayForEach(templates, (tmpl) => {
        if (_isDocumentFragment(tmpl.content))
          _scrubTemplateExpressions2(tmpl.content);
      });
  };
  const _scrubOwnCharacterData = function _scrubOwnCharacterData(node) {
    node.normalize();
    const doc = getOwnerDocument ? getOwnerDocument(node) : node.ownerDocument;
    const walker = createNodeIterator.call(doc || node, node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION | NodeFilter.SHOW_PROCESSING_INSTRUCTION, null);
    let currentNode = walker.nextNode();
    while (currentNode) {
      currentNode.data = _stripTemplateExpressions(currentNode.data);
      currentNode = walker.nextNode();
    }
  };
  const _isClobbered = function _isClobbered(element) {
    const realTagName = getNodeName ? getNodeName(element) : null;
    if (typeof realTagName !== "string")
      return false;
    if (transformCaseFunc(realTagName) !== "form")
      return false;
    return typeof element.nodeName !== "string" || typeof element.textContent !== "string" || typeof element.removeChild !== "function" || element.attributes !== getAttributes(element) || typeof element.removeAttribute !== "function" || typeof element.removeAttributeNode !== "function" || typeof element.getAttributeNode !== "function" || typeof element.setAttribute !== "function" || typeof element.namespaceURI !== "string" || typeof element.insertBefore !== "function" || typeof element.hasChildNodes !== "function" || element.nodeType !== getNodeType(element) || element.childNodes !== getChildNodes(element);
  };
  const _isDocumentFragment = function _isDocumentFragment(value) {
    if (!getNodeType || typeof value !== "object" || value === null)
      return false;
    try {
      return getNodeType(value) === NODE_TYPE.documentFragment;
    } catch (_) {
      return false;
    }
  };
  const _isNode = function _isNode(value) {
    if (!getNodeType || typeof value !== "object" || value === null)
      return false;
    try {
      return typeof getNodeType(value) === "number";
    } catch (_) {
      return false;
    }
  };
  function _executeHooks(hooks, currentNode, data) {
    if (hooks.length === 0)
      return;
    arrayForEach(hooks, (hook) => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  const _isUnsafeNode = function _isUnsafeNode(currentNode, tagName) {
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML))
      return true;
    if (SAFE_FOR_XML && LITERAL_TEXT_ELEMENTS[tagName] && _readNodeType(currentNode) === NODE_TYPE.element && _readNamespaceURI(currentNode) === HTML_NAMESPACE && (_isNode(currentNode.firstElementChild) || typeof currentNode.textContent === "string" && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent)))
      return true;
    if (currentNode.nodeType === NODE_TYPE.processingInstruction)
      return true;
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data))
      return true;
    return false;
  };
  const _matchesNameCheck = function _matchesNameCheck(check, name) {
    if (check instanceof RegExp)
      return regExpTest(check, name);
    if (check instanceof Function) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2;_key < _len; _key++)
        args[_key - 2] = arguments[_key];
      return Boolean(check(name, ...args));
    }
    return false;
  };
  const _sanitizeDisallowedNode = function _sanitizeDisallowedNode(currentNode, tagName, root) {
    if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName))
      return false;
    if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && !FORBID_CONTENTS[stringToLowerCase(tagName)]) {
      const parentNode = getParentNode(currentNode);
      const childNodes = getChildNodes(currentNode);
      if (childNodes && parentNode) {
        const childCount = childNodes.length;
        for (let i = childCount - 1;i >= 0; --i) {
          const hoisted = currentNode === root ? cloneNode(childNodes[i], true) : childNodes[i];
          parentNode.insertBefore(hoisted, getNextSibling(currentNode));
        }
      }
    }
    _forceRemove(currentNode);
    return true;
  };
  const _forkSharedAllowlist = function _forkSharedAllowlist(hookList, set, defaultSet, setConfigSet) {
    if (hookList.length === 0)
      return set;
    return set === defaultSet || set === setConfigSet ? clone(set) : set;
  };
  const _handleHookDetachedNode = function _handleHookDetachedNode(currentNode, root) {
    if (currentNode === root || getParentNode(currentNode) !== null)
      return false;
    if (IN_PLACE)
      _neutralizeSubtree(currentNode);
    return true;
  };
  const _sanitizeElements = function _sanitizeElements(currentNode, root) {
    _markVisited(currentNode);
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    if (_handleHookDetachedNode(currentNode, root))
      return true;
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    const tagName = transformCaseFunc(_readNodeName(currentNode));
    ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    if (_handleHookDetachedNode(currentNode, root))
      return true;
    if (_isUnsafeNode(currentNode, tagName)) {
      _forceRemove(currentNode);
      return true;
    }
    if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
      const removed = _sanitizeDisallowedNode(currentNode, tagName, root);
      if (removed === false) {
        _executeHooks(hooks.afterSanitizeElements, currentNode, null);
        if (_handleHookDetachedNode(currentNode, root))
          return true;
      }
      return removed;
    }
    if (_readNodeType(currentNode) === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      const content = _stripTemplateExpressions(currentNode.textContent);
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return _handleHookDetachedNode(currentNode, root);
  };
  const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    if (FORBID_ATTR[lcName])
      return false;
    if (_isPatchLinkageAttribute(lcName, lcTag))
      return false;
    if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && ((value in document2) || (value in formElement)))
      return false;
    const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
    if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName))
      return true;
    if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName))
      return true;
    if (!nameIsPermitted)
      return _isBasicCustomElement(lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName, lcTag) || lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value);
    if (URI_SAFE_ATTRIBUTES[lcName])
      return true;
    if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, "")))
      return true;
    if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag])
      return true;
    if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, "")))
      return true;
    return !value;
  };
  const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
    "annotation-xml",
    "color-profile",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "missing-glyph"
  ]);
  const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
    return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
  };
  const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value) {
    if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function" && !namespaceURI)
      switch (trustedTypes.getAttributeType(lcTag, lcName)) {
        case "TrustedHTML":
          return _createTrustedHTML(value);
        case "TrustedScriptURL":
          return _createTrustedScriptURL(value);
      }
    return value;
  };
  const _setAttributeValue = function _setAttributeValue(currentNode, name, namespaceURI, value) {
    try {
      if (namespaceURI)
        currentNode.setAttributeNS(namespaceURI, name, value);
      else
        currentNode.setAttribute(name, value);
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return false;
      }
      return true;
    } catch (_) {
      _removeAttribute(name, currentNode);
      return false;
    }
  };
  const _isUnsafeAttributeValue = function _isUnsafeAttributeValue(name, value) {
    if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value))
      return true;
    return stringToLowerCase(name) === "attributename" && stringMatch(value, "href") !== null;
  };
  const _sanitizeAttributes = function _sanitizeAttributes(currentNode, root) {
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    if (_handleHookDetachedNode(currentNode, root))
      return;
    const attributes = currentNode.attributes;
    if (!attributes || _isClobbered(currentNode))
      return;
    ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
    const hookEvent = {
      attrName: "",
      attrValue: "",
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: undefined
    };
    let l = attributes.length;
    const lcTag = transformCaseFunc(currentNode.nodeName);
    while (l--) {
      const attr = attributes[l];
      const { name, namespaceURI, value: attrValue } = attr;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === "value" ? initValue : stringTrim(initValue);
      let recreatedNamedProp = false;
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined;
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name") && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
        _removeAttribute(name, currentNode, attr);
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
        recreatedNamedProp = true;
      }
      if (_isUnsafeAttributeValue(name, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      if (hookEvent.forceKeepAttr)
        continue;
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      if (SAFE_FOR_TEMPLATES)
        value = _stripTemplateExpressions(value);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
      if (value !== initValue) {
        if (_setAttributeValue(currentNode, name, namespaceURI, value) && recreatedNamedProp)
          arrayPop(DOMPurify.removed);
      }
    }
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
    _handleHookDetachedNode(currentNode, root);
  };
  const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      _sanitizeElements(shadowNode, fragment);
      _sanitizeAttributes(shadowNode, fragment);
      if (_isDocumentFragment(shadowNode.content))
        _sanitizeShadowDOM2(shadowNode.content);
      if (_readNodeType(shadowNode) === NODE_TYPE.element) {
        const innerSr = getShadowRoot(shadowNode);
        if (_isDocumentFragment(innerSr)) {
          _sanitizeAttachedShadowRoots(innerSr);
          _sanitizeShadowDOM2(innerSr);
        }
      }
    }
    if (SAFE_FOR_TEMPLATES)
      _scrubOwnCharacterData(fragment);
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots(root) {
    const stack = [{
      node: root,
      shadow: null
    }];
    while (stack.length > 0) {
      const item = stack.pop();
      if (item.shadow) {
        _sanitizeShadowDOM2(item.shadow);
        continue;
      }
      const node = item.node;
      const isElement = _readNodeType(node) === NODE_TYPE.element;
      const childNodes = getChildNodes(node);
      if (childNodes)
        for (let i = childNodes.length - 1;i >= 0; --i)
          stack.push({
            node: childNodes[i],
            shadow: null
          });
      if (isElement) {
        const rootName = getNodeName ? getNodeName(node) : null;
        if (typeof rootName === "string" && transformCaseFunc(rootName) === "template") {
          const content = node.content;
          if (_isDocumentFragment(content))
            stack.push({
              node: content,
              shadow: null
            });
        }
      }
      if (isElement) {
        const sr = getShadowRoot(node);
        if (_isDocumentFragment(sr))
          stack.push({
            node: null,
            shadow: sr
          }, {
            node: sr,
            shadow: null
          });
      }
    }
  };
  DOMPurify.sanitize = function(dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT)
      dirty = "<!-->";
    if (typeof dirty !== "string" && !_isNode(dirty)) {
      dirty = stringifyValue(dirty);
      if (typeof dirty !== "string")
        throw typeErrorCreate("dirty is not a string, aborting");
    }
    if (!DOMPurify.isSupported)
      return dirty;
    if (SET_CONFIG) {
      ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
      ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
    } else
      _parseConfig(cfg);
    if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0)
      ALLOWED_TAGS = clone(ALLOWED_TAGS);
    if (hooks.uponSanitizeAttribute.length > 0)
      ALLOWED_ATTR = clone(ALLOWED_ATTR);
    DOMPurify.removed = [];
    const inPlace = IN_PLACE && typeof dirty !== "string" && _isNode(dirty);
    let inPlaceNodes = [];
    const outerVisited = IN_PLACE_VISITED;
    if (inPlace) {
      _neutralizePatchLinkage(dirty);
      const nn = _readNodeName(dirty);
      if (typeof nn === "string") {
        const tagName = transformCaseFunc(nn);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          _neutralizeRoot(dirty);
          throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
        }
      }
      if (_isClobbered(dirty)) {
        _neutralizeRoot(dirty);
        throw typeErrorCreate("root node is clobbered and cannot be sanitized in-place");
      }
      inPlaceNodes = _collectLiveNodes(dirty);
      IN_PLACE_VISITED = setCreate();
    } else if (_isNode(dirty)) {
      body = _initDocument("<!---->");
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY")
        body = importedNode;
      else if (importedNode.nodeName === "HTML")
        body = importedNode;
      else
        body.appendChild(importedNode);
      _sanitizeAttachedShadowRoots(body);
    } else {
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty.indexOf("<") === -1)
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty) : dirty;
      body = _initDocument(dirty);
      if (!body)
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
    }
    if (body && FORCE_BODY)
      _forceRemove(body.firstChild);
    const walkRoot = inPlace ? dirty : body;
    try {
      if (inPlace)
        _sanitizeAttachedShadowRoots(dirty);
      const nodeIterator = _createNodeIterator(walkRoot);
      while (currentNode = nodeIterator.nextNode()) {
        _sanitizeElements(currentNode, walkRoot);
        _sanitizeAttributes(currentNode, walkRoot);
        if (_isDocumentFragment(currentNode.content))
          _sanitizeShadowDOM2(currentNode.content);
      }
      if (inPlace)
        _sanitizeUnvisitedNodes(dirty, inPlaceNodes);
    } catch (error) {
      if (inPlace) {
        _neutralizeRoot(dirty);
        _neutralizeDiscarded(dirty, inPlaceNodes);
      }
      throw error;
    } finally {
      IN_PLACE_VISITED = outerVisited;
    }
    if (inPlace) {
      if (_neutralizeDiscarded(dirty, inPlaceNodes))
        throw typeErrorCreate("a node selected for removal could not be safely returned; refusing to sanitize in place");
      if (SAFE_FOR_TEMPLATES)
        _scrubTemplateExpressions2(dirty);
      return dirty;
    }
    if (RETURN_DOM) {
      if (SAFE_FOR_TEMPLATES)
        _scrubTemplateExpressions2(body);
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild)
          returnNode.appendChild(body.firstChild);
      } else
        returnNode = body;
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode)
        returnNode = importNode.call(originalDocument, returnNode, true);
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name))
      serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + `>
` + serializedHTML;
    if (SAFE_FOR_TEMPLATES)
      serializedHTML = _stripTemplateExpressions(serializedHTML);
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function() {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
    SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
    SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
  };
  DOMPurify.clearConfig = function() {
    CONFIG = null;
    SET_CONFIG = false;
    SET_CONFIG_ALLOWED_TAGS = null;
    SET_CONFIG_ALLOWED_ATTR = null;
    trustedTypesPolicy = defaultTrustedTypesPolicy;
    emptyHTML = "";
  };
  DOMPurify.isValidAttribute = function(tag, attr, value) {
    if (!CONFIG)
      _parseConfig({});
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    if (typeof value === "string" && (_isUnsafeAttributeValue(attr, value) || !ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)))
      return false;
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function(entryPoint, hookFunction) {
    if (typeof hookFunction !== "function")
      return;
    if (!objectHasOwnProperty(hooks, entryPoint))
      return;
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function(entryPoint, hookFunction) {
    if (!objectHasOwnProperty(hooks, entryPoint))
      return;
    if (hookFunction !== undefined) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? undefined : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function(entryPoint) {
    if (!objectHasOwnProperty(hooks, entryPoint))
      return;
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function() {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify_default = createDOMPurify();

// src/profile-markdown.ts
var markdown = new U({ gfm: true, breaks: true, async: false });
var purifier;
var purifierWindow;
function renderProfileMarkdown(text) {
  if (!purifier || purifierWindow !== window) {
    purifier = purify_default(window);
    purifierWindow = window;
  }
  return purifier.sanitize(markdown.parse(text), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
    FORBID_ATTR: ["style", "class", "id", "name"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false
  });
}

// src/profile-view.ts
function embeddedLorebook(character) {
  const book = character.extensions?.character_book;
  if (!book || typeof book !== "object")
    return null;
  const entries = book.entries;
  const entryCount = Array.isArray(entries) ? entries.length : entries && typeof entries === "object" ? Object.keys(entries).length : 0;
  if (entryCount === 0)
    return null;
  const name = typeof book.name === "string" && book.name.trim() ? book.name.trim() : "Embedded Lorebook";
  return { name, entryCount };
}
var icons = {
  book: '<path d="M12 7v14m0-14C9 5 5 5 2 6v14c3-1 7-1 10 1 3-2 7-2 10-1V6c-3-1-7-1-10 1Z"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h8"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-5 5V5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v10Z"/>'
};
var fields = [
  ["description", "Description", "No description defined", "book"],
  ["personality", "Personality", "No personality defined", "sparkles"],
  ["scenario", "Scenario", "No scenario defined", "file"],
  ["system_prompt", "System Prompt", "No system prompt", "file"],
  ["post_history_instructions", "Post-History Instructions", "No post-history instructions", "file"],
  ["mes_example", "Message Examples", "No message examples", "message"],
  ["first_mes", "First Message", "No first message", "message"]
];
function createProfileView(actions) {
  const element = document.createElement("div");
  element.className = "cnhr-profile";
  const expanded = new Map;
  let characterId = null;
  let renderVersion = 0;
  function section(key, title, icon, open = false) {
    const details = document.createElement("details");
    details.className = "cnhr-section";
    details.open = expanded.get(key) ?? open;
    const id = characterId;
    details.addEventListener("toggle", () => {
      if (characterId === id)
        expanded.set(key, details.open);
    });
    const summary = document.createElement("summary");
    const badge = document.createElement("span");
    badge.className = "cnhr-section-icon";
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</svg>`;
    const label = document.createElement("span");
    label.textContent = title;
    summary.appendChild(badge);
    summary.appendChild(label);
    details.appendChild(summary);
    element.appendChild(details);
    return details;
  }
  function prose(text, placeholder) {
    const body = document.createElement("div");
    body.className = "cnhr-prose";
    if (text.trim()) {
      body.innerHTML = renderProfileMarkdown(text);
      for (const link of body.querySelectorAll("a[href]")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    } else {
      body.className += " cnhr-empty";
      body.textContent = placeholder;
    }
    return body;
  }
  function render(character) {
    const version = ++renderVersion;
    if (characterId !== character.id) {
      expanded.clear();
      characterId = character.id;
      element.scrollTop = 0;
    }
    element.replaceChildren();
    const heading = document.createElement("h2");
    heading.className = "cnhr-character-name";
    heading.textContent = character.name || "Character Profile";
    element.appendChild(heading);
    for (const [key, title, placeholder, icon] of fields) {
      section(key, title, icon).appendChild(prose(character[key] ?? "", placeholder));
    }
    const greetings = character.alternate_greetings ?? [];
    const alternatives = section("alternate_greetings", "Alternate Greetings", "message");
    const greetingList = document.createElement("div");
    greetingList.className = "cnhr-greetings";
    if (!greetings.length)
      greetingList.appendChild(prose("", "No alternate greetings"));
    greetings.forEach((greeting, index) => {
      const item = document.createElement("details");
      item.className = "cnhr-greeting";
      item.open = expanded.get(`greeting-${index}`) ?? false;
      const id = characterId;
      item.addEventListener("toggle", () => {
        if (characterId === id)
          expanded.set(`greeting-${index}`, item.open);
      });
      const summary = document.createElement("summary");
      summary.setAttribute("aria-label", `Greeting ${index + 1} — click to expand or collapse`);
      const label = document.createElement("span");
      label.className = "cnhr-greeting-label";
      label.textContent = `Greeting ${index + 1}`;
      const preview = document.createElement("span");
      preview.className = "cnhr-greeting-preview";
      const body = prose(greeting, "Empty greeting");
      const excerpt = body.cloneNode(true);
      for (const br of excerpt.querySelectorAll("br"))
        br.replaceWith(`
`);
      preview.textContent = excerpt.textContent?.trim() || "Empty greeting";
      const hint = document.createElement("span");
      hint.className = "cnhr-greeting-hint";
      hint.textContent = "Click to expand";
      summary.appendChild(label);
      summary.appendChild(preview);
      summary.appendChild(hint);
      item.appendChild(summary);
      item.appendChild(body);
      greetingList.appendChild(item);
    });
    alternatives.appendChild(greetingList);
    const books = section("world_book_ids", "Attached World Books", "book");
    const bookList = document.createElement("div");
    bookList.className = "cnhr-books";
    books.appendChild(bookList);
    const ids = [...new Set(character.world_book_ids ?? [])];
    const embedded = embeddedLorebook(character);
    if (!ids.length && !embedded) {
      bookList.appendChild(prose("", "No world books attached"));
      return;
    }
    const status = document.createElement("p");
    status.className = "cnhr-book-status";
    status.setAttribute("role", "status");
    if (embedded) {
      const link = document.createElement("button");
      link.type = "button";
      link.className = "cnhr-book-link";
      link.textContent = `${embedded.name} (${embedded.entryCount} entries)`;
      link.title = "Open this character's editor to review or import its embedded lorebook";
      link.addEventListener("click", async () => {
        link.disabled = true;
        status.textContent = "";
        try {
          await actions.openEmbeddedLorebook(character.id);
        } catch (error) {
          if (version === renderVersion)
            status.textContent = `Could not open embedded lorebook: ${error}`;
        } finally {
          link.disabled = false;
        }
      });
      bookList.appendChild(link);
    }
    const links = new Map;
    for (const [index, id] of ids.entries()) {
      const link = document.createElement("button");
      link.type = "button";
      link.className = "cnhr-book-link";
      link.textContent = `World book ${index + 1}`;
      link.title = "Open in Lorebook";
      link.addEventListener("click", async () => {
        link.disabled = true;
        status.textContent = "";
        try {
          await actions.openWorldBook(id);
        } catch (error) {
          if (version === renderVersion)
            status.textContent = `Could not open world book: ${error}`;
        } finally {
          link.disabled = false;
        }
      });
      bookList.appendChild(link);
      links.set(id, link);
    }
    bookList.appendChild(status);
    if (ids.length) {
      actions.listWorldBooks().then((available) => {
        if (version !== renderVersion)
          return;
        for (const book of available) {
          const link = links.get(book.id);
          if (link)
            link.textContent = book.name;
        }
      }).catch(() => {
        if (version === renderVersion)
          status.textContent = "World book names are unavailable. You can still open an attached book.";
      });
    }
  }
  return { element, render, clear() {
    ++renderVersion;
    characterId = null;
    expanded.clear();
    element.replaceChildren();
  } };
}

// src/character-view.ts
var styles = `
.cnhr-view { display:flex;flex-direction:column;flex:1;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;color:var(--lumiverse-text,inherit);font-family:inherit; }
.cnhr-tabs { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:12px 12px 10px;flex-shrink:0;background:color-mix(in srgb,var(--lumiverse-bg-deep,#111114) 96%,var(--lumiverse-primary,#aca2c9) 4%); }
.cnhr-tabs button { appearance:none;min-width:0;border:1px solid var(--lumiverse-primary-015,rgba(172,162,201,.15));border-radius:999px;padding:9px 10px;background:color-mix(in srgb,var(--lumiverse-primary,#aca2c9) 4%,transparent);color:var(--lumiverse-text-dim,#96939e);font-family:inherit;font-size:calc(12px * var(--lumiverse-font-scale,1));font-weight:600;line-height:1.4;cursor:pointer; }
.cnhr-tabs button[aria-selected="true"] { color:var(--lumiverse-primary-text,#d2c8e9);background:color-mix(in srgb,var(--lumiverse-primary,#aca2c9) 18%,transparent);border-color:var(--lumiverse-primary-050,#777087);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--lumiverse-primary,#aca2c9) 28%,transparent); }
.cnhr-tabs button:hover { color:var(--lumiverse-text,#eceaf1);border-color:var(--lumiverse-primary-030,#777087); }
.cnhr-view :is(button,summary):focus-visible { outline:2px solid var(--lumiverse-primary,#aca2c9);outline-offset:3px; }
.cnhr-profile-panel { flex:1;min-height:0;min-width:0;overflow:hidden; }
.cnhr-profile { box-sizing:border-box;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;padding:8px 12px 24px;scrollbar-gutter:stable;font-size:calc(13px * var(--lumiverse-font-scale,1)); }
.cnhr-character-name { font-size:calc(20px * var(--lumiverse-font-scale,1));line-height:1.3;margin:10px 0 18px;font-weight:700;overflow-wrap:anywhere; }
.cnhr-section { margin:0 0 16px; }
.cnhr-section > summary { display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--lumiverse-primary-010,rgba(128,128,128,.16));list-style:none;cursor:pointer;font-weight:600;color:var(--lumiverse-text,#e8e6ed); }
.cnhr-section > summary::-webkit-details-marker,.cnhr-greeting > summary::-webkit-details-marker { display:none; }
.cnhr-section > summary::after { content:'';width:5px;height:5px;margin-left:auto;margin-right:5px;flex-shrink:0;border-right:1.5px solid var(--lumiverse-text-muted,#85818e);border-bottom:1.5px solid var(--lumiverse-text-muted,#85818e);transform:rotate(-45deg); }
.cnhr-section[open] > summary::after { transform:rotate(45deg); }
.cnhr-section-icon { display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:var(--lumiverse-primary-010,rgba(172,162,201,.1));color:var(--lumiverse-primary,#aca2c9);flex-shrink:0; }
.cnhr-prose { padding:12px 0 4px;line-height:1.7;overflow-wrap:anywhere;color:var(--lumiverse-text-muted,#b4b1ba); }
.cnhr-prose > :first-child { margin-top:0; }.cnhr-prose > :last-child { margin-bottom:0; }
.cnhr-prose :is(h1,h2,h3,h4,h5,h6,strong) { color:var(--lumiverse-text,#eceaf1); }.cnhr-prose :is(h1,h2,h3,h4,h5,h6) { line-height:1.4;margin:1em 0 .5em; }
.cnhr-prose h1 { font-size:1.55em; }.cnhr-prose h2 { font-size:1.35em; }.cnhr-prose h3 { font-size:1.15em; }
.cnhr-prose p { margin:0 0 .8em; }.cnhr-prose :is(ul,ol) { padding-left:1.5em; }.cnhr-prose li { margin:.2em 0; }
.cnhr-prose ul > li { list-style:disc; }.cnhr-prose ol > li { list-style:decimal; }
.cnhr-prose a,.cnhr-book-link { color:var(--lumiverse-primary-text,var(--lumiverse-primary,#c4b5e5));text-decoration:underline;text-underline-offset:3px; }
.cnhr-prose img { max-width:100%;height:auto;border-radius:6px; }.cnhr-prose pre { overflow-x:auto;max-width:100%;white-space:pre-wrap;padding:12px;border-radius:6px;background:var(--lumiverse-primary-005,rgba(128,128,128,.08)); }
.cnhr-prose code { font-family:ui-monospace,monospace;font-size:.9em; }.cnhr-prose :not(pre)>code { background:var(--lumiverse-primary-010,rgba(128,128,128,.12));padding:2px 4px;border-radius:3px; }
.cnhr-prose blockquote { border-left:3px solid var(--lumiverse-primary-030,#777087);padding-left:12px;margin:12px 0;color:var(--lumiverse-text-dim,#96929f); }
.cnhr-prose table { width:100%;table-layout:fixed;border-collapse:collapse; }.cnhr-prose :is(td,th) { border:1px solid var(--lumiverse-primary-015,rgba(128,128,128,.2));padding:6px 8px;text-align:left; }
.cnhr-prose hr { border:0;border-top:1px solid var(--lumiverse-primary-015,rgba(128,128,128,.2)); }.cnhr-empty { font-style:italic;color:var(--lumiverse-text-dim,#85818e); }
.cnhr-greetings { padding-top:10px; }.cnhr-greeting { margin-bottom:10px;border:1px solid var(--lumiverse-primary-015,rgba(128,128,128,.18));border-radius:8px;padding:12px; }
.cnhr-greeting > summary { cursor:pointer;list-style:none; }.cnhr-greeting-label { display:block;font-weight:600;margin-bottom:6px; }.cnhr-greeting-preview { display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap;line-height:1.6;overflow-wrap:anywhere;color:var(--lumiverse-text-muted,#b4b1ba); }
.cnhr-greeting-hint { display:block;margin-top:8px;font-size:11px;color:var(--lumiverse-primary-text,#c4b5e5); }.cnhr-greeting[open] .cnhr-greeting-preview,.cnhr-greeting[open] .cnhr-greeting-hint { display:none; }
.cnhr-books { display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding-top:12px; }.cnhr-book-link { border:0;background:none;padding:3px 0;font:inherit;text-align:left;cursor:pointer;overflow-wrap:anywhere;max-width:100%; }.cnhr-book-link:disabled { opacity:.5;cursor:wait; }.cnhr-book-status { font-size:12px;line-height:1.5;color:var(--lumiverse-text-muted,#96929f);margin:0; }
`;
var viewId = 0;
function createCharacterView(actions, storageKey) {
  const element = document.createElement("div");
  element.className = "cnhr-view";
  const style = document.createElement("style");
  style.textContent = styles;
  element.appendChild(style);
  const tabs = document.createElement("div");
  tabs.className = "cnhr-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Character views");
  element.appendChild(tabs);
  const preview = createPreviewView();
  const profilePanel = document.createElement("div");
  profilePanel.className = "cnhr-profile-panel";
  const profile = createProfileView(actions);
  profilePanel.appendChild(profile.element);
  const id = `cnhr-${++viewId}`;
  const panels = [preview.element, profilePanel];
  let selected = 0;
  let state = null;
  let profileCharacter = null;
  function renderProfile() {
    if (state?.kind === "character") {
      if (profileCharacter !== state.character) {
        profile.render(state.character);
        profileCharacter = state.character;
      }
    } else {
      profile.clear();
      profileCharacter = null;
      const message = document.createElement("p");
      message.className = "cnhr-empty";
      message.textContent = state?.message ?? "Loading character…";
      profile.element.appendChild(message);
    }
  }
  function select(index) {
    selected = index;
    buttons.forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === selected));
      button.tabIndex = i === selected ? 0 : -1;
      panels[i].style.display = i === selected ? "block" : "none";
    });
    if (selected === 1)
      renderProfile();
    try {
      if (storageKey && typeof localStorage !== "undefined")
        localStorage.setItem(storageKey, String(index));
    } catch (_) {}
  }
  const buttons = ["Creator Notes", "Profile"].map((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.id = `${id}-tab-${index}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `${id}-panel-${index}`);
    button.addEventListener("click", () => select(index));
    button.addEventListener("keydown", (event) => {
      const key = event.key;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key))
        return;
      event.preventDefault();
      const next = key === "Home" ? 0 : key === "End" ? 1 : 1 - selected;
      select(next);
      buttons[next].focus();
    });
    tabs.appendChild(button);
    panels[index].id = `${id}-panel-${index}`;
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", button.id);
    element.appendChild(panels[index]);
    return button;
  });
  let initialTab = 0;
  try {
    if (storageKey && typeof localStorage !== "undefined" && localStorage.getItem(storageKey) === "1")
      initialTab = 1;
  } catch (_) {}
  select(initialTab);
  return {
    element,
    render(next) {
      state = next;
      if (state.kind === "character") {
        const notes = state.character.creator_notes ?? "";
        preview.render(notes ? { kind: "html", html: notes } : { kind: "placeholder", message: "Creator notes are empty." });
      } else {
        preview.render(state);
      }
      if (selected === 1)
        renderProfile();
      else if (state.kind !== "character") {
        profile.clear();
        profileCharacter = null;
      }
    }
  };
}

// src/profile-actions.ts
function createProfileActions(context, mode = "main") {
  const ctx = context;
  const Channel = typeof window !== "undefined" ? window.BroadcastChannel : undefined;
  let channel = null;
  try {
    if (mode !== "other" && Channel)
      channel = new Channel("creator_notes_html_renderer:worldBooks");
  } catch (_) {}
  const pending = new Map;
  let disposed = false;
  async function openInMainWindow(id) {
    if (disposed)
      throw new Error("The extension was reloaded. Please try again.");
    if (!ctx.host?.surfaces)
      throw new Error("Update Lumiverse to open attached world books.");
    const granted = await ctx.permissions.getGranted();
    if (!granted.includes("world_books")) {
      const updated = await ctx.permissions.request(["world_books"], {
        reason: "Open an attached world book from the character profile in Lumiverse's Lorebook editor."
      });
      if (!updated.includes("world_books"))
        throw new Error("World Books permission is required to open the editor.");
    }
    if (disposed)
      throw new Error("The extension was reloaded. Please try again.");
    await ctx.host.surfaces.invoke({ kind: "modal", id: "world_book_editor" }, { id });
  }
  async function openEmbeddedLorebookInMainWindow(characterId) {
    if (disposed)
      throw new Error("The extension was reloaded. Please try again.");
    if (!ctx.host?.surfaces)
      throw new Error("Update Lumiverse to open the character editor.");
    await ctx.host.surfaces.invoke({ kind: "modal", id: "character_editor" }, { id: characterId });
  }
  function requestMainWindow(action, id) {
    if (!channel)
      throw new Error("Open this item from the main Lumiverse window.");
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error("The main Lumiverse window did not respond. Open it and try again."));
      }, 120000);
      pending.set(requestId, { resolve, reject, timer });
      try {
        channel?.postMessage({ type: action, requestId, id });
      } catch (error) {
        pending.delete(requestId);
        clearTimeout(timer);
        reject(error);
      }
    });
  }
  if (channel)
    channel.onmessage = async ({ data }) => {
      if (disposed || !data || typeof data !== "object" || typeof data.requestId !== "string")
        return;
      if (mode === "main" && (data.type === "open" || data.type === "open-character") && typeof data.id === "string" && data.id.length > 0 && data.id.length <= 200) {
        try {
          try {
            window.focus();
          } catch (_) {}
          if (data.type === "open")
            await openInMainWindow(data.id);
          else
            await openEmbeddedLorebookInMainWindow(data.id);
          if (!disposed)
            channel?.postMessage({ type: "result", requestId: data.requestId });
        } catch (error) {
          if (!disposed)
            channel?.postMessage({ type: "result", requestId: data.requestId, error: String(error) });
        }
      } else if (mode === "popout" && data.type === "result") {
        const request = pending.get(data.requestId);
        if (!request)
          return;
        pending.delete(data.requestId);
        clearTimeout(request.timer);
        if (typeof data.error === "string")
          request.reject(new Error(data.error));
        else
          request.resolve();
      }
    };
  return {
    async listWorldBooks() {
      if (!ctx.worldBooks)
        throw new Error("This Lumiverse version cannot list world books.");
      const result = await ctx.worldBooks.list();
      return Array.isArray(result) ? result : result.data;
    },
    async openWorldBook(id) {
      if (disposed)
        throw new Error("The extension was reloaded. Please try again.");
      if (mode !== "popout")
        return openInMainWindow(id);
      await requestMainWindow("open", id);
    },
    async openEmbeddedLorebook(characterId) {
      if (disposed)
        throw new Error("The extension was reloaded. Please try again.");
      if (mode !== "popout")
        return openEmbeddedLorebookInMainWindow(characterId);
      await requestMainWindow("open-character", characterId);
    },
    dispose() {
      disposed = true;
      channel?.close();
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error("The extension was reloaded. Please try again."));
      }
      pending.clear();
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
var ACTIVE_CHARACTER_KEY = `${EXTENSION_ID}:activeCharacterId`;
function readMirroredCharacterId() {
  try {
    const id = typeof localStorage === "undefined" ? null : localStorage.getItem(ACTIVE_CHARACTER_KEY);
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch (_) {
    return null;
  }
}
function writeMirroredCharacterId(id) {
  try {
    if (typeof localStorage === "undefined")
      return;
    if (id)
      localStorage.setItem(ACTIVE_CHARACTER_KEY, id);
    else
      localStorage.removeItem(ACTIVE_CHARACTER_KEY);
  } catch (_) {}
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
function inAnyDesktopWidgetWindow() {
  if (typeof window === "undefined" || typeof window.location === "undefined")
    return false;
  try {
    return new URLSearchParams(window.location.search).has("desktopWidgetExtension");
  } catch (_) {
    return false;
  }
}
var MAX_WIDGET_WIDTH = 7680;
var MAX_WIDGET_HEIGHT = 4320;
var BROWSER_SIZE_CLAMPS = {
  minWidth: 220,
  minHeight: 150,
  maxWidth: MAX_WIDGET_WIDTH,
  maxHeight: MAX_WIDGET_HEIGHT
};
var DESKTOP_SIZE_CLAMPS = {
  minWidth: 160,
  minHeight: 100,
  maxWidth: MAX_WIDGET_WIDTH,
  maxHeight: MAX_WIDGET_HEIGHT
};
var PERSIST_GEOMETRY_KEY = "html-preview";
var FLOAT_SIZE_STORAGE_KEY = `${EXTENSION_ID}:floatSize`;
function readPersistedFloatSize(fallback) {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(FLOAT_SIZE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && Number.isFinite(parsed.width) && Number.isFinite(parsed.height) && parsed.width >= 160 && parsed.width <= MAX_WIDGET_WIDTH && parsed.height >= 100 && parsed.height <= MAX_WIDGET_HEIGHT) {
      return { width: Math.round(parsed.width), height: Math.round(parsed.height) };
    }
  } catch (_) {}
  return fallback;
}
function writePersistedFloatSize(size) {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(FLOAT_SIZE_STORAGE_KEY, JSON.stringify(size));
  } catch (_) {}
}
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
  const canMirrorActiveCharacter = !inAnyDesktopWidgetWindow();
  const profileActions = createProfileActions(ctx, isWidgetWindow ? "popout" : canMirrorActiveCharacter ? "main" : "other");
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
  function resolveActiveCharacterId() {
    const characterId = ctx.getActiveChat().characterId ?? null;
    if (characterId) {
      if (canMirrorActiveCharacter)
        writeMirroredCharacterId(characterId);
      return characterId;
    }
    if (isWidgetWindow)
      return readMirroredCharacterId();
    if (canMirrorActiveCharacter)
      writeMirroredCharacterId(null);
    return null;
  }
  async function loadCharacter() {
    if (disposed)
      return;
    const version = ++requestVersion;
    const characterId = resolveActiveCharacterId();
    const selectionChanged = observedCharacterId !== characterId;
    observedCharacterId = characterId;
    if (!characterId) {
      broadcast({
        kind: "placeholder",
        message: "Select a character to view their creator notes and profile."
      });
      return;
    }
    if (selectionChanged)
      broadcast({ kind: "placeholder", message: "Loading character…" });
    try {
      const card = await ctx.characters.get(characterId);
      if (disposed || version !== requestVersion || resolveActiveCharacterId() !== characterId)
        return;
      broadcast(card ? { kind: "character", character: card } : { kind: "placeholder", message: "Character is unavailable." });
    } catch (err) {
      if (disposed || version !== requestVersion || resolveActiveCharacterId() !== characterId)
        return;
      broadcast({ kind: "error", message: `Failed to read character: ${err}` });
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
      description: "Creator notes HTML preview and a collapsible Markdown character profile.",
      keywords: ["html", "css", "preview", "creator notes", "profile", "character", "markdown", "lorebook", "float", "widget"],
      headerTitle: "HTML Preview",
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    });
    const root = tab.root;
    root.style.cssText = "display:flex;flex-direction:column;width:100%;min-width:0;min-height:0;height:100%;";
    const toolbar = document.createElement("div");
    toolbar.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 8px;flex:0 0 auto;border-bottom:1px solid rgba(128,128,128,0.25);";
    const toolbarLabel = document.createElement("span");
    toolbarLabel.textContent = "Character";
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
    drawerView = createCharacterView(profileActions, `${EXTENSION_ID}:drawerTab`);
    root.appendChild(drawerView.element);
    root.appendChild(toolbar);
    unsubDrawerView = subscribe(drawerView.render);
    unsubActivate = tab.onActivate(() => loadCharacter());
    runtimeExtensionId = rememberRuntimeExtensionId(tab.root) ?? runtimeExtensionId;
    teardownSteps.push(() => {
      try {
        tab.destroy();
      } catch (_) {}
    });
  }
  loadCharacter();
  const unsubChatSwitched = ctx.events.on("CHAT_SWITCHED", () => loadCharacter());
  const unsubCharEdited = ctx.events.on("CHARACTER_EDITED", () => loadCharacter());
  const selectionTimer = setInterval(() => {
    if (!disposed && resolveActiveCharacterId() !== observedCharacterId) {
      loadCharacter();
    }
  }, 500);
  let floatHandle = null;
  let floatView = null;
  let unsubFloatView = null;
  let unsubDesktopReturned = null;
  let floatResizeObserver = null;
  let floatRootObserver = null;
  let floatHeightTimer = null;
  let stopWindowResizeWatch = null;
  let floatSize = readPersistedFloatSize(desktopWidget ?? { width: 420, height: 560 });
  function syncFloatRootHeight(wroot) {
    const parent = wroot.parentElement;
    let available = parent && typeof parent.clientHeight === "number" && parent.clientHeight > 0 ? parent.clientHeight : 0;
    if (isWidgetWindow && parent) {
      const viewportCap = viewportSpaceBelow(parent);
      if (viewportCap > 0 && (available <= 0 || viewportCap < available))
        available = viewportCap;
    }
    wroot.style.height = available > 0 ? `${available}px` : "100%";
  }
  function viewportSpaceBelow(el) {
    try {
      const viewportHeight = typeof window !== "undefined" ? Number(window.innerHeight) : NaN;
      if (!Number.isFinite(viewportHeight) || viewportHeight <= 0)
        return 0;
      const top = typeof el.getBoundingClientRect === "function" ? el.getBoundingClientRect().top : 0;
      return Math.floor(viewportHeight - Math.max(0, Number.isFinite(top) ? top : 0));
    } catch (_) {
      return 0;
    }
  }
  function stopFloatRootHeightWatch() {
    floatResizeObserver?.disconnect();
    floatResizeObserver = null;
    stopWindowResizeWatch?.();
    stopWindowResizeWatch = null;
    floatRootObserver?.disconnect();
    floatRootObserver = null;
    if (floatHeightTimer !== null) {
      clearTimeout(floatHeightTimer);
      floatHeightTimer = null;
    }
  }
  function watchFloatRootHeight(wroot) {
    stopFloatRootHeightWatch();
    const attach = () => {
      const parent = wroot.parentElement;
      if (!parent)
        return false;
      syncFloatRootHeight(wroot);
      if (typeof ResizeObserver !== "undefined") {
        floatResizeObserver = new ResizeObserver(() => syncFloatRootHeight(wroot));
        floatResizeObserver.observe(parent);
      }
      if (isWidgetWindow && typeof window !== "undefined" && typeof window.addEventListener === "function") {
        const onResize = () => syncFloatRootHeight(wroot);
        window.addEventListener("resize", onResize);
        stopWindowResizeWatch = () => window.removeEventListener("resize", onResize);
      }
      return true;
    };
    if (attach())
      return;
    let attempts = 0;
    const retry = () => {
      if (disposed || attach() || ++attempts >= 40) {
        floatHeightTimer = null;
        return;
      }
      floatHeightTimer = setTimeout(retry, 250);
    };
    floatHeightTimer = setTimeout(retry, 250);
  }
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
    floatView = createCharacterView(profileActions, `${EXTENSION_ID}:floatTab`);
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
      writePersistedFloatSize(floatSize);
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
    watchFloatRootHeight(wroot);
    if (typeof ResizeObserver !== "undefined") {
      floatRootObserver?.disconnect();
      floatRootObserver = new ResizeObserver(() => {
        syncFloatRootHeight(wroot);
        const width = Math.round(wroot.clientWidth);
        const height = Math.round(wroot.clientHeight);
        if (width > 0 && height > 0 && (width !== floatSize.width || height !== floatSize.height)) {
          floatSize = { width, height };
          writePersistedFloatSize(floatSize);
        }
        if (typeof document !== "undefined" && document.activeElement !== widthInput) {
          widthInput.value = String(floatSize.width);
        }
        if (typeof document !== "undefined" && document.activeElement !== heightInput) {
          heightInput.value = String(floatSize.height);
        }
      });
      floatRootObserver.observe(wroot);
    }
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
      loadCharacter();
    };
    window.addEventListener(DESKTOP_WIDGET_RETURNED_EVENT, handler);
    return () => window.removeEventListener(DESKTOP_WIDGET_RETURNED_EVENT, handler);
  }
  function closeFloatWidget() {
    unsubFloatView?.();
    unsubFloatView = null;
    unsubDesktopReturned?.();
    unsubDesktopReturned = null;
    stopFloatRootHeightWatch();
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
        tooltip: "Creator notes and character profile",
        persistGeometry: PERSIST_GEOMETRY_KEY
      });
    } catch (err) {
      console.warn(`[${EXTENSION_ID}] failed to create float widget:`, err);
      return;
    }
    floatHandle = handle;
    unsubFloatView = subscribe((state) => floatView?.render(state));
    mountFloatContent(handle);
    runtimeExtensionId = rememberRuntimeExtensionId(handle.root) ?? runtimeExtensionId;
    if (isWidgetWindow) {
      try {
        handle.setSize(floatSize.width, floatSize.height);
      } catch (_) {}
    }
    unsubDesktopReturned = listenForDesktopReturn(handle);
  }
  if (isWidgetWindow) {
    openFloatWidget();
  }
  return () => {
    disposed = true;
    ++requestVersion;
    clearInterval(selectionTimer);
    profileActions.dispose();
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
