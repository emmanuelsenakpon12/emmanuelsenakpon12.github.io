document.addEventListener("DOMContentLoaded", function () {
    console.log("Initialisation de la section projets...");

    // Variables globales pour la section projets
    let isImageModalOpen = false;
    let isCardExpanded = false;
    let expandedCard = null;
    let expandedOverlay = null;
    let originalProjectsHTML = new Map();

    // Cache DOM pour performance
    const domCache = {
        popup: null,
        videoModal: null,
        modalVideo: null,
        imageModal: null,
        nav: null,
        menuToggle: null,
        contactForm: null,
        init() {
            this.popup = document.getElementById("construction-popup");
            this.videoModal = document.getElementById("video-modal");
            this.modalVideo = document.getElementById("modal-video");
            this.imageModal = document.getElementById("imageModal");
            this.nav = document.getElementById("main-nav");
            this.menuToggle = document.getElementById("menu-toggle");
            this.contactForm = document.getElementById("contact-form");
        }
    };

    // === CRÉATION DE L'OVERLAY POUR CARTES ÉTENDUES ===
    function createExpandedOverlay() {
        expandedOverlay = document.createElement('div');
        expandedOverlay.className = 'expanded-overlay';
        expandedOverlay.addEventListener('click', closeExpandedCard);
        document.body.appendChild(expandedOverlay);
    }

    // === CRÉATION DU MODAL D'IMAGES ===
    function createImageModal() {
        let imageModal = document.getElementById('imageModal');
        
        if (!imageModal) {
            imageModal = document.createElement('div');
            imageModal.className = 'image-modal';
            imageModal.id = 'imageModal';
            imageModal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" id="imageModalClose" title="Fermer">&times;</button>
                    <button class="modal-nav prev" id="modalPrev" title="Image précédente">&larr;</button>
                    <img class="modal-image" id="modalImage" alt="">
                    <button class="modal-nav next" id="modalNext" title="Image suivante">&rarr;</button>
                    <div class="modal-info" id="modalInfo"></div>
                </div>
            `;
            document.body.appendChild(imageModal);
        }
        
        domCache.imageModal = imageModal;
        setupImageModal();
        console.log("Modal d'images créé/configuré");
    }

    // === CONFIGURATION DU MODAL D'IMAGES ===
    function setupImageModal() {
        const { imageModal } = domCache;
        if (!imageModal) return;

        const modalClose = document.getElementById('imageModalClose');
        const modalPrev = document.getElementById('modalPrev');
        const modalNext = document.getElementById('modalNext');
        
        let currentSlides = [];
        let currentIndex = 0;

        // Fermeture du modal
        if (modalClose) {
            modalClose.addEventListener('click', closeImageModal);
        }
        
        imageModal.addEventListener('click', function(e) {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });

        // Navigation
        if (modalPrev) {
            modalPrev.addEventListener('click', () => prevImage());
        }
        
        if (modalNext) {
            modalNext.addEventListener('click', () => nextImage());
        }

        function openImageModal(projectElement) {
            if (isImageModalOpen) return;
            
            const slideshowContainer = projectElement.querySelector('.slideshow-container');
            if (!slideshowContainer) return;
            
            const slides = Array.from(slideshowContainer.querySelectorAll('.slide'));
            const activeSlide = slideshowContainer.querySelector('.slide.active') || slides[0];
            
            currentSlides = slides.map(slide => ({
                src: slide.src,
                alt: slide.alt
            }));
            
            currentIndex = slides.indexOf(activeSlide);
            showImage(currentIndex);
            
            imageModal.classList.add('active');
            isImageModalOpen = true;
            document.body.style.overflow = 'hidden';
        }

        function closeImageModal() {
            if (!isImageModalOpen) return;
            
            imageModal.classList.remove('active');
            isImageModalOpen = false;
            if (!isCardExpanded) {
                document.body.style.overflow = '';
            }
        }

        function showImage(index) {
            if (index < 0 || index >= currentSlides.length) return;
            
            const slide = currentSlides[index];
            const modalImage = document.getElementById('modalImage');
            const modalInfo = document.getElementById('modalInfo');
            
            if (modalImage) {
                modalImage.src = slide.src;
                modalImage.alt = slide.alt;
            }
            
            if (modalInfo) {
                modalInfo.textContent = `${index + 1} / ${currentSlides.length} - ${slide.alt}`;
            }
            
            // Gestion des boutons de navigation
            if (modalPrev) {
                modalPrev.style.display = index === 0 ? 'none' : 'flex';
            }
            
            if (modalNext) {
                modalNext.style.display = index === currentSlides.length - 1 ? 'none' : 'flex';
            }
        }

        function prevImage() {
            if (currentIndex > 0) {
                currentIndex--;
                showImage(currentIndex);
            }
        }

        function nextImage() {
            if (currentIndex < currentSlides.length - 1) {
                currentIndex++;
                showImage(currentIndex);
            }
        }

        // Exposer les fonctions globalement
        window.openImageModal = openImageModal;
        window.closeImageModal = closeImageModal;
    }

    // === OUVERTURE CARTE ÉTENDUE ===
    function openExpandedCard(card) {
        if (isCardExpanded) return;
        
        console.log("Ouverture carte étendue:", card.querySelector('h3')?.textContent);
        
        // Sauvegarder la position originale
        const rect = card.getBoundingClientRect();
        card.setAttribute('data-original-pos', JSON.stringify({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        }));
        
        // Restructurer le contenu pour l'affichage étendu
        restructureCardForExpansion(card);
        
        // Marquer comme étendue
        card.classList.add('expanded');
        isCardExpanded = true;
        expandedCard = card;
        
        // Afficher l'overlay
        if (expandedOverlay) {
            expandedOverlay.classList.add('active');
        }
        
        // Bloquer le scroll
        document.body.style.overflow = 'hidden';
        
        // Réinitialiser les slideshows dans la carte étendue
        setTimeout(() => {
            const slideshowContainer = card.querySelector('.slideshow-container');
            if (slideshowContainer) {
                setupSlideshow(slideshowContainer);
            }
        }, 300);
    }

    // === RESTRUCTURATION CARTE POUR EXPANSION ===
    function restructureCardForExpansion(card) {
        const projectMedia = card.querySelector('.project-media');
        const projectInfo = card.querySelector('.project-info');
        
        if (!projectMedia || !projectInfo) return;
        
        // Créer le conteneur principal
        let projectContent = card.querySelector('.project-content');
        if (!projectContent) {
            projectContent = document.createElement('div');
            projectContent.className = 'project-content';
            
            // Déplacer tous les enfants dans le nouveau conteneur
            while (card.firstChild) {
                if (card.firstChild.classList && card.firstChild.classList.contains('expand-badge')) {
                    card.firstChild.remove();
                    continue;
                }
                projectContent.appendChild(card.firstChild);
            }
            card.appendChild(projectContent);
        }
        
        // Ajouter les boutons de contrôle
        addExpandedCardControls(card);
        
        // Ajouter le bouton d'agrandissement média
        addMediaExpandButton(projectMedia);
    }

    // === AJOUT DES CONTRÔLES DE CARTE ÉTENDUE ===
    function addExpandedCardControls(card) {
        // Bouton de fermeture
        let closeBtn = card.querySelector('.close-expanded');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'close-expanded';
            closeBtn.innerHTML = '&times;';
            closeBtn.title = 'Fermer';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeExpandedCard();
            });
            card.appendChild(closeBtn);
        }
        
        // Badge d'expansion (maintenir pour cohérence)
        let expandBadge = card.querySelector('.expand-badge');
        if (!expandBadge) {
            expandBadge = document.createElement('div');
            expandBadge.className = 'expand-badge';
            expandBadge.textContent = 'Détails du projet';
            card.appendChild(expandBadge);
        }
    }

    // === AJOUT BOUTON AGRANDISSEMENT MÉDIA ===
    function addMediaExpandButton(mediaContainer) {
        if (!mediaContainer) return;
        
        let expandBtn = mediaContainer.querySelector('.media-expand-btn');
        if (!expandBtn) {
            expandBtn = document.createElement('button');
            expandBtn.className = 'media-expand-btn';
            expandBtn.title = 'Agrandir le média';
            expandBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,3 21,3 21,9"></polyline>
                    <polyline points="9,21 3,21 3,15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            `;
            
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = mediaContainer.closest('.project-card');
                const video = mediaContainer.querySelector('.project-video');
                
                if (video) {
                    // Ouvrir modal vidéo
                    const projectTitle = card.querySelector('h3')?.textContent || 'Projet';
                    const videoSrc = video.querySelector('source')?.src || video.src;
                    openVideoModal(videoSrc, projectTitle);
                } else {
                    // Ouvrir modal images
                    if (window.openImageModal) {
                        window.openImageModal(card);
                    }
                }
            });
            
            mediaContainer.appendChild(expandBtn);
        }
    }

    // === FERMETURE CARTE ÉTENDUE ===
    function closeExpandedCard() {
        if (!isCardExpanded || !expandedCard) return;
        
        console.log("Fermeture carte étendue");
        
        // Retirer la classe expanded
        expandedCard.classList.remove('expanded');
        
        // Masquer l'overlay
        if (expandedOverlay) {
            expandedOverlay.classList.remove('active');
        }
        
        // Restaurer le scroll si aucun modal ouvert
        if (!isImageModalOpen) {
            document.body.style.overflow = '';
        }
        
        // Réinitialiser les variables
        isCardExpanded = false;
        expandedCard = null;
        
        // Réattacher les listeners après un délai
        setTimeout(() => {
            attachProjectListeners();
        }, 350);
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

    // === GESTION SLIDESHOWS ===
    function initSlideshows() {
        document.querySelectorAll('.slideshow-container').forEach(container => {
            setupSlideshow(container);
        });
    }

    function setupSlideshow(container) {
        const slides = container.querySelectorAll('.slide');
        const dots = container.querySelectorAll('.slide-dot');
        let currentSlide = 0;
        let slideInterval;

        if (slides.length <= 1) return;

        // Réinitialiser l'état des slides
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === 0) slide.classList.add('active');
            
            // Retirer les anciens listeners pour éviter les doublons
            slide.replaceWith(slide.cloneNode(true));
        });
        
        // Re-sélectionner après clonage
        const newSlides = container.querySelectorAll('.slide');
        
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === 0) dot.classList.add('active');
        });

        function showSlide(index) {
            if (index === currentSlide || index < 0 || index >= newSlides.length) return;
            
            newSlides[currentSlide].classList.remove('active');
            dots[currentSlide]?.classList.remove('active');
            
            currentSlide = index;
            newSlides[currentSlide].classList.add('active');
            dots[currentSlide]?.classList.add('active');
        }

        // Navigation dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(index);
            });
        });

        // Auto-slide seulement si pas dans une carte étendue
        function startSlide() {
            const parentCard = container.closest('.project-card');
            if (!parentCard || !parentCard.classList.contains('expanded')) {
                slideInterval = setInterval(() => {
                    showSlide((currentSlide + 1) % newSlides.length);
                }, 4000);
            }
        }

        function stopSlide() {
            clearInterval(slideInterval);
        }

        startSlide();
        container.addEventListener('mouseenter', stopSlide);
        container.addEventListener('mouseleave', startSlide);
        
        // Stocker les fonctions pour contrôle externe
        container._startSlide = startSlide;
        container._stopSlide = stopSlide;
    }

    // === LISTENERS CARTES PROJETS ===
    function attachProjectListeners() {
        const projectCards = document.querySelectorAll('.project-card:not(.expanded)');
        
        projectCards.forEach(card => {
            // Éviter les doublons
            if (card.hasAttribute('data-listener-attached')) return;
            card.setAttribute('data-listener-attached', 'true');
            
            // Listener principal pour ouverture carte étendue
            card.addEventListener('click', function(e) {
                // Éviter les clics sur les liens et boutons
                if (e.target.closest('a, button, .project-link')) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                openExpandedCard(this);
            });
            
            // Listener spécifique pour le badge d'expansion
            const expandBadge = card.querySelector('.expand-badge');
            if (expandBadge) {
                expandBadge.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openExpandedCard(card);
                });
            }
        });
        
        console.log("Listeners attachés à", projectCards.length, "cartes projets");
    }

    // === FILTRES PROJETS ===
    function setupProjectFilters() {
        const filters = document.querySelectorAll('.project-filters .filter-btn');
        const cards = document.querySelectorAll('.project-card');

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                console.log("Filtre sélectionné:", filterValue);
                
                // Fermer la carte étendue si ouverte
                if (isCardExpanded) {
                    closeExpandedCard();
                }
                
                // Mettre à jour les boutons
                filters.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Filtrer les cartes
                let visibleCount = 0;
                cards.forEach(card => {
                    const category = card.getAttribute('data-category') || '';
                    const shouldShow = filterValue === 'all' || category.includes(filterValue);
                    
                    if (shouldShow) {
                        card.style.display = 'block';
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
                
                console.log(`${visibleCount} projets visibles après filtrage`);
                
                // Réattacher les listeners après filtrage
                setTimeout(() => {
                    attachProjectListeners();
                }, 350);
            });
        });
    }

    // === GESTION VIDÉOS ===
    function setupVideoHandlers() {
        // Gestion des vidéos dans les cartes projets normales
        document.addEventListener('click', function(e) {
            const video = e.target.closest('.project-video');
            if (video && !video.closest('.project-card.expanded')) {
                e.stopPropagation();
                const projectTitle = video.closest('.project-card')?.querySelector('h3')?.textContent || 'Projet';
                const videoSrc = video.querySelector('source')?.src || video.src;
                openVideoModal(videoSrc, projectTitle);
            }
        });
    }

    // === GESTION MODAL VIDÉO ===
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
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                videoModal.classList.add('modal-open');
            }, 10);
        }
    }

    function setupVideoModal() {
        const { videoModal, modalVideo } = domCache;
        if (!videoModal) return;

        const modalClose = document.getElementById('modal-close');

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
                    
                    // Restaurer le scroll seulement si aucune carte étendue
                    if (!isCardExpanded && !isImageModalOpen) {
                        document.body.style.overflow = '';
                    }
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

        window.closeVideoModal = closeVideoModal;
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

        const closeElements = popup.querySelectorAll('#close-popup, #popup-ok-btn');
        closeElements.forEach(el => el?.addEventListener("click", closePopup));
        
        popup.addEventListener("click", function(e) {
            if (e.target === popup) closePopup();
        });

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
                    // Fermer la carte étendue si ouverte
                    if (isCardExpanded) {
                        closeExpandedCard();
                    }
                    
                    projectsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    // === NAVIGATION ===
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-list a');
        const { nav, menuToggle } = domCache;

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Fermer la carte étendue si ouverte
                    if (isCardExpanded) {
                        closeExpandedCard();
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

        // Menu mobile
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', function() {
                nav.classList.toggle('mobile-open');
                menuToggle.classList.toggle('active');
            });
        }
    }

    // === GESTION THÈME ===
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

    // === GESTION CLAVIER ===
    function setupKeyboardHandlers() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                
                if (isImageModalOpen) {
                    window.closeImageModal();
                } else if (isCardExpanded) {
                    closeExpandedCard();
                } else if (domCache.videoModal?.style.display === 'flex') {
                    window.closeVideoModal?.();
                } else if (domCache.popup && domCache.popup.style.display !== "none") {
                    window.closePopup?.();
                }
            }
            
            // Navigation clavier dans le modal d'images
            if (isImageModalOpen) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    document.getElementById('modalPrev')?.click();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    document.getElementById('modalNext')?.click();
                }
            }
        });
    }

    // === ANIMATIONS SECTIONS ===
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

    // === FORMULAIRE CONTACT ===
    function setupContactForm() {
        const { contactForm } = domCache;
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            let isValid = true;
            const fields = ['name', 'email', 'subject', 'message'];
            
            // Validation des champs
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
            
            // Validation email
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

    // === INITIALISATION COMPLÈTE ===
    function initialize() {
        console.log("Début de l'initialisation...");
        
        // Initialiser le cache DOM
        domCache.init();
        
        // Créer les éléments nécessaires
        createExpandedOverlay();
        createImageModal();
        
        // Sauvegarder le HTML original
        saveOriginalHTML();
        
        // Initialiser tous les composants
        setupPopup();
        setupHeroButtons();
        initSlideshows();
        attachProjectListeners();
        
        // Configuration spécifique aux projets
        setupProjectFilters();
        setupVideoHandlers();
        setupVideoModal();
        
        // Composants généraux
        setupNavigation();
        setupTheme();
        setupKeyboardHandlers();
        setupSectionAnimations();
        setupContactForm();
        
        console.log("Initialisation terminée avec succès !");
    }

    // Masquer le loading et initialiser
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        initialize();
    }, 500);

    // === FONCTIONS DE DEBUG ===
    window.debugProjects = function() {
        console.log("=== DEBUG PROJETS ===");
        console.log("Carte étendue:", isCardExpanded);
        console.log("Modal image ouverte:", isImageModalOpen);
        console.log("Image modal présent:", !!domCache.imageModal);
        console.log("Overlay étendu présent:", !!expandedOverlay);
        console.log("Projets HTML sauvegardés:", originalProjectsHTML.size);
        console.log("Cartes projets:", document.querySelectorAll('.project-card').length);
        console.log("Cartes avec listeners:", document.querySelectorAll('.project-card[data-listener-attached]').length);
        console.log("Slideshows:", document.querySelectorAll('.slideshow-container').length);
        console.log("Cache DOM:", domCache);
        console.log("===================");
    };

    window.testExpandedCard = function() {
        const firstCard = document.querySelector('.project-card');
        if (firstCard) {
            console.log("Test de la carte étendue...");
            openExpandedCard(firstCard);
        } else {
            console.log("Aucune carte trouvée");
        }
    };

    window.testImageModal = function() {
        const firstCard = document.querySelector('.project-card');
        if (firstCard && window.openImageModal) {
            console.log("Test du modal d'images...");
            window.openImageModal(firstCard);
        } else {
            console.log("Aucune carte trouvée ou modal non configuré");
        }
    };

    window.forceCloseAll = function() {
        if (isImageModalOpen && window.closeImageModal) {
            window.closeImageModal();
        }
        if (isCardExpanded) {
            closeExpandedCard();
        }
        if (domCache.videoModal?.style.display === 'flex' && window.closeVideoModal) {
            window.closeVideoModal();
        }
    };
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker enregistré'))
            .catch(() => console.log('Service Worker non supporté'));
    });
}