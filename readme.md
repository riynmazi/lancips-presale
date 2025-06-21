# 🐸 LANCIPS - Frontend

This is the frontend interface for the LANCIPS presale — a meme token built on Solana, born out of frustration, irony, and just enough hope to click "Buy".

🌐 Website: [https://lancips.xyz](https://lancips.xyz)  
📄 Whitepaper: [Read here](https://drive.google.com/file/d/1PwgTzk3bTD8z6f__kGux3ygiR0Y6ctez/view?usp=drivesdk)

---

## 🔧 Features

- Connect to Phantom Wallet (Solana)
- Buy LANCIPS using SOL
- Calculate how many tokens you’ll get
- Presale cap per wallet: 15,000,000 LANCIPS
- Countdown until presale ends
- Uses `@solana/web3.js` for transactions

---

## 📸 Screenshots

![Preview](preview_1.png) <!-- Pastikan file ini ada di root repo -->

---

## 🔐 Phantom Wallet Integration

- Only requests permission to connect to the user’s public wallet address
- All SOL transfers are sent **directly from the user's wallet**
- No sensitive data stored or required

---

## ⚙️ Setup Locally

```bash
git clone https://github.com/yourusername/lancips-frontend.git
cd lancips-frontend
