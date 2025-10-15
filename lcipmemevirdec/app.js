// Threshold scoring sederhana
function getViralScore(token){
  let score = 0;
  if(token.holders > 100) score += 1;
  if(token.volume24h > 10000) score += 1;
  if(token.absurdity) score += 1; // bisa ditentukan manual / heuristik
  return score;
}

// Render Token Baru
function renderNewTokens(tokens) {
  const newTokensTable = document.querySelector("#new-tokens tbody");
  newTokensTable.innerHTML = ""; // clear existing rows

  tokens.forEach(token => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${token.tokenName}</td>
      <td>${token.symbol}</td>
      <td>${token.totalSupply?.toLocaleString() || "-"}</td>
      <td>${token.holders?.toLocaleString() || "-"}</td>
      <td>${token.createdAt || "-"}</td>
    `;
    newTokensTable.appendChild(row);
  });
}

// Render Potensial Viral
function renderViralTokens(tokens) {
  const viralTokensTable = document.querySelector("#viral-tokens tbody");
  viralTokensTable.innerHTML = "";

  tokens.forEach(token => {
    const score = getViralScore(token);
    if(score >= 2){ // threshold minimal
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${token.tokenName}</td>
        <td>${token.symbol}</td>
        <td>${score}</td>
        <td><img src="images/${token.symbol.toLowerCase()}.png" class="badge" alt="badge"></td>
      `;
      viralTokensTable.appendChild(row);
    }
  });
}

// Fetch token terbaru dari Solscan (Solana)
async function fetchOnChainTokens(limit = 20) {
  try {
    const response = await fetch(`https://public-api.solscan.io/v1/token/list?limit=${limit}`);
    const data = await response.json();

    // Tambahin field absurdity dummy untuk scoring
    const tokens = data.map(t => ({
      ...t,
      absurdity: Math.random() < 0.5, // 50% random untuk demo
      holders: t.holders || 0,
      volume24h: t.volume24h || Math.floor(Math.random()*20000) // dummy
    }));

    renderNewTokens(tokens);
    renderViralTokens(tokens);
  } catch(err) {
    console.error("Error fetching on-chain tokens:", err);
  }
}

// Jalankan
fetchOnChainTokens();