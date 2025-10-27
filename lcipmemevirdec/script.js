(function () {
  if (window.__MVD_V2_ENABLED__) return;
  window.__MVD_V2_ENABLED__ = true;

  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';
  const POLL_MS = 60000; // refresh tiap 1 menit

  const els = {
    tokenGrid: document.getElementById('token-grid'),
    loading: document.getElementById('loading'),
    toast: document.getElementById('toast'),
    chainFilter: document.getElementById('filter-chain'),
    categoryFilter: document.getElementById('filter-category'),
    searchInput: document.getElementById('search-input'),
    scanCount: document.getElementById('scan-count'),
  };

  let allTokens = [];
  let activeChain = 'all';
  let activeCategory = 'all';
  let searchQuery = '';

  /** UTIL **/
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

  /** RENDER **/
  function makeCard(p) {
    const card = document.createElement('article');
    card.className = 'mvd-card';

    const symbol = p.symbol || '—';
    const name = p.name || '—';
    const liquidity = p.liquidityUsd || 0;
    const volume = p.volumeUsd || 0;
    const chain = (p.chain || '').toUpperCase();
    const logo = p.logoURI || `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}&background=random`;
    const pairUrl = p.pairUrl || '#';

    card.innerHTML = `
      <div class="mvd-card-header">
        <div class="mvd-card-header-left">
          <img src="${logo}" alt="${symbol}" class="mvd-token-icon" />
          <div>
            <div class="mvd-token-name">${name}</div>
            <div class="mvd-token-symbol">${symbol}</div>
          </div>
        </div>
        <div class="mvd-arrow">→</div>
      </div>

      <div class="mvd-metrics">
        <div>Liquidity <span>${formatUSD(liquidity)}</span></div>
        <div>Volume <span>${formatUSD(volume)}</span></div>
      </div>

      <div class="mvd-footer">
        <a href="${pairUrl}" target="_blank" rel="noopener">View on DexScreener</a>
      </div>
    `;
    return card;
  }

  /** FILTER LOGIC **/
  function applyFilters() {
    let filtered = [...allTokens];

    if (activeChain !== 'all') {
      filtered = filtered.filter(t => t.chain === activeChain);
    }

    if (activeCategory === 'viral') {
      filtered = filtered.sort((a, b) => b.xEngagement - a.xEngagement);
    } else if (activeCategory === 'top24h') {
      filtered = filtered.sort((a, b) => b.volumeUsd - a.volumeUsd);
    } else if (activeCategory === 'new') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.symbol?.toLowerCase().includes(q) ||
          t.name?.toLowerCase().includes(q) ||
          t.address?.toLowerCase().includes(q)
      );
    }

    renderTokens(filtered);
  }

  function renderTokens(tokens) {
    els.tokenGrid.innerHTML = '';
    if (!tokens || !tokens.length) {
      els.tokenGrid.innerHTML = `<div class="mvd-empty">😿 No tokens found</div>`;
      return;
    }

    tokens.forEach(t => els.tokenGrid.appendChild(makeCard(t)));
    if (els.scanCount) els.scanCount.textContent = tokens.length;
  }

  /** FETCH **/
  async function fetchTokens() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const tokens = Array.isArray(data) ? data : data.tokens || [];
      console.log('[MVD] Tokens fetched:', tokens.length, tokens);
      return tokens;
    } catch (err) {
      console.error('[MVD] Fetch error:', err);
      els.tokenGrid.innerHTML = `<div class="mvd-empty">⚠️ Failed to fetch tokens</div>`;
      return [];
    }
  }

  async function scan() {
    els.loading?.classList.remove('hidden');
    allTokens = await fetchTokens();
    applyFilters();
    els.loading?.classList.add('hidden');

    if (allTokens.length && els.toast) {
      els.toast.classList.remove('hidden');
      setTimeout(() => els.toast.classList.add('hidden'), 2500);
    }
  }

  /** EVENTS **/
  if (els.chainFilter) {
    els.chainFilter.addEventListener('change', e => {
      activeChain = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  if (els.categoryFilter) {
    els.categoryFilter.addEventListener('change', e => {
      activeCategory = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  if (els.searchInput) {
    els.searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim();
      applyFilters();
    });
  }

  /** INIT **/
  document.addEventListener('DOMContentLoaded', () => {
    scan();
    setInterval(scan, POLL_MS);
  });
})();