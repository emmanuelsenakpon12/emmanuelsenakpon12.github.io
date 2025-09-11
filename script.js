document.addEventListener("DOMContentLoaded", function () {
    console.log("Initialisation du portfolio...");

    // === CONFIGURATION EMAILJS ===
    const EMAIL_CONFIG = {
        publicKey: '0EwW99k0FwpYAFKg2',
        serviceId: 'service_11ipabe',
        templateId: 'template_qatv289'
    };

    // Variables globales 
    let modalBackdrop = null;
    let modalContainer = null;
    let isModalOpen = false;
    let originalProjectsHTML = new Map();

    // Cache DOM  performance
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

    // === INITIALISATION EMAILJS ===
    function initializeEmailJS() {

        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAIL_CONFIG.publicKey);
            console.log(" EmailJS initialisé avec succès");
            return true;
        } else {
            console.warn("⚠️ EmailJS non disponible - fallback vers mailto");
            return false;
        }
    }

    // Fonction  pour débounce
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

        // Event listeners 
        const closeElements = popup.querySelectorAll('#close-popup, #popup-ok-btn');
        closeElements.forEach(el => el?.addEventListener("click", closePopup));
        
        popup.addEventListener("click", function(e) {
            if (e.target === popup) closePopup();
        });

        // Fonction globale  fermeture
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

    // === CRÉATION ÉLÉMENTS MODAUX ===
    function createModalElements() {
        // Crée le backdrop
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        document.body.appendChild(modalBackdrop);
        
        // Crée le conteneur
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
        
        // Event listeners  fermeture
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
        
        // Créer  modal
        createModalFromCard(projectCard);
        
        // Afficher  modal
        modalBackdrop.classList.add('active');
        modalContainer.classList.add('active');
        
        // Gérer l'URL
        const title = projectCard.querySelector('h3')?.textContent || '';
        updateURL(title);
        
        //  Réinitit les slideshows  dans la modal après animation
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
        
        
        const modalCard = cardElement.cloneNode(true);
        modalCard.className = 'modal-card';
        modalCard.removeAttribute('data-category');
        modalCard.style.display = '';
        modalCard.style.opacity = '';
        
        
        const projectMedia = modalCard.querySelector('.project-media');
        const projectInfo = modalCard.querySelector('.project-info');
        
        if (projectMedia && projectInfo) {
            
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
        
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Fermer le projet');
        closeBtn.addEventListener('click', closeProjectModal);
        modalCard.appendChild(closeBtn);
        
        
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
        // Seulement les slideshows dans les cartes (pas dans les modals)
        document.querySelectorAll('.project-card .slideshow-container').forEach(container => {
            setupSlideshow(container, false); // false = pas dans une modal
        });
    }

    // === NOUVEAU: SLIDESHOWS POUR MODALS ===
    function initModalSlideshows() {
        // Seulement les slideshows dans les modals
        document.querySelectorAll('.modal-container .slideshow-container').forEach(container => {
            setupSlideshow(container, true); // true = dans une modal
        });
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

        // Auto-slide (conditions différentes selon le contexte)
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

    // === LISTENERS CARTES PROJETS ===
    function attachProjectListeners() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            
            if (card.hasAttribute('data-modal-listener')) return;
            card.setAttribute('data-modal-listener', 'true');
            
            card.addEventListener('click', function(e) {
                
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

    // === FILTRES UNIVERSELS ===
    function setupFilters(containerSelector, cardSelector) {
        const filters = document.querySelectorAll(`${containerSelector} .filter-btn`);
        const cards = document.querySelectorAll(cardSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                console.log("Filtre sélectionné:", filterValue);
                
                // Fermer la modal si ouverte (projets uniquement)
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
                
                // Réattacher les listeners pour les projets
                if (containerSelector.includes('projects')) {
                    setTimeout(attachProjectListeners, 350);
                }
            });
        });
    }

    // === GESTION YOUTUBE ET VIDÉOS ===
    function setupMediaHandlers() {
        // YouTube embeds (dans les project-media)
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

        // Gestionnaire unifié pour les boutons YouTube et vidéo
        document.addEventListener('click', function(e) {
            // Boutons YouTube demo
            if (e.target.closest('.youtube-demo-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.youtube-demo-btn');
                const videoId = btn.getAttribute('data-youtube');
                if (videoId) {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
                }
            }
            
            // Boutons modal vidéo
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

        // Fonction globale
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

    // === GESTION CLAVIER GLOBALE ===
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

    // === ENVOI AVEC EMAILJS ===
    function sendEmailWithEmailJS(data, form) {
        const statusDiv = document.getElementById('form-status');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Afficher le loading
        if (statusDiv) {
            statusDiv.textContent = 'Envoi en cours...';
            statusDiv.className = 'form-status loading';
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Envoi...</span>';
        }
        
        // Paramètres pour EmailJS
        const templateParams = {
            from_name: data.name,
            from_email: data.email,
            subject: data.subject,
            message: data.message
        };
        
        emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, templateParams)
            .then(function(response) {
                console.log(' Email envoyé avec succès:', response);
                
                // Succès
                if (statusDiv) {
                    statusDiv.textContent = 'Message envoyé avec succès ! Merci pour votre message.';
                    statusDiv.className = 'form-status success';
                }
                
                // Analytics 
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'engagement',
                        event_label: 'contact_form_success'
                    });
                }
                
                // Reset du formulaire
                form.reset();
                
                
                setTimeout(() => {
                    if (statusDiv) {
                        statusDiv.textContent = '';
                        statusDiv.className = 'form-status';
                    }
                }, 8000);
                
            }, function(error) {
                console.error(' Erreur lors de l\'envoi:', error);
                
                // Erreur - fallback vers mailto
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <span style="color: #dc3545; font-size: 18px;">⚠️</span>
                            <span>Erreur lors de l'envoi. Redirection vers votre client email...</span>
                        </div>
                    `;
                    statusDiv.className = 'form-status error';
                }
                
                // Fallback après 2 secondes
                setTimeout(() => {
                    sendEmailWithMailto(data, form);
                }, 2000);
            })
            .finally(function() {
                // Restaurer le bouton
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Envoyer</span><div class="btn-icon"><div class="icon"></div></div>';
                }
            });
    }

    // === FALLBACK MAILTO ===
    function sendEmailWithMailto(data, form) {
        const statusDiv = document.getElementById('form-status');
        
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="color: #007bff; font-size: 18px;"></span>
                    <span>Ouverture de votre client email...</span>
                </div>
            `;
            statusDiv.className = 'form-status info';
        }
        
        const subject = encodeURIComponent(data.subject);
        const body = encodeURIComponent(`Nom: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
        window.location.href = `mailto:etudeefr@gmail.com?subject=${subject}&body=${body}`;
        
        // Masquer le message après 4 secondes
        setTimeout(() => {
            if (statusDiv) {
                statusDiv.textContent = '';
                statusDiv.className = 'form-status';
            }
        }, 4000);
    }

    // === FORMULAIRE CONTACT  ===
    function setupContactForm() {
        const { contactForm } = domCache;
        if (!contactForm) return;

        // Initialiser EmailJS
        const emailJSAvailable = initializeEmailJS();

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
                
                if (emailJSAvailable && typeof emailjs !== 'undefined') {
                    sendEmailWithEmailJS(data, this);
                } else {
                    
                    sendEmailWithMailto(data, this);
                }
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
        
        
        handleInitialURL();
        
        console.log(" Initialisation terminée avec succès !");
        console.log(" EmailJS configuré avec les paramètres :", EMAIL_CONFIG);
    }

    
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
        console.log("Modal ouverte:", isModalOpen);
        console.log("Backdrop présent:", !!modalBackdrop);
        console.log("Container présent:", !!modalContainer);
        console.log("Projets HTML sauvegardés:", originalProjectsHTML.size);
        console.log("Cartes projets:", document.querySelectorAll('.project-card').length);
        console.log("Cartes avec listeners:", document.querySelectorAll('.project-card[data-modal-listener]').length);
        console.log("Cache DOM:", domCache);
        console.log("EmailJS disponible:", typeof emailjs !== 'undefined');
        console.log("EmailJS config:", EMAIL_CONFIG);
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

    window.testEmailJS = function() {
        const testData = {
            name: "Test User",
            email: "test@example.com",
            subject: "Test EmailJS",
            message: "Ceci est un test d'envoi EmailJS depuis la console."
        };
        
        console.log("🧪 Test EmailJS en cours...");
        
        if (typeof emailjs !== 'undefined') {
            emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, {
                from_name: testData.name,
                from_email: testData.email,
                subject: testData.subject,
                message: testData.message
            })
            .then(function(response) {
                console.log(' Test EmailJS réussi:', response);
                alert(' Test EmailJS réussi ! Vérifiez votre boîte email.');
            }, function(error) {
                console.error(' Test EmailJS échoué:', error);
                alert(' Test EmailJS échoué. Vérifiez la console pour plus de détails.');
            });
        } else {
            console.error(' EmailJS non disponible');
            alert(' EmailJS non disponible. Assurez-vous que le script est chargé.');
        }
    };

    window.forceClose = function() {
        closeProjectModal();
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