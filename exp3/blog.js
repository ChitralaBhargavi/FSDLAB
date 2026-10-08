// Light/dark theme toggle using Bootstrap 5.3 colour modes
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");

  let saved = null;
  try { saved = localStorage.getItem("blog-theme"); } catch (e) {}

  const preferred = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(preferred);

  function setTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    if (btn) {
      btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  if (btn) {
    btn.addEventListener("click", function () {
      const next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      setTheme(next);
      try { localStorage.setItem("blog-theme", next); } catch (e) {}
    });
  }
})();
