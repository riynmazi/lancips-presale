// === FETCH MEME TOKENS DARI BACKEND ===
fetch("https://backend-memevirdec.vercel.app/api/fetch-meme-tokens")
  .then(res => res.json())
  .then(data => {
    const tokens = data.saved; // anggap backend return array token
    // === Fungsi scoring viral tetap sama ===
    function getViralScore(token){
      let score = 0;
      if(token.holders > 100) score += 1;
      if(token.volume24h > 10000) score +=1;
      if(token.absurdity) score +=1;
      return score;
    }

    // === Render Token Baru ===
    const newTokensTable = document.querySelector("#new-tokens tbody");
    newTokensTable.innerHTML = ''; // bersihin dulu
    tokens.forEach(token => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${token.name}</td>
        <td>${token.symbol}</td>
        <td>${token.supply}</td>
        <td>${token.holders}</td>
        <td>${token.listingDate}</td>
      `;
      newTokensTable.appendChild(row);
    });

    // === Render Potensial Viral ===
    const viralTokensTable = document.querySelector("#viral-tokens tbody");
    viralTokensTable.innerHTML = ''; // bersihin dulu
    tokens.forEach(token => {
      const score = getViralScore(token);
      if(score >= 2){
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${token.name}</td>
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
