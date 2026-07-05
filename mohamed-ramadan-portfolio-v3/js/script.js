// ==========================================
// Mohamed Ramadan Portfolio - Fixed & Enhanced Script
// ==========================================

(function() {
    'use strict';

    // ==========================================
    // Debug Mode - Set to false in production
    // ==========================================
    const DEBUG = false;
    function log(...args) { if (DEBUG) console.log('[Portfolio]', ...args); }
    function error(...args) { console.error('[Portfolio]', ...args); }

    // ==========================================
    // Language Management
    // ==========================================
    let currentLang = localStorage.getItem('language') || 'ar';

    function setLanguage(lang) {
        try {
            currentLang = lang;
            localStorage.setItem('language', lang);

            const html = document.documentElement;
            const body = document.body;

            if (lang === 'en') {
                html.setAttribute('lang', 'en');
                html.setAttribute('dir', 'ltr');
                body.setAttribute('dir', 'ltr');
            } else {
                html.setAttribute('lang', 'ar');
                html.setAttribute('dir', 'rtl');
                body.setAttribute('dir', 'rtl');
            }

            // Update all elements with data-ar and data-en attributes
            document.querySelectorAll('[data-ar][data-en]').forEach(el => {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.setAttribute('placeholder', el.getAttribute('data-' + lang) || '');
                } else {
                    el.textContent = el.getAttribute('data-' + lang) || el.textContent;
                }
            });

            // Update lang toggle button
            const langToggle = document.getElementById('langToggle');
            if (langToggle) {
                langToggle.textContent = lang === 'ar' ? 'EN' : 'AR';
            }

            // Update document title
            const titleEl = document.querySelector('title');
            if (titleEl) {
                titleEl.textContent = lang === 'ar' 
                    ? 'محمد رمضان | مطور ومصمم مواقع' 
                    : 'Mohamed Ramadan | Web Developer & Designer';
            }

            updateProjectModalLang();
            log('Language set to:', lang);
        } catch (e) {
            error('Error setting language:', e);
        }
    }

    // ==========================================
    // Theme Management
    // ==========================================
    function setTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            log('Theme set to:', theme);
        } catch (e) {
            error('Error setting theme:', e);
        }
    }

    function toggleTheme() {
        try {
            const currentTheme = localStorage.getItem('theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        } catch (e) {
            error('Error toggling theme:', e);
        }
    }

    function initTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
        } catch (e) {
            error('Error initializing theme:', e);
            setTheme('light');
        }
    }

    // ==========================================
    // Preloader - Auto hide after max 3 seconds
    // ==========================================
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // Hide after animation completes (2s) or max 3s
            setTimeout(() => {
                preloader.classList.add('hidden');
                log('Preloader hidden');
            }, 2200);

            // Force hide after 3 seconds no matter what
            setTimeout(() => {
                if (!preloader.classList.contains('hidden')) {
                    preloader.classList.add('hidden');
                }
            }, 3000);
        }
    }

    // ==========================================
    // Navigation
    // ==========================================
    function initNavbar() {
        try {
            const navbar = document.getElementById('navbar');
            if (!navbar) return;

            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        } catch (e) {
            error('Error initializing navbar:', e);
        }
    }

    function initMobileMenu() {
        try {
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const navLinks = document.getElementById('navLinks');

            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.addEventListener('click', () => {
                    mobileMenuBtn.classList.toggle('active');
                    navLinks.classList.toggle('active');
                });

                navLinks.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileMenuBtn.classList.remove('active');
                        navLinks.classList.remove('active');
                    });
                });
            }
        } catch (e) {
            error('Error initializing mobile menu:', e);
        }
    }

    function initActiveNav() {
        try {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-links a');

            if (sections.length === 0 || navLinks.length === 0) return;

            window.addEventListener('scroll', () => {
                let current = '';

                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    if (window.scrollY >= sectionTop) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
            });
        } catch (e) {
            error('Error initializing active nav:', e);
        }
    }

    // ==========================================
    // Scroll Animations
    // ==========================================
    function initScrollAnimations() {
        try {
            const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

            if (fadeElements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            fadeElements.forEach(el => observer.observe(el));
        } catch (e) {
            error('Error initializing scroll animations:', e);
        }
    }

    // ==========================================
    // Stats Counter Animation
    // ==========================================
    function initStatsCounter() {
        try {
            const stats = document.querySelectorAll('.stat-number');

            if (stats.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.getAttribute('data-count'));
                        if (!isNaN(target)) {
                            animateCounter(entry.target, target);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            stats.forEach(stat => observer.observe(stat));
        } catch (e) {
            error('Error initializing stats counter:', e);
        }
    }

    function animateCounter(element, target) {
        try {
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + '+';
                }
            }, 25);
        } catch (e) {
            error('Error animating counter:', e);
            element.textContent = target + '+';
        }
    }

    // ==========================================
    // Skills Progress Animation
    // ==========================================
    function initSkillsAnimation() {
        try {
            const skillBars = document.querySelectorAll('.skill-progress');

            if (skillBars.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const width = entry.target.getAttribute('data-width');
                        if (width) {
                            entry.target.style.width = width + '%';
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            skillBars.forEach(bar => observer.observe(bar));
        } catch (e) {
            error('Error initializing skills animation:', e);
        }
    }

    // ==========================================
    // Portfolio with Project Detail Modal
    // ==========================================
    const portfolioDescriptions = {
        'corporate': {
            ar: 'موقع احترافي لتعزيز الهوية الرقمية للشركة مع تصميم عصري وسهل الاستخدام. يتضمن صفحات متعددة ونظام إدارة محتوى مرن.',
            en: 'A professional website to enhance the company\'s digital identity with a modern and user-friendly design. Includes multiple pages and a flexible content management system.'
        },
        'ecommerce': {
            ar: 'متجر إلكتروني متكامل مع نظام دفع آمن، سلة تسوق ذكية، ولوحة تحكم لإدارة المنتجات والطلبات.',
            en: 'A complete e-commerce store with secure payment system, smart shopping cart, and a dashboard for managing products and orders.'
        },
        'personal': {
            ar: 'موقع شخصي أنيق لعرض السيرة الذاتية والمهارات والأعمال. تصميم فريد يعكس شخصية صاحبه.',
            en: 'An elegant personal website to showcase resume, skills, and works. A unique design that reflects the owner\'s personality.'
        },
        'landing': {
            ar: 'صفحة هبوط مقنعة لتحويل الزوار إلى عملاء. تصميم مركز على النتائج مع دعوات للعمل واضحة.',
            en: 'A convincing landing page to convert visitors into customers. Results-focused design with clear calls to action.'
        }
    };

    function loadPortfolio() {
        try {
            const portfolioGrid = document.getElementById('portfolioGrid');
            if (!portfolioGrid) {
                log('Portfolio grid not found');
                return;
            }

            let portfolioItems = [];
            try {
                const stored = localStorage.getItem('portfolioItems');
                if (stored) {
                    portfolioItems = JSON.parse(stored);
                }
            } catch (e) {
                log('No stored portfolio items, using defaults');
            }

            if (!portfolioItems || portfolioItems.length === 0) {
                portfolioItems = getDefaultPortfolio();
            }

            renderPortfolio(portfolioItems);
            initPortfolioFilter();
        } catch (e) {
            error('Error loading portfolio:', e);
            // Render defaults on error
            renderPortfolio(getDefaultPortfolio());
        }
    }

    function getDefaultPortfolio() {
        return [
            {
                id: 1,
                title: 'موقع شركة تقنية',
                titleEn: 'Tech Company Website',
                category: 'corporate',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
                link: '#'
            },
            {
                id: 2,
                title: 'متجر إلكتروني للأزياء',
                titleEn: 'Fashion E-commerce Store',
                category: 'ecommerce',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
                link: '#'
            },
            {
                id: 3,
                title: 'موقع شخصي لمصمم',
                titleEn: 'Designer Portfolio Website',
                category: 'personal',
                image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=500&fit=crop',
                link: '#'
            },
            {
                id: 4,
                title: 'صفحة هبوط لتطبيق',
                titleEn: 'App Landing Page',
                category: 'landing',
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
                link: '#'
            },
            {
                id: 5,
                title: 'موقع شركة عقارية',
                titleEn: 'Real Estate Company Website',
                category: 'corporate',
                image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
                link: '#'
            },
            {
                id: 6,
                title: 'متجر إلكتروني للإلكترونيات',
                titleEn: 'Electronics E-commerce Store',
                category: 'ecommerce',
                image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=500&fit=crop',
                link: '#'
            }
        ];
    }

    function renderPortfolio(items) {
        try {
            const portfolioGrid = document.getElementById('portfolioGrid');
            if (!portfolioGrid) return;

            if (!items || items.length === 0) {
                portfolioGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">لا توجد أعمال لعرضها</p>';
                return;
            }

            portfolioGrid.innerHTML = items.map(item => `
                <div class="portfolio-item" data-category="${item.category || 'all'}" onclick="openProjectModal(${item.id})">
                    <img src="${item.image}" alt="${currentLang === 'ar' ? item.title : item.titleEn}" loading="lazy" onerror="this.src='https://via.placeholder.com/800x500?text=No+Image'">
                    <div class="portfolio-overlay">
                        <h3>${currentLang === 'ar' ? item.title : item.titleEn}</h3>
                        <p>${getCategoryName(item.category)}</p>
                        <span class="btn btn-primary">
                            <i class="fa-solid fa-eye"></i>
                            <span data-ar="عرض التفاصيل" data-en="View Details">عرض التفاصيل</span>
                        </span>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            error('Error rendering portfolio:', e);
        }
    }

    function getCategoryName(cat) {
        const names = {
            'corporate': currentLang === 'ar' ? 'موقع شركة' : 'Corporate Website',
            'ecommerce': currentLang === 'ar' ? 'متجر إلكتروني' : 'E-commerce Store',
            'personal': currentLang === 'ar' ? 'موقع شخصي' : 'Personal Website',
            'landing': currentLang === 'ar' ? 'صفحة هبوط' : 'Landing Page'
        };
        return names[cat] || (currentLang === 'ar' ? 'موقع ويب' : 'Website');
    }

    // ==========================================
    // Project Detail Modal
    // ==========================================
    window.openProjectModal = function(itemId) {
        try {
            let items = [];
            try {
                const stored = localStorage.getItem('portfolioItems');
                if (stored) items = JSON.parse(stored);
            } catch (e) {}

            if (!items || items.length === 0) {
                items = getDefaultPortfolio();
            }

            const item = items.find(i => i.id === itemId);
            if (!item) {
                error('Project not found:', itemId);
                return;
            }

            const modal = document.getElementById('projectModal');
            const modalImage = document.getElementById('projectModalImage');
            const modalCategory = document.getElementById('projectModalCategory');
            const modalTitle = document.getElementById('projectModalTitle');
            const modalDescription = document.getElementById('projectModalDescription');
            const modalLink = document.getElementById('projectModalLink');

            if (!modal || !modalImage || !modalTitle) {
                error('Modal elements not found');
                return;
            }

            modalImage.src = item.image;
            modalImage.alt = currentLang === 'ar' ? item.title : item.titleEn;

            if (modalCategory) {
                modalCategory.textContent = getCategoryName(item.category);
                modalCategory.style.background = getCategoryColor(item.category) + '20';
                modalCategory.style.color = getCategoryColor(item.category);
            }

            modalTitle.textContent = currentLang === 'ar' ? item.title : item.titleEn;

            if (modalDescription) {
                const desc = portfolioDescriptions[item.category];
                modalDescription.textContent = desc ? (currentLang === 'ar' ? desc.ar : desc.en) : '';
            }

            if (modalLink) {
                modalLink.href = item.link || '#';
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            log('Project modal opened:', itemId);
        } catch (e) {
            error('Error opening project modal:', e);
        }
    };

    window.closeProjectModal = function() {
        try {
            const modal = document.getElementById('projectModal');
            if (modal) {
                modal.classList.remove('active');
            }
            document.body.style.overflow = '';
        } catch (e) {
            error('Error closing project modal:', e);
        }
    };

    function updateProjectModalLang() {
        // This will be handled when modal is reopened
    }

    function getCategoryColor(cat) {
        const colors = { 
            'corporate': '#0044cc', 
            'ecommerce': '#28a745', 
            'personal': '#ffc107', 
            'landing': '#ff6b6b'
        };
        return colors[cat] || '#666';
    }

    // Close modal events
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('project-modal-overlay')) {
            closeProjectModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });

    function initPortfolioFilter() {
        try {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const portfolioItems = document.querySelectorAll('.portfolio-item');

            if (filterBtns.length === 0) return;

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filter = btn.getAttribute('data-filter');

                    portfolioItems.forEach(item => {
                        if (filter === 'all' || item.getAttribute('data-category') === filter) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            }, 10);
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        } catch (e) {
            error('Error initializing portfolio filter:', e);
        }
    }

    // ==========================================
    // Back to Top Button
    // ==========================================
    function initBackToTop() {
        try {
            const backToTop = document.getElementById('backToTop');
            if (!backToTop) return;

            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
        } catch (e) {
            error('Error initializing back to top:', e);
        }
    }

    // ==========================================
    // Contact Form
    // ==========================================
    window.handleSubmit = function(e) {
        try {
            e.preventDefault();

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');

            if (!name || !email || !subject || !message) {
                alert('Error: Form fields not found');
                return false;
            }

            const mailtoLink = 'mailto:elbatlanmohamed295@gmail.com?subject=' + 
                encodeURIComponent(subject.value) + 
                '&body=' + encodeURIComponent(
                    'الاسم: ' + name.value + '\nالبريد: ' + email.value + '\n\nالرسالة:\n' + message.value
                );

            window.location.href = mailtoLink;

            const successMsg = currentLang === 'ar' 
                ? 'تم فتح تطبيق البريد! أرسل رسالتك وسأرد عليك في أقرب وقت.' 
                : 'Email app opened! Send your message and I will reply soon.';

            alert(successMsg);
            e.target.reset();

            return false;
        } catch (err) {
            error('Error handling form submit:', err);
            alert('Error sending message. Please try again.');
            return false;
        }
    };

    // ==========================================
    // Smooth Scroll
    // ==========================================
    function initSmoothScroll() {
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        } catch (e) {
            error('Error initializing smooth scroll:', e);
        }
    }

    // ==========================================
    // Update Year
    // ==========================================
    function updateYear() {
        try {
            const yearEl = document.getElementById('year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        } catch (e) {
            error('Error updating year:', e);
        }
    }

    // ==========================================
    // Typing Effect
    // ==========================================
    function initTypingEffect() {
        try {
            const element = document.querySelector('.typing-effect');
            if (!element) return;

            const text = element.getAttribute('data-' + currentLang);
            if (!text) return;

            element.textContent = '';

            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 100);
        } catch (e) {
            error('Error initializing typing effect:', e);
        }
    }

    // ==========================================
    // Admin Quick Access - Hidden feature
    // ==========================================
    function initAdminAccess() {
        // Double-click on logo to go to admin
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('dblclick', function() {
                window.open('admin/index.html', '_blank');
            });

            // Add tooltip hint
            logo.title = currentLang === 'ar' ? 'انقر مرتين للوصول للوحة التحكم' : 'Double-click to access admin panel';
        }

        // Keyboard shortcut: Ctrl+Shift+A
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                window.open('admin/index.html', '_blank');
            }
        });
    }

    // ==========================================
    // Main Initialization
    // ==========================================
    function init() {
        log('Initializing portfolio...');

        try {
            initTheme();
            setLanguage(currentLang);
            hidePreloader();
            initNavbar();
            initMobileMenu();
            initActiveNav();
            initScrollAnimations();
            initStatsCounter();
            initSkillsAnimation();
            loadPortfolio();
            initBackToTop();
            initSmoothScroll();
            updateYear();
            initAdminAccess();

            setTimeout(initTypingEffect, 2500);

            // Event listeners
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', toggleTheme);
            }

            const langToggle = document.getElementById('langToggle');
            if (langToggle) {
                langToggle.addEventListener('click', () => {
                    const newLang = currentLang === 'ar' ? 'en' : 'ar';
                    setLanguage(newLang);
                    loadPortfolio();
                });
            }

            log('Portfolio initialized successfully!');
        } catch (e) {
            error('Fatal error during initialization:', e);
            // Force hide preloader on error
            hidePreloader();
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            try {
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                const navLinks = document.getElementById('navLinks');
                if (mobileMenuBtn && navLinks) {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            } catch (e) {}
        }, 250);
    });

})();
