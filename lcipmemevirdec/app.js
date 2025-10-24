fetch("https://backend-memevirdec.vercel.app/api/fetch-meme-tokens")
  .then(res => res.json())
  .then(data => {
    const tokens = data.tokens || []; // ambil array tokens
    console.log("✅ Tokens fetched:", tokens.length);

    const newTokensTable = document.querySelector("#new-tokens tbody");
    const viralTokensTable = document.querySelector("#viral-tokens tbody");

    newTokensTable.innerHTML = "";
    viralTokensTable.innerHTML = "";

    tokens.forEach(token => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="${token.pairUrl}" target="_blank">${token.name || "-"}</a></td>
        <td>${token.symbol || "-"}</td>
        <td>${token.priceUsd ? "$" + parseFloat(token.priceUsd).toFixed(6) : "-"}</td>
        <td>${token.liquidityUsd ? "$" + parseFloat(token.liquidityUsd).toLocaleString() : "-"}</td>
        <td>${token.createdAt ? new Date(token.createdAt).toLocaleString() : "-"}</td>
      `;
      newTokensTable.appendChild(row);

      // tampilkan di "Potentially Viral" kalau likuiditas di atas 10k
      if (parseFloat(token.liquidityUsd) > 10000) {
        const viralRow = document.createElement("tr");
        viralRow.innerHTML = `
          <td><a href="${token.pairUrl}" target="_blank">${token.name}</a></td>
          <td>${token.symbol}</td>
          <td>$${parseFloat(token.liquidityUsd).toLocaleString()}</td>
          <td>🚀 Viral</td>
        `;
        viralTokensTable.appendChild(viralRow);
      }
    });

    // kalau kosong kasih tanda
    if (tokens.length === 0) {
      newTokensTable.innerHTML = `<tr><td colspan="5">No tokens found</td></tr>`;
    }
  })
  .catch(err => {
    console.error("❌ Failed to fetch meme tokens:", err);
    document.querySelector("#new-tokens tbody").innerHTML =
      `<tr><td colspan="5">Error loading data</td></tr>`;
  });