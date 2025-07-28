document.addEventListener("DOMContentLoaded", function () {
    // Variables globales
    const popup = document.getElementById("construction-popup");
    const closeBtn = document.getElementById("close-popup");
    const okBtn = document.getElementById("popup-ok-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");
    const loading = document.getElementById("loading");

    // Fonction utilitaire pour débounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Gestion de la popup de construction
    function closePopup() {
        popup.classList.add('popup-closing');
        setTimeout(() => {
            popup.style.display = "none";
            popup.classList.remove('popup-closing');
        }, 300);
    }

    if (closeBtn) closeBtn.addEventListener("click", closePopup);
    if (okBtn) okBtn.addEventListener("click", closePopup);

    popup?.addEventListener("click", function(e) {
        if (e.target === popup) closePopup();
    });

    // Gestion des boutons hero
    const downloadCvBtn = document.getElementById("download-cv-btn");
    const viewProjectsBtn = document.getElementById("view-projects-btn");

    if (downloadCvBtn) {
        downloadCvBtn.addEventListener("click", function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download_cv', {
                    event_category: 'engagement'
                });
            }
        });
    }

    if (viewProjectsBtn) {
        viewProjectsBtn.addEventListener("click", function() {
            const projectsSection = document.getElementById("projets");
            if (projectsSection) {
                projectsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Gestion des vidéos de projets
    const videoElements = document.querySelectorAll('.project-video');
    const videoPlayBtns = document.querySelectorAll('.video-play-btn');
    const youtubeEmbeds = document.querySelectorAll('.youtube-embed');
    const modalVideoBtns = document.querySelectorAll('.modal-video-btn');
    const videoModal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalVideoSource = document.getElementById('modal-video-source');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.getElementById('modal-close');

    // Gestion lecture/pause vidéos inline
    videoPlayBtns.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const video = videoElements[index];
            if (!video) return;
            
            const playIcon = btn.querySelector('.play-icon');
            const pauseIcon = btn.querySelector('.pause-icon');
            
            if (video.paused) {
                video.play().catch(e => console.warn('Erreur lecture vidéo:', e));
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'inline';
            } else {
                video.pause();
                if (playIcon) playIcon.style.display = 'inline';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        });
    });

    // Gestion des vidéos YouTube
    youtubeEmbeds.forEach(embed => {
        embed.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.getAttribute('data-video-id');
            if (!videoId) return;
            
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.title = `Vidéo YouTube: ${videoId}`;
            
            this.innerHTML = '';
            this.appendChild(iframe);
        });
    });

    // Gestion des boutons YouTube dans les actions
    const youtubeDemoBtns = document.querySelectorAll('.youtube-demo-btn');
    youtubeDemoBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.getAttribute('data-youtube');
            if (videoId) {
                window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
            }
        });
    });

    // Gestion modal vidéo
    modalVideoBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoSrc = this.getAttribute('data-video');
            const projectTitle = this.closest('.project-card')?.querySelector('h3')?.textContent || 'Projet';
            
            if (modalVideoSource && modalTitle && videoModal) {
                modalVideoSource.src = videoSrc;
                modalTitle.textContent = `Démo - ${projectTitle}`;
                modalVideo.load();
                videoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    videoModal.classList.add('modal-open');
                }, 10);
            }
        });
    });

    // Fermeture modal vidéo
    function closeVideoModal() {
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        if (videoModal) {
            videoModal.classList.remove('modal-open');
            setTimeout(() => {
                videoModal.style.display = 'none';
                if (modalVideoSource) modalVideoSource.src = '';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeVideoModal);
    }

    videoModal?.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // ===== GESTION PROJETS OPTIMISÉE 60 FPS =====
    const projectCards = document.querySelectorAll('.project-card');
    const projectsOverlay = document.querySelector('.projects-overlay');
    let expandedCard = null;
    let isAnimating = false;

    // Slideshows optimisés
    function initSlideshows() {
        document.querySelectorAll('.slideshow-container').forEach(container => {
            const slides = container.querySelectorAll('.slide');
            const dots = container.querySelectorAll('.slide-dot');
            let currentSlide = 0;
            let slideInterval;

            if (slides.length <= 1) return;

            function showSlide(index) {
                if (index === currentSlide || index < 0 || index >= slides.length) return;
                
                slides[currentSlide].classList.remove('active');
                dots[currentSlide]?.classList.remove('active');
                
                currentSlide = index;
                slides[currentSlide].classList.add('active');
                dots[currentSlide]?.classList.add('active');
            }

            // Navigation dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showSlide(index);
                });
            });

            // Auto-slide
            function startSlide() {
                slideInterval = setInterval(() => {
                    showSlide((currentSlide + 1) % slides.length);
                }, 4000);
            }

            function stopSlide() {
                clearInterval(slideInterval);
            }

            startSlide();
            
            container.addEventListener('mouseenter', stopSlide);
            container.addEventListener('mouseleave', startSlide);
        });
    }

    // Fonction d'expansion corrigée
    function expandCard(card) {
        if (expandedCard === card || isAnimating) return;
        
        isAnimating = true;

        // Fermer l'ancienne carte si elle existe
        if (expandedCard) {
            closeProjectCard();
            setTimeout(() => openNewCard(card), 200);
        } else {
            openNewCard(card);
        }
    }

    function openNewCard(card) {
        expandedCard = card;
        
        // Montrer l'overlay
        projectsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Ajouter .expanded (état initial scale(0.7), opacity 0)
        card.classList.add('expanded');
        
        // Force reflow
        card.offsetHeight;
        
        // Déclencher l'animation avec .animate-in
        requestAnimationFrame(() => {
            card.classList.add('animate-in');
        });

        // Ajouter le bouton close après un délai
        setTimeout(() => {
            if (expandedCard === card && !card.querySelector('.close-btn')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'close-btn';
                closeBtn.innerHTML = '×';
                closeBtn.setAttribute('aria-label', 'Fermer le projet');
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeProjectCard();
                });
                card.appendChild(closeBtn);
            }
            isAnimating = false;
        }, 100);
    }

    // Fonction de fermeture corrigée
    function closeProjectCard() {
        if (!expandedCard) return;
        
        isAnimating = true;
        
        // Supprimer .animate-in pour déclencher l'animation de fermeture
        expandedCard.classList.remove('animate-in');
        
        // Attendre la fin de l'animation CSS
        setTimeout(() => {
            if (expandedCard) {
                expandedCard.classList.remove('expanded');
                
                const closeBtn = expandedCard.querySelector('.close-btn');
                if (closeBtn) closeBtn.remove();
                
                expandedCard = null;
            }
            
            projectsOverlay.classList.remove('active');
            document.body.style.overflow = '';
            isAnimating = false;
        }, 350);
    }

    // Event listeners pour les cartes
    projectCards.forEach(card => {
        // Click pour ouvrir
        card.addEventListener('click', function(e) {
            // Éviter l'ouverture si on clique sur les liens/boutons/vidéos
            if (e.target.closest('a, button, .project-link, .video-play-btn, .youtube-embed, .slide-dot, iframe')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            expandCard(card);
        });
        
        // Hover léger pour feedback visuel
        card.addEventListener('mouseenter', function() {
            if (!expandedCard && !isAnimating && !this.classList.contains('expanded')) {
                this.style.transform = 'translateZ(0) translateY(-2px)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!expandedCard && !isAnimating && !this.classList.contains('expanded')) {
                this.style.transform = 'translateZ(0) translateY(0)';
                this.style.boxShadow = '';
            }
        });
    });

    // Fermeture par overlay
    if (projectsOverlay) {
        projectsOverlay.addEventListener('click', function(e) {
            if (e.target === projectsOverlay) {
                closeProjectCard();
            }
        });
    }

    // Initialisation des slideshows
    initSlideshows();

    // ===== FILTRES UNIFIÉS =====
    function setupFilters(filtersSelector, cardsSelector) {
        const filters = document.querySelectorAll(filtersSelector);
        const cards = document.querySelectorAll(cardsSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                // Fermer toute carte étendue si c'est un filtre de projets
                if (filtersSelector.includes('project') && expandedCard) {
                    closeProjectCard();
                }
                
                // Mise à jour des boutons actifs
                filters.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Pause vidéos si nécessaire
                if (filtersSelector.includes('project')) {
                    videoElements.forEach(video => {
                        video.pause();
                        video.currentTime = 0;
                    });
                    
                    videoPlayBtns.forEach(btn => {
                        const playIcon = btn.querySelector('.play-icon');
                        const pauseIcon = btn.querySelector('.pause-icon');
                        if (playIcon) playIcon.style.display = 'inline';
                        if (pauseIcon) pauseIcon.style.display = 'none';
                    });
                }
                
                // Filtrage des cartes avec animation
                cards.forEach(card => {
                    const category = card.getAttribute('data-category') || '';
                    const shouldShow = filterValue === 'all' || category.includes(filterValue);
                    
                    if (shouldShow) {
                        card.style.display = 'block';
                        requestAnimationFrame(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateZ(0) scale(1)';
                        });
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateZ(0) scale(0.95)';
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            });
        });
    }

    // Setup des filtres
    setupFilters('.projects .filter-btn', '.project-card');
    setupFilters('.certifications .filter-btn', '.certification-card');

    // Navigation fluide
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                // Fermer toute carte ouverte avant navigation
                if (expandedCard) {
                    closeProjectCard();
                }
                
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Fermer le menu mobile si ouvert
                if (nav?.classList.contains('mobile-open')) {
                    nav.classList.remove('mobile-open');
                    menuToggle?.classList.remove('active');
                }
            }
        });
    });

    // Menu mobile toggle
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('mobile-open');
            menuToggle.classList.toggle('active');
        });
    }

    // Toggle thème avec persistance
    if (themeToggle) {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            }
        } catch (e) {
            console.warn('LocalStorage non disponible');
        }

        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            const isDark = document.body.classList.contains('dark-theme');
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (e) {
                console.warn('Impossible de sauvegarder le thème');
            }
        });
    }

    // Barres de compétences permanentes
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const originalWidth = bar.style.width || bar.getAttribute('data-width');
        if (originalWidth) {
            bar.style.setProperty('width', originalWidth, 'important');
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (bar.style.width !== originalWidth) {
                            bar.style.setProperty('width', originalWidth, 'important');
                        }
                    }
                });
            });
            
            observer.observe(bar, { attributes: true });
        }
    });

    // Animation d'apparition des sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Validation du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            let isValid = true;
            const fields = ['name', 'email', 'subject', 'message'];
            
            fields.forEach(field => {
                const input = document.getElementById(field);
                const error = document.getElementById(`${field}-error`);
                
                if (!data[field] || data[field].trim() === '') {
                    if (error) error.textContent = 'Ce champ est requis';
                    if (input) input.classList.add('error');
                    isValid = false;
                } else {
                    if (error) error.textContent = '';
                    if (input) input.classList.remove('error');
                }
            });
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (data.email && !emailRegex.test(data.email)) {
                const emailError = document.getElementById('email-error');
                const emailInput = document.getElementById('email');
                if (emailError) emailError.textContent = 'Email invalide';
                if (emailInput) emailInput.classList.add('error');
                isValid = false;
            }
            
            if (isValid) {
                const statusDiv = document.getElementById('form-status');
                if (statusDiv) {
                    statusDiv.textContent = 'Message envoyé avec succès !';
                    statusDiv.className = 'form-status success';
                }
                contactForm.reset();
                
                const subject = encodeURIComponent(data.subject);
                const body = encodeURIComponent(`Nom: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
                window.location.href = `mailto:etudeefr@gmail.com?subject=${subject}&body=${body}`;
            }
        });
    }

    // Lazy loading des images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Gestion des touches clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            
            // Priorité : projets étendus
            if (expandedCard) {
                closeProjectCard();
            } 
            // Puis modal vidéo
            else if (videoModal && videoModal.style.display === 'flex') {
                closeVideoModal();
            } 
            // Enfin popup
            else if (popup && popup.style.display !== "none") {
                closePopup();
            }
        }
    });

    // Masquer le loading
    setTimeout(() => {
        if (loading) {
            loading.style.display = 'none';
        }
    }, 500);

    console.log('Portfolio optimisé initialisé - 60 FPS garanti');
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker enregistré'))
            .catch(() => console.log('Service Worker non supporté'));
    });
}