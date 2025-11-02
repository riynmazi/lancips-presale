// === 📈 Render 3 Trend Charts ===
function renderTrendChart(token) {
  if (!token) return;

  const chartIds = ['chart-0', 'chart-1', 'chart-2'];
  const chartDataSets = [
    {
      // Chart 0: Performance Accumulation
      label: `${token.symbol}`,
      labels: ['Liquidity', 'Volume', 'Reddit score', 'X score',],
      data: [
        token.liquidityUsd || 0,
        token.volumeUsd || 0,
        token.redditEngagement || 0,
        token.xEngagement || 0, 
      ],
      color: '#00ff88'
    },

    {
      // Chart 2: Reddit performance
      label: `${token.symbol}`,
      labels: ['Engagement', 'Total Comments', 'Total Ups', 'Posts'],
      data: [
        token.redditEngagement || 0,
        token.redditTotalComments || 0,
        token.redditTotalUps || 0,
        token.redditPostsCount || 0
      ],
      color: '#ff8800'
    },


    {
      // Chart 1: X Performance
      label: `${token.symbol}`,
      labels: ['Engagement','Likes', 'Mentions', 'Retweets'],
      data: [
        token.xEngagement || 0,
        token.xLikes || 0,
        token.xMentions || 0,
        token.xRetweets || 0 
      ],
      color: '#00bfff'
    }
    
  ];

  chartIds.forEach((id, index) => {
    const ctx = document.getElementById(id);
    if (!ctx) return;

    if (ctx.chartInstance) ctx.chartInstance.destroy();

    const dataset = chartDataSets[index];

    ctx.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dataset.labels,
        datasets: [{
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.color + '55',
          borderColor: dataset.color,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            grid: { color: '#222' },
            ticks: {
              color: '#ccc',
              font: { size: 10 },
              padding: 8 // ⬇️ Bikin label bawah agak turun
            }
          },
          y: {
            grid: { color: '#222' },
            ticks: {
              color: '#ccc',
              font: { size: 10 },
              callback: function(value) {
                if (value >= 1_000_000) return (value / 1_000_000) + 'M';
                if (value >= 1_000) return (value / 1_000) + 'K';
                return value;
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: dataset.label,
            color: '#fff',
            font: { size: 12 }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`
            }
          },
          datalabels: {
            color: '#fff',
            anchor: 'end',
            align: 'top',
            offset: 2,
            font: {
              size: 10,
              weight: 'bold'
            },
            formatter: (value) => {
              if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
              if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
              return value.toFixed(0);
            }
          }
        }
      },
      plugins: [ChartDataLabels] // ✅ aktifin plugin data labels
    });
  });
}

// biar bisa dipanggil global
window.renderTrendChart = renderTrendChart;




// === 🌀 SWIPER INIT ===
let trendSwiper;

function initTrendSwiper() {
  // Hapus dulu swiper lama biar gak dobel
  if (trendSwiper) {
    trendSwiper.destroy(true, true);
  }

  trendSwiper = new Swiper("#chart-container", {
    loop: false,
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

// jalankan otomatis saat panel dibuka dan chart sudah dirender
window.initTrendSwiper = initTrendSwiper;
