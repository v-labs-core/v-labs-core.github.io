window.VINDEM_LABS_CONFIG = {
  contactEmail: "info@vindem.tech",
  contactEndpoint: "contact.php",
};

(() => {
  const links = [...document.querySelectorAll('.site-header a[href^="#"]:not(.brand)')];
  const sections = [...new Set(links.map((link) => document.querySelector(link.hash)))].filter(Boolean);
  const header = document.querySelector(".site-header");
  let frame = null;

  const update = () => {
    const readingLine = (header?.getBoundingClientRect().height || 0) + Math.min(innerHeight * 0.2, 160);
    let currentId = null;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= readingLine) currentId = section.id;
    });

    links.forEach((link) => {
      if (link.hash === `#${currentId}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    frame = null;
  };

  const queueUpdate = () => {
    if (frame === null) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate);
  window.addEventListener("hashchange", queueUpdate);
})();
