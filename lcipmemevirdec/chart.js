// === 📈 Render 3 Trend Charts ===
function renderTrendChart(token) {
  if (!token) return;

  const chartIds = ['chart-0', 'chart-1', 'chart-2'];
const chartDataSets = [
  {
    // Chart 0: Performance Accumulation
    label: `${token.symbol} Performance Accumulation`,
    labels: ['Liquidity', 'Volume', 'Likes', 'Mentions', 'Retweets'],
    data: [
      token.liquidityUsd || 0,
      token.volumeUsd || 0,
      token.xLikes || 0,
      token.xMentions || 0,
      token.xRetweets || 0
    ],
    color: '#00ff88'
  },
  {
    // Chart 1: X Performance
    label: `${token.symbol} X Performance`,
    labels: ['Likes', 'Mentions', 'Retweets'],
    data: [
      token.xLikes || 0,
      token.xMentions || 0,
      token.xRetweets || 0
    ],
    color: '#00bfff'
  },
  {
    // Chart 2: Kosong dulu
    label: `${token.symbol} Reddit performance`,
    labels: ['Engagement', 'Total Comments', 'Total Ups'],
    data: [
      token.redditEngagement || 0,
      token.redditTotalComments || 0,
      token.redditTotalUps || 0
    ],
    color: '#ff8800'
  }
];


  chartIds.forEach((id, index) => {
    const ctx = document.getElementById(id);
    if (!ctx) return;

    // Hapus chart lama kalau ada
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
        font: {
          size: 10  // 🔥 kecilin label bawah (Mentions, Likes, dll)
        }
      }
    },
    y: {
      grid: { color: '#222' },
      ticks: {
        color: '#ccc',
        font: {
          size: 10  // 🔥 kecilin angka kiri (nilai)
        }
      }
    }
  },
  plugins: {
    legend: { display: false }, // ❌ legend dimatiin
    title: {
      display: true, // ✅ tampilkan judul di atas chart
      text: '',      // nanti diisi per chart
      color: '#fff',
      font: { size: 12 } // 🔥 ukuran judul kecil
    }
  }
}

    });
  });
}

// biar bisa dipanggil global dari script utama
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
