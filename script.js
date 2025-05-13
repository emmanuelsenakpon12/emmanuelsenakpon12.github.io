// 🎨 Animation de l'arrière-plan fluide
const bg = document.getElementById('bg-animation');
let hue = 0;
setInterval(() => {
  hue += 0.5;
  bg.style.filter = `hue-rotate(${hue}deg)`;
}, 60);

// ✨ Effet "fade-in" au scroll
const fadeIns = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // facultatif : stop observer une fois visible
    }
  });
}, {
  threshold: 0.2
});

fadeIns.forEach(el => observer.observe(el));

// 📌 Option : surlignage actif dans le menu selon la section visible
const navLinks = document.querySelectorAll('.sidebar nav a');
const sections = document.querySelectorAll('main section');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = window.scrollY;
    const offset = section.offsetTop - 100;
    const height = section.offsetHeight;
    if (top >= offset && top < offset + height) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
});
