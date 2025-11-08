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

// Lightbox functionality
function openLightbox(img) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('active');
  
  // Prevent body scroll when lightbox is open
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  
  // Restore body scroll
  document.body.style.overflow = 'auto';
}

// Close lightbox with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

// Create dynamic CSS for pseudo-element control
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .projects h2.reveal-0::before { width: 0%; }
  .projects h2.reveal-10::before { width: 10%; }
  .projects h2.reveal-20::before { width: 20%; }
  .projects h2.reveal-30::before { width: 30%; }
  .projects h2.reveal-40::before { width: 40%; }
  .projects h2.reveal-50::before { width: 50%; }
  .projects h2.reveal-60::before { width: 60%; }
  .projects h2.reveal-70::before { width: 70%; }
  .projects h2.reveal-80::before { width: 80%; }
  .projects h2.reveal-90::before { width: 90%; }
  .projects h2.reveal-100::before { width: 100%; }

  /* Mobile-specific adjustments */
  @media (max-width: 768px) {
    .projects h2 {
      -webkit-text-stroke: 1px var(--text-primary) !important;
    }
    
    .projects h2::before {
      transition: width 0.3s ease;
      font-size: 3rem;
    }
    
    .projects h2.reveal-0::before { width: 0%; }
    .projects h2.reveal-10::before { width: 10%; }
    .projects h2.reveal-20::before { width: 20%; }
    .projects h2.reveal-30::before { width: 30%; }
    .projects h2.reveal-40::before { width: 40%; }
    .projects h2.reveal-50::before { width: 50%; }
    .projects h2.reveal-60::before { width: 60%; }
    .projects h2.reveal-70::before { width: 70%; }
    .projects h2.reveal-80::before { width: 80%; }
    .projects h2.reveal-90::before { width: 90%; }
    .projects h2.reveal-100::before { width: 100%; }
  }
`;
document.head.appendChild(styleSheet);

// Scroll-based text reveal animation for "RECENT WORKS"
function updateScrollReveal() {
  const titleElement = document.querySelector('.projects h2');
  if (!titleElement) return;

  // Check if mobile device - skip animation on mobile
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Remove any existing animation classes on mobile
    titleElement.className = titleElement.className.replace(/reveal-\d+/g, '');
    return;
  }

  const rect = titleElement.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Desktop animation triggers
  const elementTop = rect.top;
  const triggerStart = windowHeight * 0.8;
  const triggerEnd = windowHeight * 0.2;
  
  let progress = 0;
  
  if (elementTop <= triggerStart && elementTop >= triggerEnd) {
    progress = (triggerStart - elementTop) / (triggerStart - triggerEnd);
  } else if (elementTop < triggerEnd) {
    progress = 1;
  }
  
  progress = Math.max(0, Math.min(1, progress));
  const fillWidth = Math.round(progress * 10) * 10; // Round to nearest 10%
  
  // Remove all reveal classes and add the current one
  titleElement.className = titleElement.className.replace(/reveal-\d+/g, '');
  titleElement.classList.add(`reveal-${fillWidth}`);
  
  // Debug logging (desktop only)
  console.log('Scroll progress (desktop):', progress, 'Fill width:', fillWidth + '%');
}

// Throttled scroll event
let scrollTicking = false;
function handleScrollReveal() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateScrollReveal();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

window.addEventListener('scroll', handleScrollReveal);
window.addEventListener('resize', updateScrollReveal);

// Initial call
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateScrollReveal, 100); // Slight delay to ensure DOM is ready
});