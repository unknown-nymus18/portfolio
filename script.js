document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const status = document.getElementById("form-status");
      status.textContent = "Thank you! Your message has been sent.";
      form.reset();
    });
  }
});
