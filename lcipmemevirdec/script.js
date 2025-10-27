(function() {
  if (window.__MVD_BACKEND_ENABLED__) return;
  window.__MVD_BACKEND_ENABLED__ = true;

  const API_URL = 'https://backend-memevirdec.vercel.app/api/fetch-meme-tokens';
  const POLL_MS = 60000;
  const VIRAL_LIMIT = 12;
  const NEW_LIMIT = 12;
  const FRESH_WINDOW_MS = 6 * 60 * 60 * 1000;

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

  function formatUSD(n) {
    const num = Number(n || 0);
    if (num >= 1e9) return `$${ (num / 1e9).toFixed(2) }B`;
    if (num >= 1e6) return `$${ (num / 1e6).toFixed(2) }M`;
    if (num >= 1e3) return `$${ (num / 1e3).toFixed(2) }K`;
    return `$${ num.toFixed(2) }`;
  }

  function formatPct(n) {
    if (n == null || isNaN(n)) return '—';
    const sign = n > 0 ? '+' : '';
    return `${ sign }${ n.toFixed(2) }%`;
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return '—';
    const diff = Date.now() - new Date(timestamp).getTime();
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
    const ch1 = Number(p.priceChange?.h1 || 0);
    const ch6 = Number(p.priceChange?.h6 || 0);
    const meme = isMemeLike(p.symbol, p.name);
    const momentum = ch1 > 50 || ch6 > 100 || p.viralScore > 15;
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
      if (!res.ok) throw new Error('Failed to fetch tokens');
      const data = await res.json();
      return Array.isArray(data) ? data : data.tokens || [];
    } catch (err) {
      console.error('[MVD] Error fetch:', err);
      els.viralCards.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      els.newCards.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      els.mobileViral.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      els.mobileNew.innerHTML = '<div class="mvd-empty">😿 Oops, our meme radar is down! Try again later.</div>';
      return [];
    }
  }

  function render(pairs) {
    const fresh = pairs.filter(isFresh).slice(0, NEW_LIMIT);
    const viral = pairs.filter(isViral).slice(0, VIRAL_LIMIT);

    els.viralCards.innerHTML = viral.length ? '' : '<div class="mvd-empty">😴 No viral memes yet!</div>';
    els.newCards.innerHTML = fresh.length ? '' : '<div class="mvd-empty">🍼 No new memes yet!</div>';
    els.mobileViral.innerHTML = viral.length ? '' : '<div class="mvd-empty">😴 No viral memes yet!</div>';
    els.mobileNew.innerHTML = fresh.length ? '' : '<div class="mvd-empty">🍼 No new memes yet!</div>';

    viral.forEach(p => {
      els.viralCards.appendChild(makeCard(p));
      els.mobileViral.appendChild(makeCard(p));
    });
    fresh.forEach(p => {
      els.newCards.appendChild(makeCard(p));
      els.mobileNew.appendChild(makeCard(p));
    });

    els.scanCount.textContent = pairs.filter(p => p.createdAt && (Date.now() - new Date(p.createdAt).getTime()) < 24 * 60 * 60 * 1000).length;
  }

  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      els.tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      els.mobileViral.classList.toggle('hidden', tab.getAttribute('data-tab') !== 'viral');
      els.mobileNew.classList.toggle('hidden', tab.getAttribute('data-tab') !== 'new');
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    setInterval(scan, POLL_MS);
  });

  async function scan() {
    els.loading.classList.remove('hidden');
    const tokens = await fetchTokens();
    render(tokens);
    els.loading.classList.add('hidden');
  }
})();
