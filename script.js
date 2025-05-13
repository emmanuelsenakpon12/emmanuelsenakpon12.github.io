// 🎨 Animation de l'arrière-plan
const bg = document.getElementById('bg-animation');
let hue = 0;
setInterval(() => {
  hue = (hue + 0.5) % 360;
  bg.style.filter = `hue-rotate(${hue}deg)`;
}, 60);

// ✨ Fade-in des sections
const fadeIns = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

fadeIns.forEach(el => observer.observe(el));

// 📌 Menu actif selon scroll
const navLinks = document.querySelectorAll('.sidebar nav a');
const sections = document.querySelectorAll('main section');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const offset = section.offsetTop - 120;
    const height = section.offsetHeight;
    if (window.scrollY >= offset && window.scrollY < offset + height) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// 📱 Menu responsive
const menuBtn = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// 📬 EmailJS contact form
const form = document.getElementById('contact-form');
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Injecte la date dans le champ caché
  document.getElementById('message-date').value = new Date().toLocaleString();

  emailjs.sendForm('VOTRE_SERVICE_ID', 'VOTRE_TEMPLATE_ID', this)
    .then(() => {
      alert('✅ Message envoyé avec succès !');
      form.reset();
    })
    .catch(error => {
      alert('❌ Erreur : ' + JSON.stringify(error));
    });
});
