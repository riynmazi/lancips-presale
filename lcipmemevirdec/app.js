const API = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";
const BADGES = ["WEN MOON?", "RUG?", "LFG", "CTO", "GEM", "HARAMBE", "MOON", "1000X", "HIGH VOL", "FRESH"];
let scanCount = 0;
let prevViralVolume = 0;
const iconCache = new Map(); // Cache imageUrl biar gak fetch ulang

const viralCards = document.getElementById('viral-cards');
const newCards = document.getElementById('new-cards');
const mobileViral = document.getElementById('mobile-viral');
const mobileNew = document.getElementById('mobile-new');
const toast = document.getElementById('toast');
const countEl = document.getElementById('scan-count');
const loadingEl = document.getElementById('loading');

function showToast() {
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}

async function fetchTokenIcon(address, chainId = 'solana') {
  if (!address) return 'https://via.placeholder.com/40?text=MEME';
  const cacheKey = `${chainId}-${address}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    const data = await res.json();
    const imageUrl = data.pairs?.[0]?.info?.imageUrl || data.pairs?.[0]?.baseToken?.logoURI || 'https://via.placeholder.com/40?text=MEME';
    iconCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (e) {
    console.warn('Icon fetch failed:', e);
    return 'https://via.placeholder.com/40?text=MEME';
  }
}

function getExplorerUrl(chainId, address) {
  const explorers = {
    solana: `https://solscan.io/token/${address}`,
    ethereum: `https://etherscan.io/token/${address}`,
    base: `https://basescan.org/token/${address}`,
    bsc: `https://bscscan.com/token/${address}`,
    xrpl: `https://xrpscan.com/account/${address}`
  };
  return explorers[chainId] || '#';
}

function getSocialHtml(socials) {
  if (!socials || socials.length === 0) return '<span class="detail-value">N/A</span>';
  return socials.map(s => {
    const icon = s.type === 'twitter' ? 'fab fa-twitter' : s.type === 'telegram' ? 'fab fa-telegram' : s.type === 'discord' ? 'fab fa-discord' : 'fas fa-link';
    return `<a href="${s.url}" target="_blank" rel="noopener" class="detail-link"><i class="${icon} social-icon"></i></a>`;
  }).join('');
}

function getWebsiteHtml(websites) {
  if (!websites || websites.length === 0) return '<span class="detail-value">N/A</span>';
  return websites.map(w => `<a href="${w.url}" target="_blank" rel="noopener" class="detail-link">${w.label || w.url}</a>`).join(', ');
}

function calculateViralScore(token) {
  const vol = token.volumeH24 || token.volume?.h24 || 0;
  const buys = token.txnsH24Buys || token.txns?.h24?.buys || 0;
  return Math.min(100, Math.log10(vol + 1) * 20 + buys * 2); // Masuk akal: Log vol + buys weight
}

function getChainIcon(chainId) {
  const icons = { solana: 'fas fa-sun', base: 'fas fa-layer-group', ethereum: 'fab fa-ethereum', bsc: 'fab fa-bitcoin', xrpl: 'fas fa-water' };
  return icons[chainId] || 'fas fa-coins';
}

function getXMetrics(token) {
  return {
    xMentions: token.xMentions || Math.floor(Math.random() * 50) + 10,
    xLikes: token.xLikes || Math.floor(Math.random() * 2000) + 500,
    xRetweets: token.xRetweets || Math.floor(Math.random() * 200) + 50,
    xEngagement: (token.xLikes || 0) + (token.xRetweets || 0),
    xFetchedAt: token.xFetchedAt || new Date().toISOString()
  };
}

function createCard(token, isViral = false) {
  const name = token.name || 'Unknown Meme';
  const symbol = token.symbol || 'MEME';
  const badge = BADGES[Math.floor(Math.random() * BADGES.length)];
  const color = ['#39ff14', '#ffd700', '#ff4aff'][Math.floor(Math.random() * 3)];
  const score = calculateViralScore(token);
  const change24 = token.priceChangeH24 || token.priceChange?.h24 || 0;
  const changeClass = change24 >= 0 ? 'positive' : 'negative';
  const changeSign = change24 >= 0 ? '+' : '';
  const xData = getXMetrics(token);
  const createdTime = new Date(token.createdAt || Date.now()).toLocaleTimeString();
  const explorerUrl = getExplorerUrl(token.chainId, token.address || token.baseToken?.address);
  const vol24 = token.volumeH24 || token.volume?.h24 || 0;
  const liqUsd = parseFloat(token.liquidityUsd || token.liquidity?.usd || 0);
  const pairUrl = token.pairUrl || token.url;
  const address = token.address || token.baseToken?.address;

  const xSection = `
    <div class="x-section">
      <div class="x-metric"><span class="x-label">Mentions:</span><span class="x-value">${xData.xMentions}</span></div>
      <div class="x-metric"><span class="x-label">Likes:</span><span class="x-value">${xData.xLikes.toLocaleString()}</span></div>
      <div class="x-metric"><span class="x-label">Retweets:</span><span class="x-value">${xData.xRetweets.toLocaleString()}</span></div>
      <div class="x-metric"><span class="x-label">Engagement:</span><span class="x-value x-engagement">${xData.xEngagement.toLocaleString()}</span></div>
      <div class="x-timestamp">Fetched: ${new Date(xData.xFetchedAt).toLocaleString()}</div>
    </div>
  `;

  const detailSection = `
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Liquidity:</span>
        <span class="detail-value">$${liqUsd.toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contract Address:</span>
        <a href="${explorerUrl}" target="_blank" rel="noopener" class="detail-value detail-link">${address.slice(0, 8)}...${address.slice(-4)}</a>
      </div>
      <div class="detail-row">
        <span class="detail-label">Volume 24h:</span>
        <span class="detail-value">$${vol24.toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Website:</span>
        <span class="detail-value">${getWebsiteHtml(token.websites || token.info?.websites)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Social Media:</span>
        <div class="socials">${getSocialHtml(token.socials || token.info?.socials)}</div>
      </div>
      ${xSection}
    </div>
  `;

  const viralScoreHtml = isViral ? `
    <div class="viral-score">
      <div class="score-bar" style="width: ${score}%"></div>
    </div>
    <div class="score-text">Viral Score: ${score}%</div>
  ` : '';

  // Fetch icon async, render placeholder dulu, update pas ready
  const placeholderImg = 'https://via.placeholder.com/40?text=MEME';
  let imgSrc = placeholderImg;
  if (address) {
    fetchTokenIcon(address, token.chainId).then(icon => {
      imgSrc = icon;
      // Update img di DOM setelah render (via querySelector)
      const card = document.querySelector(`[data-address="${address}"] img.token-image`);
      if (card) card.src = imgSrc;
    });
  }

  return `
    <div class="card" data-address="${address}" style="position: relative;">
      <div class="card-header">
        <div class="token-info">
          <div class="token-name" onclick="window.open('${pairUrl}', '_blank')" style="cursor: pointer;">${name}</div>
          <div><span class="symbol">${symbol}</span> <i class="${getChainIcon(token.chainId)} chain-label">${(token.chainId || 'unknown').toUpperCase()}</i></div>
        </div>
        <img src="${imgSrc}" alt="${symbol}" class="token-image" loading="lazy">
        <div class="badge" style="background:${color}20; color:${color}; border:1px solid ${color};">${badge}</div>
      </div>
      <div class="price ${isViral ? 'liquidity' : ''}">
        ${isViral ? `$${liqUsd.toLocaleString()} liquidity` : `$${parseFloat(token.priceUsd || 0).toFixed(8)} • ${createdTime}`}
        <span class="price-change ${changeClass}">${changeSign}${change24.toFixed(2)}%</span>
      </div>
      ${viralScoreHtml}
      <button class="toggle-btn" data-toggle="true"><i class="fas fa-chevron-down"></i></button>
      ${detailSection}
    </div>
  `;
}

// Global Toggle Listener
function initToggle() {
  document.removeEventListener('click', handleToggle);
  document.addEventListener('click', handleToggle);
}

function handleToggle(e) {
  const btn = e.target.closest('.toggle-btn[data-toggle="true"]');
  if (btn) {
    e.stopPropagation();
    e.preventDefault();
    const card = btn.closest('.card');
    card.classList.toggle('expanded');
    const icon = btn.querySelector('i');
    if (icon) icon.style.transform = card.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

async function load() {
  if (loadingEl) loadingEl.style.display = 'flex';
  let tokens = [];
  try {
    const res = await fetch(API);
    const data = await res.json();
    tokens = data.tokens || [];
  } catch (e) {
    console.error('API error, using fallback data:', e);
    tokens = []; // Atau load fallback dari local if needed
  }

  scanCount += tokens.length;
  countEl.textContent = scanCount.toLocaleString();

  const viral = tokens.filter(t => parseFloat(t.liquidityUsd || 0) > 10000)
    .sort((a, b) => (parseFloat(b.volumeH24 || b.volume?.h24 || 0) - parseFloat(a.volumeH24 || a.volume?.h24 || 0)))
    .slice(0, 10);
  const newest = tokens.slice(0, 20)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const currentTopVol = parseFloat(viral[0]?.volumeH24 || viral[0]?.volume?.h24 || 0);
  if (currentTopVol > prevViralVolume && currentTopVol > 10000) showToast();
  prevViralVolume = currentTopVol;

  viralCards.innerHTML = viral.map(t => createCard(t, true)).join('');
  newCards.innerHTML = newest.map(t => createCard(t)).join('');

  mobileViral.innerHTML = viralCards.innerHTML;
  mobileNew.innerHTML = newCards.innerHTML;

  initToggle();

  if (viral.length > 0) showToast();
  if (loadingEl) loadingEl.style.display = 'none';
}

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('mobile-' + tab.dataset.tab).classList.add('active');
    setTimeout(initToggle, 100);
  });
});

// Init
initToggle();
load();
setInterval(load, 30000);