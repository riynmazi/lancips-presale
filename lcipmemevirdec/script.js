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

// === 🧠 Dummy X generator & memeScore calculation ===
const xStatsMemory = new Map();
function generateDummyXData(symbol) {
  const key = symbol.toUpperCase();
  const prevData = xStatsMemory.get(key);

  if (!prevData) {
    const initial = {
      mentions: Math.floor(Math.random() * 5) + 1,
      likes: Math.floor(Math.random() * 20) + 10,
      retweets: Math.floor(Math.random() * 10) + 5
    };
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

// === 🧠 Fungsi bantu ambil logo token berdasarkan address ===
async function fetchLogo(chain, address) {
  try {
    let logo = null;
    if (chain === "solana") {
      const res = await axios.get(`https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json`, { timeout: 15000 });
      const token = res.data.tokens.find(t => t.address === address);
      if (token) logo = token.logoURI || null;
    } else if (chain === "bsc") {
      const res = await axios.get(`https://tokens.pancakeswap.finance/pancakeswap-extended.json`, { timeout: 15000 });
      const token = res.data.tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      if (token) logo = token.logoURI || null;
    }
    return logo;
  } catch (err) {
    console.error(`❌ Error fetching logo [${chain} | ${address}]: ${err.message}`);
    return null;
  }
}

// === 🚀 POST: Update logo token secara terjadwal (cron) ===
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

    console.log("🕒 Logo cron started:", new Date().toISOString());

    const collection = db.collection("tokens");
    const snapshot = await collection.get();
    if (snapshot.empty) return withCors({ message: "No tokens to update" });

    let updatedCount = 0;
    let successCount = 0;
    let failCount = 0;

    for (const doc of snapshot.docs) {
      const token = doc.data();
      updatedCount++;

      const logo = await fetchLogo(token.chain, token.address);
      if (logo) {
        successCount++;
        console.log(`✅ Logo fetched: [${token.chain}] ${token.symbol}`);
      } else {
        failCount++;
        console.log(`❌ Logo missing: [${token.chain}] ${token.symbol}`);
      }

      await doc.ref.update({ logoURI: logo, updatedAt: new Date() });
    }

    console.log(`🧾 Logo cron finished. Total processed: ${updatedCount}, Success: ${successCount}, Missing: ${failCount}`);

    return withCors({ success: true, total: updatedCount, success: successCount, missing: failCount });

  } catch (err) {
    console.error("POST logo error:", err);
    return withCors({ error: err.message }, 500);
  }
}

// === 🌐 GET: buat frontend lihat hasil ===
export async function GET() {
  try {
    const snapshot = await db
      .collection("tokens")
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();

    const tokens = snapshot.docs.map(doc => doc.data());
    return withCors({ tokens });
  } catch (err) {
    console.error("Fetch tokens error:", err);
    return withCors({ error: err.message }, 500);
  }
}