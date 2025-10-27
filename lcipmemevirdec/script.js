(function() {
  if (window.__MVD_BACKEND_ENABLED__) return;
  window.__MVD_BACKEND_ENABLED__ = true;

  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';
  const POLL_MS = 60000;
  const VIRAL_LIMIT = 12;
  const NEW_LIMIT = 12;
  const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

  const els = {
    scanCount: document.getElementById('scan-count'),
    loading: document.getElementById('loading'),
    viralCards: document.getElementById('viral-cards'),
    newCards: document.getElementById('new-cards'),
    mobileViral: document.getElementById('mobile-viral'),
    mobileNew: document.getElementById('mobile-new'),
    toast: document.getElementById('toast'),
    tabs: document.querySelectorAll('[role="tab"]'),
  };

  // NEW: Cek apakah semua elemen DOM ada
  for (const [key, el] of Object.entries(els)) {
    if (!el && key !== 'tabs') {
      console.error(`[MVD] Element #${key} not found in DOM`);
    }
    if (key === 'tabs' && el.length === 0) {
      console.error('[MVD] No elements with [role="tab"] found');
    }
  }

  function formatUSD(n) {
    const num = Number(n || 0);
    if (num >= 1e9) return `$${ (num / 1e9).toFixed(2) }B`;
    if (num >= 1e6) return `$${ (num / 1e6).toFixed(2) }M`;
    if (num >= 1e3) return `$${ (num / 1e3).toFixed(2) }K`;
    return `$${ num.toFixed(2) }`;
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return '—';
    const diff = Date.now() - new Date(timestamp).getTime();
    if (isNaN(diff)) return '—'; // NEW: Handle invalid timestamp
    const minutes = Math.max(1, Math.floor(diff / (60 * 1000)));
    if (minutes >= 1440) return `${ Math.floor(minutes / 1440) }d ago`;
    if (minutes >= 60) return `${ Math.floor(minutes / 60) }h ago`;
    return `${ minutes }m ago`;
  }

  function isMemeLike(symbol, name) {
    const kws = ['pepe', 'dog', 'doge', 'shib', 'inu', 'cat', 'elon', 'meme', 'moon', 'pump', 'wojak', 'floki', 'bonk'];
    return kws.some(k => (symbol || '').toLowerCase().includes(k) || (name || '').toLowerCase().includes(k));
  }

  function isViral(p) {
    const vol = Number(p.volumeUsd || 0);
    const liq = Number(p.liquidityUsd || 0);
    const meme = isMemeLike(p.symbol, p.name);
    const viralScore = Number(p.viralScore || 0);
    const xEngagement = Number(p.xEngagement || p.x?.engagement || 0);
    // NEW: Fokus pada volume, liquidity, viralScore, dan engagement karena priceChange nggak ada
    const momentum = viralScore > 15 || xEngagement > 20;
    const healthy = liq >= 30000 || vol >= 100000;
    return meme && healthy && momentum;
  }

  function isFresh(p) {
    const created = new Date(p.createdAt || 0).getTime();
    return created && (Date.now() - created) < FRESH_WINDOW_MS;
  }

  function makeCard(p) {
    const chain = p.chain || 'unknown';
    const symbol = p.symbol || '—';
    const name = p.name || '—';
    const price = p.priceUsd ? Number(p.priceUsd).toFixed(6) : '—';
    const liquidity = p.liquidityUsd || 0;
    const volume = p.volumeUsd || 0;
    const createdAgo = formatTimeAgo(p.createdAt);
    const fetchedAgo = formatTimeAgo(p.xFetchedAt);
    const xLikes = p.xLikes || p.x?.likes || 0;
    const xMentions = p.xMentions || p.x?.mentions || 0;
    const xRetweets = p.xRetweets || p.x?.retweets || 0;
    const xEngagement = p.xEngagement || p.x?.engagement || 0;
    const category = p.category || '—';
    const viralScore = p.viralScore || '—';
    const lunarScore = p.lunar?.galaxyScore || '—';

    const card = document.createElement('article');
    card.className = 'mvd-card';
    card.innerHTML = `
      <div class="mvd-card-header">
        <div class="mvd-title-wrap">
          <span class="mvd-pair">${ symbol }</span>
          ${ isViral(p) ? '<span class="mvd-badge mvd-badge--hot">🔥 HOT</span>' : '' }
          ${ category === 'meme' ? '<span class="mvd-badge mvd-badge--meme">😂 Meme</span>' : '' }
        </div>
        <span class="mvd-badge mvd-badge--chain">${ chain.toUpperCase() }</span>
      </div>
      <div class="mvd-info">
        <span class="mvd-info-label">Name</span>
        <span class="mvd-info-value">${ name }</span>
        <span class="mvd-info-label">Address</span>
        <span class="mvd-info-value mvd-info-address">${ p.address || '—' }</span>
      </div>
      <div class="mvd-metrics">
        <div class="mvd-metric">
          <span class="mvd-metric-label">Price (USD)</span>
          <span class="mvd-metric-value">${ price !== '—' ? `$${ price }` : '—' }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Liquidity</span>
          <span class="mvd-metric-value">${ formatUSD(liquidity) }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Volume (24h)</span>
          <span class="mvd-metric-value">${ formatUSD(volume) }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Viral Score</span>
          <span class="mvd-metric-value ${ viralScore > 15 ? 'mvd-metric-up' : '' }">${ viralScore }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Lunar Score</span>
          <span class="mvd-metric-value">${ lunarScore }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Created</span>
          <span class="mvd-metric-value">${ createdAgo }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">Fetched</span>
          <span class="mvd-metric-value">${ fetchedAgo }</span>
        </div>
      </div>
      <div class="mvd-social">
        <div class="mvd-metric">
          <span class="mvd-metric-label">❤️ Likes</span>
          <span class="mvd-metric-value">${ xLikes }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">💬 Mentions</span>
          <span class="mvd-metric-value">${ xMentions }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">🔄 Retweets</span>
          <span class="mvd-metric-value">${ xRetweets }</span>
        </div>
        <div class="mvd-metric">
          <span class="mvd-metric-label">📈 Engagement</span>
          <span class="mvd-metric-value">${ xEngagement }</span>
        </div>
      </div>
      <div class="mvd-footer">
        <div class="mvd-chips">
          ${ category !== '—' ? `<span class="mvd-chip">🏷️ ${ category }</span>` : '' }
          <span class="mvd-chip">💰 ${ formatUSD(volume) }</span>
          <span class="mvd-chip">💧 ${ formatUSD(liquidity) }</span>
          <span class="mvd-chip mvd-age">🕒 ${ createdAgo }</span>
        </div>
        <a class="mvd-view" href="${ p.pairUrl || '#' }" target="_blank" rel="noopener">🔗 View</a>
      </div>
    `;
    return card;
  }

  async function fetchTokens() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        console.error(`[MVD] Fetch failed with status: ${res.status}`); // NEW: Log status
        throw new Error('Failed to fetch tokens');
      }
      const data = await res.json();
      if (!data) {
        console.error('[MVD] Empty response from API');
        throw new Error('Empty response');
      }
      const tokens = Array.isArray(data) ? data : data.tokens || [];
      console.log('[MVD] Fetched tokens:', tokens); // NEW: Log data buat debug
      return tokens;
    } catch (err) {
      console.error('[MVD] Error fetch:', err);
      if (els.viralCards) els.viralCards.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      if (els.newCards) els.newCards.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      if (els.mobileViral) els.mobileViral.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      if (els.mobileNew) els.mobileNew.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      return [];
    }
  }

  function render(pairs) {
    if (!els.viralCards || !els.newCards || !els.mobileViral || !els.mobileNew || !els.scanCount) {
      console.error('[MVD] Missing required DOM elements for rendering');
      return;
    }

    const fresh = pairs.filter(isFresh).slice(0, NEW_LIMIT);
    const viral = pairs.filter(isViral).slice(0, VIRAL_LIMIT);

    // NEW: Trigger toast kalau ada viral baru
    if (viral.length > 0 && els.toast) {
      els.toast.classList.remove('hidden');
      setTimeout(() => els.toast.classList.add('hidden'), 3000);
    }

    els.viralCards.innerHTML = viral.length ? '' : '<div class="mvd-empty">😴 No viral memes yet!</div>';
    els.newCards.innerHTML = fresh.length ? '' : '<div class="mvd-empty">🍼 No new memes yet!</div>';
    els.mobileViral.innerHTML = viral.length ? '' : '<div class="mvd-empty">😴 No viral memes yet!</div>';
    els.mobileNew.innerHTML = fresh.length ? '' : '<div class="mvd-empty">🍼 No new memes yet!</div>';

    viral.forEach(p => {
      const card = makeCard(p);
      els.viralCards.appendChild(card);
      els.mobileViral.appendChild(card.cloneNode(true)); // NEW: Clone node biar nggak error DOM
    });
    fresh.forEach(p => {
      const card = makeCard(p);
      els.newCards.appendChild(card);
      els.mobileNew.appendChild(card.cloneNode(true)); // NEW: Clone node
    });

    els.scanCount.textContent = pairs.filter(p => p.createdAt && (Date.now() - new Date(p.createdAt).getTime()) < 24 * 60 * 60 * 1000).length;
  }

  // NEW: Cek apakah tabs ada sebelum tambah event listener
  if (els.tabs.length > 0) {
    els.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        els.tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');
        if (els.mobileViral && els.mobileNew) {
          els.mobileViral.classList.toggle('hidden', tab.getAttribute('data-tab') !== 'viral');
          els.mobileNew.classList.toggle('hidden', tab.getAttribute('data-tab') !== 'new');
        } else {
          console.error('[MVD] Mobile viral or new panel missing');
        }
      });
    });
  } else {
    console.warn('[MVD] No tabs found, skipping tab event listeners');
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.log('[MVD] DOM loaded, starting scan'); // NEW: Log buat debug
    scan();
    setInterval(scan, POLL_MS);
  });

  async function scan() {
    if (!els.loading) {
      console.error('[MVD] Loading element missing');
      return;
    }
    els.loading.classList.remove('hidden');
    const tokens = await fetchTokens();
    render(tokens);
    els.loading.classList.add('hidden');
  }
})();
