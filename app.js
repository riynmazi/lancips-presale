// Ensure Buffer is defined (especially for mobile Phantom)
if (typeof Buffer === "undefined" && typeof window.buffer !== "undefined") {
  window.Buffer = window.buffer.Buffer;
}

const connectBtn = document.getElementById("connect");
const buyBtn = document.getElementById("buy");
const solAmountInput = document.getElementById("solAmount");
const tokenAmountSpan = document.getElementById("tokenAmount");
const walletAddressText = document.getElementById("wallet-address");
const statusMsg = document.getElementById("status-message");
const totalBought = document.getElementById("total-bought");

let wallet = null;
const PRICE_PER_TOKEN = 0.0001;
const OWNER_WALLET = "7VJHv1UNSCoxdNmboxLrjMj1FgyaGdSELK9Eo4iaPVC8"; // Wallet tujuan

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

// Connect Phantom wallet
connectBtn.onclick = async () => {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      alert("⚠️ Phantom Wallet not found. Please install it from https://phantom.app");
      return;
    }

    const resp = await window.solana.connect();
    wallet = resp.publicKey.toString();
    walletAddressText.textContent = "✅ Connected: " + wallet;
    statusMsg.textContent = "Wallet connected.";
    buyBtn.disabled = false;
    loadPurchaseData();
  } catch (err) {
    alert("❌ Wallet connection failed.\n\nTry using Phantom browser or mobile app.");
    statusMsg.textContent = "❌ Wallet connection failed.";
    buyBtn.disabled = true;
  }
};

// Hitung jumlah token dari input SOL
solAmountInput.oninput = () => {
  const sol = parseFloat(solAmountInput.value) || 0;
  const tokens = sol / PRICE_PER_TOKEN;
  tokenAmountSpan.textContent = tokens.toLocaleString();
};

// Tombol beli token
buyBtn.onclick = async () => {
  const sol = parseFloat(solAmountInput.value);
  if (!sol || sol <= 0) {
    alert("⚠️ Please enter a valid amount of SOL.");
    return;
  }

  if (!window.solanaWeb3) {
    alert("❌ Solana Web3 not available. Make sure it is loaded.");
    return;
  }

  const tokens = sol / PRICE_PER_TOKEN;
  buyBtn.disabled = true;
  buyBtn.textContent = "Processing...";
  statusMsg.textContent = "⏳ Sending transaction...";

  try {
    const provider = window.solana;
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    const fromPubkey = new solanaWeb3.PublicKey(wallet);
    const toPubkey = new solanaWeb3.PublicKey(OWNER_WALLET);

    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(sol * solanaWeb3.LAMPORTS_PER_SOL),
      })
    );

    transaction.feePayer = fromPubkey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature, "confirmed");

    alert("✅ Transaction successful!\n\nTX Hash:\n" + signature);
    statusMsg.textContent = "✅ Transaction successful!";
    updatePurchaseRecord(tokens);

    solAmountInput.value = "";
    tokenAmountSpan.textContent = "0";
  } catch (e) {
    console.error(e);
    alert("❌ Transaction failed:\n" + e.message);
    statusMsg.textContent = "❌ Transaction failed.";
  } finally {
    buyBtn.disabled = false;
    buyBtn.textContent = "Buy LANCIPS";
  }
};
