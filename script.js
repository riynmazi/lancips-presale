// === TOGGLE MENU ===
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('active');
}

// === AUTO CLOSE MENU ON LINK CLICK ===
window.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const nav = document.querySelector('.nav-links');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Tutup menu kalau sedang aktif (mobile mode)
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
      }
    });
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

// === COPY TO CLIPBOARD (khusus halaman donate) ===
function copyAddress(address) {
  navigator.clipboard.writeText(address)
    .then(() => alert("✅ Address copied:\n" + address))
    .catch(() => alert("❌ Failed to copy address."));
}