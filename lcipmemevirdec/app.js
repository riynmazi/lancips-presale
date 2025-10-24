// 🌐 API endpoint
const API_URL = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";

// 🧠 Simpan token yang sudah pernah ditampilkan (biar gak duplikat)
const renderedTokens = new Map();

async function fetchTokens() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    let tokens = Array.isArray(data.tokens) ? data.tokens : [];

    console.log(`✅ Fetched ${tokens.length} tokens`);

    // 🧹 Filter duplikat berdasarkan mint
    const uniqueTokens = [];
    tokens.forEach(token => {
      if (!renderedTokens.has(token.mint)) {
        renderedTokens.set(token.mint, token);
        uniqueTokens.push(token);
      }
    });

    console.log(`✨ ${uniqueTokens.length} new unique tokens found`);

    // Render hanya yang baru
    renderTokens(uniqueTokens);
  } catch (err) {
    console.error("❌ Failed to fetch meme tokens:", err);
    document.querySelector("#new-tokens tbody").innerHTML =
      `<tr><td colspan="5">Error loading data</td></tr>`;
  }
}

function renderTokens(tokens) {
  const newTokensTable = document.querySelector("#new-tokens tbody");
  const viralTokensTable = document.querySelector("#viral-tokens tbody");

  tokens.forEach(token => {
    const {
      pairUrl = "#",
      name = "-",
      symbol = "-",
      priceUsd,
      liquidityUsd,
      createdAt
    } = token;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
      <td>${symbol}</td>
      <td>${priceUsd ? "$" + parseFloat(priceUsd).toFixed(6) : "-"}</td>
      <td>${liquidityUsd ? "$" + parseFloat(liquidityUsd).toLocaleString() : "-"}</td>
      <td>${createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
    `;
    newTokensTable.prepend(row); // 🔁 tambahkan di atas biar token baru tampil duluan

    // 🚀 Deteksi yang berpotensi viral (likuiditas > 10k)
    const liquidityValue = parseFloat(liquidityUsd);
    if (!isNaN(liquidityValue) && liquidityValue > 10000) {
      const viralRow = document.createElement("tr");
      viralRow.innerHTML = `
        <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
        <td>${symbol}</td>
        <td>$${liquidityValue.toLocaleString()}</td>
        <td><span class="badge">🚀</span></td>
      `;
      viralTokensTable.prepend(viralRow);
    }
  });

  // Kalau belum ada token sama sekali
  if (renderedTokens.size === 0) {
    newTokensTable.innerHTML = `<tr><td colspan="5">No tokens found</td></tr>`;
    viralTokensTable.innerHTML = `<tr><td colspan="4">No viral tokens yet</td></tr>`;
  }
}

// 🕒 Auto-refresh setiap 60 detik
setInterval(fetchTokens, 60000);

// 🚀 Jalankan pertama kali saat halaman dimuat
fetchTokens();