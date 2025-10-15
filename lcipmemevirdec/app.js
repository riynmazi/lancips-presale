// Dummy data for MVP
const tokens = [
  {name: "KucingCoin", symbol: "KCAT", supply: 1000000, holders: 500, volume24h: 20000, absurdity: true, listingDate: "2025-10-15"},
  {name: "ToasterToken", symbol: "TOAST", supply: 500000, holders: 50, volume24h: 500, absurdity: true, listingDate: "2025-10-14"},
  {name: "MoonCheese", symbol: "CHEESE", supply: 200000, holders: 300, volume24h: 15000, absurdity: false, listingDate: "2025-10-15"}
];

// Threshold scoring function
function getViralScore(token){
  let score = 0;
  if(token.holders > 100) score += 1;
  if(token.volume24h > 10000) score += 1;
  if(token.absurdity) score += 1;
  return score;
}

// Utility: create table row with data-label for mobile
function createRow(token, columns) {
  const row = document.createElement("tr");
  row.innerHTML = columns.map(col => `<td data-label="${col.label}">${col.value}</td>`).join('');
  return row;
}

// Render New Tokens
const newTokensTable = document.querySelector("#new-tokens tbody");
tokens.forEach(token => {
  const row = createRow(token, [
    {label: "Token Name", value: token.name},
    {label: "Symbol", value: token.symbol},
    {label: "Total Supply", value: token.supply},
    {label: "Holder Count", value: token.holders},
    {label: "Listing Date", value: token.listingDate}
  ]);
  newTokensTable.appendChild(row);
});

// Render Potentially Viral Tokens
const viralTokensTable = document.querySelector("#viral-tokens tbody");
tokens.forEach(token => {
  const score = getViralScore(token);
  if(score >= 2){ // minimal threshold
    const row = createRow(token, [
      {label: "Token Name", value: token.name},
      {label: "Symbol", value: token.symbol},
      {label: "Score", value: score},
      {label: "Badge", value: `<img src="images/${token.symbol.toLowerCase()}.png" class="badge" alt="badge">`}
    ]);
    viralTokensTable.appendChild(row);
  }
});