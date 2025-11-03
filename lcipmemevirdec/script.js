(function () {

  if (window.MVD_V2_ENABLED) return;
  window.MVD_V2_ENABLED = true;

  const POLL_MS = 60000; // refresh tiap 1 menit
  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';
  const TOKENS_PER_PAGE = 9;

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
  let filteredTokens = [];
  let activeChain = 'all';
  let activeCategory = 'all';
  let searchQuery = '';
  let currentPage = 1;

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
    if (el) el.textContent = value ?? "—";
  };

  // === Data utama ===
  setText("#detail-name", token.name || "—");
  setText("#detail-symbol", token.symbol || "—");
  setText("#detail-network", token.chain || "—");
  setText("#detail-liquidity-info", formatUSD(token.liquidityUsd));
  setText("#detail-vol24-info", formatUSD(token.volumeUsd));
  setText("#detail-price", "$" + (token.priceUsd?.toFixed(6) || "0.000000"));
  setText("#detail-hype", "🔥 " + Math.round(token.memeScore || 0) + "%");

  // === 🆕 Data sosial (X/Twitter) ===
  setText("#detail-xmentions", formatNumber(token.xMentions));
  setText("#detail-xlikes", formatNumber(token.xLikes));
  setText("#detail-xretweets", formatNumber(token.xRetweets));
  setText("#detail-xengagement", formatNumber(token.xEngagement));

  // === 🆕 Data Reddit ===
  setText("#detail-reddit-posts", formatNumber(token.redditPostsCount));
  setText("#detail-reddit-comments", formatNumber(token.redditTotalComments));
  setText("#detail-reddit-ups", formatNumber(token.redditTotalUps));
  setText("#detail-reddit-engagement", formatNumber(token.redditEngagement));

  // === 🆕 Total Score ===
  setText("#detail-score", token.memeScore ? token.memeScore.toFixed(1) + " / 1000" : "—");

  // === Tombol aksi ===
  function openBirdeye(token) {
    if (!token || !token.address) return;
    const chainPath =
      token.chain?.toLowerCase() === "solana"
        ? "solana"
        : token.chain?.toLowerCase() === "bsc"
        ? "bsc"
        : "unknown";
    window.open(`https://birdeye.so/${chainPath}/token/${token.address}`, "_blank");
  }

  const [buyBtn, chartBtn] = panel.querySelectorAll(".detail-buttons button:nth-child(-n+2)");
  if (buyBtn) buyBtn.onclick = () => openBirdeye(token);
  if (chartBtn) chartBtn.onclick = () => openBirdeye(token);

  const copyBtn = panel.querySelector(".detail-buttons button:nth-child(3)");
  if (copyBtn && token.address) {
    copyBtn.onclick = () => {
      navigator.clipboard
        .writeText(token.address)
        .then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = original), 1500);
        })
        .catch((err) => console.error("Copy failed:", err));
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
      navigator.clipboard
        .writeText(token.address)
        .then(() => {
          icon.textContent = "✅";
          setTimeout(() => (icon.textContent = "📋"), 1500);
        })
        .catch((err) => console.error("Copy failed:", err));
    };

    addrContainer.appendChild(icon);

    const maxLen = 18;
    if (token.address.length > maxLen) {
      if (addrContainer.firstChild && addrContainer.firstChild.nodeType === Node.TEXT_NODE) {
        addrContainer.firstChild.textContent =
          token.address.slice(0, 8) + "..." + token.address.slice(-6);
      } else {
        addrContainer.textContent =
          token.address.slice(0, 8) + "..." + token.address.slice(-6);
        addrContainer.appendChild(icon);
      }
    }
  }

  const logoEl = panel.querySelector("#detail-logo");
  if (logoEl) {
    logoEl.src =
      token.logoURI ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(token.symbol)}&background=random`;
  }

  if (typeof window.renderTrendChart === "function") {
    window.renderTrendChart(token);
  }

  if (typeof window.initTrendSwiper === "function") {
    setTimeout(() => window.initTrendSwiper(), 300); // kasih jeda biar chart ready
  }

  panel.classList.add("open");
};

window.closeDetailPanel = function () {
  const panel = document.getElementById("detail-panel");
  if (panel) panel.classList.remove("open");
};

// === 🧩 Helper Functions ===
function formatNumber(num) {
  if (num === null || num === undefined) return "—";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}



  /** RENDER **/
function makeCard(p, i) {
  const card = document.createElement('article');
  card.className = 'mvd-card';
  const symbol = p.symbol || '—';
  const name = p.name || '—';
  const liquidity = p.liquidityUsd || 0;
  const volume = p.volumeUsd || 0;
  const logo = p.logoURI || `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}&background=random`;

  // TAMBAH: Reddit data
  const redditEngagement = p.redditEngagement || 0;
  const redditQueryUrl = p.redditQueryUrl || null;

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
  <div>
    🔥 
    <span style="color: ${Math.round(p.memeScore || 0) >= 500 ? 'green' : 'red'};">
      ${Math.round(p.memeScore || 0)} / 1000
    </span>
  </div>
  <div>Volume <span>${formatUSD(volume)}</span></div>
</div>



      <!-- TAMBAH REDDIT BUZZ -->
      <div class="mvd-reddit-buzz">
  <img src="reddit.png" alt="Reddit" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;" />
  <span>${redditEngagement.toLocaleString()}</span>
  ${redditQueryUrl ? `
    <a href="${redditQueryUrl}" target="_blank" class="mvd-reddit-link" onclick="event.stopPropagation()">
      verify
    </a>
  ` : ''}
</div>

    </div>
  `;

  card.addEventListener('click', () => window.openDetailPanel(i));
  const arrow = card.querySelector('.mvd-arrow');
  if (arrow) arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    window.openDetailPanel(i);
  });

  return card;
}

  function renderTokens(tokensToShow) {
  if (!els.tokenGrid) return;
  els.tokenGrid.innerHTML = '';

  if (!tokensToShow || !tokensToShow.length) {
    els.tokenGrid.innerHTML = `<div class="mvd-empty">😿 No tokens found</div>`;
    if (els.scanCount) els.scanCount.textContent = '0';
    return;
  }

  tokensToShow.forEach((t) => {
    const globalIndex = filteredTokens.indexOf(t); // posisi token asli di filteredTokens
    els.tokenGrid.appendChild(makeCard(t, globalIndex));
  });

  if (els.scanCount) els.scanCount.textContent = filteredTokens.length;
}



  /** PAGINATION **/
  function renderPaginatedTokens() {
    const start = (currentPage - 1) * TOKENS_PER_PAGE;
    const end = start + TOKENS_PER_PAGE;
    const tokensToShow = filteredTokens.slice(start, end);
    renderTokens(tokensToShow);

    const pageInfo = document.getElementById("page-info");
    if (pageInfo) {
      pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filteredTokens.length / TOKENS_PER_PAGE)}`;
    }

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = end >= filteredTokens.length;
  }

  function setupPaginationButtons() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderPaginatedTokens();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage * TOKENS_PER_PAGE < filteredTokens.length) {
          currentPage++;
          renderPaginatedTokens();
        }
      });
    }
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

    filteredTokens = filtered;
    currentPage = 1;
    renderPaginatedTokens();
    renderViralTop(filtered);
  }

  /** RENDER VIRAL TOP **/
  function renderViralTop(tokens) {
    if (!els.viralTop) return;
    els.viralTop.innerHTML = '';

    if (!tokens || !tokens.length) {
      els.viralTop.innerHTML = `<div class="viral-empty">—</div>`;
      return;
    }

    const sorted = [...tokens].sort((a, b) => (b.memeScore || 0) - (a.memeScore || 0));
    const top3 = sorted.slice(0, 3);

    top3.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'viral-top-card';
      div.innerHTML = `
  <span class="viral-rank">${i + 1}.</span>
  <strong class="viral-symbol">
    ${t.symbol || '—'}
    <span class="viral-chart" style="--w:${Math.min(Math.round(t.memeScore || 0),100)}"></span>
    <span class="viral-hype">🔥 ${Math.round(t.memeScore || 0)}/1000</span>
  </strong>
`;
console.log('Render viral:', t.symbol, t.memeScore);

      div.style.cursor = 'pointer';
      div.onclick = () => {
        const idx = allTokens.indexOf(t);
        if (idx !== -1) window.openDetailPanel(idx);
      };
      els.viralTop.appendChild(div);
    });
  }

  /** FETCH **/
  async function fetchTokens() {
    if (els.loading) els.loading.classList.remove('hidden');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      allTokens = Array.isArray(data.tokens) ? data.tokens : [];
      applyFilters();
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
    setupPaginationButtons();

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
