(function () {
  if (window.__MVD_V2_ENABLED__) return;
  window.__MVD_V2_ENABLED__ = true;

  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';
  const POLL_MS = 60000;
  const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

  const els = {
    chainFilter: document.getElementById('filter-chain'),
    categoryFilter: document.getElementById('filter-category'),
    searchInput: document.getElementById('search-input'),
    tokenGrid: document.getElementById('token-grid'),
    scanCount: document.getElementById('scan-count'),
    loading: document.getElementById('loading'),
    toast: document.getElementById('toast'),
  };

  let allTokens = [];

  /** Utils **/
  function formatUSD(n) {
    const num = Number(n || 0);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  }

  function formatTimeAgo(ts) {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.max(1, Math.floor(diff / (60 * 1000)));
    if (m >= 1440) return `${Math.floor(m / 1440)}d ago`;
    if (m >= 60) return `${Math.floor(m / 60)}h ago`;
    return `${m}m ago`;
  }

  function isMemeLike(symbol, name) {
    const kws = ['pepe', 'dog', 'doge', 'shib', 'inu', 'cat', 'elon', 'meme', 'moon', 'pump', 'wojak', 'floki', 'bonk'];
    return kws.some(k => (symbol || '').toLowerCase().includes(k) || (name || '').toLowerCase().includes(k));
  }

  function isViral(p) {
    const vol = Number(p.volumeUsd || 0);
    const liq = Number(p.liquidityUsd || 0);
    const viralScore = Number(p.viralScore || 0);
    const xEng = Number(p.xEngagement || p.x?.engagement || 0);
    return isMemeLike(p.symbol, p.name) && (liq > 30000 || vol > 100000) && (viralScore > 15 || xEng > 20);
  }

  function isFresh(p) {
    const c = new Date(p.createdAt || 0).getTime();
    return c && Date.now() - c < FRESH_WINDOW_MS;
  }

  /** Render **/
  function makeCard(p) {
    const chain = p.chain || 'unknown';
    const symbol = p.symbol || '—';
    const name = p.name || '—';
    const price = p.priceUsd ? Number(p.priceUsd).toFixed(6) : '—';
    const liquidity = p.liquidityUsd || 0;
    const volume = p.volumeUsd || 0;
    const createdAgo = formatTimeAgo(p.createdAt);
    const xLikes = p.xLikes || p.x?.likes || 0;
    const xMentions = p.xMentions || p.x?.mentions || 0;
    const xRetweets = p.xRetweets || p.x?.retweets || 0;
    const xEng = p.xEngagement || p.x?.engagement || 0;
    const viralScore = p.viralScore || 0;
    const category = p.category || '—';

    const card = document.createElement('article');
    card.className = 'mvd-card';
    card.innerHTML = `
      <div class="mvd-card-header">
        <div class="mvd-title-wrap">
          <span class="mvd-pair">${symbol}</span>
          ${isViral(p) ? '<span class="mvd-badge mvd-badge--hot">🔥 HOT</span>' : ''}
          ${category === 'meme' ? '<span class="mvd-badge mvd-badge--meme">😂 Meme</span>' : ''}
        </div>
        <span class="mvd-badge mvd-badge--chain">${chain.toUpperCase()}</span>
      </div>

      <div class="mvd-info">
        <span class="mvd-info-label">Name</span>
        <span class="mvd-info-value">${name}</span>
        <span class="mvd-info-label">Address</span>
        <span class="mvd-info-value mvd-info-address">${p.address || '—'}</span>
      </div>

      <div class="mvd-metrics">
        <div class="mvd-metric">
          <span class="mvd-metric-label">Price</span>
          <span class="mvd-metric-value">${price !== '—' ? `$${price}` : '—'}</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Liquidity</span>
          <span class="mvd-metric-value">${formatUSD(liquidity)}</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Volume 24h</span>
          <span class="mvd-metric-value">${formatUSD(volume)}</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Viral Score</span>
          <span class="mvd-metric-value ${viralScore > 15 ? 'mvd-metric-up' : ''}">${viralScore}</span>
        </div>
      </div>

      <div class="mvd-social">
        <div class="mvd-metric"><span class="mvd-metric-label">❤️ Likes</span><span class="mvd-metric-value">${xLikes}</span></div>
        <div class="mvd-metric"><span class="mvd-metric-label">💬 Mentions</span><span class="mvd-metric-value">${xMentions}</span></div>
        <div class="mvd-metric"><span class="mvd-metric-label">🔄 Retweets</span><span class="mvd-metric-value">${xRetweets}</span></div>
        <div class="mvd-metric"><span class="mvd-metric-label">📈 Engagement</span><span class="mvd-metric-value">${xEng}</span></div>
      </div>

      <div class="mvd-footer">
        <div class="mvd-chips">
          <span class="mvd-chip">💰 ${formatUSD(volume)}</span>
          <span class="mvd-chip">💧 ${formatUSD(liquidity)}</span>
          <span class="mvd-chip">🕒 ${createdAgo}</span>
        </div>
        <a class="mvd-view" href="${p.pairUrl || '#'}" target="_blank" rel="noopener">🔗 View</a>
      </div>
    `;
    return card;
  }

  function renderTokens(tokens) {
    els.tokenGrid.innerHTML = '';

    if (tokens.length === 0) {
      els.tokenGrid.innerHTML = `<div class="mvd-empty">😿 No tokens match your filters</div>`;
      return;
    }

    tokens.forEach(t => els.tokenGrid.appendChild(makeCard(t)));

    els.scanCount.textContent = tokens.length;
  }

  /** Filtering Logic **/
  function applyFilters() {
    const chain = els.chainFilter.value;
    const category = els.categoryFilter.value;
    const q = (els.searchInput.value || '').toLowerCase();

    let filtered = [...allTokens];

    if (chain !== 'all') {
      filtered = filtered.filter(t => (t.chain || '').toLowerCase() === chain);
    }

    if (category === 'viral') {
      filtered = filtered.filter(isViral);
    } else if (category === 'new') {
      filtered = filtered.filter(isFresh);
    } else if (category === 'top24h') {
      filtered = filtered.sort((a, b) => Number(b.volumeUsd) - Number(a.volumeUsd));
    }

    if (q) {
      filtered = filtered.filter(
        t =>
          (t.symbol || '').toLowerCase().includes(q) ||
          (t.name || '').toLowerCase().includes(q)
      );
    }

    renderTokens(filtered);
  }

  /** Fetch **/
  async function fetchTokens() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      return Array.isArray(data) ? data : data.tokens || [];
    } catch (e) {
      console.error('[MVD] Fetch error:', e);
      els.tokenGrid.innerHTML = `<div class="mvd-empty">⚠️ Failed to fetch tokens</div>`;
      return [];
    }
  }

  async function scan() {
    els.loading.classList.remove('hidden');
    allTokens = await fetchTokens();
    applyFilters();
    els.loading.classList.add('hidden');

    if (allTokens.length && els.toast) {
      els.toast.classList.remove('hidden');
      setTimeout(() => els.toast.classList.add('hidden'), 2500);
    }
  }

  /** Listeners **/
  els.chainFilter.addEventListener('change', applyFilters);
  els.categoryFilter.addEventListener('change', applyFilters);
  els.searchInput.addEventListener('input', applyFilters);

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    setInterval(scan, POLL_MS);
  });
})();