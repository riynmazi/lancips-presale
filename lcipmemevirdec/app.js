// ========================================
// LANCIPS MEME RADAR — app.js v2.0
// ========================================

const API_URL = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";
const BADGES = [
  "MOON", "RUG?", "WEN?", "DOGE?", "LIZARD", "CLOWN", "HARAMBE", "1000X", "GEM", "LFG"
];

// DOM Elements
const newTokensBody = document.querySelector("#new-tokens tbody");
const viralTokensBody = document.querySelector("#viral-tokens tbody");

// Random badge generator
function getRandomBadge() {
  const badge = BADGES[Math.floor(Math.random() * BADGES.length)];
  const colors = ['#39ff14', '#ffd700', '#ff4aff', '#4affee'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `<span class="badge" style="color:${color}; border-color:${color};">${badge}</span>`;
}

// Format number
function formatUSD(num) {
  if (!numm) return "-";
  return "$" + parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

// Create row with animation delay
function createRow(html, delay = 0) {
  const tr = document.createElement("tr");
  tr.className = "fade-in";
  tr.style.animationDelay = `${delay}s`;
  tr.innerHTML = html;
  return tr;
}

// Main fetch
async function loadTokens() {
  try {
    // Optional: Show loading skeleton
    newTokensBody.innerHTML = "<tr><td colspan='5' class='text-center py-8 text-gray-500'>Scanning the void...</td></tr>";
    viralTokensBody.innerHTML = "<tr><td colspan='4' class='text-center py-8 text-gray-500'>Hunting for virals...</td></tr>";

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const tokens = Array.isArray(data.tokens) ? data.tokens : [];

    console.log("Tokens fetched:", tokens.length);

    // Clear tables
    newTokensBody.innerHTML = "";
    viralTokensBody.innerHTML = "";

    if (tokens.length === 0) {
      newTokensBody.innerHTML = "<tr><td colspan='5' class='text-center py-6 text-gray-400'>No new tokens found. The memeverse is quiet...</td></tr>";
      viralTokensBody.innerHTML = "<tr><td colspan='4' class='text-center py-6 text-gray-400'>No viral signals yet. Keep watching.</td></tr>";
      return;
    }

    // Render tokens
    tokens.forEach((token, index) => {
      const {
        pairUrl = "#",
        name = "Unknown",
        symbol = "???",
        priceUsd,
        liquidityUsd,
        createdAt
      } = token;

      const liquidityValue = parseFloat(liquidityUsd) || 0;
      const delay = index * 0.05; // Stagger animation

      // === NEW TOKENS TABLE ===
      const newRow = createRow(`
        <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
        <td><span class="text-neon font-bold">${symbol}</span></td>
        <td>${priceUsd ? "$" + parseFloat(priceUsd).toFixed(8) : "-"}</td>
        <td>${formatUSD(liquidityUsd)}</td>
        <td class="text-gray-400 text-xs">${createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
      `, delay);
      newTokensBody.appendChild(newRow);

      // === POTENTIALLY VIRAL (Liquidity > $10k) ===
      if (liquidityValue > 10000) {
        const viralRow = createRow(`
          <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
          <td><span class="text-neon">${symbol}</span></td>
          <td class="text-lux font-bold">${formatUSD(liquidityUsd)}</td>
          <td class="text-center">${getRandomBadge()}</td>
        `, delay);
        viralTokensBody.appendChild(viralRow);
      }
    });

  } catch (err) {
    console.error("Fetch failed:", err);
    const errorMsg = "<tr><td class='text-center py-6 text-red-400'>Failed to load data. Try again later.</td></tr>";
    newTokensBody.innerHTML = errorMsg.replace('td>', 'td colspan="5">');
    viralTokensBody.innerHTML = errorMsg.replace('td>', 'td colspan="4">');
  }
}

// Auto refresh every 30 seconds
setInterval(loadTokens, 30_000);

// Initial load
loadTokens();

// Optional: Add fade-in CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in {
    animation: fadeInUp 0.5s ease-out forwards;
  }
  .token-link {
    color: #f0f0f0;
    text-decoration: none;
    font-weight: 600;
    position: relative;
  }
  .token-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background: linear-gradient(90deg, #39ff14, #ffd700);
    transition: width 0.3s ease;
  }
  .token-link:hover::after {
    width: 100%;
  }
  .token-link:hover {
    color: #39ff14;
    text-shadow: 0 0 8px rgba(57, 255, 20, 0.5);
  }
`;
document.head.appendChild(style);