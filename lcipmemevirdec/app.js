// 🌐 API endpoint
const API_URL = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";

// 🧠 Simpan token yang sudah pernah ditampilkan (New Tokens)
const renderedTokens = new Map();
const MAX_TOKENS = 50; // maksimal token yang disimpan

async function fetchTokens() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    let tokens = Array.isArray(data.tokens) ? data.tokens : [];

    console.log(`✅ Fetched ${tokens.length} tokens`);

    // 🧹 Filter token baru untuk New Tokens
    const newUniqueTokens = [];
    tokens.forEach(token => {
      if (!renderedTokens.has(token.mint)) {
        renderedTokens.set(token.mint, token);
        newUniqueTokens.push(token);
      }
    });

    console.log(`✨ ${newUniqueTokens.length} new unique tokens found`);

    // 🔁 Batasi agar hanya menyimpan 50 token terakhir
    while (renderedTokens.size > MAX_TOKENS) {
      const oldestKey = renderedTokens.keys().next().value;
      renderedTokens.delete(oldestKey);
    }

    // Render New Tokens & Viral Tokens
    renderTokens(newUniqueTokens, tokens);
  } catch (err) {
    console.error("❌ Failed to fetch meme tokens:", err);
    document.querySelector("#new-tokens tbody").innerHTML =
      `<tr><td colspan="5">Error loading data</td></tr>`;
    document.querySelector("#viral-tokens tbody").innerHTML =
      `<tr><td colspan="4">Error loading data</td></tr>`;
  }
}

function renderTokens(newTokens, allTokens) {
  const newTokensTable = document.querySelector("#new-tokens tbody");
  const viralTokensTable = document.querySelector("#viral-tokens tbody");

  // === Render New Tokens (hanya token baru) ===
  newTokens.forEach(token => {
    const { pairUrl = "#", name = "-", symbol = "-", priceUsd, liquidityUsd, createdAt } = token;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
      <td>${symbol}</td>
      <td>${priceUsd ? "$" + parseFloat(priceUsd).toFixed(6) : "-"}</td>
      <td>${liquidityUsd ? "$" + parseFloat(liquidityUsd).toLocaleString() : "-"}</td>
      <td>${createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
    `;
    newTokensTable.prepend(row);
  });

  // === Render Viral Tokens (bisa token baru atau lama) ===
  // Kriteria viral: liquidity > 10k || volume > 5k
  const VIRAL_LIQUIDITY = 10000;
  const VIRAL_VOLUME = 5000;

  allTokens.forEach(token => {
    const { pairUrl = "#", name = "-", symbol = "-", liquidityUsd, volumeUsd } = token;
    const liquidityValue = parseFloat(liquidityUsd);
    const volumeValue = parseFloat(volumeUsd);

    if (
      (!isNaN(liquidityValue) && liquidityValue > VIRAL_LIQUIDITY) ||
      (!isNaN(volumeValue) && volumeValue > VIRAL_VOLUME)
    ) {
      // Cek kalau row sudah ada, supaya nggak duplikat
      const existingRow = viralTokensTable.querySelector(`tr[data-mint="${token.mint}"]`);
      if (existingRow) return;

      const viralRow = document.createElement("tr");
      viralRow.setAttribute("data-mint", token.mint); // id unik
      viralRow.innerHTML = `
        <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
        <td>${symbol}</td>
        <td>$${liquidityValue ? liquidityValue.toLocaleString() : "-"}</td>
        <td>$${volumeValue ? volumeValue.toLocaleString() : "-"}</td>
        <td><span class="badge">🚀</span></td>
      `;
      viralTokensTable.prepend(viralRow);
    }
  });

  // === Bersihkan tabel jika lebih dari 50 row ===
  while (newTokensTable.rows.length > MAX_TOKENS) {
    newTokensTable.deleteRow(newTokensTable.rows.length - 1);
  }
  while (viralTokensTable.rows.length > MAX_TOKENS) {
    viralTokensTable.deleteRow(viralTokensTable.rows.length - 1);
  }

  // === Default message kalau kosong ===
  if (renderedTokens.size === 0) {
    newTokensTable.innerHTML = `<tr><td colspan="5">No tokens found</td></tr>`;
  }
  if (viralTokensTable.rows.length === 0) {
    viralTokensTable.innerHTML = `<tr><td colspan="5">No viral tokens yet</td></tr>`;
  }
}

// 🕒 Auto-refresh tiap 60 detik
setInterval(fetchTokens, 60000);

// 🚀 Jalankan pertama kali saat halaman dimuat
fetchTokens();