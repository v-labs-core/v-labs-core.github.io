window.VINDEM_LABS_CONFIG = {
  formEndpoint: "https://api.web3forms.com/submit",
  formAccessKey: "",
};

(() => {
  const contactForm = document.getElementById("contact-form");
  const fallback = document.getElementById("contact-fallback");

  if (!contactForm || !fallback) {
    return;
  }

  fallback.setAttribute("role", "status");
  fallback.innerHTML =
    "<strong>Contact form temporarily unavailable</strong> Message delivery is being configured. Please check back shortly before sending project details.";
  contactForm.insertBefore(fallback, contactForm.firstElementChild);
})();
