// Dummy data untuk MVP
const tokens = [
  {name: "KucingCoin", symbol: "KCAT", supply: 1000000, holders: 500, volume24h: 20000, absurdity: true, listingDate: "2025-10-15"},
  {name: "ToasterToken", symbol: "TOAST", supply: 500000, holders: 50, volume24h: 500, absurdity: true, listingDate: "2025-10-14"},
  {name: "MoonCheese", symbol: "CHEESE", supply: 200000, holders: 300, volume24h: 15000, absurdity: false, listingDate: "2025-10-15"}
];

// Threshold scoring sederhana
function getViralScore(token){
  let score = 0;
  if(token.holders > 100) score += 1;
  if(token.volume24h > 10000) score +=1;
  if(token.absurdity) score +=1;
  return score;
}

// Render Token Baru
const newTokensTable = document.querySelector("#new-tokens tbody");
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

// Render Potensial Viral
const viralTokensTable = document.querySelector("#viral-tokens tbody");
tokens.forEach(token => {
  const score = getViralScore(token);
  if(score >= 2){ // threshold minimal
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