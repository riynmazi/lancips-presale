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

setText("#detail-address", token.address || "—");

// ⚡ Update sesuai backend

setText("#detail-mentions", token.xMentions || 0);

setText("#detail-likes", token.xLikes || 0);

setText("#detail-retweets", token.xRetweets || 0);

setText("#detail-score", ${token.xEngagement}/100);

const logoEl = panel.querySelector("#detail-logo");

if (logoEl) {

logoEl.src = token.logoURI || `https://ui-avatars.com/api/?name=${encodeURIComponent(token.symbol)}&background=random`;

}

// 🔥 Update chart sesuai token yang dibuka

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



  <div class="mvd-footer">

    <a href="${p.pairUrl}" target="_blank" rel="noopener">View on DexScreener</a>

  </div>

`;



const arrow = card.querySelector('.mvd-arrow');

if (arrow) arrow.addEventListener('click', () => window.openDetailPanel(i));



return card;

}

/** FILTER **/

function applyFilters() {

let filtered = [...allTokens];



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

/** FETCH DATA **/

async function fetchTokens() {

if (els.loading) els.loading.classList.remove('hidden');



try {

  const res = await fetch(API_URL);

  const data = await res.json();

  allTokens = Array.isArray(data.tokens) ? data.tokens : [];



  // 🧠 Langsung apply filter dan render tampilan utama

  applyFilters();



  // 🔥 Render chart pakai token paling atas (misal token paling viral)

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

if (closeBtn) {

  closeBtn.addEventListener('click', () => window.closeDetailPanel());

}

});

})();