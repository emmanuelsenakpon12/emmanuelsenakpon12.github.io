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
    let currentProjectData = null; // 🔧 NOUVEAU: Stocker les données du projet

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

    // 🔧 FONCTION POUR SAUVEGARDER LES DONNÉES D'UN PROJET
    function saveProjectData(projectCard) {
        const title = projectCard.querySelector('h3')?.textContent || 'Projet sans titre';
        const tags = Array.from(projectCard.querySelectorAll('.tag')).map(tag => tag.textContent);
        const description = projectCard.querySelector('.project-description')?.textContent || '';
        const category = projectCard.getAttribute('data-category') || '';
        
        // Sauvegarder les médias (images du slideshow)
        const mediaElements = [];
        const slides = projectCard.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            mediaElements.push({
                src: slide.src,
                alt: slide.alt,
                active: slide.classList.contains('active')
            });
        });
        
        // Sauvegarder les actions/liens
        const actions = [];
        const actionLinks = projectCard.querySelectorAll('.project-link');
        actionLinks.forEach(link => {
            actions.push({
                href: link.href,
                text: link.textContent.trim(),
                innerHTML: link.innerHTML
            });
        });

        return {
            title,
            tags,
            description,
            category,
            mediaElements,
            actions
        };
    }

    // ✅ FONCTION D'OUVERTURE MODAL - CORRIGÉE
    function openProjectModal(projectCard) {
        if (isModalOpen) return; // Une seule modal à la fois
        
        // 🔧 SAUVEGARDER LES DONNÉES AVANT OUVERTURE
        currentProjectData = saveProjectData(projectCard);
        
        console.log('🚀 Ouverture modal:', currentProjectData.title);
        
        // Marquer comme ouverte
        isModalOpen = true;
        
        // Bloquer le scroll du body
        document.body.style.overflow = 'hidden';
        document.body.classList.add('no-scroll');
        
        // Arrêter tous les slideshows
        document.querySelectorAll('.slideshow-container').forEach(container => {
            if (container._stopSlide) container._stopSlide();
        });
        
        // Créer la modal à partir des données sauvegardées
        createModalFromData(currentProjectData);
        
        // Activer les éléments modaux avec les classes CSS
        modalBackdrop.classList.add('active');
        modalContainer.classList.add('active');
        
        // Réinitialiser les slideshows dans la modal
        setTimeout(() => {
            initSlideshows();
        }, 350); // Après l'animation d'ouverture
        
        // 🔧 GESTION URL AMÉLIORÉE
        updateModalURL(currentProjectData.title);
        
        console.log('✅ Modal ouverte avec succès');
    }

    // 🔧 NOUVELLE FONCTION POUR CRÉER LA MODAL À PARTIR DES DONNÉES
    function createModalFromData(projectData) {
        // Cloner la structure sans dépendre de l'élément DOM original
        const modalCard = document.createElement('div');
        modalCard.className = 'modal-card';
        
        // 1. Créer la section média
        const modalMedia = document.createElement('div');
        modalMedia.className = 'modal-media';
        
        if (projectData.mediaElements.length > 1) {
            // Slideshow
            const slideshowContainer = document.createElement('div');
            slideshowContainer.className = 'slideshow-container';
            
            projectData.mediaElements.forEach((media, index) => {
                const img = document.createElement('img');
                img.src = media.src;
                img.alt = media.alt;
                img.className = media.active ? 'slide active' : 'slide';
                img.loading = 'lazy';
                slideshowContainer.appendChild(img);
            });
            
            // Dots de navigation
            const slideDots = document.createElement('div');
            slideDots.className = 'slide-dots';
            projectData.mediaElements.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = index === 0 ? 'slide-dot active' : 'slide-dot';
                dot.setAttribute('aria-label', `Image ${index + 1}`);
                slideDots.appendChild(dot);
            });
            
            slideshowContainer.appendChild(slideDots);
            modalMedia.appendChild(slideshowContainer);
        } else if (projectData.mediaElements.length === 1) {
            // Image unique
            const img = document.createElement('img');
            img.src = projectData.mediaElements[0].src;
            img.alt = projectData.mediaElements[0].alt;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            modalMedia.appendChild(img);
        }
        
        // 2. Créer la section info
        const modalInfo = document.createElement('div');
        modalInfo.className = 'modal-info';
        
        // Titre
        const title = document.createElement('h3');
        title.textContent = projectData.title;
        modalInfo.appendChild(title);
        
        // Description
        const description = document.createElement('p');
        description.className = 'modal-description';
        description.textContent = projectData.description;
        modalInfo.appendChild(description);
        
        // Tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'modal-tags';
        projectData.tags.forEach(tagText => {
            const tag = document.createElement('span');
            tag.className = 'modal-tag';
            tag.textContent = tagText;
            tagsContainer.appendChild(tag);
        });
        modalInfo.appendChild(tagsContainer);
        
        // Actions
        if (projectData.actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'modal-actions';
            projectData.actions.forEach(action => {
                const link = document.createElement('a');
                link.href = action.href;
                link.className = 'modal-link';
                link.innerHTML = action.innerHTML.replace('project-link', 'modal-link');
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                actionsContainer.appendChild(link);
            });
            modalInfo.appendChild(actionsContainer);
        }
        
        // 3. Créer le bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Fermer le projet');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeProjectModal();
        };
        
        // Assembler la modal
        modalCard.appendChild(modalMedia);
        modalCard.appendChild(modalInfo);
        modalCard.appendChild(closeBtn);
        
        // Stocker la référence
        currentModalCard = modalCard;
        
        // Ajouter au conteneur modal
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalCard);
    }

    // 🔧 GESTION URL AMÉLIORÉE
    function updateModalURL(projectTitle) {
        if (history.pushState) {
            const urlSlug = projectTitle.toLowerCase()
                .replace(/[àáâãäå]/g, 'a')
                .replace(/[èéêë]/g, 'e')
                .replace(/[ìíîï]/g, 'i')
                .replace(/[òóôõö]/g, 'o')
                .replace(/[ùúûü]/g, 'u')
                .replace(/[ç]/g, 'c')
                .replace(/[ñ]/g, 'n')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
            
            history.pushState(
                { modal: true, project: projectTitle }, 
                `${projectTitle} - Mohamed Amine Sobhi`, 
                `#projet-${urlSlug}`
            );
        }
    }

    function removeModalURL() {
        if (history.replaceState) {
            history.replaceState(null, 'Mohamed Amine Sobhi - Portfolio', window.location.pathname);
        }
    }

    // ✅ FONCTION DE FERMETURE MODAL - CORRIGÉE
    function closeProjectModal() {
        if (!isModalOpen) return;
        
        console.log('🔽 Fermeture modal');
        
        // Marquer comme fermée
        isModalOpen = false;
        currentProjectData = null; // 🔧 Nettoyer les données
        
        // Désactiver les éléments modaux
        modalBackdrop.classList.remove('active');
        modalContainer.classList.remove('active');
        
        // 🔧 NETTOYER L'URL
        removeModalURL();
        
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

    // ✅ EVENT LISTENERS POUR LES CARTES PROJET - CORRIGÉS
    function attachProjectCardListeners() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Supprimer les anciens listeners pour éviter les doublons
            card.replaceWith(card.cloneNode(true));
        });
        
        // Rattacher les listeners sur les nouveaux éléments
        document.querySelectorAll('.project-card').forEach(card => {
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
        });
    }

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

    // 🔧 GESTION HISTORIQUE NAVIGATEUR CORRIGÉE
    window.addEventListener('popstate', function(e) {
        if (isModalOpen && (!e.state || !e.state.modal)) {
            closeProjectModal();
        }
    });

    // Initialisation des slideshows pour les cartes normales
    initSlideshows();

    // ===== FILTRES UNIFIÉS - CORRIGÉS =====
    function setupFilters(filtersSelector, cardsSelector) {
        const filters = document.querySelectorAll(filtersSelector);
        const cards = document.querySelectorAll(cardsSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                // 🔧 FERMER TOUTE MODAL OUVERTE AVANT FILTRAGE
                if (isModalOpen) {
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
                        card.style.opacity = '1';
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 300);
                    }
                });
                
                // 🔧 RATTACHER LES LISTENERS APRÈS FILTRAGE
                setTimeout(() => {
                    if (filtersSelector.includes('project')) {
                        attachProjectCardListeners();
                        initSlideshows(); // Réinitialiser les slideshows
                    }
                }, 350);
            });
        });
    }

    // Setup des filtres
    setupFilters('.projects .filter-btn', '.project-card');
    setupFilters('.certifications .filter-btn', '.certification-card');

    // Initialiser les listeners pour les cartes au chargement
    attachProjectCardListeners();

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

    // ✅ GESTION ERREURS JAVASCRIPT - AMÉLIORÉE
    window.addEventListener('error', function(e) {
        console.warn('Erreur JS détectée:', e.message);
        // En cas d'erreur, nettoyer l'état modal
        if (isModalOpen) {
            console.log('🔧 Nettoyage forcé de l\'état modal suite à une erreur');
            isModalOpen = false;
            currentProjectData = null;
            document.body.style.overflow = '';
            document.body.classList.remove('no-scroll');
            if (modalBackdrop) modalBackdrop.classList.remove('active');
            if (modalContainer) {
                modalContainer.classList.remove('active');
                modalContainer.innerHTML = '';
            }
            removeModalURL();
        }
    });

    // 🔧 FONCTION DE RÉCUPÉRATION D'ÉTAT (au cas où l'URL contient un projet)
    function checkURLForProject() {
        const hash = window.location.hash;
        if (hash.startsWith('#projet-')) {
            // Tentative de retrouver le projet correspondant
            const projectSlug = hash.replace('#projet-', '');
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent || '';
                const cardSlug = title.toLowerCase()
                    .replace(/[àáâãäå]/g, 'a')
                    .replace(/[èéêë]/g, 'e')
                    .replace(/[ìíîï]/g, 'i')
                    .replace(/[òóôõö]/g, 'o')
                    .replace(/[ùúûü]/g, 'u')
                    .replace(/[ç]/g, 'c')
                    .replace(/[ñ]/g, 'n')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim('-');
                
                if (cardSlug === decodeURIComponent(projectSlug)) {
                    // Projet trouvé, ouvrir la modal après un délai
                    setTimeout(() => {
                        if (card.style.display !== 'none') { // Vérifier que la carte est visible
                            openProjectModal(card);
                        } else {
                            // La carte est filtrée, nettoyer l'URL
                            removeModalURL();
                        }
                    }, 500);
                }
            });
        }
    }

    // Vérifier l'URL au chargement
    setTimeout(checkURLForProject, 1000);

    // Masquer le loading
    setTimeout(() => {
        if (loading) {
            loading.style.display = 'none';
        }
    }, 500);

    // ✅ LOG FINAL DE CONFIRMATION
    console.log('🚀 Portfolio modal révolutionnaire initialisé avec succès');
    console.log('✅ Corrections appliquées:');
    console.log('  • Sauvegarde des données projet avant filtrage');
    console.log('  • Gestion URL améliorée avec nettoyage automatique');
    console.log('  • Listeners reattachés après filtrage');
    console.log('  • Gestion d\'erreurs renforcée');
    console.log('  • Récupération depuis URL au chargement');
    console.log('✅ Project cards détectées:', document.querySelectorAll('.project-card').length);
    console.log('✅ Modal backdrop:', modalBackdrop ? 'Créé' : 'ERREUR');
    console.log('✅ Modal container:', modalContainer ? 'Créé' : 'ERREUR');
    console.log('✅ Mode révolutionnaire activé - AUCUN FLOU GARANTI');
    console.log('✅ Système de filtrage corrigé - Contenu préservé');
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
    console.log('Données projet:', currentProjectData ? currentProjectData.title : 'Aucune');
    console.log('Backdrop:', modalBackdrop?.classList.contains('active') ? 'ACTIF' : 'INACTIF');
    console.log('Container:', modalContainer?.classList.contains('active') ? 'ACTIF' : 'INACTIF');
    console.log('Body overflow:', document.body.style.overflow || 'auto');
    console.log('URL actuelle:', window.location.href);
    console.log('Cartes visibles:', Array.from(document.querySelectorAll('.project-card')).filter(card => card.style.display !== 'none').length);
    console.log('============================');
};

window.testModal = function() {
    const visibleCards = Array.from(document.querySelectorAll('.project-card')).filter(card => card.style.display !== 'none');
    if (visibleCards.length > 0) {
        console.log('🧪 Test modal avec première carte visible...');
        openProjectModal(visibleCards[0]);
    } else {
        console.log('❌ Aucune carte visible pour le test');
    }
};

window.forceCloseModal = function() {
    console.log('🔧 Fermeture forcée de la modal...');
    closeProjectModal();
};

window.debugFilters = function() {
    console.log('=== DEBUG FILTRES ===');
    const allCards = document.querySelectorAll('.project-card');
    const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
    console.log('Cartes totales:', allCards.length);
    console.log('Cartes visibles:', visibleCards.length);
    console.log('Filtre actif:', document.querySelector('.project-filters .filter-btn.active')?.textContent);
    console.log('===================');
};