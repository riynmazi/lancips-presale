(function () {
  if (window.__MVD_V2_ENABLED__) return;
  window.__MVD_V2_ENABLED__ = true;

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

  // ===== Dummy 12 Token =====
  window.allTokens = Array.from({ length: 12 }, (_, i) => ({
    symbol: `MEME${i + 1}`,
    name: `Meme Token ${i + 1}`,
    liquidityUsd: Math.floor(Math.random() * 200000 + 50000),
    volumeUsd: Math.floor(Math.random() * 100000 + 10000),
    chain: i % 2 === 0 ? 'ETH' : 'SOL',
    logoURI: '',
    pairUrl: '#',
    createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    xEngagement: Math.floor(Math.random() * 100),
    address: `0x${Math.random().toString(16).slice(2, 10)}`,
    mentions: Math.floor(Math.random() * 9000),
    likes: Math.floor(Math.random() * 5000),
    retweets: Math.floor(Math.random() * 3000),
  }));

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

  /** DETAIL PANEL **/
  window.openDetailPanel = function (index) {
    const panel = document.getElementById("detail-panel");
    if (!panel) return;

    const token = window.allTokens[index];
    if (!token) return;

    const setText = (selector, value) => {
      const el = panel.querySelector(selector);
      if (el) el.textContent = value;
    };

    setText("#detail-name", token.name || "—");
    setText("#detail-symbol", token.symbol || "—");
    setText("#detail-network", token.chain || "—");
    setText("#detail-liquidity", formatUSD(token.liquidityUsd));
    setText("#detail-vol24", formatUSD(token.volumeUsd));
    setText("#detail-address", token.address || "—");
    setText("#detail-mentions", token.mentions);
    setText("#detail-likes", token.likes);
    setText("#detail-retweets", token.retweets);
    setText("#detail-score", `${token.xEngagement}/100`);

    const logoEl = panel.querySelector("#detail-logo");
    if (logoEl) {
      logoEl.src = token.logoURI || `https://ui-avatars.com/api/?name=${encodeURIComponent(token.symbol)}&background=random`;
    }

    panel.classList.add("open");
  };

  window.closeDetailPanel = function () {
    const panel = document.getElementById("detail-panel");
    if (panel) panel.classList.remove("open");
  };

  /** RENDER **/
  function makeCard(p, i) {
    const card = document.createElement('article');
    card.className = 'mvd-card';

    const symbol = p.symbol || '—';
    const name = p.name || '—';
    const liquidity = p.liquidityUsd || 0;
    const volume = p.volumeUsd || 0;
    const logo = p.logoURI || `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}&background=random`;

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
        <a href="${p.pairUrl}" target="_blank" rel="noopener">View on DexScreener</a>
      </div>
    `;

    // Event listener arrow
    const arrow = card.querySelector('.mvd-arrow');
    if (arrow) {
      arrow.addEventListener('click', () => window.openDetailPanel(i));
    }

    return card;
  }

  /** FILTER **/
  function applyFilters() {
    let filtered = [...window.allTokens];

    if (activeChain !== 'all') {
      filtered = filtered.filter(t => t.chain.toLowerCase() === activeChain);
    }

    if (activeCategory === 'viral') {
      filtered.sort((a, b) => b.xEngagement - a.xEngagement);
    } else if (activeCategory === 'top24h') {
      filtered.sort((a, b) => b.volumeUsd - a.volumeUsd);
    } else if (activeCategory === 'new') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    tokens.forEach((t, i) => els.tokenGrid.appendChild(makeCard(t, i)));
    if (els.scanCount) els.scanCount.textContent = tokens.length;
  }

  /** INIT **/
  document.addEventListener('DOMContentLoaded', () => {
    applyFilters();
    setInterval(applyFilters, POLL_MS);

    if (els.chainFilter) els.chainFilter.addEventListener('change', e => { activeChain = e.target.value; applyFilters(); });
    if (els.categoryFilter) els.categoryFilter.addEventListener('change', e => { activeCategory = e.target.value; applyFilters(); });
    if (els.searchInput) els.searchInput.addEventListener('input', e => { searchQuery = e.target.value; applyFilters(); });

    // Tombol close panel
    const closeBtn = document.getElementById('detail-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => window.closeDetailPanel());
  });
})();
