// === 📈 Trend Chart ===
function renderTrendChart(token) {
  const ctx = document.getElementById('trend-chart');
  if (!ctx || !token) return;

  const labels = ['Mentions', 'Likes', 'Retweets'];
  const values = [
    token.mentions || 0,
    token.likes || 0,
    token.retweets || 0
  ];

  // Hapus chart lama kalau ada
  if (ctx.chartInstance) {
    ctx.chartInstance.destroy();
  }

  ctx.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${token.symbol} Trend`,
        data: values,
        fill: true,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0,255,136,0.15)',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { grid: { color: '#222' }, ticks: { color: '#ccc' } },
        y: { grid: { color: '#222' }, ticks: { color: '#ccc' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// Buat global supaya bisa dipanggil di script utama
window.renderTrendChart = renderTrendChart;
