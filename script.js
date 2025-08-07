document.addEventListener("DOMContentLoaded", function () {
    console.log("Initialisation du portfolio...");

    // Variables globales 
    let modalBackdrop = null;
    let modalContainer = null;
    let isModalOpen = false;
    let originalProjectsHTML = new Map();

    // Cache DOM pour performance
    const domCache = {
        popup: null,
        videoModal: null,
        modalVideo: null,
        nav: null,
        menuToggle: null,
        contactForm: null,
        init() {
            this.popup = document.getElementById("construction-popup");
            this.videoModal = document.getElementById("video-modal");
            this.modalVideo = document.getElementById("modal-video");
            this.nav = document.getElementById("main-nav");
            this.menuToggle = document.getElementById("menu-toggle");
            this.contactForm = document.getElementById("contact-form");
        }
    };

    //  utilitaire pour debounce
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

    // === GESTION POPUP CONSTRUCTION ===
    function setupPopup() {
        const { popup } = domCache;
        if (!popup) return;

        function closePopup() {
            popup.classList.add('popup-closing');
            setTimeout(() => {
                popup.style.display = "none";
                popup.classList.remove('popup-closing');
            }, 300);
        }

        // Event listeners uni
        const closeElements = popup.querySelectorAll('#close-popup, #popup-ok-btn');
        closeElements.forEach(el => el?.addEventListener("click", closePopup));
        
        popup.addEventListener("click", function(e) {
            if (e.target === popup) closePopup();
        });

        // Fonction globale pour fermeture
        window.closePopup = closePopup;
    }

    // === GESTION BOUTONS HERO ===
    function setupHeroButtons() {
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
                    if (isModalOpen) closeProjectModal();
                    projectsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    // === CReATION eLeMENTS MODAUX ===
    function createModalElements() {
        // backdrop
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        document.body.appendChild(modalBackdrop);
        
        //  conteneur
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
        
        // Event listeners unified pour fermeture
        [modalBackdrop, modalContainer].forEach(element => {
            element.addEventListener('click', function(e) {
                if (e.target === element) {
                    closeProjectModal();
                }
            });
        });
        
        console.log("Éléments modaux créés");
    }

    // === SAUVEGARDE HTML INITIAL ===
    function saveOriginalHTML() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            const title = card.querySelector('h3')?.textContent || `projet-${index}`;
            originalProjectsHTML.set(title, card.outerHTML);
        });
        console.log("HTML original sauvegardé pour", originalProjectsHTML.size, "projets");
    }

    // === GESTION BODY ET SCROLL ===
    function toggleBodyScroll(lock = true) {
        if (lock) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('no-scroll');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('no-scroll');
        }
    }

   // === GESTION SLIDESHOWS ===
    function toggleSlideshows(action = 'stop') {
        document.querySelectorAll('.slideshow-container').forEach(container => {
            const method = action === 'stop' ? '_stopSlide' : '_startSlide';
            if (container[method]) container[method]();
        });
    }

    // === OUVERTURE MODAL ===
    function openProjectModal(projectCard) {
        if (isModalOpen || !modalBackdrop || !modalContainer) return;
        
        console.log("Ouverture modal pour:", projectCard.querySelector('h3')?.textContent);
        
        isModalOpen = true;
        toggleBodyScroll(true);
        toggleSlideshows('stop');
        
        // Cree la modal
        createModalFromCard(projectCard);
        
        // Affichee la modal
        modalBackdrop.classList.add('active');
        modalContainer.classList.add('active');
        
        // Gestion URL
        const title = projectCard.querySelector('h3')?.textContent || '';
        updateURL(title);
        
        // Renit
        setTimeout(() => {
            initModalSlideshows();
        }, 350);
    }

    // === MODAL À PARTIR D'UNE CARTE ===
    function createModalFromCard(projectCard) {
        const title = projectCard.querySelector('h3')?.textContent || '';
        const originalHTML = originalProjectsHTML.get(title);
        
        
        const htmlToUse = originalHTML || projectCard.outerHTML;
        
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlToUse;
        const cardElement = tempDiv.firstElementChild;
        
        // Cloner et nettoyer
        const modalCard = cardElement.cloneNode(true);
        modalCard.className = 'modal-card';
        modalCard.removeAttribute('data-category');
        modalCard.style.display = '';
        modalCard.style.opacity = '';
        
        // Extraire
        const projectMedia = modalCard.querySelector('.project-media');
        const projectInfo = modalCard.querySelector('.project-info');
        
        if (projectMedia && projectInfo) {
            // Restructurer pour la modal
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
        
        //  bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Fermer le projet');
        closeBtn.addEventListener('click', closeProjectModal);
        modalCard.appendChild(closeBtn);
        
        // Ajout à la modal
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalCard);
        
        console.log("Modal créée avec succès");
    }

    // === FERMETURE MODAL ===
    function closeProjectModal() {
        if (!isModalOpen) return;
        
        console.log("Fermeture modal");
        
        isModalOpen = false;
        
        modalBackdrop.classList.remove('active');
        modalContainer.classList.remove('active');
        
        clearURL();
        
        setTimeout(() => {
            modalContainer.innerHTML = '';
            toggleBodyScroll(false);
            toggleSlideshows('start');
        }, 250);
    }

    // === GESTION URL ===
    function updateURL(projectTitle) {
        if (history.pushState && projectTitle) {
            const urlSlug = projectTitle.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            history.pushState(
                { modal: true, project: urlSlug }, 
                '', 
                '#projet-' + urlSlug
            );
        }
    }

    function clearURL() {
        if (history.pushState) {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
    }

    // === GESTION HISTORIQUE NAVIGATEUR ===
    window.addEventListener('popstate', function(e) {
        if (isModalOpen) {
            closeProjectModal();
        }
    });

    // === SLIDESHOWS PRINCIPAL (pour les cartes) ===
    function initSlideshows() {
        
        document.querySelectorAll('.project-card .slideshow-container').forEach(container => {
            setupSlideshow(container, false); // false = pas dans une modal
        });
    }

    // === NOUVEAU: SLIDESHOWS POUR MODALS ===
    function initModalSlideshows() {
        /
        document.querySelectorAll('.modal-container .slideshow-container').forEach(container => {
            setupSlideshow(container, true); // true = dans une modal
        });
    }

    // === CONFIG  SLIDESHOW ===
    function setupSlideshow(container, isInModal = false) {
        const slides = container.querySelectorAll('.slide');
        const dots = container.querySelectorAll('.slide-dot');
        let currentSlide = 0;
        let slideInterval;

        if (slides.length <= 1) return;

       // Reset de l'état des slides
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === 0) slide.classList.add('active');
        });
        
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === 0) dot.classList.add('active');
        });

        function showSlide(index) {
            if (index === currentSlide || index < 0 || index >= slides.length) return;
            
            slides[currentSlide].classList.remove('active');
            dots[currentSlide]?.classList.remove('active');
            
            currentSlide = index;
            slides[currentSlide].classList.add('active');
            dots[currentSlide]?.classList.add('active');
        }

        // Gestion des points de navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(index);
            });
        });

        // Auto-slide avec conditions pour modal/normal
        function startSlide() {
            const shouldStart = isInModal ? isModalOpen : !isModalOpen;
            if (shouldStart) {
                slideInterval = setInterval(() => {
                    const shouldContinue = isInModal ? isModalOpen : !isModalOpen;
                    if (shouldContinue) {
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
        
        container._startSlide = startSlide;
        container._stopSlide = stopSlide;
    }

    // Gestion des événements sur les cartes de projets
    function attachProjectListeners() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Évite les doublons d'événements
            if (card.hasAttribute('data-modal-listener')) return;
            card.setAttribute('data-modal-listener', 'true');
            
            card.addEventListener('click', function(e) {
                // Ignore les clics sur les éléments interactifs internes
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
                    .youtube-play-btn
                `)) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                openProjectModal(this);
            });
        });
        
        console.log("Listeners attachés à", projectCards.length, "cartes projets");
    }

    // Système de filtres réutilisable pour projets et certifications
    function setupFilters(containerSelector, cardSelector) {
        const filters = document.querySelectorAll(`${containerSelector} .filter-btn`);
        const cards = document.querySelectorAll(cardSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                console.log("Filtre sélectionné:", filterValue);
                
                // Ferme la modal si elle est ouverte (projets seulement)
                if (isModalOpen && containerSelector.includes('projects')) {
                    closeProjectModal();
                }
                
                // Met à jour l'état des boutons
                filters.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Applique le filtre sur les cartes
                let visibleCount = 0;
                cards.forEach(card => {
                    const category = card.getAttribute('data-category') || '';
                    const shouldShow = filterValue === 'all' || category.includes(filterValue);
                    
                    if (shouldShow) {
                        card.style.display = cardSelector.includes('certification') ? 'flex' : 'block';
                        card.style.opacity = '1';
                        visibleCount++;
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 300);
                    }
                });
                
                console.log(`${visibleCount} éléments visibles après filtrage`);
                
                // Re-attache les listeners pour les projets après filtrage
                if (containerSelector.includes('projects')) {
                    setTimeout(attachProjectListeners, 350);
                }
            });
        });
    }

    // Configuration des gestionnaires pour médias et YouTube
    function setupMediaHandlers() {
        // Embeds YouTube dans les médias de projets
        document.querySelectorAll('.youtube-embed').forEach(embed => {
            embed.addEventListener('click', function(e) {
                e.stopPropagation();
                const videoId = this.getAttribute('data-video-id');
                if (videoId) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    iframe.width = '100%';
                    iframe.height = '100%';
                    iframe.frameBorder = '0';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.allowFullscreen = true;
                    
                    this.innerHTML = '';
                    this.appendChild(iframe);
                }
            });
        });

        // Gestionnaire unifié pour tous les boutons vidéo
        document.addEventListener('click', function(e) {
            // Boutons démo YouTube
            if (e.target.closest('.youtube-demo-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.youtube-demo-btn');
                const videoId = btn.getAttribute('data-youtube');
                if (videoId) {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
                }
            }
            
            // Boutons vidéo en modal
            else if (e.target.closest('.modal-video-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.modal-video-btn');
                const videoSrc = btn.getAttribute('data-video');
                const projectTitle = btn.closest('.project-card, .modal-card')?.querySelector('h3')?.textContent || 'Projet';
                
                openVideoModal(videoSrc, projectTitle);
            }
        });
    }

    // Ouverture de la modal vidéo
    function openVideoModal(videoSrc, title) {
        const { videoModal, modalVideo } = domCache;
        if (!videoModal || !modalVideo) return;

        const modalVideoSource = document.getElementById('modal-video-source');
        const modalTitle = document.getElementById('modal-title');
        
        if (modalVideoSource && modalTitle) {
            modalVideoSource.src = videoSrc;
            modalTitle.textContent = `Démo - ${title}`;
            modalVideo.load();
            videoModal.style.display = 'flex';
            toggleBodyScroll(true);
            
            setTimeout(() => {
                videoModal.classList.add('modal-open');
            }, 10);
        }
    }

    function setupVideoModal() {
        const { videoModal, modalVideo } = domCache;
        if (!videoModal) return;

        const modalClose = document.getElementById('modal-close');

        // Fermeture de la modal vidéo
        function closeVideoModal() {
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.currentTime = 0;
            }
            if (videoModal) {
                videoModal.classList.remove('modal-open');
                setTimeout(() => {
                    videoModal.style.display = 'none';
                    const modalVideoSource = document.getElementById('modal-video-source');
                    if (modalVideoSource) modalVideoSource.src = '';
                    toggleBodyScroll(false);
                }, 300);
            }
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeVideoModal);
        }

        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });

        // Rend la fonction accessible globalement
        window.closeVideoModal = closeVideoModal;
    }

    // Configuration de la navigation
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-list a');
        const { nav, menuToggle } = domCache;

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    if (isModalOpen) {
                        closeProjectModal();
                    }
                    
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    if (nav?.classList.contains('mobile-open')) {
                        nav.classList.remove('mobile-open');
                        menuToggle?.classList.remove('active');
                    }
                }
            });
        });

        // Toggle menu mobile
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', function() {
                nav.classList.toggle('mobile-open');
                menuToggle.classList.toggle('active');
            });
        }
    }

    // Gestion du thème sombre/clair
    function setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

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

    // Gestion des raccourcis clavier
    function setupKeyboardHandlers() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                
                if (isModalOpen) {
                    closeProjectModal();
                } else if (domCache.videoModal?.style.display === 'flex') {
                    window.closeVideoModal?.();
                } else if (domCache.popup && domCache.popup.style.display !== "none") {
                    window.closePopup?.();
                }
            }
        });
    }

    // Animations d'apparition des sections
    function setupSectionAnimations() {
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

        document.querySelectorAll('section').forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // Configuration du formulaire de contact
    function setupContactForm() {
        const { contactForm } = domCache;
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            let isValid = true;
            const fields = ['name', 'email', 'subject', 'message'];
            
            // Validation des champs obligatoires
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
            
            // Validation format email
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

    // Gestion URL avec hash pour ouverture directe de projet
    function handleInitialURL() {
        const hash = window.location.hash;
        if (hash.startsWith('#projet-')) {
            const projectSlug = hash.replace('#projet-', '');
            const matchingCard = Array.from(document.querySelectorAll('.project-card')).find(card => {
                const title = card.querySelector('h3')?.textContent || '';
                const slug = title.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();
                return slug === projectSlug;
            });
            
            if (matchingCard) {
                setTimeout(() => {
                    openProjectModal(matchingCard);
                }, 500);
            } else {
                clearURL();
            }
        }
    }

    // Fonction d'initialisation principale
    function initialize() {
        console.log("Début de l'initialisation...");
        
        // Init du cache DOM
        domCache.init();
        
        // Sauvegarde du HTML original avant modifications
        saveOriginalHTML();
        
        // Création des éléments de modal
        createModalElements();
        
        // Init de tous les composants
        setupPopup();
        setupHeroButtons();
        initSlideshows();
        attachProjectListeners();
        
        // Filtres pour projets et certifications
        setupFilters('.projects', '.project-card');
        setupFilters('.certifications', '.certification-card');
        
        setupMediaHandlers();
        setupVideoModal();
        setupNavigation();
        setupTheme();
        setupKeyboardHandlers();
        setupSectionAnimations();
        setupContactForm();
        
        // Traitement URL initiale
        handleInitialURL();
        
        console.log("Initialisation terminée avec succès !");
    }

    // Cache l'écran de chargement et lance l'init
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        initialize();
    }, 500);

    // Fonctions de debug pour développement
    window.debugPortfolio = function() {
        console.log("=== DEBUG PORTFOLIO ===");
        console.log("Modal ouverte:", isModalOpen);
        console.log("Backdrop présent:", !!modalBackdrop);
        console.log("Container présent:", !!modalContainer);
        console.log("Projets HTML sauvegardés:", originalProjectsHTML.size);
        console.log("Cartes projets:", document.querySelectorAll('.project-card').length);
        console.log("Cartes avec listeners:", document.querySelectorAll('.project-card[data-modal-listener]').length);
        console.log("Cache DOM:", domCache);
        console.log("========================");
    };

    window.testModal = function() {
        const firstCard = document.querySelector('.project-card');
        if (firstCard) {
            console.log("Test de la modal...");
            openProjectModal(firstCard);
        } else {
            console.log("Aucune carte trouvée");
        }
    };

    window.forceClose = function() {
        closeProjectModal();
    };
});

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker enregistré'))
            .catch(() => console.log('Service Worker non supporté'));
    });
}