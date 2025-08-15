document.addEventListener("DOMContentLoaded", function () {
    console.log("Initialisation du portfolio...");

    // Variables globales adaptées de votre ancien code
    let modalBackdrop = null;
    let modalContainer = null;
    let isModalOpen = false;
    let isImageModalOpen = false;
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
                    if (isModalOpen) closeProjectModal();
                    projectsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    // === CRÉATION ÉLÉMENTS MODAUX (inspiré de votre ancien code) ===
    function createModalElements() {
        // Créer le backdrop
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'expanded-overlay';
        document.body.appendChild(modalBackdrop);
        
        // Créer le conteneur - pas besoin car on utilise la carte elle-même
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.display = 'none'; // Caché par défaut
        document.body.appendChild(modalContainer);
        
        // Event listeners unifiés pour fermeture
        modalBackdrop.addEventListener('click', function(e) {
            if (e.target === modalBackdrop) {
                closeProjectModal();
            }
        });
        
        // Créer le modal d'images si nécessaire
        createImageModal();
        
        console.log("Éléments modaux créés");
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
            toggleBodyScroll(true);
        }

        function closeImageModal() {
            if (!isImageModalOpen) return;
            
            imageModal.classList.remove('active');
            isImageModalOpen = false;
            
            // Restaurer le scroll seulement si aucune carte étendue
            if (!isModalOpen) {
                toggleBodyScroll(false);
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

    // === OUVERTURE MODAL (carte étendue) ===
    function openProjectModal(projectCard) {
        if (isModalOpen || !modalBackdrop) return;
        
        console.log("Ouverture carte étendue pour:", projectCard.querySelector('h3')?.textContent);
        
        isModalOpen = true;
        toggleBodyScroll(true);
        toggleSlideshows('stop');
        
        // Restructurer la carte pour l'affichage étendu
        restructureCardForExpansion(projectCard);
        
        // Marquer comme étendue
        projectCard.classList.add('expanded');
        
        // Afficher l'overlay
        modalBackdrop.classList.add('active');
        
        // Gérer l'URL
        const title = projectCard.querySelector('h3')?.textContent || '';
        updateURL(title);
        
        // Réinitialiser les slideshows dans la carte étendue
        setTimeout(() => {
            initModalSlideshows(projectCard);
            addMediaExpandButton(projectCard);
        }, 350);
    }

    // === RESTRUCTURATION CARTE POUR EXPANSION ===
    function restructureCardForExpansion(card) {
        // Assurer la structure .project-content
        let projectContent = card.querySelector('.project-content');
        if (!projectContent) {
            projectContent = document.createElement('div');
            projectContent.className = 'project-content';
            
            // Déplacer tous les enfants sauf expand-badge
            const children = Array.from(card.children);
            children.forEach(child => {
                if (!child.classList.contains('expand-badge')) {
                    projectContent.appendChild(child);
                }
            });
            card.appendChild(projectContent);
        }
        
        // Ajouter les boutons de contrôle
        addExpandedCardControls(card);
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
                closeProjectModal();
            });
            card.appendChild(closeBtn);
        }
    }

    // === AJOUT BOUTON AGRANDISSEMENT MÉDIA ===
    function addMediaExpandButton(card) {
        const mediaContainer = card.querySelector('.project-media');
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

    // === FERMETURE MODAL ===
    function closeProjectModal() {
        if (!isModalOpen) return;
        
        console.log("Fermeture carte étendue");
        
        isModalOpen = false;
        
        // Trouver la carte étendue et la fermer
        const expandedCard = document.querySelector('.project-card.expanded');
        if (expandedCard) {
            expandedCard.classList.remove('expanded');
        }
        
        modalBackdrop.classList.remove('active');
        
        clearURL();
        
        setTimeout(() => {
            // Restaurer le scroll si aucun modal image ouvert
            if (!isImageModalOpen) {
                toggleBodyScroll(false);
            }
            toggleSlideshows('start');
            
            // Nettoyer les éléments ajoutés
            const controls = document.querySelectorAll('.close-expanded, .media-expand-btn');
            controls.forEach(control => control.remove());
            
            // Réattacher les listeners
            attachProjectListeners();
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
        if (isImageModalOpen) {
            window.closeImageModal();
        } else if (isModalOpen) {
            closeProjectModal();
        }
    });

    // === SLIDESHOWS PRINCIPAL ===
    function initSlideshows() {
        document.querySelectorAll('.project-card:not(.expanded) .slideshow-container').forEach(container => {
            setupSlideshow(container, false);
        });
    }

    // === SLIDESHOWS POUR CARTES ÉTENDUES ===
    function initModalSlideshows(card) {
        if (card) {
            const container = card.querySelector('.slideshow-container');
            if (container) {
                setupSlideshow(container, true);
            }
        }
    }

    // === FONCTION UNIFIÉE POUR CONFIGURER UN SLIDESHOW ===
    function setupSlideshow(container, isInModal = false) {
        const slides = container.querySelectorAll('.slide');
        const dots = container.querySelectorAll('.slide-dot');
        let currentSlide = 0;
        let slideInterval;

        if (slides.length <= 1) return;

        // Réinitialiser l'état des slides
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === 0) slide.classList.add('active');
            
            // Ajouter event listener pour expansion sur clic (seulement en mode étendu)
            if (isInModal) {
                slide.addEventListener('click', function(e) {
                    if (e.target.closest('.slide-dot, .media-expand-btn, button')) return;
                    
                    e.stopPropagation();
                    const parentCard = container.closest('.project-card');
                    if (parentCard && window.openImageModal) {
                        window.openImageModal(parentCard);
                    }
                });
            }
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

        // Navigation dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(index);
            });
        });

        // Auto-slide (pas en mode étendu)
        function startSlide() {
            if (!isInModal) {
                slideInterval = setInterval(() => {
                    showSlide((currentSlide + 1) % slides.length);
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

    // === LISTENERS CARTES PROJETS ===
    function attachProjectListeners() {
        const projectCards = document.querySelectorAll('.project-card:not(.expanded)');
        
        projectCards.forEach(card => {
            // Éviter les doublons
            if (card.hasAttribute('data-modal-listener')) return;
            card.setAttribute('data-modal-listener', 'true');
            
            card.addEventListener('click', function(e) {
                // Éviter les clics sur les boutons internes
                if (e.target.closest(`
                    a, 
                    button:not(.modal-close), 
                    .project-link, 
                    .modal-link,
                    .slide-dot, 
                    iframe
                `)) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                openProjectModal(this);
            });
            
            // Listener spécifique pour le badge d'expansion
            const expandBadge = card.querySelector('.expand-badge');
            if (expandBadge) {
                expandBadge.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openProjectModal(card);
                });
            }
        });
        
        console.log("Listeners attachés à", projectCards.length, "cartes projets");
    }

    // === FILTRES UNIVERSELS ===
    function setupFilters(containerSelector, cardSelector) {
        const filters = document.querySelectorAll(`${containerSelector} .filter-btn`);
        const cards = document.querySelectorAll(cardSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                console.log("Filtre sélectionné:", filterValue);
                
                // Fermer la modal si ouverte
                if (isModalOpen && containerSelector.includes('projects')) {
                    closeProjectModal();
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
                
                // Réattacher les listeners
                if (containerSelector.includes('projects')) {
                    setTimeout(attachProjectListeners, 350);
                }
            });
        });
    }

    // === GESTION VIDÉOS ===
    function setupMediaHandlers() {
        // Gestion des vidéos dans les cartes normales
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
                    
                    // Restaurer le scroll approprié
                    if (!isModalOpen && !isImageModalOpen) {
                        toggleBodyScroll(false);
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

    // === GESTION CLAVIER GLOBALE ===
    function setupKeyboardHandlers() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                
                if (isImageModalOpen) {
                    window.closeImageModal();
                } else if (isModalOpen) {
                    closeProjectModal();
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

    // === GESTION CHARGEMENT URL ===
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

    // === INITIALISATION COMPLÈTE ===
    function initialize() {
        console.log("Début de l'initialisation...");
        
        // Initialiser le cache DOM
        domCache.init();
        
        // Sauvegarder le HTML original AVANT tout
        saveOriginalHTML();
        
        // Créer les éléments modaux
        createModalElements();
        
        // Initialiser tous les composants
        setupPopup();
        setupHeroButtons();
        initSlideshows();
        attachProjectListeners();
        
        // Filtres (utilisation de la fonction universelle)
        setupFilters('.projects', '.project-card');
        setupFilters('.certifications', '.certification-card');
        
        setupMediaHandlers();
        setupVideoModal();
        setupNavigation();
        setupTheme();
        setupKeyboardHandlers();
        setupSectionAnimations();
        setupContactForm();
        
        // Gérer l'URL initiale
        handleInitialURL();
        
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
    window.debugPortfolio = function() {
        console.log("=== DEBUG PORTFOLIO ===");
        console.log("Carte étendue ouverte:", isModalOpen);
        console.log("Modal image ouverte:", isImageModalOpen);
        console.log("Backdrop présent:", !!modalBackdrop);
        console.log("Container présent:", !!modalContainer);
        console.log("Image modal présent:", !!domCache.imageModal);
        console.log("Projets HTML sauvegardés:", originalProjectsHTML.size);
        console.log("Cartes projets:", document.querySelectorAll('.project-card').length);
        console.log("Cartes avec listeners:", document.querySelectorAll('.project-card[data-modal-listener]').length);
        console.log("Cartes étendues:", document.querySelectorAll('.project-card.expanded').length);
        console.log("Cache DOM:", domCache);
        console.log("========================");
    };

    window.testModal = function() {
        const firstCard = document.querySelector('.project-card');
        if (firstCard) {
            console.log("Test de la carte étendue...");
            openProjectModal(firstCard);
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

    window.forceClose = function() {
        if (isImageModalOpen) {
            window.closeImageModal();
        }
        if (isModalOpen) {
            closeProjectModal();
        }
        if (domCache.videoModal?.style.display === 'flex') {
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