fetch("https://backend-memevirdec.vercel.app/api/fetch-meme-tokens")
  .then(res => res.json())
  .then(data => {
    const tokens = Array.isArray(data.tokens) ? data.tokens : [];
    console.log("✅ Tokens fetched:", tokens.length);

    const newTokensTable = document.querySelector("#new-tokens tbody");
    const viralTokensTable = document.querySelector("#viral-tokens tbody");

    newTokensTable.innerHTML = "";
    viralTokensTable.innerHTML = "";

    tokens.forEach(token => {
      const {
        pairUrl = "#",
        name = "-",
        symbol = "-",
        priceUsd,
        liquidityUsd,
        createdAt
      } = token;

      // 💠 Baris untuk tabel "New Tokens"
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
        <td>${symbol}</td>
        <td>${priceUsd ? "$" + parseFloat(priceUsd).toFixed(6) : "-"}</td>
        <td>${liquidityUsd ? "$" + parseFloat(liquidityUsd).toLocaleString() : "-"}</td>
        <td>${createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
      `;
      newTokensTable.appendChild(row);

      // 🚀 Kalau likuiditas di atas 10k, tambahkan ke "Potentially Viral"
      const liquidityValue = parseFloat(liquidityUsd);
      if (!isNaN(liquidityValue) && liquidityValue > 10000) {
        const viralRow = document.createElement("tr");
        viralRow.innerHTML = `
          <td><a href="${pairUrl}" target="_blank" class="token-link">${name}</a></td>
          <td>${symbol}</td>
          <td>$${liquidityValue.toLocaleString()}</td>
          <td><span class="badge">🚀</span></td>
        `;
        viralTokensTable.appendChild(viralRow);
      }
    });

    // 🧩 Jika kosong, tampilkan pesan di masing-masing tabel
    if (tokens.length === 0) {
      const emptyRow = `<tr><td colspan="5">No tokens found</td></tr>`;
      newTokensTable.innerHTML = emptyRow;
      viralTokensTable.innerHTML = `<tr><td colspan="4">No viral tokens yet</td></tr>`;
    }
  })
  .catch(err => {
    console.error("❌ Failed to fetch meme tokens:", err);
    document.querySelector("#new-tokens tbody").innerHTML =
      `<tr><td colspan="5">Error loading data</td></tr>`;
    document.querySelector("#viral-tokens tbody").innerHTML =
      `<tr><td colspan="4">Error loading data</td></tr>`;
  });