const API = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";
const BADGES = ["WEN MOON?", "RUG?", "LFG", "CTO", "GEM", "HARAMBE", "MOON", "1000X"];
let scanCount = 0;

const viralCards = document.getElementById('viral-cards');
const newCards = document.getElementById('new-cards');
const mobileViral = document.getElementById('mobile-viral');
const mobileNew = document.getElementById('mobile-new');
const toast = document.getElementById('toast');
const countEl = document.getElementById('scan-count');

function showToast() {
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}

function createCard(token, isViral = false) {
  const badge = BADGES[Math.floor(Math.random() * BADGES.length)];
  const color = ['#39ff14', '#ffd700', '#ff4aff'][Math.floor(Math.random() * 3)];
  
  return `
    <div class="card" onclick="window.open('${token.pairUrl}', '_blank')">
      <div class="card-header">
        <div class="token-name">${token.name}</div>
        <div class="badge" style="background:${color}20; color:${color}; border:1px solid ${color};">${badge}</div>
      </div>
      <div><span class="symbol">${token.symbol}</span></div>
      ${isViral 
        ? `<div class="liquidity">$${parseFloat(token.liquidityUsd).toLocaleString()} liquidity</div>`
        : `<div>$${parseFloat(token.priceUsd).toFixed(8)} • ${new Date(token.createdAt).toLocaleTimeString()}</div>`
      }
    </div>
  `;
}

async function load() {
  try {
    const res = await fetch(API);
    const { tokens = [] } = await res.json();
    scanCount += tokens.length;
    countEl.textContent = scanCount.toLocaleString();

    const viral = tokens.filter(t => parseFloat(t.liquidityUsd) > 10000);
    const newest = tokens.slice(0, 20);

    // Desktop
    viralCards.innerHTML = viral.map(t => createCard(t, true)).join('');
    newCards.innerHTML = newest.map(t => createCard(t)).join('');

    // Mobile
    mobileViral.innerHTML = viralCards.innerHTML;
    mobileNew.innerHTML = newCards.innerHTML;

    if (viral.length > 0) showToast();
  } catch (e) {
    console.error(e);
  }
}

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('mobile-' + tab.dataset.tab).classList.add('active');
  });
});

// Load + refresh
load();
setInterval(load, 30000);