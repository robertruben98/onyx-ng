/**
 * Dependency-free syntax highlighter for the docs code panels.
 *
 * Returns an HTML string of `<span class="hl-*">` tokens. All text (gaps and
 * token content alike) is HTML-escaped here, and Angular's default `[innerHTML]`
 * sanitizer keeps `<span class>` while stripping anything unsafe — so the output
 * is safe to bind without bypassing the sanitizer.
 */
export type Lang = "html" | "ts" | "bash" | "css" | "python";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TS_KEYWORDS =
  /\b(?:import|from|export|default|const|let|var|class|extends|implements|new|return|if|else|for|of|in|function|interface|type|enum|readonly|protected|private|public|static|async|await|true|false|null|undefined|this|void|typeof|as|get|set)\b/;

// Order matters: comments and strings win over tags/keywords.
const GRAMMAR: RegExp = new RegExp(
  [
    /(<!--[\s\S]*?-->)/.source, // 1 html comment
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/.source, // 2 js/css comment
    /(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.source, // 3 string
    /(<\/?[A-Za-z][\w-]*|\/?>)/.source, // 4 tag bracket + name
    /((?:\[\(?|\(|\*|#|@)?[A-Za-z_][\w.-]*(?=\s*=))/.source, // 5 attribute / binding before '='
    `(${TS_KEYWORDS.source})`, // 6 keyword
    /(\b\d[\w.]*\b)/.source, // 7 number-ish
  ].join("|"),
  "g",
);

const PY_KEYWORDS =
  /\b(?:import|from|as|def|class|return|if|elif|else|for|while|in|not|and|or|is|with|async|await|try|except|finally|raise|yield|lambda|pass|break|continue|global|nonlocal|del|assert|True|False|None|self)\b/;

// Python: comments, strings (incl. triple-quoted), decorators, keywords, numbers.
const PYTHON = new RegExp(
  [
    /(#[^\n]*)/.source, // 1 comment
    /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/
      .source, // 2 string
    /(@[A-Za-z_][\w.]*)/.source, // 3 decorator
    `(${PY_KEYWORDS.source})`, // 4 keyword
    /(\b\d[\w.]*\b)/.source, // 5 number-ish
  ].join("|"),
  "g",
);

// Bash: comments, strings, flags, and the leading command of each segment.
const BASH = new RegExp(
  [
    /(#[^\n]*)/.source, // 1 comment
    /("(?:\\.|[^"\\])*"|'(?:[^'])*')/.source, // 2 string
    /(\s--?[\w-]+)/.source, // 3 flag
  ].join("|"),
  "g",
);

function highlightDefault(code: string): string {
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  GRAMMAR.lastIndex = 0;
  while ((m = GRAMMAR.exec(code))) {
    out += esc(code.slice(last, m.index));
    const t = m[0];
    let cls = "";
    if (m[1] || m[2]) cls = "hl-comment";
    else if (m[3]) cls = "hl-string";
    else if (m[4]) cls = "hl-tag";
    else if (m[5]) cls = "hl-attr";
    else if (m[6]) cls = "hl-keyword";
    else if (m[7]) cls = "hl-num";
    out += `<span class="${cls}">${esc(t)}</span>`;
    last = m.index + t.length;
  }
  out += esc(code.slice(last));
  return out;
}

function highlightBash(code: string): string {
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  BASH.lastIndex = 0;
  while ((m = BASH.exec(code))) {
    out += esc(code.slice(last, m.index));
    const t = m[0];
    let cls = "";
    if (m[1]) cls = "hl-comment";
    else if (m[2]) cls = "hl-string";
    else if (m[3]) cls = "hl-attr";
    out += `<span class="${cls}">${esc(t)}</span>`;
    last = m.index + t.length;
  }
  out += esc(code.slice(last));
  return out;
}

function highlightPython(code: string): string {
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  PYTHON.lastIndex = 0;
  while ((m = PYTHON.exec(code))) {
    out += esc(code.slice(last, m.index));
    const t = m[0];
    let cls = "";
    if (m[1]) cls = "hl-comment";
    else if (m[2]) cls = "hl-string";
    else if (m[3]) cls = "hl-attr";
    else if (m[4]) cls = "hl-keyword";
    else if (m[5]) cls = "hl-num";
    out += `<span class="${cls}">${esc(t)}</span>`;
    last = m.index + t.length;
  }
  out += esc(code.slice(last));
  return out;
}

export function highlight(code: string, lang: Lang): string {
  if (lang === "bash") return highlightBash(code);
  if (lang === "python") return highlightPython(code);
  return highlightDefault(code);
}
