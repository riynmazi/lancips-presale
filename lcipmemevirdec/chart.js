// chart render

function renderTrendChart(token) {
  if (!token) return;

  const tokenCharts = [
    {
      title: "Performance Accumulated",
      labels: ["Liquidity", "Mentions", "Likes", "Retweets"],
      data: [
        token.liquidityUsd || 0,
        token.xMentions || 0,
        token.xLikes || 0,
        token.xRetweets || 0
      ]
    },
    {
      title: "X Performance",
      labels: ["Liquidity", "Mentions", "Likes"],
      data: [
        token.liquidityUsd || 0,
        token.xMentions || 0,
        token.xLikes || 0
      ]
    },
    {
      title: "Reddit Performance",
      labels: ["Reddit Mentions", "Reddit Upvotes", "Reddit Comments"],
      data: [
        token.redditMentions || 0,
        token.redditUpvotes || 0,
        token.redditComments || 0
      ]
    }
  ];

  // Render chart tiap slide
  tokenCharts.forEach((chartData, i) => {
    const canvas = document.getElementById(`chart-${i}`);
    if (!canvas) return;

    // Hapus chart lama kalau ada
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    canvas.chartInstance = new Chart(canvas.getContext("2d"), {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.data,
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
        plugins: {
          legend: { display: false },
          title: { display: true, text: chartData.title, font: { size: 14 } }
        },
        scales: {
          x: { grid: { color: '#222' }, ticks: { color: '#ccc' } },
          y: { grid: { color: '#222' }, ticks: { color: '#ccc' } }
        }
      }
    });
  });

  // Inisialisasi Swiper (slide)
  if (!window.chartSwiper) {
    window.chartSwiper = new Swiper('#chart-container', {
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: { el: '.swiper-pagination', clickable: true },
    });
  }
}

window.renderTrendChart = renderTrendChart;