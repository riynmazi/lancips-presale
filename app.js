const connectBtn = document.getElementById("connect");
const buyBtn = document.getElementById("buy");
const solAmountInput = document.getElementById("solAmount");
const tokenAmountSpan = document.getElementById("tokenAmount");
const walletAddressText = document.getElementById("wallet-address");
const statusMsg = document.getElementById("status-message");
const totalBought = document.getElementById("total-bought");

let wallet = null;
const PRICE_PER_TOKEN = 0.0001;
const OWNER_WALLET = "7VJHv1UNSCoxdNmboxLrjMj1FgyaGdSELK9Eo4iaPVC8";


window.addEventListener("load", () => {
  buyBtn.disabled = true;
  statusMsg.textContent = "Connect your wallet to get started";
  tokenAmountSpan.textContent = "0";
});


function loadPurchaseData() {
  if (wallet) {
    const key = `lancips-${wallet}`;
    const bought = localStorage.getItem(key);
    totalBought.textContent = bought ? parseFloat(bought).toLocaleString() : "0";
  }
}


function updatePurchaseRecord(amount) {
  const key = `lancips-${wallet}`;
  const current = parseFloat(localStorage.getItem(key)) || 0;
  const updated = current + amount;
  localStorage.setItem(key, updated);
  totalBought.textContent = updated.toLocaleString();
}

// Connect Wallet
connectBtn.onclick = async () => {
  try {
    const resp = await window.solana.connect();
    wallet = resp.publicKey.toString();
    walletAddressText.textContent = "✅ Connected: " + wallet;
    statusMsg.textContent = "Wallet connected.";
    buyBtn.disabled = false;
    loadPurchaseData();
  } catch (err) {
    alert("❌ Wallet connection failed. Please try again via Phantom DApp browser.");
    statusMsg.textContent = "❌ Please try again via Phantom DApp browser.";
    buyBtn.disabled = true;
  }
};


solAmountInput.oninput = () => {
  const sol = parseFloat(solAmountInput.value) || 0;
  const tokens = sol / PRICE_PER_TOKEN;
  tokenAmountSpan.textContent = tokens.toLocaleString();
};


buyBtn.onclick = async () => {
  const sol = parseFloat(solAmountInput.value);
  if (!sol || sol <= 0) {
    alert("⚠ Please enter a valid amount of SOL.");
    return;
  }

  const tokens = sol / PRICE_PER_TOKEN;
  buyBtn.disabled = true;
  buyBtn.textContent = "Processing...";
  statusMsg.textContent = "⏳ Sending transaction...";

  try {
    const provider = window.solana;
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta") 
    );

    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(wallet),
        toPubkey: new solanaWeb3.PublicKey(OWNER_WALLET),
        lamports: sol * solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    const { signature } = await provider.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);

    alert("✅ Transaction successful!\n\nTX Hash:\n" + signature);
    statusMsg.textContent = "✅ Transaction successful!";
    updatePurchaseRecord(tokens);

    solAmountInput.value = "";
    tokenAmountSpan.textContent = "0";
  } catch (e) {
    alert("❌ Transaction failed:\n" + e.message);
    statusMsg.textContent = "❌ Transaction failed.";
  } finally {
    buyBtn.disabled = false;
    buyBtn.textContent = "Buy LANCIPS";
  }
};
