# About LANCIPS 

**LANCIPS**— a meme token built on Solana, born out of frustration, irony, and just enough hope to click "Buy".

🌐 Website: [https://lancips.xyz](https://lancips.xyz)  
📄 Whitepaper: [Read here](https://github.com/riynmazi/lancips-presale/blob/main/data/whitepaper.pdf)

---

## 🔧 Features

- Connect to Phantom Wallet (Solana)
- Buy LANCIPS using SOL
- Automatic token calculation
- Presale cap per wallet: 35,000,000 LANCIPS
- Countdown timer until presale ends
- Uses `@solana/web3.js` for secure transactions

---

## 📸 Screenshots

![Preview](https://github.com/riynmazi/lancips-presale/blob/main/preview_2.png)

---

## 🔐 Phantom Wallet Integration

- Only requests access to the user’s **public wallet address**
- All transactions are **initiated and signed directly by the user**
- No sensitive data is collected or stored
- Transactions are sent via Phantom using Solana RPC

---

## 🛡️ Token Transparency & Safety

LANCIPS is a standard SPL token created via **Solana CLI** — without custom smart contracts.

- ✅ Created using `spl-token` (official Solana CLI)
- ✅ No mint authority (disabled after mint)
- ✅ Fixed total supply: 100,000,000 LANCIPS
- ✅ No taxes, no hidden logic, no backdoors
- ✅ Token uses Solana’s official SPL Token Program:  
  `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`

### 🔍 Token Creation Proof (CLI)

```bash
# 1. Create the token
spl-token create-token

# 2. Create a token account
spl-token create-account 6ycUdE8C5r7Fhvujw2neRXCkxu4Xw4MdSeqy3UkSgmWK

# 3. Mint total supply to our wallet
spl-token mint 8KigeQfhBc9Xw8mJ3pbuhUsyCh9N1AUbhAPwHfuBUrzm 100000000 HPbJkontUYCiriMxTuCZxcxCAmod7dzBVTpXzzXkHbq7

# 4. Disable minting forever
spl-token authorize 8KigeQfhBc9Xw8mJ3pbuhUsyCh9N1AUbhAPwHfuBUrzm mint --disable