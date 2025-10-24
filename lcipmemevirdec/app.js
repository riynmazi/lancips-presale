// === FETCH MEME TOKENS DARI BACKEND ===
fetch("https://backend-memevirdec.vercel.app/api/fetch-meme-tokens")
  .then(res => res.json())
  .then(data => {
    const tokens = data.tokens || []; // pastiin format sesuai backend

    console.log("Fetched tokens:", tokens); // cek dulu di console browser

    // === Render Token Baru ===
    const newTokensTable = document.querySelector("#new-tokens tbody");
    newTokensTable.innerHTML = ''; // bersihin dulu
    tokens.forEach(token => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${token.name}</td>
        <td>${token.symbol}</td>
        <td>$${token.priceUsd}</td>
        <td>$${token.liquidityUsd}</td>
        <td>${new Date(token.createdAt).toLocaleString()}</td>
      `;
      newTokensTable.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Failed to fetch meme tokens:", err);
  });