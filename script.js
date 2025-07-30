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

    // SYSTÈME MODAL CORRIGÉ - Variables globales
    let modalBackdrop = null;
    let modalContainer = null;
    let currentModalCard = null;
    let currentProjectData = null; // NOUVEAU: Stocker les données du projet
    let isModalOpen = false;

    // Fonction pour créer les éléments modaux
    function createModalElements() {
        modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        document.body.appendChild(modalBackdrop);
        document.body.appendChild(modalContainer);
        
        console.log('Éléments modaux créés');
    }

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

            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showSlide(index);
                });
            });

            function startSlide() {
                if (!isModalOpen) {
                    slideInterval = setInterval(() => {
                        if (!isModalOpen) {
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
        });
    }

    // CORRECTION 1: Extraire les données du projet pour éviter la perte de contenu
    function extractProjectData(projectCard) {
        const title = projectCard.querySelector('h3')?.textContent || '';
        const category = projectCard.getAttribute('data-category') || '';
        
        return {
            title: title,
            category: category,
            originalCard: projectCard,
            // Stocker le HTML complet pour recréer la modal si nécessaire
            originalHTML: projectCard.outerHTML
        };
    }

    // CORRECTION 2: Fonction d'ouverture modal robuste
    function openProjectModal(projectCard) {
        if (isModalOpen) return;
        
        console.log('Ouverture modal:', projectCard.querySelector('h3')?.textContent || 'Sans titre');
        
        // Extraire et stocker les données du projet
        currentProjectData = extractProjectData(projectCard);
        
        isModalOpen = true;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('no-scroll');
        
        document.querySelectorAll('.slideshow-container').forEach(container => {
            if (container._stopSlide) container._stopSlide();
        });
        
        // Créer la modal en utilisant les données stockées
        createModalFromData(currentProjectData);
        
        modalBackdrop.classList.add('active');
        modalContainer.classList.add('active');
        
        // CORRECTION 3: Mettre à jour l'URL de manière synchronisée
        updateURLForModal(currentProjectData.title);
        
        setTimeout(() => {
            initSlideshows();
        }, 350);
        
        console.log('Modal ouverte avec succès');
    }

    // NOUVELLE FONCTION: Créer la modal à partir des données stockées
    function createModalFromData(projectData) {
        // Recréer l'élément depuis le HTML original pour éviter les problèmes de référence
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = projectData.originalHTML;
        const freshCard = tempDiv.firstElementChild;
        
        const modalCard = freshCard.cloneNode(true);
        modalCard.className = 'modal-card';
        modalCard.removeAttribute('data-category');
        
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
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeProjectModal();
        };
        
        modalCard.appendChild(closeBtn);
        currentModalCard = modalCard;
        
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalCard);
    }

    // CORRECTION 4: Fonction de fermeture modal avec nettoyage URL
    function closeProjectModal() {
        if (!isModalOpen) return;
        
        console.log('Fermeture modal');
        
        isModalOpen = false;
        
        modalBackdrop.classList.remove('active');
        modalContainer.classList.remove('active');
        
        // CORRECTION: Nettoyer l'URL
        clearModalURL();
        
        setTimeout(() => {
            if (modalContainer) {
                modalContainer.innerHTML = '';
            }
            currentModalCard = null;
            currentProjectData = null; // Nettoyer les données stockées
            
            document.body.style.overflow = '';
            document.body.classList.remove('no-scroll');
            
            document.querySelectorAll('.slideshow-container').forEach(container => {
                if (container._startSlide) container._startSlide();
            });
            
        }, 250);
        
        console.log('Modal fermée');
    }

    // CORRECTION 5: Gestion URL synchronisée
    function updateURLForModal(projectTitle) {
        if (history.pushState) {
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

    function clearModalURL() {
        if (history.pushState) {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
    }

    // CORRECTION 6: Event listeners robustes pour les cartes projet
    function attachProjectCardListeners() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Vérifier si le listener n'est pas déjà attaché
            if (card.hasAttribute('data-listener-attached')) {
                return;
            }
            
            // Marquer comme ayant un listener
            card.setAttribute('data-listener-attached', 'true');
            
            // Attacher le listener
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
                    .youtube-play-btn,
                    .modal-play-btn
                `)) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                openProjectModal(this);
            });
        });
        
        console.log('Event listeners attachés à', projectCards.length, 'cartes');
    }

    // Event listeners pour fermeture modal
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

    // CORRECTION 7: Système de filtres amélioré
    function setupFilters(filtersSelector, cardsSelector) {
        const filters = document.querySelectorAll(filtersSelector);
        const cards = document.querySelectorAll(cardsSelector);

        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                console.log('Filtre sélectionné:', filterValue);
                
                // CORRECTION: Fermer la modal ET nettoyer l'URL avant filtrage
                if (filtersSelector.includes('project') && isModalOpen) {
                    closeProjectModal();
                }
                
                filters.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
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
                
                // CORRECTION: Filtrage amélioré avec logs
                let visibleCount = 0;
                cards.forEach(card => {
                    const category = card.getAttribute('data-category') || '';
                    const shouldShow = filterValue === 'all' || category.includes(filterValue);
                    
                    console.log(`Carte: ${card.querySelector('h3')?.textContent}, Catégorie: "${category}", Filtre: "${filterValue}", Afficher: ${shouldShow}`);
                    
                    if (shouldShow) {
                        card.style.display = 'block';
                        card.style.opacity = '1';
                        visibleCount++;
                        
                        // Assurer que le listener est attaché
                        if (!card.hasAttribute('data-listener-attached')) {
                            card.setAttribute('data-listener-attached', 'true');
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
                                    .youtube-play-btn,
                                    .modal-play-btn
                                `)) {
                                    return;
                                }
                                
                                e.preventDefault();
                                e.stopPropagation();
                                openProjectModal(this);
                            });
                        }
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 300);
                    }
                });
                
                console.log(`Filtrage terminé. ${visibleCount} cartes visibles.`);
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

    // CORRECTION 8: Gestion touches clavier et historique améliorée
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            
            if (isModalOpen) {
                closeProjectModal();
            } 
            else if (videoModal && videoModal.style.display === 'flex') {
                closeVideoModal();
            } 
            else if (popup && popup.style.display !== "none") {
                closePopup();
            }
        }
    });

    // CORRECTION 9: Gestion historique navigateur corrigée
    window.addEventListener('popstate', function(e) {
        if (isModalOpen) {
            // Fermer la modal sans ajouter d'entrée dans l'historique
            isModalOpen = false;
            modalBackdrop.classList.remove('active');
            modalContainer.classList.remove('active');
            
            setTimeout(() => {
                if (modalContainer) {
                    modalContainer.innerHTML = '';
                }
                currentModalCard = null;
                currentProjectData = null;
                
                document.body.style.overflow = '';
                document.body.classList.remove('no-scroll');
                
                document.querySelectorAll('.slideshow-container').forEach(container => {
                    if (container._startSlide) container._startSlide();
                });
            }, 250);
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isModalOpen) {
                console.log('Resize détecté avec modal ouverte - CSS gère automatiquement');
            }
        }, 250);
    });

    // Gestion erreurs JavaScript avec nettoyage
    window.addEventListener('error', function(e) {
        console.warn('Erreur JS détectée:', e.message);
        if (isModalOpen) {
            isModalOpen = false;
            document.body.style.overflow = '';
            document.body.classList.remove('no-scroll');
            if (modalBackdrop) modalBackdrop.classList.remove('active');
            if (modalContainer) modalContainer.classList.remove('active');
            clearModalURL();
        }
    });

    // CORRECTION 10: Initialisation complète au chargement
    function initializePortfolio() {
        initSlideshows();
        attachProjectCardListeners();
        
        // Gestion URL au chargement (si l'utilisateur arrive avec une URL de projet)
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
                // Nettoyer l'URL si le projet n'existe pas
                clearModalURL();
            }
        }
    }

    // Masquer le loading
    setTimeout(() => {
        if (loading) {
            loading.style.display = 'none';
        }
        // Initialiser après le masquage du loading
        initializePortfolio();
    }, 500);

    console.log('Portfolio modal système corrigé initialisé avec succès');
    console.log('Corrections appliquées:');
    console.log('- Stockage des données de projet pour éviter la perte de contenu');
    console.log('- Synchronisation URL avec état modal');
    console.log('- Réattachement des listeners après filtrage');
    console.log('- Gestion historique navigateur améliorée');
    console.log('- Nettoyage automatique en cas d\'erreur');
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker enregistré'))
            .catch(() => console.log('Service Worker non supporté'));
    });
}

// Fonctions de debug améliorées
window.debugModal = function() {
    console.log('=== DEBUG SYSTÈME MODAL ===');
    console.log('État modal:', isModalOpen ? 'OUVERTE' : 'FERMÉE');
    console.log('Backdrop:', modalBackdrop?.classList.contains('active') ? 'ACTIF' : 'INACTIF');
    console.log('Container:', modalContainer?.classList.contains('active') ? 'ACTIF' : 'INACTIF');
    console.log('Body overflow:', document.body.style.overflow || 'auto');
    console.log('Modal actuelle:', currentModalCard?.querySelector('h3')?.textContent || 'Aucune');
    console.log('Données stockées:', currentProjectData?.title || 'Aucune');
    console.log('Cartes détectées:', document.querySelectorAll('.project-card').length);
    console.log('URL actuelle:', window.location.href);
    console.log('============================');
};

window.testModal = function() {
    const firstCard = document.querySelector('.project-card');
    if (firstCard) {
        console.log('Test modal avec première carte...');
        openProjectModal(firstCard);
    } else {
        console.log('Aucune carte trouvée pour le test');
    }
};

window.forceCloseModal = function() {
    console.log('Fermeture forcée de la modal...');
    closeProjectModal();
};

// Fonction de debug pour les filtres
window.debugFilters = function() {
    console.log('=== DEBUG SYSTÈME FILTRES ===');
    const projectCards = document.querySelectorAll('.project-card');
    const filters = document.querySelectorAll('.projects .filter-btn');
    const activeFilter = document.querySelector('.projects .filter-btn.active');
    
    console.log('Filtres détectés:', filters.length);
    console.log('Filtre actif:', activeFilter?.getAttribute('data-filter') || 'Aucun');
    console.log('Cartes projet:', projectCards.length);
    
    projectCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent || `Carte ${index + 1}`;
        const category = card.getAttribute('data-category') || 'sans catégorie';
        const visible = card.style.display !== 'none';
        const hasListener = card.hasAttribute('data-listener-attached');
        
        console.log(`- ${title}: catégorie="${category}", visible=${visible}, listener=${hasListener}`);
    });
    
    console.log('============================');
};