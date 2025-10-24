const API_URL = "https://backend-memevirdec.vercel.app/api/fetch-meme-tokens";

async function fetchTokens() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch tokens");

    const data = await res.json();
    const tokens = data.tokens || [];

    console.log("✅ Tokens fetched:", tokens.length);
    renderTokens(tokens);

  } catch (err) {
    console.error("❌ Fetch error:", err);
  }
}

function renderTokens(tokens) {
  const tbody = document.querySelector("#new-tokens tbody");
  tbody.innerHTML = "";

  tokens.forEach(token => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${token.name || "-"}</td>
      <td>${token.symbol || "-"}</td>
      <td>${formatNumber(token.priceUsd)} USD</td>
      <td>${formatNumber(token.liquidityUsd)}</td>
      <td>${new Date(token.createdAt).toLocaleString()}</td>
    `;

    // Klik baris → buka pair di dexscreener
    row.addEventListener("click", () => {
      if (token.pairUrl) window.open(token.pairUrl, "_blank");
    });

    tbody.appendChild(row);
  });
}

function formatNumber(num) {
  if (!num || isNaN(num)) return "0";
  const n = parseFloat(num);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(4);
}

fetchTokens();