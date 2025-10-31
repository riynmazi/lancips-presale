<script>
// === 🌗 DARK MODE TOGGLE ===
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const darkIcon = document.getElementById("darkModeIcon");
  const lightIcon = document.getElementById("lightModeIcon");

  if (!darkIcon || !lightIcon) return;

  // Aktifkan dark mode
  darkIcon.addEventListener("click", () => {
    body.classList.add("dark-mode");
    darkIcon.style.display = "none";
    lightIcon.style.display = "inline";
  });

  // Kembali ke mode terang
  lightIcon.addEventListener("click", () => {
    body.classList.remove("dark-mode");
    darkIcon.style.display = "inline";
    lightIcon.style.display = "none";
  });
});
</script>