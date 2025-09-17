class ThemeToggle {
    constructor() {
        this.currentTheme = localStorage.getItem('moplay-theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createToggleButton();
        this.bindEvents();
    }

    createToggleButton() {
        // Find the user section in the navigation
        const userSection = document.querySelector('.user-section');
        if (!userSection) return;

        // Create theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.id = 'themeToggle';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.innerHTML = this.getThemeIcon();

        // Insert before the first child (login button) or append if no children
        if (userSection.firstChild) {
            userSection.insertBefore(themeToggle, userSection.firstChild);
        } else {
            userSection.appendChild(themeToggle);
        }
    }

    getThemeIcon() {
        return this.currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }

    bindEvents() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('moplay-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        this.saveTheme();
        this.updateToggleIcon();
        this.animateToggle();
    }

    applyTheme(theme) {
        // Use class-based approach for consistency with main site
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update meta theme-color for mobile browsers
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    }

    saveTheme() {
        localStorage.setItem('moplay-theme', this.currentTheme);
    }

    updateToggleIcon() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.innerHTML = this.getThemeIcon();
        }
    }

    animateToggle() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.style.transform = 'scale(0.8)';
            toggleButton.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                toggleButton.style.transform = 'scale(1)';
            }, 200);
        }

        // Add a subtle flash effect to indicate theme change
        const flashEffect = document.createElement('div');
        flashEffect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
            pointer-events: none;
            z-index: 9999;
            animation: flash 0.3s ease-out;
        `;

        // Add flash animation keyframes
        if (!document.querySelector('#flash-animation-style')) {
            const flashStyle = document.createElement('style');
            flashStyle.id = 'flash-animation-style';
            flashStyle.textContent = `
                @keyframes flash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(flashStyle);
        }

        document.body.appendChild(flashEffect);
        
        setTimeout(() => {
            flashEffect.remove();
        }, 300);
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to set theme programmatically
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme();
            this.updateToggleIcon();
        }
    }

    // Auto-detect system preference if no saved preference
    detectSystemTheme() {
        if (!localStorage.getItem('moplay-theme')) {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }
}

// Initialize theme toggle when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
    
    // Auto-detect system theme preference
    window.themeToggle.detectSystemTheme();
});

// Make theme toggle available globally
window.ThemeToggle = ThemeToggle;