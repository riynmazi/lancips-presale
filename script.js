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


// === MEME QUOTE MARQUEE SCROLL (Seamless) ===
window.addEventListener('DOMContentLoaded', () => {
  const quoteContainer = document.querySelector('.meme-quotes');
  const marqueeText = document.getElementById('marquee-text');
  const marqueeClone = document.getElementById('marquee-text-clone');

  if (!quoteContainer || !marqueeText || !marqueeClone) return;

  const quotes = [...quoteContainer.querySelectorAll('div')].map(el => el.innerHTML.trim());
  const fullQuote = quotes.join(' • ');

  marqueeText.innerHTML = fullQuote;
  marqueeClone.innerHTML = fullQuote;
});



// WEIRD

function showFunnyAlert(message, type) {
  const alertBox = document.getElementById('fun-alert');
  if (!alertBox) return;

  // Reset class
  alertBox.className = 'fun-alert';
  if (type === 'fortune') alertBox.classList.add('fortune');
  if (type === 'useless') alertBox.classList.add('useless');

  alertBox.innerText = message;
  alertBox.style.display = 'block';

  alertBox.style.animation = 'none';
  void alertBox.offsetWidth;
  alertBox.style.animation = 'pop-fade 3s ease-in-out';

  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 3000);
}

function generateFortune() {
  const fortunes = [
    "🔮 Your token will moon. In your dreams. 🌕🛌",
    "🧘 You’ll get rugged today. Spiritually.",
    "🐻 You’re early. For the next bear market.",
    "📦 Someone is about to buy your bag. Not today.",
    "💬❤️ You will find love… in the Telegram chat.",
    "📉💸 The chart says up. But your wallet says no.",
  ];
  const random = fortunes[Math.floor(Math.random() * fortunes.length)];
  showFunnyAlert(random, 'fortune');
}

function pressUselessButton() {
  const messages = [
    "🤡 Why did you press that?",
    "💸 Congratulations, you're still broke!",
    "⚡️ Nice reflexes. Still no airdrop.",
    "🎉 Well that was pointless.",
    "⌛ You wasted 0.001 seconds. Worth it?",
    "🕵️ You're now being watched. Just kidding. Or not.",
  ];
  const random = messages[Math.floor(Math.random() * messages.length)];
  showFunnyAlert(random, 'useless');
}

function showFunnyAlert(message, type) {
  const alertBox = document.getElementById('fun-alert');
  if (!alertBox) return;

  // Reset class
  alertBox.className = 'fun-alert';
  if (type) alertBox.classList.add(type);

  alertBox.innerText = message;
  alertBox.style.display = 'block';

  alertBox.style.animation = 'none';
  void alertBox.offsetWidth;
  alertBox.style.animation = 'pop-fade 3s ease-in-out';

  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 3000);
}

function screamAlert() {
  showFunnyAlert("Ahh! Don’t touch me! 😱💢", "useless");
}