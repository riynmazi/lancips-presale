(function () {

  if (window.MVD_V2_ENABLED) return;
  window.MVD_V2_ENABLED = true;

  const POLL_MS = 60000; // refresh tiap 1 menit
  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';

  const els = {
    tokenGrid: document.getElementById('token-grid'),
    loading: document.getElementById('loading'),
    toast: document.getElementById('toast'),
    chainFilter: document.getElementById('filter-chain'),
    categoryFilter: document.getElementById('filter-category'),
    searchInput: document.getElementById('search-input'),
    scanCount: document.getElementById('scan-count'),
    viralTop: document.getElementById('viral-top'),
  };

  let allTokens = [];
  let activeChain = 'all';
  let activeCategory = 'all';
  let searchQuery = '';

  /** UTIL **/
  function formatUSD(n) {
    const num = Number(n || 0);
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
  }

  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  function copyToClipboardWithToast(el, text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const original = el.textContent;
      el.textContent = "Copied!";
      setTimeout(() => { el.textContent = original; }, 1500);
    }).catch(err => {
      console.error("Copy failed:", err);
    });
  }

  /** DETAIL PANEL **/
  window.openDetailPanel = function (index) {
    const panel = document.getElementById("detail-panel");
    if (!panel || !allTokens[index]) return;
    const token = allTokens[index];
    const setText = (selector, value) => {
      const el = panel.querySelector(selector);
      if (el) el.textContent = value;
    };
    setText("#detail-name", token.name || "—");
    setText("#detail-symbol", token.symbol || "—");
    setText("#detail-network", token.chain || "—");
    setText("#detail-liquidity", formatUSD(token.liquidityUsd));
    setText("#detail-vol24", formatUSD(token.volumeUsd));
    setText("#detail-price", '$' + (token.priceUsd?.toFixed(6) || '0.000000'));
    setText("#detail-hype", '🔥 ' + Math.round(token.memeScore || 0) + '%');

    function openBirdeye(token) {
      if (!token || !token.address) return;
      const chainPath = token.chain?.toLowerCase() === "solana" ? "solana"
        : token.chain?.toLowerCase() === "bsc" ? "bsc"
        : "unknown";
      window.open(`https://birdeye.so/${chainPath}/token/${token.address}`, "_blank");
    }

    const [buyBtn, chartBtn] = panel.querySelectorAll(".detail-buttons button:nth-child(-n+2)");
    if (buyBtn) buyBtn.onclick = () => openBirdeye(token);
    if (chartBtn) chartBtn.onclick = () => openBirdeye(token);

    const copyBtn = panel.querySelector(".detail-buttons button:nth-child(3)");
    if (copyBtn && token.address) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(token.address).then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copied!";
          setTimeout(() => copyBtn.textContent = original, 1500);
        }).catch(err => console.error("Copy failed:", err));
      };
    }

    const addrContainer = panel.querySelector("#detail-address");
    if (addrContainer && token.address) {
      addrContainer.textContent = token.address;
      const existingIcon = addrContainer.querySelector(".copy-icon");
      if (existingIcon) existingIcon.remove();

      const icon = document.createElement("span");
      icon.className = "copy-icon";
      icon.style.cursor = "pointer";
      icon.style.marginLeft = "6px";
      icon.textContent = "📋";
      icon.title = "Copy address";

      icon.onclick = () => {
        navigator.clipboard.writeText(token.address).then(() => {
          icon.textContent = "✅";
          setTimeout(() => icon.textContent = "📋", 1500);
        }).catch(err => console.error("Copy failed:", err));
      };

      addrContainer.appendChild(icon);

      const maxLen = 18;
      if (token.address.length > maxLen) {
        // firstChild might be a text node depending on DOM; be defensive
        if (addrContainer.firstChild && addrContainer.firstChild.nodeType === Node.TEXT_NODE) {
          addrContainer.firstChild.textContent = token.address.slice(0, 8) + "..." + token.address.slice(-6);
        } else {
          addrContainer.textContent = token.address.slice(0, 8) + "..." + token.address.slice(-6);
          addrContainer.appendChild(icon);
        }
      }
    }

    const logoEl = panel.querySelector("#detail-logo");
    if (logoEl) {
      logoEl.src = token.logoURI || `https://ui-avatars.com/api/?name=${encodeURIComponent(token.symbol)}&background=random`;
    }

    if (typeof window.renderTrendChart === "function") {
      window.renderTrendChart(token);
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
        </div>
        <div class="mvd-card-header-right">
          <div class="mvd-token-name">${name}</div>
          <div class="mvd-token-symbol">${symbol}</div>
        </div>
        <div class="mvd-arrow">→</div>
      </div>

      <div class="mvd-metrics">
        <div>Liquidity <span>${formatUSD(liquidity)}</span></div>
        <div>Volume <span>${formatUSD(volume)}</span></div>
      </div>
    `;

    const addrEl = card.querySelector('.mvd-token-address');
    if (addrEl && p.address) {
      addrEl.style.cursor = "pointer";
      addrEl.title = "Click to copy";
      addrEl.addEventListener('click', () => copyToClipboardWithToast(addrEl, p.address));
    }

    const arrow = card.querySelector('.mvd-arrow');
    if (arrow) arrow.addEventListener('click', () => window.openDetailPanel(i));

    return card;
  }

  /** RENDER VIRAL TOP 3 **/
  function renderViralTop(tokens) {
    if (!els.viralTop) return;
    els.viralTop.innerHTML = '';

    if (!tokens || !tokens.length) {
      els.viralTop.innerHTML = `<div class="viral-empty">—</div>`;
      return;
    }

    // If tokens passed are not sorted by memeScore, sort a copy by memeScore desc
    const sorted = [...tokens].sort((a, b) => (b.memeScore || 0) - (a.memeScore || 0));
    const top3 = sorted.slice(0, 3);

    top3.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'viral-top-card';
      div.innerHTML = `<span class="viral-rank">${i + 1}.</span> <strong class="viral-symbol">${t.symbol || '—'}</strong> <span class="viral-hype">- 🔥 ${Math.round(t.memeScore || 0)}%</span>`;
      div.style.cursor = 'pointer';
      div.onclick = () => {
        // open detail for the token: find its index in allTokens (original source)
        const idx = allTokens.indexOf(t);
        if (idx !== -1) window.openDetailPanel(idx);
      };
      els.viralTop.appendChild(div);
    });
  }

  /** FILTER **/
  function applyFilters() {
    let filtered = [...allTokens];

    if (activeChain !== 'all') {
      filtered = filtered.filter(t => (t.chain || '').toLowerCase() === activeChain);
    }

    if (activeCategory === 'viral') {
      filtered.sort((a, b) => (b.xEngagement || 0) - (a.xEngagement || 0));
    } else if (activeCategory === 'top24h') {
      filtered.sort((a, b) => (b.volumeUsd || 0) - (a.volumeUsd || 0));
    } else if (activeCategory === 'new') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => (t.symbol || '').toLowerCase().includes(q) ||
             (t.name || '').toLowerCase().includes(q) ||
             (t.address || '').toLowerCase().includes(q)
      );
    }

    renderTokens(filtered);

    // update Viral Top based on currently filtered list (so it matches filters/search)
    // If you prefer always showing global top, change to renderViralTop(allTokens)
    renderViralTop(filtered);
  }

  function renderTokens(tokens) {
    if (!els.tokenGrid) return;
    els.tokenGrid.innerHTML = '';

    if (!tokens || !tokens.length) {
      els.tokenGrid.innerHTML = `<div class="mvd-empty">😿 No tokens found</div>`;
      if (els.scanCount) els.scanCount.textContent = '0';
      return;
    }

    tokens.forEach((t, i) => els.tokenGrid.appendChild(makeCard(t, i)));

    if (els.scanCount) els.scanCount.textContent = tokens.length;
  }

  /** FETCH DATA **/
  async function fetchTokens() {
    if (els.loading) els.loading.classList.remove('hidden');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      allTokens = Array.isArray(data.tokens) ? data.tokens : [];

      applyFilters();

      // Tambahan: pastikan Viral Top juga diupdate dengan data terbaru (global)
      // Jika kamu mau Viral Top selalu berdasarkan seluruh dataset (bukan filter),
      // gunakan renderViralTop(allTokens) di sini. Saat ini applyFilters() sudah memanggil renderViralTop(filtered).
      // Untuk safety, kita panggil juga renderViralTop(allTokens) setelah fetch agar jika applyFilters belum ter-trigger,
      // viral tetap tampil.
      renderViralTop(allTokens);

      const topToken = allTokens[0];
      if (topToken && typeof window.renderTrendChart === 'function') {
        window.renderTrendChart(topToken);
      }
    } catch (err) {
      console.error("❌ Fetch tokens error:", err);
    } finally {
      if (els.loading) els.loading.classList.add('hidden');
    }
  }

  /** INIT **/
  document.addEventListener('DOMContentLoaded', () => {
    fetchTokens();
    setInterval(fetchTokens, POLL_MS);

    if (els.chainFilter) {
      els.chainFilter.addEventListener('change', e => {
        activeChain = e.target.value;
        applyFilters();
      });
    }

    if (els.categoryFilter) {
      els.categoryFilter.addEventListener('change', e => {
        activeCategory = e.target.value;
        applyFilters();
      });
    }

    if (els.searchInput) {
      els.searchInput.addEventListener('input', e => {
        searchQuery = e.target.value;
        applyFilters();
      });
    }

    const closeBtn = document.getElementById('detail-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => window.closeDetailPanel());
  });

})();