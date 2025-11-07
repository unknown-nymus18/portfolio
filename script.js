function sendEmail(){
  if(!document.getElementById('name').value || !document.getElementById('email').value || !document.getElementById('message').value){
    alert("Please fill in all fields.");
    return;
  }
  document.getElementById('send-btn').innerHTML = "Sending...";
  
  let templateParams = {
    from_name: document.getElementById('name').value,
    from_email: document.getElementById('email').value,
    message: document.getElementById('message').value,
  };

  emailjs.send("service_fq0fsr6",'template_y0twnl3', templateParams)
  .then(function (response){
    document.getElementById('send-btn').innerHTML = "Message sent successfully!";
    // Reset form
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
    // Reset button after 3 seconds
    setTimeout(function() {
      document.getElementById('send-btn').innerHTML = "SEND MESSAGE";
    }, 3000);
  })
  .catch(function(error) {
    console.error("EmailJS Error:", error);
    document.getElementById('send-btn').innerHTML = "SEND MESSAGE";
    alert("Failed to send message: " + JSON.stringify(error));
  });
}

window.addEventListener("scroll",function(){
  const target = document.querySelector('header');

  if(this.window.scrollY>30){
    target.classList.add('scrolled');

  }
  else{
    target.classList.remove('scrolled');
  }
});
