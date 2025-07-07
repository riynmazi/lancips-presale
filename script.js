// === TOGGLE MENU ===
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  nav.classList.toggle('active');
}

// === AUTO CLOSE MENU ON LINK CLICK ===
window.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const nav = document.querySelector('.nav-links');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
      }
    });
  });

  // === AUTO CLOSE MENU IF CLICK OUTSIDE ===
  document.addEventListener('click', (e) => {
    const toggleBtn = document.querySelector('.menu-toggle');
    const isClickInsideNav = nav.contains(e.target);
    const isClickOnToggle = toggleBtn.contains(e.target);

    if (!isClickInsideNav && !isClickOnToggle) {
      nav.classList.remove('active');
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



// === COPY TO CLIPBOARD ( donate.html) ===
function copyAddress(address) {
  navigator.clipboard.writeText(address)
    .then(() => alert("✅ Address copied:\n" + address))
    .catch(() => alert("❌ Failed to copy address."));
}

