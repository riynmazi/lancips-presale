// === TOGGLE MENU ===
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('active');
}

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