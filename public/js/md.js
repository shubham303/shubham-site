/**
 * Minimal, zero-dependency markdown renderer for the dashboard.
 *
 * Exposes two globals:
 *   window.md(text)      -> sanitized HTML for headings, lists, code, links, etc.
 *   window.stripMd(text) -> plain text with markdown syntax removed (for excerpts).
 *
 * Safety: HTML is escaped FIRST, so no other transform can introduce raw markup.
 * The only place an attribute is emitted is the link href, which is validated to
 * block javascript:/data: URLs. This is intentionally a small subset of Markdown
 * (CommonMark would need a real library) — enough for outreach playbook prompts.
 */
(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Safe URL check: allow http(s), relative, and fragment links only.
  function safeHref(url) {
    const u = String(url).trim();
    if (/^(https?:|mailto:|\/|#|\.\/|\.\.\/)/i.test(u)) return u;
    return null;
  }

  function inline(text) {
    // Inline transforms run on already-escaped text. Placeholders protect nested
    // content (e.g. code spans) from further transformation.
    const store = [];
    const stash = (html) => { store.push(html); return `\x00${store.length - 1}\x00`; };

    // Inline code: `code` -> escaped, stashed
    text = text.replace(/`([^`]+)`/g, (_, c) => stash('<code>' + escapeHtml(c) + '</code>'));
    // Images: ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt, url) => {
      const href = safeHref(url);
      return href ? stash(`<img alt="${escapeHtml(alt)}" src="${escapeHtml(href)}">`) : escapeHtml(`![${alt}](${url})`);
    });
    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, url) => {
      const href = safeHref(url);
      return href
        ? stash(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
        : escapeHtml(`[${label}](${url})`);
    });
    // Bold: **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*  (avoid matching list markers since those are handled per-line)
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    // Strikethrough: ~~text~~
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Restore stashed fragments.
    text = text.replace(/\x00(\d+)\x00/g, (_, i) => store[Number(i)]);
    return text;
  }

  function md(src) {
    if (src == null) return '';
    const text = String(src).replace(/\r\n?/g, '\n');
    const lines = text.split('\n');
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block: ```lang ... ```
      const fence = line.match(/^```\s*([\w-]*)\s*$/);
      if (fence) {
        const lang = fence[1];
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // skip closing fence
        out.push('<pre><code' + (lang ? ` class="language-${escapeHtml(lang)}"` : '') + '>' + escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      // Horizontal rule: --- (3+), ***, ___ on its own line
      if (/^\s*([-*_])\1\1[-*_]*\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

      // ATX headings: # .. ######
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const lvl = h[1].length; out.push(`<h${lvl}>${inline(escapeHtml(h[2]))}</h${lvl}>`); i++; continue; }

      // Blank line -> paragraph separator
      if (/^\s*$/.test(line)) { i++; continue; }

      // Blockquote: > ...
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + inline(escapeHtml(buf.join('\n'))).replace(/\n/g, '<br>') + '</blockquote>');
        continue;
      }

      // Unordered list: -, *, +
      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { items.push('<li>' + inline(escapeHtml(lines[i].replace(/^\s*[-*+]\s+/, ''))) + '</li>'); i++; }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      // Ordered list: 1. / 1)
      if (/^\s*\d+[.)]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push('<li>' + inline(escapeHtml(lines[i].replace(/^\s*\d+[.)]\s+/, ''))) + '</li>'); i++; }
        out.push('<ol>' + items.join('') + '</ol>');
        continue;
      }

      // Paragraph: gather consecutive non-blank, non-special lines.
      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|```|>\s?|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      out.push('<p>' + inline(escapeHtml(buf.join('\n'))).replace(/\n/g, '<br>') + '</p>');
    }
    return out.join('\n');
  }

  function stripMd(src) {
    if (src == null) return '';
    return String(src)
      .replace(/```[\s\S]*?```/g, ' ')      // fenced code blocks
      .replace(/`([^`]+)`/g, '$1')           // inline code
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // links
      .replace(/^[#>+-\s]*[-*+]\s+/gm, '')    // unordered list markers
      .replace(/^\s*\d+[.)]\s+/gm, '')        // ordered list markers
      .replace(/^#{1,6}\s+/gm, '')            // headings
      .replace(/^>\s?/gm, '')                 // blockquote markers
      .replace(/^\s*([-*_])\1{2,}\s*$/gm, '') // horizontal rules
      .replace(/\*\*([^*]+)\*\*/g, '$1')      // bold
      .replace(/\*([^*\n]+)\*/g, '$1')        // italic
      .replace(/~~([^~]+)~~/g, '$1')          // strikethrough
      .replace(/\s+/g, ' ')
      .trim();
  }

  window.md = md;
  window.stripMd = stripMd;
})();
