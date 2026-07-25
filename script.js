const previewFixStylesheet = document.createElement('link');
previewFixStylesheet.rel = 'stylesheet';
previewFixStylesheet.href = './preview-fix.css?v=2';
document.head.appendChild(previewFixStylesheet);

document.addEventListener('DOMContentLoaded', () => {
    const statusDot = document.querySelector('.status-dot');
    statusDot?.remove();

    const componentCount = document.querySelector('.hero-meta strong');
    if (componentCount) componentCount.textContent = '22';

    const componentGrid = document.querySelector('.component-grid');
    if (componentGrid && !componentGrid.querySelector('[data-advanced-component]')) {
        const advancedComponents = [
            {
                icon: 'gauge',
                title: 'Progress bar',
                description: 'Determinate, indeterminate, ranged, and status states.',
            },
            {
                icon: 'table-2',
                title: 'Data table',
                description: 'Sorting, selection, pagination, columns, and runtime rows.',
            },
            {
                icon: 'menu',
                title: 'Context menu',
                description: 'Anchored or pointer-positioned actions with checkable items.',
            },
            {
                icon: 'search',
                title: 'Command palette',
                description: 'Keyboard navigation, filtering, shortcuts, and command execution.',
            },
        ];

        advancedComponents.forEach((component) => {
            const article = document.createElement('article');
            article.className = 'component-item reveal visible';
            article.dataset.advancedComponent = component.title;
            article.innerHTML = `<i data-lucide="${component.icon}"></i><div><h3>${component.title}</h3><p>${component.description}</p></div>`;
            componentGrid.appendChild(article);
        });
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const menuButton = document.querySelector('.menu-button');
    const mobileMenu = document.querySelector('.mobile-nav');

    const closeMobileMenu = () => {
        if (!menuButton || !mobileMenu) return;
        mobileMenu.hidden = true;
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        menuButton.innerHTML = '<i data-lucide="menu"></i>';
        if (window.lucide) window.lucide.createIcons();
    };

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            const shouldOpen = mobileMenu.hidden;
            mobileMenu.hidden = !shouldOpen;
            menuButton.setAttribute('aria-expanded', String(shouldOpen));
            menuButton.setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');
            menuButton.innerHTML = shouldOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
            if (window.lucide) window.lucide.createIcons();
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 840) closeMobileMenu();
        });
    }

    const revealItems = document.querySelectorAll('.reveal');
    revealItems.forEach((item) => {
        const delay = item.getAttribute('data-delay');
        if (delay) item.style.setProperty('--delay', `${delay}ms`);
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('visible'));
    }

    const navLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            const visibleEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visibleEntry) return;
            navLinks.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${visibleEntry.target.id}`);
            });
        }, { rootMargin: '-25% 0px -60%', threshold: [0.05, 0.2, 0.5] });

        sections.forEach((section) => navObserver.observe(section));
    }

    const toast = document.querySelector('.copy-toast');
    let toastTimer = 0;

    const showToast = (message = 'Copied to clipboard') => {
        if (!toast) return;
        const label = toast.querySelector('span');
        if (label) label.textContent = message;
        toast.classList.add('visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 1800);
    };

    document.querySelectorAll('[data-copy-target]').forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.getElementById(button.dataset.copyTarget);
            if (!target) return;

            const text = target.textContent.trim();
            try {
                await navigator.clipboard.writeText(text);
                const original = button.innerHTML;
                button.innerHTML = '<i data-lucide="check"></i><span>Copied</span>';
                if (window.lucide) window.lucide.createIcons();
                showToast();
                window.setTimeout(() => {
                    button.innerHTML = original;
                    if (window.lucide) window.lucide.createIcons();
                }, 1500);
            } catch {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(target);
                selection.removeAllRanges();
                selection.addRange(range);
                showToast('Code selected — press Ctrl+C');
            }
        });
    });

    const previewButton = document.querySelector('.full-preview');
    const previewDialog = document.querySelector('.image-dialog');
    const dialogClose = document.querySelector('.dialog-close');

    const openPreview = () => {
        if (!previewDialog) return;
        document.body.classList.add('dialog-open');
        if (typeof previewDialog.showModal === 'function') {
            previewDialog.showModal();
        } else {
            previewDialog.setAttribute('open', '');
        }
    };

    const closePreview = () => {
        if (!previewDialog) return;
        document.body.classList.remove('dialog-open');
        if (typeof previewDialog.close === 'function') {
            previewDialog.close();
        } else {
            previewDialog.removeAttribute('open');
        }
    };

    previewButton?.addEventListener('click', openPreview);
    dialogClose?.addEventListener('click', closePreview);

    previewDialog?.addEventListener('click', (event) => {
        const bounds = previewDialog.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) closePreview();
    });

    previewDialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && previewDialog?.open) closePreview();
    });
});
