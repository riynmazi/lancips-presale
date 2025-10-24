// === FETCH MEME TOKENS DARI BACKEND ===
fetch("https://backend-memevirdec.vercel.app/api/fetch-meme-tokens")
  .then(res => res.json())
  .then(data => {
    const tokens = data.tokens || [];

    console.log("Fetched tokens:", tokens);

    // === Fungsi scoring viral sederhana ===
    function getViralScore(token) {
      let score = 0;
      if (token.volumeUsd > 10000) score += 1;
      if (token.liquidityUsd > 5000) score += 1;
      if (token.priceChange24h > 10) score += 1;
      return score;
    }

    // === Render Token Baru ===
    const newTokensTable = document.querySelector("#new-tokens tbody");
    newTokensTable.innerHTML = '';
    tokens.forEach(token => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="${token.pairUrl}" target="_blank">${token.name}</a></td>
        <td>${token.symbol}</td>
        <td>$${Number(token.priceUsd).toFixed(6)}</td>
        <td>$${Number(token.liquidityUsd || 0).toLocaleString()}</td>
        <td>${new Date(token.createdAt).toLocaleString()}</td>
      `;
      newTokensTable.appendChild(row);
    });

    // === Render Potensial Viral ===
    const viralTokensTable = document.querySelector("#viral-tokens tbody");
    viralTokensTable.innerHTML = '';
    tokens.forEach(token => {
      const score = getViralScore(token);
      if (score >= 2) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><a href="${token.pairUrl}" target="_blank">${token.name}</a></td>
          <td>${token.symbol}</td>
          <td>${score}</td>
          <td><img src="images/${token.symbol.toLowerCase()}.png" class="badge" alt="badge"></td>
        `;
        viralTokensTable.appendChild(row);
      }
    });
  })
  .catch(err => {
    console.error("Failed to fetch meme tokens:", err);
  });