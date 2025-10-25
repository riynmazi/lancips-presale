// 🌐 API endpoint
const API_URL = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";

const renderedTokens = new Map();
const MAX_TOKENS = 50;

// 🔹 Fetch token dari API
async function fetchTokens() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    let tokens = Array.isArray(data.tokens) ? data.tokens : [];

    console.log(`✅ Fetched ${tokens.length} tokens`);

    // 🧹 Filter token baru untuk New Tokens
    const newUniqueTokens = [];
    tokens.forEach(token => {
      const uniqueId = token.mint || token.address; // fallback ke address
      if (!renderedTokens.has(uniqueId)) {
        renderedTokens.set(uniqueId, token);
        newUniqueTokens.push(token);
      }
    });

    // 🔁 Batasi cache agar max 50 token
    while (renderedTokens.size > MAX_TOKENS) {
      const oldestKey = renderedTokens.keys().next().value;
      renderedTokens.delete(oldestKey);
    }

    // Render semua token
    renderTokens(newUniqueTokens, tokens);
  } catch (err) {
    console.error("❌ Failed to fetch tokens:", err);
    document.querySelector("#new-tokens tbody").innerHTML =
      `<tr><td colspan="5">Error loading data</td></tr>`;
    document.querySelector("#viral-tokens tbody").innerHTML =
      `<tr><td colspan="5">Error loading data</td></tr>`;
  }
}

// 🔹 Render token di tabel
function renderTokens(newTokens, allTokens) {
  const newTokensTable = document.querySelector("#new-tokens tbody");
  const viralTokensTable = document.querySelector("#viral-tokens tbody");

  // === New Tokens Table ===
  newTokens.forEach(token => {
    const { pairUrl = "#", name = "-", symbol = "-", priceUsd, liquidityUsd, volumeUsd, createdAt } = token;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${pairUrl}" target="_blank">${name}</a></td>
      <td>${symbol}</td>
      <td>${priceUsd ? "$" + parseFloat(priceUsd).toFixed(6) : "-"}</td>
      <td>${liquidityUsd ? "$" + parseFloat(liquidityUsd).toLocaleString() : "-"}</td>
      <td>${volumeUsd ? "$" + parseFloat(volumeUsd).toLocaleString() : "-"}</td>
      <td>${createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
    `;
    newTokensTable.prepend(row);
  });

  // === Viral Tokens Table ===
  const VIRAL_LIQUIDITY = 10000;
  const VIRAL_VOLUME = 5000;

  allTokens.forEach(token => {
    const { pairUrl = "#", name = "-", symbol = "-", liquidityUsd, volumeUsd } = token;
    const liquidityValue = parseFloat(liquidityUsd) || 0;
    const volumeValue = parseFloat(volumeUsd) || 0;

    const uniqueId = token.mint || token.address;

    if (liquidityValue >= VIRAL_LIQUIDITY || volumeValue >= VIRAL_VOLUME) {
      // hindari duplikat row
      if (viralTokensTable.querySelector(`tr[data-id="${uniqueId}"]`)) return;

      const viralRow = document.createElement("tr");
      viralRow.setAttribute("data-id", uniqueId);
      viralRow.innerHTML = `
        <td><a href="${pairUrl}" target="_blank">${name}</a></td>
        <td>${symbol}</td>
        <td>$${liquidityValue.toLocaleString()}</td>
        <td>$${volumeValue.toLocaleString()}</td>
        <td><span class="badge">🚀</span></td>
      `;
      viralTokensTable.prepend(viralRow);
    }
  });

  // === Bersihkan tabel > 50 row ===
  while (newTokensTable.rows.length > MAX_TOKENS) {
    newTokensTable.deleteRow(newTokensTable.rows.length - 1);
  }
  while (viralTokensTable.rows.length > MAX_TOKENS) {
    viralTokensTable.deleteRow(viralTokensTable.rows.length - 1);
  }

  // Default message kalau kosong
  if (renderedTokens.size === 0) newTokensTable.innerHTML = `<tr><td colspan="6">No tokens found</td></tr>`;
  if (viralTokensTable.rows.length === 0) viralTokensTable.innerHTML = `<tr><td colspan="5">No viral tokens yet</td></tr>`;
}

// 🕒 Auto-refresh tiap 60 detik
setInterval(fetchTokens, 60000);

// 🚀 Jalankan pertama kali
fetchTokens();