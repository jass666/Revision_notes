/**
 * Revision Hub — Search Widget v2
 * • In-page search with prev/next nav
 * • Cross-page suggestions from sites.json
 * • "Ask Google AI" fallback when no results
 */
(function () {

  // ── STYLES ────────────────────────────────────────────────────────────────
  const css = `
  #rh-search-fab {
    position: fixed; bottom: 1.4rem; right: 1.4rem; z-index: 9000;
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--saffron, #d97706);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.15rem; color: #fff;
    box-shadow: 0 4px 18px rgba(0,0,0,.45);
    transition: transform .18s, box-shadow .18s;
  }
  #rh-search-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,.55); }

  #rh-search-overlay {
    display: none; position: fixed; inset: 0; z-index: 9001;
    background: rgba(0,0,0,.72); backdrop-filter: blur(6px);
    align-items: flex-start; justify-content: center; padding-top: 5vh;
  }
  #rh-search-overlay.open { display: flex; }

  #rh-search-box {
    background: var(--surface, #1a1724);
    border: 1px solid var(--border, #26223a);
    border-radius: 12px; width: 100%; max-width: 640px;
    margin: 0 1rem;
    box-shadow: 0 16px 60px rgba(0,0,0,.65);
    overflow: hidden;
    font-family: 'DM Mono', monospace;
  }
  #rh-search-head {
    display: flex; align-items: center; gap: .6rem;
    padding: .65rem 1rem; border-bottom: 1px solid var(--border, #26223a);
  }
  #rh-search-head .rh-icon { font-size: 1rem; color: var(--saffron, #d97706); flex-shrink: 0; }
  #rh-search-input {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'DM Mono', monospace; font-size: .85rem;
    color: var(--text, #eee8f8);
    caret-color: var(--saffron, #d97706);
  }
  #rh-search-input::placeholder { color: var(--muted, #5c5478); }
  #rh-search-close {
    background: none; border: none; cursor: pointer;
    color: var(--muted, #5c5478); font-size: .75rem; padding: .2rem .4rem;
    border-radius: 4px; transition: color .15s;
    font-family: 'DM Mono', monospace;
  }
  #rh-search-close:hover { color: var(--text, #eee8f8); }

  #rh-search-results {
    max-height: 56vh; overflow-y: auto; padding: .5rem;
    scrollbar-width: thin;
  }

  /* Section dividers inside results */
  .rh-section-label {
    font-size: .55rem; letter-spacing: .14em; text-transform: uppercase;
    color: var(--muted, #5c5478); padding: .5rem .9rem .3rem;
    border-bottom: 1px solid var(--border, #26223a); margin-bottom: .25rem;
  }

  .rh-result {
    padding: .65rem .9rem; border-radius: 8px; cursor: pointer;
    transition: background .15s; border: 1px solid transparent;
    margin-bottom: .25rem;
  }
  .rh-result:hover, .rh-result:focus {
    background: color-mix(in srgb, var(--saffron, #d97706) 10%, transparent);
    border-color: color-mix(in srgb, var(--saffron, #d97706) 25%, transparent);
    outline: none;
  }
  .rh-result-title {
    font-size: .8rem; font-weight: 500;
    color: var(--text, #eee8f8); margin-bottom: .2rem;
    display: flex; align-items: center; gap: .5rem;
  }
  .rh-result-ctx {
    font-size: .7rem; color: var(--muted, #5c5478); line-height: 1.4;
  }
  .rh-result-ctx mark {
    background: color-mix(in srgb, var(--saffron, #d97706) 28%, transparent);
    color: var(--saffron, #d97706); border-radius: 2px; padding: 0 2px;
  }
  .rh-result-tag {
    font-size: .55rem; letter-spacing: .1em; text-transform: uppercase;
    padding: .1rem .38rem; border-radius: 3px;
    background: color-mix(in srgb, var(--saffron, #d97706) 12%, transparent);
    color: var(--saffron, #d97706);
    border: 1px solid color-mix(in srgb, var(--saffron, #d97706) 22%, transparent);
  }

  /* Cross-page result style */
  .rh-result.rh-crosspage {
    border-left: 2px solid color-mix(in srgb, var(--saffron,#d97706) 40%, transparent);
  }
  .rh-result.rh-crosspage .rh-result-title { color: var(--saffron, #d97706); }
  .rh-cp-icon { font-size: 1rem; flex-shrink: 0; }
  .rh-cp-arrow {
    font-size: .65rem; color: var(--muted,#5c5478); margin-left: auto; flex-shrink: 0;
  }
  .rh-cp-tags { display: flex; gap: .35rem; flex-wrap: wrap; margin-top: .3rem; }
  .rh-cp-tag {
    font-size: .5rem; letter-spacing: .1em; text-transform: uppercase;
    padding: .1rem .32rem; border-radius: 3px;
    background: var(--surface2, #1a1724);
    color: var(--muted, #5c5478);
    border: 1px solid var(--border, #26223a);
  }

  /* Google AI button */
  #rh-search-empty { padding: 1.2rem 1rem; }
  .rh-no-results-msg {
    text-align: center; color: var(--muted, #5c5478); font-size: .78rem;
    margin-bottom: 1rem;
  }
  .rh-ai-btn {
    display: flex; align-items: center; justify-content: center; gap: .6rem;
    width: 100%; padding: .75rem 1rem;
    background: linear-gradient(135deg,rgba(66,133,244,.15),rgba(52,168,83,.1));
    border: 1px solid rgba(66,133,244,.3);
    border-radius: 8px; cursor: pointer;
    color: var(--text, #eee8f8); font-family: 'DM Mono', monospace;
    font-size: .78rem; text-decoration: none;
    transition: all .2s; letter-spacing: .02em;
  }
  .rh-ai-btn:hover {
    background: linear-gradient(135deg,rgba(66,133,244,.25),rgba(52,168,83,.18));
    border-color: rgba(66,133,244,.55);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(66,133,244,.2);
  }
  .rh-ai-logo {
    display: inline-flex; gap: 1px; font-size: 1rem; letter-spacing: -.5px;
    font-weight: 700; font-family: sans-serif;
    flex-shrink: 0;
  }
  .rh-ai-logo .g-b { color: #4285f4; }
  .rh-ai-logo .g-r { color: #ea4335; }
  .rh-ai-logo .g-y { color: #fbbc04; }
  .rh-ai-logo .g-g { color: #34a853; }
  .rh-ai-sub { font-size: .6rem; color: var(--muted,#5c5478); display: block; margin-top: .1rem; }

  /* Always-visible AI button at footer */
  #rh-search-footer {
    padding: .5rem 1rem; border-top: 1px solid var(--border, #26223a);
    display: flex; justify-content: space-between; align-items: center;
    font-size: .6rem; letter-spacing: .08em; color: var(--muted, #5c5478);
    gap: .5rem;
  }
  #rh-match-count { color: var(--saffron, #d97706); flex-shrink: 0; }
  #rh-footer-ai {
    display: flex; align-items: center; gap: .35rem;
    font-size: .6rem; color: var(--muted,#5c5478);
    cursor: pointer; text-decoration: none;
    padding: .2rem .5rem; border-radius: 4px;
    border: 1px solid var(--border,#26223a);
    transition: all .15s; flex-shrink: 0;
    font-family: 'DM Mono', monospace;
  }
  #rh-footer-ai:hover {
    color: var(--text,#eee8f8);
    border-color: rgba(66,133,244,.4);
    background: rgba(66,133,244,.08);
  }

  /* Nav bar */
  #rh-nav-bar {
    position: fixed; bottom: 1.4rem; left: 50%; transform: translateX(-50%);
    z-index: 8999;
    background: var(--surface, #1a1724); border: 1px solid var(--border, #26223a);
    border-radius: 99px; padding: .4rem .9rem;
    display: none;
    align-items: center; gap: .6rem;
    box-shadow: 0 4px 20px rgba(0,0,0,.5);
    font-family: 'DM Mono', monospace; font-size: .7rem;
    color: var(--muted, #5c5478);
  }
  #rh-nav-bar.visible { display: flex; }
  .rh-nav-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text, #eee8f8); font-size: .85rem; padding: 0 .25rem;
    transition: color .15s;
  }
  .rh-nav-btn:hover { color: var(--saffron, #d97706); }
  .rh-nav-clear {
    font-size: .6rem; letter-spacing: .08em; text-transform: uppercase;
    color: var(--muted, #5c5478); background: none; border: none;
    cursor: pointer; transition: color .15s; padding: 0;
    font-family: 'DM Mono', monospace;
  }
  .rh-nav-clear:hover { color: var(--saffron, #d97706); }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ──────────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
  <button id="rh-search-fab" title="Search (Ctrl+K)">⌕</button>

  <div id="rh-search-overlay" role="dialog" aria-modal="true" aria-label="Search">
    <div id="rh-search-box">
      <div id="rh-search-head">
        <span class="rh-icon">⌕</span>
        <input id="rh-search-input" type="text" placeholder="Search this page or all topics…" autocomplete="off" spellcheck="false">
        <button id="rh-search-close" title="Close (Esc)">✕ esc</button>
      </div>
      <div id="rh-search-results"></div>
      <div id="rh-search-footer">
        <span id="rh-match-count"></span>
        <span style="flex:1;text-align:center">↑↓ navigate · Enter jump · Esc close</span>
        <a id="rh-footer-ai" href="#" target="_blank" rel="noopener" title="Ask Google AI">
          <span style="display:inline-flex;gap:1px;font-weight:700;font-family:sans-serif;font-size:.75rem">
            <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc04">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
          </span>
          AI ↗
        </a>
      </div>
    </div>
  </div>

  <div id="rh-nav-bar">
    <button class="rh-nav-btn" id="rh-prev-btn" title="Previous">↑</button>
    <span id="rh-nav-info">0 / 0</span>
    <button class="rh-nav-btn" id="rh-next-btn" title="Next">↓</button>
    <button class="rh-nav-clear" id="rh-clear-btn">✕ clear</button>
  </div>
  `);

  // ── SITES INDEX (cross-page) ──────────────────────────────────────────────
  let sites = [];
  // Determine base path (same directory as the current page)
  const basePath = (function() {
    const parts = window.location.pathname.split('/');
    parts.pop();
    return parts.join('/') + '/';
  })();

  // Try to load sites.json; silently fail if not available (e.g. file:// without server)
  fetch(basePath + 'sites.json')
    .then(r => r.ok ? r.json() : [])
    .then(data => { sites = Array.isArray(data) ? data.filter(s => s.status === 'live') : []; })
    .catch(() => {});

  function currentFile() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function matchSites(q) {
    if (!sites.length || q.length < 2) return [];
    const ql = q.toLowerCase();
    return sites
      .filter(s => s.file !== currentFile())
      .map(s => {
        const haystack = (s.title + ' ' + s.desc + ' ' + (s.tags || []).join(' ')).toLowerCase();
        const score = haystack.split(ql).length - 1; // count occurrences
        return { ...s, score };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  // ── PAGE INDEX ────────────────────────────────────────────────────────────
  const SKIP = new Set(['SCRIPT','STYLE','META','LINK','NOSCRIPT','BUTTON','NAV']);

  function buildIndex() {
    const blocks = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (SKIP.has(node.tagName)) continue;
      if (['H1','H2','H3','H4','H5','H6'].includes(node.tagName)) {
        const txt = node.textContent.trim();
        if (txt.length > 2) blocks.push({ type: 'heading', el: node, text: txt });
      } else if (['P','LI','TD','DD','BLOCKQUOTE'].includes(node.tagName)) {
        const txt = node.textContent.trim();
        if (txt.length > 15) blocks.push({ type: 'para', el: node, text: txt });
      }
    }
    return blocks;
  }

  let index = [];
  let pageMatches = [];
  let activeMatchIdx = 0;

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(text, q) {
    return text.replace(new RegExp('(' + escapeRe(q) + ')', 'gi'), '<mark>$1</mark>');
  }

  function excerpt(text, q, len) {
    len = len || 120;
    const lo = text.toLowerCase();
    const qi = lo.indexOf(q.toLowerCase());
    if (qi < 0) return text.slice(0, len) + (text.length > len ? '…' : '');
    const start = Math.max(0, qi - 40);
    const end = Math.min(text.length, qi + len - 40);
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }

  function googleAIUrl(q) {
    // Opens Google Search with AI mode via ?udm=50 (AI mode param)
    return 'https://www.google.com/search?q=' + encodeURIComponent(q + ' UPSC') + '&udm=50';
  }

  function updateFooterAI(q) {
    const el = document.getElementById('rh-footer-ai');
    if (!el) return;
    el.href = q && q.length > 1 ? googleAIUrl(q) : 'https://www.google.com/search?udm=50';
  }

  // ── SEARCH ────────────────────────────────────────────────────────────────
  function doSearch(q) {
    const resultsEl = document.getElementById('rh-search-results');
    const countEl   = document.getElementById('rh-match-count');

    updateFooterAI(q);

    if (!q || q.length < 2) {
      resultsEl.innerHTML = '';
      countEl.textContent = '';
      pageMatches = [];
      document.getElementById('rh-nav-bar').classList.remove('visible');
      return;
    }

    const lower = q.toLowerCase();
    const matches = index.filter(b => b.text.toLowerCase().includes(lower));
    const crossMatches = matchSites(q);

    // Build HTML
    let html = '';

    // ── In-page results ──
    if (matches.length) {
      countEl.textContent = matches.length + ' result' + (matches.length !== 1 ? 's' : '') + ' on this page';
      html += '<div class="rh-section-label">📄 On this page</div>';
      html += matches.slice(0, 30).map(function(m, i) {
        const ctx = excerpt(m.text, q);
        const titleText = m.el.tagName.charAt(0) === 'H'
          ? m.text
          : m.text.slice(0, 60) + (m.text.length > 60 ? '…' : '');
        return '<div class="rh-result" data-idx="' + i + '" tabindex="0">' +
          '<div class="rh-result-title">' +
            (m.type === 'heading' ? '§' : '¶') + ' ' + highlight(titleText, q) +
            (m.type === 'heading' ? ' <span class="rh-result-tag">' + m.el.tagName + '</span>' : '') +
          '</div>' +
          (m.type !== 'heading' ? '<div class="rh-result-ctx">' + highlight(ctx, q) + '</div>' : '') +
        '</div>';
      }).join('');
    } else {
      countEl.textContent = '0 results on this page';
    }

    // ── Cross-page results ──
    if (crossMatches.length) {
      html += '<div class="rh-section-label">🔗 Other pages in this hub</div>';
      html += crossMatches.map(function(s) {
        const tagsHtml = (s.tags || []).map(t => '<span class="rh-cp-tag">' + t + '</span>').join('');
        return '<div class="rh-result rh-crosspage" data-file="' + s.file + '" tabindex="0">' +
          '<div class="rh-result-title">' +
            '<span class="rh-cp-icon">' + (s.icon || '📄') + '</span>' +
            highlight(s.title, q) +
            '<span class="rh-cp-arrow">↗ open</span>' +
          '</div>' +
          '<div class="rh-result-ctx">' + highlight(s.desc, q) + '</div>' +
          (tagsHtml ? '<div class="rh-cp-tags">' + tagsHtml + '</div>' : '') +
        '</div>';
      }).join('');
    }

    // ── No results at all → big AI button ──
    if (!matches.length && !crossMatches.length) {
      html = '<div id="rh-search-empty">' +
        '<div class="rh-no-results-msg">No results for "<strong>' + q + '</strong>" — try Google AI</div>' +
        '<a class="rh-ai-btn" href="' + googleAIUrl(q) + '" target="_blank" rel="noopener">' +
          '<span class="rh-ai-logo">' +
            '<span class="g-b">G</span><span class="g-r">o</span><span class="g-y">o</span>' +
            '<span class="g-b">g</span><span class="g-g">l</span><span class="g-r">e</span>' +
          '</span>' +
          '<span>' +
            '<span style="font-size:.8rem">Ask Google AI about <em>' + q + '</em></span>' +
            '<span class="rh-ai-sub">Searches with AI Overview for UPSC context</span>' +
          '</span>' +
          '<span style="color:var(--muted,#5c5478);font-size:.75rem">↗</span>' +
        '</a>' +
      '</div>';
    }

    resultsEl.innerHTML = html;

    // Wire in-page result clicks
    pageMatches = matches;
    activeMatchIdx = 0;
    updateNavBar();

    resultsEl.querySelectorAll('.rh-result:not(.rh-crosspage)').forEach(function(el, i) {
      el.addEventListener('click', function() { jumpTo(matches[i]); });
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') jumpTo(matches[i]);
        if (e.key === 'ArrowDown') { e.preventDefault(); var next = el.nextElementSibling; if (next) next.focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); var prev = el.previousElementSibling; if (prev) prev.focus(); else document.getElementById('rh-search-input').focus(); }
      });
    });

    // Wire cross-page result clicks
    resultsEl.querySelectorAll('.rh-result.rh-crosspage').forEach(function(el) {
      const file = el.dataset.file;
      el.addEventListener('click', function() { window.location.href = file; });
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.location.href = file;
        if (e.key === 'ArrowDown') { e.preventDefault(); var next = el.nextElementSibling; if (next) next.focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); var prev = el.previousElementSibling; if (prev) prev.focus(); else document.getElementById('rh-search-input').focus(); }
      });
    });
  }

  function jumpTo(match) {
    close();
    setTimeout(function() {
      match.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      match.el.style.transition = 'outline .15s, outline-offset .15s';
      match.el.style.outline = '2px solid var(--saffron, #d97706)';
      match.el.style.outlineOffset = '4px';
      setTimeout(function() {
        match.el.style.outline = '';
        match.el.style.outlineOffset = '';
      }, 1800);
    }, 80);
  }

  // ── NAV BAR ───────────────────────────────────────────────────────────────
  function updateNavBar() {
    if (!pageMatches.length) { document.getElementById('rh-nav-bar').classList.remove('visible'); return; }
    document.getElementById('rh-nav-bar').classList.add('visible');
    document.getElementById('rh-nav-info').textContent = (activeMatchIdx + 1) + ' / ' + pageMatches.length;
  }

  function navJump(idx) {
    if (!pageMatches.length) return;
    activeMatchIdx = (idx + pageMatches.length) % pageMatches.length;
    updateNavBar();
    const match = pageMatches[activeMatchIdx];
    match.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    match.el.style.transition = 'outline .15s';
    match.el.style.outline = '2px solid var(--saffron, #d97706)';
    match.el.style.outlineOffset = '4px';
    setTimeout(function() { match.el.style.outline = ''; match.el.style.outlineOffset = ''; }, 1400);
  }

  document.getElementById('rh-next-btn').addEventListener('click', function() { navJump(activeMatchIdx + 1); });
  document.getElementById('rh-prev-btn').addEventListener('click', function() { navJump(activeMatchIdx - 1); });
  document.getElementById('rh-clear-btn').addEventListener('click', function() {
    pageMatches = [];
    document.getElementById('rh-nav-bar').classList.remove('visible');
  });

  // ── OPEN / CLOSE ──────────────────────────────────────────────────────────
  function open() {
    document.getElementById('rh-search-overlay').classList.add('open');
    setTimeout(function() { document.getElementById('rh-search-input').focus(); }, 60);
    if (!index.length) index = buildIndex();
    updateFooterAI(document.getElementById('rh-search-input').value.trim());
  }

  function close() {
    document.getElementById('rh-search-overlay').classList.remove('open');
    document.getElementById('rh-search-input').value = '';
    document.getElementById('rh-search-results').innerHTML = '';
    document.getElementById('rh-match-count').textContent = '';
  }

  // ── EVENTS ────────────────────────────────────────────────────────────────
  document.getElementById('rh-search-fab').addEventListener('click', open);
  document.getElementById('rh-search-close').addEventListener('click', close);
  document.getElementById('rh-search-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('rh-search-overlay')) close();
  });
  document.getElementById('rh-search-input').addEventListener('input', function(e) {
    doSearch(e.target.value.trim());
  });
  document.getElementById('rh-search-input').addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); var first = document.querySelector('.rh-result'); if (first) first.focus(); }
  });
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
    if (e.key === 'Escape') close();
  });

  // ── HUB LINK ──────────────────────────────────────────────────────────────
  var brand = document.querySelector('.nav-brand');
  if (brand && !document.querySelector('#rh-hub-link')) {
    var link = document.createElement('a');
    link.id = 'rh-hub-link';
    link.href = 'index.html';
    link.title = 'Back to Revision Hub';
    link.style.cssText = 'color:var(--muted,#5c5478);text-decoration:none;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;margin-right:.5rem;transition:color .15s;flex-shrink:0;';
    link.textContent = '← Hub';
    link.addEventListener('mouseover', function() { link.style.color = 'var(--saffron,#d97706)'; });
    link.addEventListener('mouseout',  function() { link.style.color = 'var(--muted,#5c5478)'; });
    brand.parentNode.insertBefore(link, brand);
  }

})();
