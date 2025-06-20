// ✅ Polyfill Buffer "hex", "base64", dan "utf8" if (typeof Buffer === "undefined") { window.Buffer = { from: function (input, encoding) { if (encoding === "base64") { const binary = atob(input); const len = binary.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binary.charCodeAt(i); } return bytes; } if (encoding === "utf8" || encoding === "utf-8") { const encoder = new TextEncoder(); return encoder.encode(input); } if (encoding === "hex") { const bytes = new Uint8Array(input.length / 2); for (let i = 0; i < input.length; i += 2) { bytes[i / 2] = parseInt(input.substr(i, 2), 16); } return bytes; } throw new Error("Unsupported encoding: " + encoding); } }; }

// 🧠 DOM Element const connectBtn = document.getElementById("connect"); const buyBtn = document.getElementById("buy"); const solAmountInput = document.getElementById("solAmount"); const tokenAmountSpan = document.getElementById("tokenAmount"); const walletAddressText = document.getElementById("wallet-address"); const statusMsg = document.getElementById("status-message"); const totalBought = document.getElementById("total-bought");

let wallet = null; const PRICE_PER_TOKEN = 0.000005;

window.addEventListener("load", () => { buyBtn.disabled = true; statusMsg.textContent = "Connect your wallet to get started"; tokenAmountSpan.textContent = "0"; });

// Load Total Bought function loadPurchaseData() { if (wallet) { const key = lancips-${wallet}; const bought = localStorage.getItem(key); totalBought.textContent = bought ? parseFloat(bought).toLocaleString() : "0"; } }

function updatePurchaseRecord(amount) { const key = lancips-${wallet}; const current = parseFloat(localStorage.getItem(key)) || 0; const updated = current + amount; localStorage.setItem(key, updated); totalBought.textContent = updated.toLocaleString(); }

// ✅ Connect Wallet connectBtn.onclick = async () => { try { if (!window.solana || !window.solana.isPhantom) { alert("⚠️ Phantom Wallet not found. Please install it from https://phantom.app"); return; }

const resp = await window.solana.connect();
wallet = resp.publicKey.toString();
walletAddressText.textContent = "✅ Connected: " + wallet;
statusMsg.textContent = "Wallet connected.";
buyBtn.disabled = false;
loadPurchaseData();

} catch (err) { alert("❌ Wallet connection failed.\n\nTry using Phantom browser or mobile app."); statusMsg.textContent = "❌ Wallet connection failed."; buyBtn.disabled = true; } };

// 💰 Calculator solAmountInput.oninput = () => { const sol = parseFloat(solAmountInput.value) || 0; const tokens = sol / PRICE_PER_TOKEN; tokenAmountSpan.textContent = tokens.toLocaleString(); };

// ✅ Buy LANCIPS (frontend hanya kirim request ke backend) buyBtn.onclick = async () => { const sol = parseFloat(solAmountInput.value); const tokens = sol / PRICE_PER_TOKEN;

if (!sol || sol <= 0 || tokens <= 0) { alert("⚠️ Please enter a valid amount of SOL."); return; }

buyBtn.disabled = true; buyBtn.textContent = "Sending request..."; statusMsg.textContent = "⏳ Sending request to backend...";

try { const response = await fetch("https://backendlancips-production.up.railway.app/buy", { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify({ walletAddress: wallet, amount: tokens, }), });

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "Unknown error");
}

alert(
  `✅ Purchase request received.\n\nSend ${data.payAmount} SOL to:\n${data.payTo}`
);

statusMsg.textContent = "✅ Request accepted. Please send SOL manually.";
updatePurchaseRecord(tokens);

solAmountInput.value = "";
tokenAmountSpan.textContent = "0";

} catch (e) { console.error(e); alert("❌ Request failed:\n" + e.message); statusMsg.textContent = "❌ Request failed."; } finally { buyBtn.disabled = false; buyBtn.textContent = "Buy LANCIPS"; } };

