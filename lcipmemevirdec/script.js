(function() {
  if (window.__MVD_BACKEND_ENABLED__) return;
  window.__MVD_BACKEND_ENABLED__ = true;

  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';
  const POLL_MS = 60000;
  const VIRAL_LIMIT = 12;
  const NEW_LIMIT = 12;
  const FRESH_WINDOW_MS = 6 * 60 * 60 * 1000;

  const els = {
    scanCount: document.getElementById('scan-count'),
    loading: document.getElementById('loading'),
    viralCards: document.getElementById('viral-cards'),
    newCards: document.getElementById('new-cards'),
    mobileViral: document.getElementById('mobile-viral'),
    mobileNew: document.getElementById('mobile-new'),
    toast: document.getElementById('toast'),
    tabs: document.querySelectorAll('[role="tab"]'),
  };

  function formatUSD(n) {
    const num = Number(n || 0);
    if (num >= 1e9) return `$${ (num / 1e9).toFixed(2) }B`;
    if (num >= 1e6) return `$${ (num / 1e6).toFixed(2) }M`;
    if (num >= 1e3) return `$${ (num / 1e3).toFixed(2) }K`;
    return `$${ num.toFixed(2) }`;
  }

  function formatPct(n) {
    if (n == null || isNaN(n)) return '—';
    const sign = n > 0 ? '+' : '';
    return `${ sign }${ n.toFixed(2) }%`;
  }

  function isMemeLike(symbol, name) {
    const kws = ['pepe', 'dog', 'doge', 'shib', 'inu', 'cat', 'elon', 'meme', 'moon', 'pump', 'wojak', 'floki', 'bonk'];
    return kws.some(k => (symbol || '').toLowerCase().includes(k) || (name || '').toLowerCase().includes(k));
  }

  function isViral(p) {
    const vol = Number(p.volume?.h24 || 0);
    const liq = Number(p.liquidity?.usd || 0);
    const ch1 = Number(p.priceChange?.h1 || 0);
    const ch6 = Number(p.priceChange?.h6 || 0);
    const meme = isMemeLike(p.baseToken?.symbol, p.baseToken?.name);
    const momentum = ch1 > 50 || ch6 > 100;
    const healthy = liq >= 30000 || vol >= 100000;
    return meme && healthy && momentum;
  }

  function isFresh(p) {
    const created = Number(p.pairCreatedAt || 0);
    return created && (Date.now() - created) < FRESH_WINDOW_MS;
  }

  function makeCard(p) {
    const chain = p.chain || 'unknown';
    const baseSymbol = p.baseToken?.symbol || '—';
    const quoteSymbol = p.quoteToken?.symbol || '—';
    const price = p.priceUsd ? Number(p.priceUsd).toFixed(6) : '—';
    const ch5m = p.priceChange?.m5;
    const ch1h = p.priceChange?.h1;
    const ch6h = p.priceChange?.h6;
    const createdAgo = p.pairCreatedAt ? Math.max(1, Math.floor((Date.now() - Number(p.pairCreatedAt)) / (60 * 1000))) : null;

    const card = document.createElement('article');
    card.className = 'mvd-card';
    card.innerHTML = `
      <div class="mvd-card-header">
        <div class="mvd-title-wrap">
          <span class="mvd-pair">${ baseSymbol }/${ quoteSymbol }</span>
          ${ isViral(p) ? '<span class="mvd-badge mvd-badge--hot">🔥 HOT</span>' : '' }
        </div>
        <span class="mvd-badge mvd-badge--chain">${ chain.toUpperCase() }</span>
      </div>
      <div class="mvd-metrics">
        <div class="mvd-metric">
          <span class="mvd-metric-label">Harga (USD)</span>
          <span class="mvd-metric-value">${ price !== '—' ? `$${ price }` : '—' }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">5m</span>
          <span class="mvd-metric-value ${ ch5m >= 0 ? 'mvd-metric-up' : 'mvd-metric-down' }">${ formatPct(ch5m) }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">1j</span>
          <span class="mvd-metric-value ${ ch1h >= 0 ? 'mvd-metric-up' : 'mvd-metric-down' }">${ formatPct(ch1h) }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">6j</span>
          <span class="mvd-metric-value ${ ch6h >= 0 ? 'mvd-metric-up' : 'mvd-metric-down' }">${ formatPct(ch6h) }</span>
        </div>
      </div>
      <div class="mvd-footer">
        <div class="mvd-chips">
          <span class="mvd-chip">💰 ${ formatUSD(p.volume?.h24 || 0) }</span>
          <span class="mvd-chip">💧 ${ formatUSD(p.liquidity?.usd || 0) }</span>
          ${ createdAgo ? `<span class="mvd-chip mvd-age">🕒 ${ createdAgo }m lalu</span>` : '' }
        </div>
        <a class="mvd-view" href="${ p.url || '#' }" target="_blank" rel="noopener">🔗 Lihat</a>
      </div>
    `;
    return card;
  }

  async function fetchTokens() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Gagal ambil token');
      const data = await res.json();
      return Array.isArray(data) ? data : data.tokens || [];
    } catch (err) {
      console.error('[MVD] Error fetch:', err);
      els.viralCards.innerHTML = '<div class="mvd-empty">😿 Wah, radar meme kita lagi ngadat! Coba lagi nanti.</div>';
      els.newCards.innerHTML = '<div class="mvd-empty">😿 Wah, radar meme kita lagi ngadat! Coba lagi nanti.</div>';
      els.mobileViral.innerHTML = '<div class="mvd-empty">😿 Wah, radar meme kita lagi ngadat! Coba lagi nanti.</div>';
      els.mobileNew.innerHTML = '<div class="mvd-empty">😿 Wah, radar meme kita lagi ngadat! Coba lagi nanti.</div>';
      return [];
    }
  }

  function render(pairs) {
    const fresh = pairs.filter(isFresh).slice(0, NEW_LIMIT);
    const viral = pairs.filter(isViral).slice(0, VIRAL_LIMIT);

    els.viralCards.innerHTML = viral.length ? '' : '<div class="mvd-empty">😴 Belum ada meme viral!</div>';
    els.newCards.innerHTML = fresh.length ? '' : '<div class="mvd-empty">🍼 Belum ada meme baru!</div>';
    els.mobileViral.innerHTML = viral.length ? '' : '<div class="mvd-empty">😴 Belum ada meme viral!</div>';
    els.mobileNew.innerHTML = fresh.length ? '' : '<div class="mvd-empty">🍼 Belum ada meme baru!</div>';

    viral.forEach(p => {
      els.viralCards.appendChild(makeCard(p));
      els.mobileViral.appendChild(makeCard(p));
    });
    fresh.forEach(p => {
      els.newCards.appendChild(makeCard(p));
      els.mobileNew.appendChild(makeCard(p));
    });

    els.scanCount.textContent = pairs.filter(p => p.pairCreatedAt && Number(p.pairCreatedAt) >= Date.now() - 24 * 60 * 60 * 1000).length;
  }

  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      els.tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      els.mobileViral.style.display = tab.getAttribute('data-tab') === 'viral' ? 'block' : 'none';
      els.mobileNew.style.display = tab.getAttribute('data-tab') === 'new' ? 'block' : 'none';
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    setInterval(scan, POLL_MS);
  });

  async function scan() {
    els.loading.style.display = 'block';
    const tokens = await fetchTokens();
    render(tokens);
    els.loading.style.display = 'none';
  }
})();
