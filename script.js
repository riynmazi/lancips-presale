// === TOGGLE MENU ===
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  const toggleBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('menuClose');

  nav.classList.toggle('active');

  const isActive = nav.classList.contains('active');
  toggleBtn.style.display = isActive ? 'none' : 'block';
  closeBtn.style.display = isActive ? 'block' : 'none';
}

// === SCROLL REVEAL ===
function revealOnScroll() {
  const reveals = document.querySelectorAll('.fade-left, .fade-right, .fade-in-up');

  for (const el of reveals) {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight - 100;

    if (isVisible) {
      el.classList.add('show');
    }
  }
}

// === DOM READY ===
window.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const toggleBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('menuClose');
  const logoWrapper = document.querySelector('.logo-wrapper');

  // 1. Margin top otomatis untuk logo
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  const logoContainer = document.querySelector('.logo-container');
  if (navbarWrapper && logoContainer) {
    const navbarHeight = navbarWrapper.offsetHeight;
    logoContainer.style.marginTop = navbarHeight + 'px';
  }

  // 2. Tutup menu setelah klik link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggleBtn.style.display = 'block';
      closeBtn.style.display = 'none';
    });
  });

  // 3. Tutup menu jika klik di luar
  document.addEventListener('click', (e) => {
    const isClickInsideNav = nav.contains(e.target);
    const isClickOnToggle = toggleBtn.contains(e.target);
    const isClickOnClose = closeBtn.contains(e.target);

    if (!isClickInsideNav && !isClickOnToggle && !isClickOnClose) {
      nav.classList.remove('active');
      toggleBtn.style.display = 'block';
      closeBtn.style.display = 'none';
    }
  });

  // 4. Reveal saat load awal
  revealOnScroll();

  // 5. Efek bintang saat hover logo
  if (logoWrapper) {
    logoWrapper.addEventListener('mouseenter', () => {
      const container = document.querySelector('.star-particles');
      if (!container) return;

      for (let i = 0; i < 12; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 40 + 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        star.style.setProperty('--x', `${x}px`);
        star.style.setProperty('--y', `${y}px`);
        container.appendChild(star);

        setTimeout(() => {
          star.remove();
        }, 600);
      }
    });

    // 6. Efek gerak preset + suara saat klik logo
    const jumpPositions = [
      { x: '50%', y: '50%' },      // Tengah
      { x: '20%', y: '20%' },      // Kiri atas
      { x: '80%', y: '20%' },      // Kanan atas
      { x: '20%', y: '80%' },      // Kiri bawah
      { x: '80%', y: '80%' },      // Kanan bawah
      { x: '50%', y: '20%' },      // Tengah atas
      { x: '50%', y: '80%' },      // Tengah bawah
    ];
    let jumpIndex = 0;

    const boingSound = new Audio('audio/boing.mp3');

    logoWrapper.addEventListener('click', () => {
      const pos = jumpPositions[jumpIndex];

      logoWrapper.style.transition = 'none';
      logoWrapper.style.left = pos.x;
      logoWrapper.style.top = pos.y;
      logoWrapper.offsetHeight; // force reflow

      logoWrapper.style.transition = 'left 0.4s ease, top 0.4s ease, transform 0.3s ease';
      logoWrapper.style.left = pos.x;
      logoWrapper.style.top = pos.y;
      logoWrapper.style.transform = 'translate(-50%, -50%)';

      boingSound.currentTime = 0;
      boingSound.play();

      jumpIndex = (jumpIndex + 1) % jumpPositions.length;
    });
  }
});

// === SCROLL EVENT ===
window.addEventListener('scroll', revealOnScroll);

// === COPY TO CLIPBOARD (untuk donate.html) ===
function copyAddress(address) {
  navigator.clipboard.writeText(address)
    .then(() => alert("✅ Address copied:\n" + address))
    .catch(() => alert("❌ Failed to copy address."));
}


// === MEME QUOTE MARQUEE AUTO SCROLL ===
window.addEventListener('DOMContentLoaded', () => {
  const quoteContainer = document.querySelector('.meme-quotes');
  const quoteDisplay = document.getElementById('quote-display');

  if (!quoteContainer || !quoteDisplay) {
    console.warn("Meme quote elements not found");
    return;
  }

  // Ambil semua quote dan gabungkan jadi satu string panjang
  const quotes = [...quoteContainer.querySelectorAll('div')].map(el => el.innerHTML.trim());
  const fullQuote = quotes.join(' • ');

  // Masukkan ke elemen display
  quoteDisplay.innerHTML = fullQuote;

  // Reset posisi awal & animasi (tanpa delay)
  quoteDisplay.style.transform = 'translateX(100%)';
  quoteDisplay.style.animation = 'none';
  void quoteDisplay.offsetWidth;

  // Durasi animasi berdasarkan panjang teks (pelan tapi langsung jalan)
  const duration = Math.min(60, Math.max(20, fullQuote.length * 0.1));
  quoteDisplay.style.animation = `scrollLeft ${duration}s linear infinite`;
});