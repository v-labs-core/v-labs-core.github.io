window.VINDEM_LABS_CONFIG = {
  formEndpoint: "https://api.web3forms.com/submit",
  formAccessKey: "",
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

  const contactForm = document.getElementById("contact-form");
  const fallback = document.getElementById("contact-fallback");
  const config = window.VINDEM_LABS_CONFIG || {};

  if (!contactForm || !fallback) {
    return;
  }

  fallback.setAttribute("role", "status");

  if (config.formAccessKey) {
    return;
  }

  contactForm.querySelectorAll(".field input, .field textarea").forEach((field) => {
    field.disabled = true;
  });
})();
