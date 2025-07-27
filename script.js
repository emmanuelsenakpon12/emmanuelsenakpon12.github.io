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
            // Tracking pour analytics
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
        btn.addEventListener('click', function() {
            const video = videoElements[index];
            if (!video) return;
            
            const playIcon = btn.querySelector('.play-icon');
            const pauseIcon = btn.querySelector('.pause-icon');
            
            if (video.paused) {
                video.play().catch(e => console.warn('Erreur lecture vidéo:', e));
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline';
            } else {
                video.pause();
                playIcon.style.display = 'inline';
                pauseIcon.style.display = 'none';
            }
        });
    });

    // Gestion des vidéos YouTube
    youtubeEmbeds.forEach(embed => {
        embed.addEventListener('click', function() {
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
        btn.addEventListener('click', function() {
            const videoId = this.getAttribute('data-youtube');
            if (videoId) {
                window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
            }
        });
    });

    // Gestion modal vidéo
    modalVideoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
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

    // Fermeture modal
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

    // Gestion des filtres avec amélioration
    function setupFilters(filtersSelector, cardsSelector) {
        const filters = document.querySelectorAll(filtersSelector);
        const cards = document.querySelectorAll(cardsSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                // Mise à jour des boutons actifs et ARIA
                filters.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Pause toutes les vidéos lors du filtrage
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
                
                // Filtrage des cartes avec animation
                cards.forEach(card => {
                    const category = card.getAttribute('data-category') || '';
                    const shouldShow = filterValue === 'all' || category.includes(filterValue);
                    
                    if (shouldShow) {
                        card.style.display = 'block';
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Setup des filtres pour projets et certifications
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
        // Charger le thème sauvegardé
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

    // *** SECTION MODIFIÉE : Barres de compétences PERMANENTES ***
    // Les barres gardent leur remplissage sans animation au scroll
    const skillBars = document.querySelectorAll('.skill-progress');
    
    // Forcer le maintien des largeurs définies dans le HTML
    skillBars.forEach(bar => {
        const originalWidth = bar.style.width || bar.getAttribute('data-width');
        if (originalWidth) {
            // Forcer la largeur en permanence
            bar.style.setProperty('width', originalWidth, 'important');
            
            // Observer les changements et les corriger si nécessaire
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
            
            // Validation simple
            let isValid = true;
            const fields = ['name', 'email', 'subject', 'message'];
            
            fields.forEach(field => {
                const input = document.getElementById(field);
                const error = document.getElementById(`${field}-error`);
                
                if (!data[field] || data[field].trim() === '') {
                    error.textContent = 'Ce champ est requis';
                    input.classList.add('error');
                    isValid = false;
                } else {
                    error.textContent = '';
                    input.classList.remove('error');
                }
            });
            
            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (data.email && !emailRegex.test(data.email)) {
                document.getElementById('email-error').textContent = 'Email invalide';
                document.getElementById('email').classList.add('error');
                isValid = false;
            }
            
            if (isValid) {
                // Simulation envoi
                const statusDiv = document.getElementById('form-status');
                statusDiv.textContent = 'Message envoyé avec succès !';
                statusDiv.className = 'form-status success';
                contactForm.reset();
                
                // Ouverture du client email
                const subject = encodeURIComponent(data.subject);
                const body = encodeURIComponent(`Nom: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
                window.location.href = `mailto:etudeefr@gmail.com?subject=${subject}&body=${body}`;
            }
        });
    }

    // Performance: Lazy loading des images
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

    // ===== GESTION DES PROJETS INTERACTIFS OPTIMISÉE =====
    const projectCards = document.querySelectorAll('.project-card');
    const projectsOverlay = document.querySelector('.projects-overlay');
    let expandedCard = null;
    let isAnimating = false;

    // Gestion des slideshows optimisée
    function initSlideshows() {
        document.querySelectorAll('.slideshow-container').forEach(container => {
            const slides = container.querySelectorAll('.slide');
            const dots = container.querySelectorAll('.slide-dot');
            let currentSlide = 0;
            let slideInterval;

            function showSlide(index) {
                // Optimisation: éviter les changements inutiles
                if (index === currentSlide) return;

                slides.forEach(slide => slide.classList.remove('active'));
                dots.forEach(dot => {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                });
                
                slides[index].classList.add('active');
                dots[index].classList.add('active');
                dots[index].setAttribute('aria-selected', 'true');
                currentSlide = index;
            }

            // Navigation par dots avec débounce
            dots.forEach((dot, index) => {
                dot.addEventListener('click', debounce(() => showSlide(index), 100));
            });

            // Auto-slide avec pause au hover
            function startSlideshow() {
                slideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % slides.length;
                    showSlide(currentSlide);
                }, 4000);
            }

            function stopSlideshow() {
                clearInterval(slideInterval);
            }

            // Démarrer le slideshow
            startSlideshow();

            // Pause au hover
            container.addEventListener('mouseenter', stopSlideshow);
            container.addEventListener('mouseleave', startSlideshow);
        });
    }

    // Expansion des cartes optimisée
    function expandCard(card) {
        if (expandedCard === card || isAnimating) return;

        isAnimating = true;

        // Fermer la carte précédente si elle existe
        if (expandedCard) {
            closeProjectCard();
            // Attendre la fermeture avant d'ouvrir la nouvelle
            setTimeout(() => openCard(card), 150);
        } else {
            openCard(card);
        }
    }

    function openCard(card) {
        expandedCard = card;
        
        // Optimisation: utiliser requestAnimationFrame pour des animations fluides
        requestAnimationFrame(() => {
            card.classList.add('expanded');
            projectsOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Ajouter le bouton de fermeture
            if (!card.querySelector('.close-btn')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'close-btn';
                closeBtn.innerHTML = '×';
                closeBtn.setAttribute('aria-label', 'Fermer la vue étendue');
                closeBtn.addEventListener('click', closeProjectCard);
                card.appendChild(closeBtn);
            }

            // Marquer la fin de l'animation
            setTimeout(() => {
                isAnimating = false;
            }, 150);
        });
    }

    function closeProjectCard() {
        if (!expandedCard || isAnimating) return;

        isAnimating = true;

        requestAnimationFrame(() => {
            expandedCard.classList.remove('expanded');
            const closeBtn = expandedCard.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.remove();
            }
            expandedCard = null;
            
            if (projectsOverlay) {
                projectsOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';

            // Marquer la fin de l'animation
            setTimeout(() => {
                isAnimating = false;
            }, 150);
        });
    }

    // Event listeners optimisés pour les projets
    projectCards.forEach(card => {
        // Débounce le mouseenter pour éviter les appels répétés
        const debouncedExpand = debounce(() => {
            if (!expandedCard && !isAnimating) {
                expandCard(card);
            }
        }, 100);

        card.addEventListener('mouseenter', debouncedExpand);
        
        // Optimisation: prévenir le comportement par défaut sur les liens internes
        const links = card.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    });

    // Event listeners optimisés
    if (projectsOverlay) {
        projectsOverlay.addEventListener('click', debounce(closeProjectCard, 100));
    }

    // Gestion des filtres avec fermeture des cartes
    const projectFilters = document.querySelectorAll('.projects .filter-btn');
    projectFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Fermer immédiatement toute carte étendue
            if (expandedCard) {
                closeProjectCard();
            }
        });
    });

    // Gestion globale des touches Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (expandedCard && !isAnimating) {
                closeProjectCard();
            } else if (videoModal && videoModal.style.display === 'flex') {
                closeVideoModal();
            } else if (popup && popup.style.display !== "none") {
                closePopup();
            }
        }
    });

    // Gestion du redimensionnement de fenêtre
    window.addEventListener('resize', debounce(() => {
        if (expandedCard) {
            // Ajuster la position si nécessaire
            requestAnimationFrame(() => {
                // La position est gérée par le CSS, pas besoin d'action JS
            });
        }
    }, 250));

    // Optimisation: Intersection Observer pour les performances
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            if (entry.isIntersecting) {
                // Activer les interactions quand la carte est visible
                card.style.pointerEvents = 'auto';
            } else {
                // Désactiver les interactions quand la carte n'est pas visible
                if (card !== expandedCard) {
                    card.style.pointerEvents = 'none';
                }
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });

    // Observer toutes les cartes
    projectCards.forEach(card => {
        cardObserver.observe(card);
    });

    // Initialiser les slideshows
    initSlideshows();

    // Optimisation: Précharger les images au hover (optionnel)
    function preloadImages(card) {
        const images = card.querySelectorAll('img[src]');
        images.forEach(img => {
            if (!img.complete) {
                img.loading = 'eager';
            }
        });
    }

    // Ajouter le préchargement au hover
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => preloadImages(card), { once: true });
    });

    // Masquer le loading une fois tout chargé
    setTimeout(() => {
        if (loading) {
            loading.style.display = 'none';
        }
    }, 500);

    console.log('Portfolio initialisé avec succès - Projets interactifs optimisés');
});

// Service Worker pour mise en cache (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker enregistré'))
            .catch(() => console.log('Service Worker non supporté'));
    });
}