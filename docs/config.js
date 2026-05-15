window.VINDEM_LABS_CONFIG = {
  contactEmail: "info@vindem.tech",
  contactEndpoint: "contact.php",
};

(() => {
  const footerBar = document.querySelector(".footer-bar");

  if (footerBar && !footerBar.querySelector(".footer-links")) {
    const footerStyles = document.createElement("style");
    footerStyles.textContent = `
      .footer-bar {
        align-items: center;
        flex-wrap: wrap;
      }

      .footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem 1rem;
        justify-content: flex-end;
      }

      .footer-links a {
        color: var(--brand-deep);
        font-weight: 800;
      }

      .footer-links a:hover,
      .footer-links a:focus-visible {
        color: var(--text);
        text-decoration: underline;
        text-underline-offset: 0.25rem;
      }

      @media (max-width: 640px) {
        .footer-links {
          justify-content: flex-start;
        }
      }
    `;
    document.head.appendChild(footerStyles);

    const footerLinks = document.createElement("nav");
    footerLinks.className = "footer-links";
    footerLinks.setAttribute("aria-label", "Footer");
    footerLinks.innerHTML = `
      <a href="#streams">Offerings</a>
      <a href="#focus">Sectors</a>
      <a href="#contact">Contact</a>
      <a href="https://vindem.tech/privacy.html?v=20260505">Privacy</a>
    `;
    footerBar.appendChild(footerLinks);
  }

  const sectionNavLinks = document.querySelectorAll('.site-header a[href^="#"]:not(.brand)');
  const linkedSections = Array.from(sectionNavLinks)
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);

  if (sectionNavLinks.length && linkedSections.length) {
    const navStyles = document.createElement("style");
    navStyles.textContent = `
      .site-header nav a[aria-current="location"],
      .mobile-nav-panel a[aria-current="location"] {
        background: rgba(0, 167, 179, 0.13);
        color: var(--brand-deep);
        font-weight: 800;
        box-shadow: inset 0 0 0 1px rgba(0, 167, 179, 0.18);
      }
    `;
    document.head.appendChild(navStyles);

    let activeSectionFrame = null;

    const setCurrentSection = (sectionId) => {
      sectionNavLinks.forEach((link) => {
        if (link.hash === `#${sectionId}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const updateCurrentSection = () => {
      const readingLine = window.innerHeight * 0.38;
      let currentSectionId = linkedSections[0].id;

      linkedSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= readingLine) {
          currentSectionId = section.id;
        }
      });

      setCurrentSection(currentSectionId);
      activeSectionFrame = null;
    };

    const queueCurrentSectionUpdate = () => {
      if (activeSectionFrame !== null) {
        return;
      }

      activeSectionFrame = window.requestAnimationFrame(updateCurrentSection);
    };

    updateCurrentSection();
    window.addEventListener("scroll", queueCurrentSectionUpdate, { passive: true });
    window.addEventListener("resize", queueCurrentSectionUpdate);
    window.addEventListener("hashchange", queueCurrentSectionUpdate);
  }

})();
