const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const ROOT = path.join(__dirname, 'assets', 'script');
const EXCLUDE_DIRS = new Set(['protobuf']);

const PRETTIER_OPTS = {
  parser: 'typescript',
  tabWidth: 4,
  useTabs: false,
  printWidth: 160,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  arrowParens: 'avoid',
};

function collectTs(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        files.push(...collectTs(path.join(dir, entry.name)));
      }
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const files = collectTs(ROOT);
console.log(`Found ${files.length} .ts files to process`);

function isBlank(line) { return line.trim() === ''; }
function isComment(line) { return /^\s*(@|\/\/|\/\*|\*)/.test(line.trimEnd()); }

function isMethod(line) {
  let t = line.trimEnd();
  let ci = t.indexOf('//'); if (ci !== -1) t = t.substring(0, ci);
  ci = t.indexOf('/*'); if (ci !== -1) t = t.substring(0, ci);
  t = t.trim();
  if (!t || t === '{' || t === '}') return false;
  // skip decorators: @ccclass, @property, @menu(...), etc.
  if (t.startsWith('@')) return false;
  // strip rhs of assignment: `foo: Type = expr()` → `foo: Type`
  let eq = t.indexOf('=');
  if (eq !== -1) t = t.substring(0, eq).trimEnd();
  if (!t.includes('(')) return false;
  // exclude lines that start with statement keywords or lowercase (not a method decl)
  let firstWord = t.match(/^\s*(\w+)/);
  if (firstWord) {
    let kw = new Set(['return','if','for','while','switch','try','catch','throw',
      'new','delete','typeof','void','await','yield','break','continue',
      'case','default','else','finally','import','let','var','const']);
    if (kw.has(firstWord[1])) return false;
    // known modifiers → always a method declaration
    let modifiers = new Set(['public','private','protected','static','async','override','readonly','abstract']);
    if (modifiers.has(firstWord[1]) || firstWord[1] === 'constructor' || firstWord[1] === 'get' || firstWord[1] === 'set') return true;
    // lowercase with dot → expression call (cc.v3(...), this.foo()), not a method declaration
    // use only the identifier before '(' or line end, e.g. "onShow" in "onShow(...param: any)"
    let ident = t.match(/^\s*([\w.]+)\s*\(?/);
    if (ident && ident[1].includes('.') && ident[1][0] === ident[1][0].toLowerCase()) return false;
  }
  return true;
}

function isClassOrMethod(line) {
  let t = line.trimEnd();
  let ci = t.indexOf('//'); if (ci !== -1) t = t.substring(0, ci);
  ci = t.indexOf('/*'); if (ci !== -1) t = t.substring(0, ci);
  t = t.trim();
  if (!t || t === '{' || t === '}') return false;
  // skip decorators
  if (t.startsWith('@')) return false;
  // class / interface / enum
  if (/\b(class|interface|enum)\b/.test(t)) return true;
  // top-level export declaration; exclude re-exports like `export { Foo }`
  if (/^\s*export\s+(?!\{)/.test(t)) return true;
  // strip rhs of assignment
  let eq = t.indexOf('=');
  if (eq !== -1) t = t.substring(0, eq).trimEnd();
  // function / method
  if (!t.includes('(')) return false;
  let firstWord = t.match(/^\s*(\w+)/);
  if (firstWord) {
    let kw = new Set(['return','if','for','while','switch','try','catch','throw',
      'new','delete','typeof','void','await','yield','break','continue',
      'case','default','else','finally','import','let','var','const']);
    if (kw.has(firstWord[1])) return false;
    let modifiers = new Set(['public','private','protected','static','async','override','readonly','abstract']);
    if (modifiers.has(firstWord[1]) || firstWord[1] === 'constructor' || firstWord[1] === 'get' || firstWord[1] === 'set') return true;
  }
  return true;
}

async function fmt(file) {
  let src = fs.readFileSync(file, 'utf8');

  // stage 1: prettier (indent, quotes, trailing commas, etc.)
  try {
    src = await prettier.format(src, { ...PRETTIER_OPTS, filepath: file });
  } catch (e) {
    console.warn('  prettier failed for', path.basename(file), '- continuing with blank-lines only');
  }

  let raw = src.split(/\r?\n/);
  let out = [];

  // pre-depth: depth BEFORE this line's braces
  let preDepth = new Array(raw.length);
  let d = 0;
  for (let i = 0; i < raw.length; i++) {
    preDepth[i] = d;
    let t = raw[i].trim();
    if (!/^\s*\/\//.test(t) && !/^\s*\*/.test(t)) {
      d += (t.match(/\{/g) || []).length - (t.match(/\}/g) || []).length;
    }
  }

  for (let i = 0; i < raw.length; i++) {
    let line = raw[i].trimEnd();
    let empty = isBlank(line);
    let dp = preDepth[i];

    // inside method/function body (dp >= 2): drop blanks entirely
    if (dp >= 2 && empty) continue;

    // at class/top level (dp <= 1)
    if (dp <= 1) {
      // depth=0 → class/method separation; depth=1 → method separation only
      let isDeclaration = dp === 0 ? isClassOrMethod : isMethod;

      if (empty) {
        // keep blank only if next meaningful line is a declaration start
        let j = i + 1;
        while (j < raw.length && isBlank(raw[j])) j++;
        if (j < raw.length && isDeclaration(raw[j]) && preDepth[j] >= dp) {
          if (out.length > 0 && out[out.length - 1] === '') continue;
          out.push('');
        }
        continue;
      }

      // ----- blank before declaration, or after `}` before member/comment -----
      if (isDeclaration(line) && out.length > 0) {
        // find the comment block start (if any) preceding this declaration
        let ci = out.length - 1;
        while (ci >= 0 && isBlank(out[ci])) ci--;

        let insertPos;

        if (ci >= 0 && isComment(out[ci])) {
          // go up to the first comment in this contiguous comment block
          let firstComment = ci;
          while (firstComment > 0 && isComment(out[firstComment - 1])) firstComment--;
          insertPos = firstComment;
        } else {
          insertPos = out.length;
        }

        // check the line above insertPos: if it's not blank and not '{', insert blank
        if (insertPos > 0 && out[insertPos - 1] !== '' && out[insertPos - 1].trimEnd() !== '{') {
          out.splice(insertPos, 0, '');
        }
      } else if (!isDeclaration(line) && out.length > 0) {
        // non-method line at class level (member var, comment):
        // insert blank after `}` only if this line looks like a class member
        let t = line.trimEnd().trim();
        let isMemberLike = /^(public |private |protected |static |readonly |\/\/|\/\*|\*|@)/.test(t);
        if (isMemberLike) {
          let ci = out.length - 1;
          while (ci >= 0 && isBlank(out[ci])) ci--;
          if (ci >= 0 && out[ci].trim() === '}') {
            out.push('');
          }
        }
      }
    }

    out.push(line);
  }

  let result = out.join('\n');
  if (!result.endsWith('\n')) result += '\n';
  fs.writeFileSync(file, result, 'utf8');
}

async function main() {
  let ok = 0, err = 0;
  for (const f of files) {
    try {
      await fmt(f);
      ok++;
    } catch (e) {
      err++;
      console.error('FAIL:', f.slice(ROOT.length), e.message);
    }
  }
  console.log(`Done: ${ok} OK, ${err} failed`);
}
main().catch(e => { console.error(e); process.exit(1); });
