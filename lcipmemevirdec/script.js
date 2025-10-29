import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import axios from "axios";

// === 🔥 Init Firebase ===
if (!getApps().length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  }
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
    );
    initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    throw new Error("Invalid service account: " + err.message);
  }
}

const db = getFirestore();

// === 🧩 Helper: CORS ===
function withCors(data, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

export async function OPTIONS() {
  return withCors({}, 204);
}

// === 🧠 Ambil logo Solana SPL Registry ===
async function fetchSolanaLogo(address) {
  try {
    const res = await axios.get(`https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json`);
    const tokens = res.data.tokens || [];
    const token = tokens.find(t => t.address === address);
    return token?.logoURI || null;
  } catch {
    return null;
  }
}

// === 🧠 Ambil logo BSC token list ===
async function fetchBscLogo(address) {
  try {
    const res = await axios.get(`https://tokens.pancakeswap.finance/pancakeswap-extended.json`);
    const tokens = res.data?.tokens || [];
    const token = tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token?.logoURI || null;
  } catch {
    return null;
  }
}

// === 🧠 Ambil data dari DexScreener ===
async function fetchFromDexScreener() {
  const chains = [
    { name: "solana", url: "https://api.dexscreener.com/latest/dex/search?q=raydium" },
    { name: "bsc", url: "https://api.dexscreener.com/latest/dex/search?q=meme&chain=bsc" },
  ];

  const allTokens = [];

  const FILTERS = { maxLiquidityUsd: 200000, minVolumeUsd24h: 500, minSymbolLength: 2, maxSymbolLength: 12 };
  // const memeKeywords = ["meme","doge","pepe","cat","elon","wojak","frog","baby","bonk","shiba","kitten","floki","lol","rofl","lmao","troll","woof"];

  for (const chain of chains) {
    try {
      console.log(`📡 Fetching ${chain.name.toUpperCase()}...`);
      const res = await axios.get(chain.url, { timeout: 15000 });
      const pairs = res.data?.pairs || [];
      console.log(`${chain.name.toUpperCase()} total pairs: ${pairs.length}`);

      const filtered = pairs.filter(p => {
        const liquidity = p.liquidity?.usd || 0;
        const volume = p.volume?.h24 || 0;
        const symbol = p.baseToken?.symbol || "";
        const validSymbol =
          /^[A-Z0-9]+$/.test(symbol) &&
          symbol.length >= FILTERS.minSymbolLength &&
          symbol.length <= FILTERS.maxSymbolLength &&
          !symbol.includes("$") &&
          !symbol.includes("?");
        return liquidity <= FILTERS.maxLiquidityUsd && volume >= FILTERS.minVolumeUsd24h && validSymbol;
      }).slice(0, 50);

      for (const p of filtered) {
        let logoURI = p.baseToken.logo || null;
        if (!logoURI) {
          if (chain.name === "solana") logoURI = await fetchSolanaLogo(p.baseToken.address);
          if (chain.name === "bsc") logoURI = await fetchBscLogo(p.baseToken.address);
        }

        allTokens.push({
          chain: chain.name,
          address: p.baseToken.address,
          symbol: p.baseToken.symbol,
          name: p.baseToken.name || p.baseToken.symbol,
          logoURI,
          priceUsd: Number(p.priceUsd || 0),
          liquidityUsd: Number(p.liquidity?.usd || 0),
          volumeUsd: Number(p.volume?.h24 || 0),
          fdv: Number(p.fdv || 0),
          txns: { h24: { buys: p.txns?.h24?.buys || 0, sells: p.txns?.h24?.sells || 0 } },
          pairAddress: p.pairAddress || null,
          pairCreatedAt: p.pairCreatedAt || null,
          pairUrl: `https://dexscreener.com/${chain.name}/${p.pairAddress}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`${chain.name.toUpperCase()} filtered: ${filtered.length}`);
    } catch (err) {
      console.error(`❌ Error fetching ${chain.name}:`, err.message);
    }
  }

  console.log(`✅ Total tokens collected: ${allTokens.length}`);
  return allTokens;
}

// === 🧠 Dummy X generator & memeScore calculation ===
const xStatsMemory = new Map();
function generateDummyXData(symbol) {
  const key = symbol.toUpperCase();
  const prevData = xStatsMemory.get(key);
  if (!prevData) {
    const initial = { mentions: Math.floor(Math.random() * 5) + 1, likes: Math.floor(Math.random() * 20) + 10, retweets: Math.floor(Math.random() * 10) + 5 };
    initial.engagement = initial.likes + initial.retweets;
    xStatsMemory.set(key, initial);
    return { ...initial, fetchedAt: new Date() };
  }
  const growthFactor = 1 + 0.05 + Math.random() * 0.1;
  let mentions = Math.floor(prevData.mentions * growthFactor);
  let likes = Math.floor(prevData.likes * (growthFactor + 0.1));
  let retweets = Math.floor(prevData.retweets * (growthFactor + 0.05));
  if (Math.random() < 0.08) {
    const viralBoost = 1.5 + Math.random();
    likes = Math.floor(likes * viralBoost);
    retweets = Math.floor(retweets * viralBoost);
  }
  const engagement = likes + retweets;
  const updated = { mentions, likes, retweets, engagement };
  xStatsMemory.set(key, updated);
  return { ...updated, fetchedAt: new Date() };
}

// === 🚀 POST: Cron job ===
export async function POST(request) {
  try {
    let auth = request.headers.get("authorization");
    if (!auth) {
      const url = new URL(request.url);
      auth = url.searchParams.get("secret");
    }
    let bodySecret = null;
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try { bodySecret = (await request.json()).secret; } catch {}
    }
    const secret = auth || bodySecret;
    if (secret !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
      return withCors({ error: "Unauthorized" }, 401);
    }

    console.log("🕒 CRON RUN:", new Date().toISOString());

    // === Hapus token lama tiap 3 hari ===
    const collection = db.collection("tokens");
    const snapshot = await collection.get();
    if (!snapshot.empty) {
      const now = Date.now();
      const deleteBatch = db.batch();
      snapshot.docs.forEach(doc => {
        const updatedAt = new Date(doc.data().updatedAt).getTime();
        if (now - updatedAt > 3*24*60*60*1000) deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log(`🧹 Old tokens older than 3 days deleted`);
    }

    const tokens = await fetchFromDexScreener();
    if (!tokens.length) return withCors({ message: "No tokens fetched" });

    const batch = db.batch();
    tokens.forEach(t => {
      const xData = generateDummyXData(t.symbol);
      const memeScore = xData.engagement + Math.log1p(t.volumeUsd) + 1/(1+t.liquidityUsd);

      batch.set(collection.doc(t.address), {
        ...t,
        xMentions: xData.mentions,
        xLikes: xData.likes,
        xRetweets: xData.retweets,
        xEngagement: xData.engagement,
        xFetchedAt: xData.fetchedAt,
        memeScore,
        updatedAt: new Date()
      });
    });

    await batch.commit();
    console.log(`✅ Firestore updated with ${tokens.length} tokens`);
    return withCors({ success: true, tokens: tokens.length });

  } catch (err) {
    console.error("POST error:", err);
    return withCors({ error: err.message }, 500);
  }
}

// === 🌐 GET: buat frontend lihat hasil ===
export async function GET() {
  try {
    const snapshot = await db.collection("tokens").orderBy("updatedAt","desc").limit(100).get();
    const tokens = snapshot.docs.map(doc => doc.data());
    return withCors({ tokens });
  } catch (err) {
    console.error("Fetch tokens error:", err);
    return withCors({ error: err.message }, 500);
  }
}