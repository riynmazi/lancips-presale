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
    const xLikes = p.xLikes || 0;
    const xMentions = p.xMentions || 0;
    const xRetweets = p.xRetweets || 0;
    const xEng = p.xEngagement || 0;
    const viralScore = p.memeScore || 0;
    const category = p.category || '—';

    const card = document.createElement('article');
    card.className = 'mvd-card';
    card.innerHTML = `
      <div class="mvd-card-header">
        <div class="mvd-title-wrap">
          <span class="mvd-pair">${symbol}</span>
          ${category === 'viral' ? '<span class="mvd-badge mvd-badge--hot">🔥 Viral</span>' : ''}
          ${category === 'new' ? '<span class="mvd-badge mvd-badge--new">🆕 New</span>' : ''}
          ${category === 'top24h' ? '<span class="mvd-badge mvd-badge--top">🚀 Top 24h</span>' : ''}
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
          <span class="mvd-metric-label">Meme Score</span>
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

    if (!tokens.length) {
      els.tokenGrid.innerHTML = `<div class="mvd-empty">😿 No tokens found</div>`;
      return;
    }

    tokens.forEach(t => els.tokenGrid.appendChild(makeCard(t)));
    els.scanCount.textContent = tokens.length;
  }

  /** Filtering **/
  function applyFilters() {
    const chain = els.chainFilter.value;
    const category = els.categoryFilter.value;
    const q = (els.searchInput.value || '').toLowerCase();

    let filtered = [...allTokens];

    if (chain !== 'all') {
      filtered = filtered.filter(t => (t.chain || '').toLowerCase() === chain);
    }

    if (category !== 'all') {
      filtered = filtered.filter(t => (t.category || '').toLowerCase() === category);
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
    } catch (err) {
      console.error('[MVD] Fetch error:', err);
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