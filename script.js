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

// === AUTO CLOSE MENU ON LINK CLICK or Outside ===
window.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const toggleBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('menuClose');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggleBtn.style.display = 'block';
      closeBtn.style.display = 'none';
    });
  });

  // Close if click outside nav & not on toggle
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
});




// === AUTO MARGIN-TOP BUAT LOGO (biar ga ketiban navbar) ===
window.addEventListener('DOMContentLoaded', () => {
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  const logoContainer = document.querySelector('.logo-container');
  if (navbarWrapper && logoContainer) {
    const navbarHeight = navbarWrapper.offsetHeight;
    logoContainer.style.marginTop = navbarHeight + 'px';
  }
});


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

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', revealOnScroll);



document.querySelector('.logo-wrapper').addEventListener('mouseenter', () => {
  const container = document.querySelector('.star-particles');

  for (let i = 0; i < 12; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    // Random arah ledakan
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 40 + 20;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    star.style.setProperty('--x', `${x}px`);
    star.style.setProperty('--y', `${y}px`);

    container.appendChild(star);

    // Hapus bintang setelah animasi selesai
    setTimeout(() => {
      star.remove();
    }, 600);
  }
});



// === COPY TO CLIPBOARD ( donate.html) ===
function copyAddress(address) {
  navigator.clipboard.writeText(address)
    .then(() => alert("✅ Address copied:\n" + address))
    .catch(() => alert("❌ Failed to copy address."));
}

