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


  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar-wrapper");
    if (window.scrollY > 30) {
      navbar.classList.add("shrink");
    } else {
      navbar.classList.remove("shrink");
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

// Fungsi tambahan di luar
function screamAlert() {
  showFunnyAlert("Ahh! Don’t touch me! 😱💢", "useless");
}



//FORTUNE

function activateCrystalBall(wrapper) {
  const ball = wrapper.querySelector('.magic-ball');
  const overlay = wrapper.querySelector('.lightning-overlay');
  const alertBox = document.getElementById('fun-alert');

  // Reset animasi bola
  wrapper.classList.remove('shock');
  ball.style.animation = 'none';
  void ball.offsetWidth; // trigger reflow
  ball.style.animation = 'shake 0.5s';

  // Efek petir menyala
  overlay.style.opacity = '1';

  // Setelah 500ms: petir mati, bola kembali muter
  setTimeout(() => {
    overlay.style.opacity = '0';
    wrapper.classList.remove('shock');
    ball.style.animation = 'slowRotate 12s linear infinite';
  }, 500);

  // Random fortune
  const fortunes = [
    "You're about to buy the top 😹",
    "Soon... you'll be rich or rugged. Who knows?",
    "The spirits say: GM.",
    "Airdrop coming? Keep dreaming.",
    "Your wallet is... empty 😭"
  ];
  const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

  // Tampilkan alert lucu
  showFunnyAlert(randomFortune, "fortune");
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



function askLcipAI() {
  const input = document.getElementById("user-question");
  const chatBox = document.getElementById("chat-box");
  const userText = input.value.trim();

  if (userText === "") return;

  // Tambahkan pesan user ke chatbox
  const userMsg = document.createElement("div");
  userMsg.className = "lcip-ai-msg user";
  userMsg.innerText = userText;
  chatBox.appendChild(userMsg);

  // Scroll ke bawah otomatis
  chatBox.scrollTop = chatBox.scrollHeight;

  input.value = "";

  // Simulasikan loading bot
  const loadingMsg = document.createElement("div");
  loadingMsg.className = "lcip-ai-msg bot typing";
  loadingMsg.innerText = "LCIP-AI is thinking...";
  chatBox.appendChild(loadingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Setelah delay, tampilkan jawaban random
  setTimeout(() => {
    loadingMsg.remove();

    const responses = [
      "Sounds like a rugpull, go on.",
      "Not financial advice, but... good luck!",
      "Trust me, I'm coded to be wise.",
      "You should’ve asked GPT, not me.",
      "I can neither confirm nor deny.",
      "Yes. Or no. Depends on the vibes.",
      "Why are you like this? 😂",
      "Ask again when gas fees are lower.",
      "It’s a bull market. In your imagination.",
    ];

    const botMsg = document.createElement("div");
    botMsg.className = "lcip-ai-msg bot";
    botMsg.innerText = responses[Math.floor(Math.random() * responses.length)];
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1200); // Delay 1.2 detik untuk efek realistik
}


// === SWITCH TAB ===
function showTab(tabId) {
  // Sembunyikan semua tab-pane
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => pane.classList.remove('active'));

  // Nonaktifkan semua tombol tab
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Tampilkan tab yang diklik
  const targetPane = document.getElementById(tabId);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Aktifkan tombol yang diklik
  const btnToActivate = [...buttons].find(btn =>
    btn.getAttribute('onclick')?.includes(tabId)
  );
  if (btnToActivate) {
    btnToActivate.classList.add('active');
  }
}



  const body = document.body;
  const darkIcon = document.getElementById("darkModeIcon");   // Klik untuk AKTIFKAN mode gelap
  const lightIcon = document.getElementById("lightModeIcon"); // Klik untuk AKTIFKAN mode terang

  darkIcon.addEventListener("click", () => {
    body.classList.add("dark-mode");           // Aktifkan dark mode
    darkIcon.style.display = "none";           // Sembunyikan ikon dark
    lightIcon.style.display = "inline";        // Tampilkan ikon light
  });

  lightIcon.addEventListener("click", () => {
    body.classList.remove("dark-mode");        // Kembali ke terang
    darkIcon.style.display = "inline";
    lightIcon.style.display = "none";
  });