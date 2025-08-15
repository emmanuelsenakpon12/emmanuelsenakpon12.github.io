document.addEventListener("DOMContentLoaded", function () {
    console.log("Initialisation de la section projets...");

    // Variables globales pour la section projets
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
                    projectsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    // === CRÉATION DU MODAL D'IMAGES ===
    function createImageModal() {
        // Utiliser le modal existant s'il est présent dans le HTML
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
            document.body.style.overflow = '';
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
            
            // Ajouter event listener pour expansion sur clic
            slide.addEventListener('click', function(e) {
                // Éviter l'expansion si on clique sur un dot ou un bouton
                if (e.target.closest('.slide-dot, .expand-badge, button')) return;
                
                e.stopPropagation();
                const parentCard = container.closest('.project-card');
                if (parentCard && window.openImageModal) {
                    window.openImageModal(parentCard);
                }
            });
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
        
        // Stocker les fonctions pour contrôle externe
        container._startSlide = startSlide;
        container._stopSlide = stopSlide;
    }

    // === LISTENERS CARTES PROJETS ===
    function attachProjectListeners() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Éviter les doublons
            if (card.hasAttribute('data-listener-attached')) return;
            card.setAttribute('data-listener-attached', 'true');
            
            // Listener pour le badge d'expansion
            const expandBadge = card.querySelector('.expand-badge');
            if (expandBadge) {
                expandBadge.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.openImageModal) {
                        window.openImageModal(card);
                    }
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
        // Gestion des vidéos dans les cartes projets
        document.querySelectorAll('.project-video').forEach(video => {
            video.addEventListener('click', function(e) {
                e.stopPropagation();
                const projectTitle = this.closest('.project-card')?.querySelector('h3')?.textContent || 'Projet';
                openVideoModal(this.querySelector('source')?.src || this.src, projectTitle);
            });
        });

        // Gestionnaire pour les boutons demo
        document.addEventListener('click', function(e) {
            if (e.target.closest('.drive-demo-btn')) {
                e.preventDefault();
                e.stopPropagation();
                // Les liens Google Drive s'ouvrent normalement via href
                return;
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
                    document.body.style.overflow = '';
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
        
        // Sauvegarder le HTML original
        saveOriginalHTML();
        
        // Créer et configurer le modal d'images
        createImageModal();
        
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
        console.log("Modal image ouverte:", isImageModalOpen);
        console.log("Image modal présent:", !!domCache.imageModal);
        console.log("Projets HTML sauvegardés:", originalProjectsHTML.size);
        console.log("Cartes projets:", document.querySelectorAll('.project-card').length);
        console.log("Cartes avec listeners:", document.querySelectorAll('.project-card[data-listener-attached]').length);
        console.log("Slideshows:", document.querySelectorAll('.slideshow-container').length);
        console.log("Cache DOM:", domCache);
        console.log("===================");
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

    window.forceCloseModals = function() {
        if (isImageModalOpen && window.closeImageModal) {
            window.closeImageModal();
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