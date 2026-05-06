window.VINDEM_LABS_CONFIG = {
  formEndpoint: "https://api.web3forms.com/submit",
  formAccessKey: "",
};

(() => {
  const contactForm = document.getElementById("contact-form");
  const fallback = document.getElementById("contact-fallback");
  const config = window.VINDEM_LABS_CONFIG || {};

  if (!contactForm || !fallback) {
    return;
  }

  fallback.setAttribute("role", "status");
  fallback.innerHTML =
    "<strong>Contact form temporarily unavailable</strong> Message delivery is being configured before inquiries can be sent. The form fields are paused for now.";
  contactForm.insertBefore(fallback, contactForm.firstElementChild);

  if (config.formAccessKey) {
    return;
  }

  const unavailableStyles = document.createElement("style");
  unavailableStyles.textContent = `
    .contact-form.is-unavailable .form-grid {
      opacity: 0.62;
    }

    .contact-form.is-unavailable .field label {
      color: var(--muted);
    }

    .contact-form.is-unavailable .field input,
    .contact-form.is-unavailable .field textarea {
      border-style: dashed;
      background: rgba(255, 255, 255, 0.54);
      color: rgba(19, 49, 56, 0.68);
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(unavailableStyles);

  contactForm.querySelectorAll(".field input, .field textarea").forEach((field) => {
    field.disabled = true;
  });
})();
