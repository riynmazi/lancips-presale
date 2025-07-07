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
  const reveals = document.querySelectorAll('.fade-left, .fade-right');
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

    // 6. Efek loncat preset (pindah posisi) + suara boing
    const jumpPositions = [
      { x: '0%', y: '0%' },           // Tengah
      { x: '-40%', y: '-40%' },       // Kiri atas
      { x: '40%', y: '-40%' },        // Kanan atas
      { x: '-40%', y: '40%' },        // Kiri bawah
      { x: '40%', y: '40%' },         // Kanan bawah
      { x: '0%', y: '-50%' },         // Tengah atas
      { x: '0%', y: '50%' },          // Tengah bawah
    ];

    let jumpIndex = 0;
    const boingSound = new Audio('audio/boing.mp3');

    logoWrapper.addEventListener('click', () => {
      const pos = jumpPositions[jumpIndex];
      logoWrapper.style.left = `calc(50% + ${pos.x})`;
      logoWrapper.style.top = `calc(50% + ${pos.y})`;
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