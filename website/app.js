(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");

  function effectiveTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  themeButton?.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("chuan-theme", next); } catch (_) {}
  });

  const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${visible.target.id}`
        );
      });
    }, { rootMargin: "-25% 0px -58% 0px", threshold: [0, .15, .35, .65] });

    sections.forEach((section) => observer.observe(section));
  }

  const pipelineTitles = {
    "0–4": "Preprocess",
    "5–7": "Reconstruct",
    "8": "Prepare",
    "9": "Train",
    "10": "Publish"
  };

  const tabs = [...document.querySelectorAll(".pipeline__tab")];
  const badge = document.getElementById("pipeline-badge");
  const title = document.getElementById("pipeline-title");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const stage = tab.dataset.stage;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      if (badge) badge.textContent = `Stage ${stage}`;
      if (title) title.textContent = pipelineTitles[stage] || "Pipeline phase";
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
