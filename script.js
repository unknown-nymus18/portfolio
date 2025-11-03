// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("contact-form");
//   // Support for both possible forms
//   const sendBtn = document.getElementById("send-btn");
//   if (form) {
//     form.addEventListener("submit", function (e) {
//       e.preventDefault();
//       const status = document.getElementById("form-status");
//       status.textContent = "Thank you! Your message has been sent.";
//       form.reset();
//     });
//     if (sendBtn) {
//       sendBtn.addEventListener("click", function (e) {
//         e.preventDefault();
//         form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
//       });
//     }
//   } else if (sendBtn) {
//     // For the form structure in contact.html (no <form> tag)
//     sendBtn.addEventListener("click", function (e) {
//       e.preventDefault();
//       const name = document.getElementById("name").value.trim();
//       const email = document.getElementById("email").value.trim();
//       const message = document.getElementById("message").value.trim();
//       let status = document.getElementById("form-status");
//       if (!status) {
//         status = document.createElement("p");
//         status.id = "form-status";
//         sendBtn.parentNode.appendChild(status);
//       }
//       if (name && email && message) {
//         status.textContent = "Thank you! Your message has been sent.";
//         document.getElementById("name").value = "";
//         document.getElementById("email").value = "";
//         document.getElementById("message").value = "";
//       } else {
//         status.textContent = "Please fill in all fields.";
//       }
//     });
//   }
// });


window.addEventListener("scroll",function(){
  console.log(window.scrollY);
  const target = document.querySelector('header');

  if(this.window.scrollY>30){
    target.classList.add('scrolled');

  }
  else{
    target.classList.remove('scrolled');
  }
});
