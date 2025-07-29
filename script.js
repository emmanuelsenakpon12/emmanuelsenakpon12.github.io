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

    // Gestion modal vidéo (séparée - utilise .video-modal-overlay du CSS)
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

    // ===== 🚀 NOUVEAU SYSTÈME MODAL RÉVOLUTIONNAIRE - 100% SANS FLOU =====
    
    // Variables globales pour le système modal
    let modalBackdrop = null;
    let modalContainer = null;
    let currentModalCard = null;
    let isModalOpen = false;

    // Fonction pour créer les éléments modaux (correspondant au CSS)
    function createModalElements() {
        // Créer le backdrop (fond noir)
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        
        // Créer le conteneur modal
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Ajouter au DOM mais cachés initialement
        document.body.appendChild(modalBackdrop);
        document.body.appendChild(modalContainer);
        
        console.log('✅ Éléments modaux créés');
    }

    // Initialiser les éléments modaux
    createModalElements();

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

            // Auto-slide (arrêté en modal)
            function startSlide() {
                if (!isModalOpen) { // Seulement si pas en modal
                    slideInterval = setInterval(() => {
                        if (!isModalOpen) { // Vérifier encore au moment de l'exécution
                            showSlide((currentSlide + 1) % slides.length);
                        }
                    }, 4000);
                }
            }

            function stopSlide() {
                clearInterval(slideInterval);
            }

            startSlide();
            container.addEventListener('mouseenter', stopSlide);
            container.addEventListener('mouseleave', startSlide);
            
            // Stocker les fonctions pour les utiliser lors des modals
            container._startSlide = startSlide;
            container._stopSlide = stopSlide;
        });
    }

    // ✅ FONCTION D'OUVERTURE MODAL - NOUVELLE APPROCHE
    function openProjectModal(projectCard) {
        if (isModalOpen) return; // Une seule modal à la fois
        
        console.log('🚀 Ouverture modal:', projectCard.querySelector('h3')?.textContent || 'Sans titre');
        
        // Marquer comme ouverte
        isModalOpen = true;
        
        // Bloquer le scroll du body
        document.body.style.overflow = 'hidden';
        document.body.classList.add('no-scroll');
        
        // Arrêter tous les slideshows
        document.querySelectorAll('.slideshow-container').forEach(container => {
            if (container._stopSlide) container._stopSlide();
        });
        
        // Cloner la carte pour la modal
        const modalCard = projectCard.cloneNode(true);
        modalCard.className = 'modal-card'; // Remplacer par la classe modal
        modalCard.removeAttribute('data-category'); // Nettoyer
        
        // Restructurer le contenu pour la modal (CSS layout flex row)
        const originalContent = modalCard.innerHTML;
        const projectMedia = modalCard.querySelector('.project-media');
        const projectInfo = modalCard.querySelector('.project-info');
        
        if (projectMedia && projectInfo) {
            // Créer la nouvelle structure modal
            modalCard.innerHTML = `
                <div class="modal-media">
                    ${projectMedia.outerHTML.replace('project-media', 'modal-media-content')}
                </div>
                <div class="modal-info">
                    ${projectInfo.innerHTML
                        .replace(/project-description/g, 'modal-description')
                        .replace(/project-tags/g, 'modal-tags')
                        .replace(/tag(?![s-])/g, 'modal-tag')
                        .replace(/project-actions/g, 'modal-actions')
                        .replace(/project-link/g, 'modal-link')
                    }
                </div>
            `;
        }
        
        // Créer le bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Fermer le projet');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeProjectModal();
        };
        
        // Ajouter le bouton à la modal card
        modalCard.appendChild(closeBtn);
        
        // Stocker la référence
        currentModalCard = modalCard;
        
        // Ajouter au conteneur modal
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalCard);
        
        // Activer les éléments modaux avec les classes CSS
        modalBackdrop.classList.add('active');
        modalContainer.classList.add('active');
        
        // Réinitialiser les slideshows dans la modal
        setTimeout(() => {
            initSlideshows();
        }, 350); // Après l'animation d'ouverture
        
        console.log('✅ Modal ouverte avec succès');
    }

    // ✅ FONCTION DE FERMETURE MODAL - NOUVELLE APPROCHE
    function closeProjectModal() {
        if (!isModalOpen) return;
        
        console.log('🔽 Fermeture modal');
        
        // Marquer comme fermée
        isModalOpen = false;
        
        // Désactiver les éléments modaux
        modalBackdrop.classList.remove('active');
        modalContainer.classList.remove('active');
        
        // Nettoyer après l'animation
        setTimeout(() => {
            if (modalContainer) {
                modalContainer.innerHTML = '';
            }
            currentModalCard = null;
            
            // Restaurer le scroll
            document.body.style.overflow = '';
            document.body.classList.remove('no-scroll');
            
            // Redémarrer les slideshows sur la page
            document.querySelectorAll('.slideshow-container').forEach(container => {
                if (container._startSlide) container._startSlide();
            });
            
        }, 250); // Durée de l'animation CSS
        
        console.log('✅ Modal fermée');
    }

    // ✅ EVENT LISTENERS POUR LES CARTES PROJET
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Click pour ouvrir la modal
        card.addEventListener('click', function(e) {
            // Éviter les clics sur les éléments internes
            if (e.target.closest(`
                a, 
                button:not(.modal-close), 
                .project-link, 
                .modal-link,
                .video-play-btn, 
                .youtube-embed, 
                .slide-dot, 
                iframe, 
                .youtube-demo-btn, 
                .modal-video-btn,
                .youtube-play-btn,
                .modal-play-btn
            `)) {
                return; // Laisser les liens/boutons fonctionner normalement
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // Ouvrir la modal
            openProjectModal(this);
        });
        
        // Hover effect léger (géré par CSS)
        card.addEventListener('mouseenter', function() {
            if (!isModalOpen) {
                // Le CSS .project-card:hover:not(.modal-active) gère l'effet
            }
        });
    });

    // ✅ Event listeners pour fermeture modal
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', function(e) {
            if (e.target === modalBackdrop) {
                closeProjectModal();
            }
        });
    }

    if (modalContainer) {
        modalContainer.addEventListener('click', function(e) {
            if (e.target === modalContainer) {
                closeProjectModal();
            }
        });
    }

    // Initialisation des slideshows pour les cartes normales
    initSlideshows();

    // ===== FILTRES UNIFIÉS =====
    function setupFilters(filtersSelector, cardsSelector) {
        const filters = document.querySelectorAll(filtersSelector);
        const cards = document.querySelectorAll(cardsSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                // Fermer toute modal ouverte si c'est un filtre de projets
                if (filtersSelector.includes('project') && isModalOpen) {
                    closeProjectModal();
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
                
                // Filtrage des cartes avec animation douce
                cards.forEach(card => {
                    const category = card.getAttribute('data-category') || '';
                    const shouldShow = filterValue === 'all' || category.includes(filterValue);
                    
                    if (shouldShow) {
                        card.style.display = 'block';
                        requestAnimationFrame(() => {
                            card.style.opacity = '1';
                        });
                    } else {
                        card.style.opacity = '0';
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
                // Fermer toute modal ouverte avant navigation
                if (isModalOpen) {
                    closeProjectModal();
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

    // ✅ GESTION TOUCHES CLAVIER OPTIMISÉE
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            
            // Priorité 1 : modal projet
            if (isModalOpen) {
                closeProjectModal();
            } 
            // Priorité 2 : modal vidéo
            else if (videoModal && videoModal.style.display === 'flex') {
                closeVideoModal();
            } 
            // Priorité 3 : popup construction
            else if (popup && popup.style.display !== "none") {
                closePopup();
            }
        }
        
        // Navigation Tab dans les modals
        if (isModalOpen && e.key === 'Tab') {
            // Laisser la navigation naturelle, les éléments focusables sont dans la modal
        }
    });

    // ✅ GESTION RESIZE WINDOW (responsive)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isModalOpen) {
                console.log('Resize détecté avec modal ouverte - CSS gère automatiquement');
                // Le CSS responsive gère automatiquement le redimensionnement
            }
        }, 250);
    });

    // ✅ GESTION ERREURS JAVASCRIPT
    window.addEventListener('error', function(e) {
        console.warn('Erreur JS détectée:', e.message);
        // En cas d'erreur, nettoyer l'état
        if (isModalOpen) {
            isModalOpen = false;
            document.body.style.overflow = '';
            document.body.classList.remove('no-scroll');
            if (modalBackdrop) modalBackdrop.classList.remove('active');
            if (modalContainer) modalContainer.classList.remove('active');
        }
    });

    // ✅ GESTION HISTORIQUE NAVIGATEUR (optionnel)
    let modalHistoryState = false;
    
    function pushModalState(projectTitle) {
        if (history.pushState && !modalHistoryState) {
            history.pushState({ modal: true, title: projectTitle }, '', '#projet-' + projectTitle.toLowerCase().replace(/\s+/g, '-'));
            modalHistoryState = true;
        }
    }
    
    function popModalState() {
        if (modalHistoryState) {
            history.back();
            modalHistoryState = false;
        }
    }
    
    window.addEventListener('popstate', function(e) {
        if (isModalOpen && e.state?.modal !== true) {
            closeProjectModal();
            modalHistoryState = false;
        }
    });

    // Modifier la fonction d'ouverture pour inclure l'état de l'historique
    const originalOpenProjectModal = openProjectModal;
    openProjectModal = function(projectCard) {
        const title = projectCard.querySelector('h3')?.textContent || 'Projet';
        originalOpenProjectModal(projectCard);
        if (isModalOpen) {
            pushModalState(title);
        }
    };

    // Modifier la fonction de fermeture pour l'historique
    const originalCloseProjectModal = closeProjectModal;
    closeProjectModal = function() {
        originalCloseProjectModal();
        if (modalHistoryState && !isModalOpen) {
            modalHistoryState = false;
        }
    };

    // Masquer le loading
    setTimeout(() => {
        if (loading) {
            loading.style.display = 'none';
        }
    }, 500);

    // ✅ LOG FINAL DE CONFIRMATION
    console.log('🚀 Portfolio modal révolutionnaire initialisé avec succès');
    console.log('✅ Project cards:', projectCards.length, 'détectées');
    console.log('✅ Modal backdrop:', modalBackdrop ? 'Créé' : 'ERREUR');
    console.log('✅ Modal container:', modalContainer ? 'Créé' : 'ERREUR');
    console.log('✅ Mode révolutionnaire activé - AUCUN FLOU GARANTI');
    console.log('✅ Animations CPU uniquement - Performance maximale');
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('✅ Service Worker enregistré'))
            .catch(() => console.log('⚠️ Service Worker non supporté'));
    });
}

// ✅ FONCTIONS DE DEBUG AMÉLIORÉES
window.debugModal = function() {
    console.log('=== DEBUG SYSTÈME MODAL ===');
    console.log('État modal:', isModalOpen ? 'OUVERTE' : 'FERMÉE');
    console.log('Backdrop:', modalBackdrop?.classList.contains('active') ? 'ACTIF' : 'INACTIF');
    console.log('Container:', modalContainer?.classList.contains('active') ? 'ACTIF' : 'INACTIF');
    console.log('Body overflow:', document.body.style.overflow || 'auto');
    console.log('Modal actuelle:', currentModalCard?.querySelector('h3')?.textContent || 'Aucune');
    console.log('Cartes détectées:', document.querySelectorAll('.project-card').length);
    console.log('============================');
};

window.testModal = function() {
    const firstCard = document.querySelector('.project-card');
    if (firstCard) {
        console.log('🧪 Test modal avec première carte...');
        openProjectModal(firstCard);
    } else {
        console.log('❌ Aucune carte trouvée pour le test');
    }
};

window.forceCloseModal = function() {
    console.log('🔧 Fermeture forcée de la modal...');
    closeProjectModal();
};