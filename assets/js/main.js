class GameSite {
    constructor() {
        this.games = [];
        this.currentUser = null;
        this.chatMessages = [];
        this.achievements = [];
        this.leaderboard = [];
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.loadFeaturedGames();
        this.loadRecentGames();
        this.initChat();
    }

    loadSampleData() {
        this.games = [
            {
                id: 1,
                title: "Space Adventure",
                category: "action",
                thumbnail: "🚀",
                rating: 4.5,
                plays: 15420,
                url: "https://example.com/game1",
                featured: true
            },
            {
                id: 2,
                title: "Puzzle Master",
                category: "puzzle",
                thumbnail: "🧩",
                rating: 4.8,
                plays: 8932,
                url: "https://example.com/game2",
                featured: true
            },
            {
                id: 3,
                title: "Speed Racer",
                category: "racing",
                thumbnail: "🏎️",
                rating: 4.3,
                plays: 12045,
                url: "https://example.com/game3",
                featured: false
            },
            {
                id: 4,
                title: "Strategy Kingdom",
                category: "strategy",
                thumbnail: "🏰",
                rating: 4.6,
                plays: 9876,
                url: "https://example.com/game4",
                featured: true
            },
            {
                id: 5,
                title: "Mystic Quest",
                category: "adventure",
                thumbnail: "⚔️",
                rating: 4.7,
                plays: 11234,
                url: "https://example.com/game5",
                featured: false
            },
            {
                id: 6,
                title: "Soccer Pro",
                category: "sports",
                thumbnail: "⚽",
                rating: 4.4,
                plays: 7654,
                url: "https://example.com/game6",
                featured: true
            }
        ];

        this.achievements = [
            { id: 1, name: "First Game", description: "Play your first game", icon: "🎮", unlocked: false },
            { id: 2, name: "Game Master", description: "Play 100 games", icon: "🏆", unlocked: false },
            { id: 3, name: "High Scorer", description: "Reach top 10 in leaderboard", icon: "⭐", unlocked: false },
            { id: 4, name: "Social Player", description: "Send 50 chat messages", icon: "💬", unlocked: false }
        ];

        this.leaderboard = [
            { rank: 1, username: "ProGamer", score: 15420, avatar: "P" },
            { rank: 2, username: "GameMaster", score: 14890, avatar: "G" },
            { rank: 3, username: "SpeedRacer", score: 13456, avatar: "S" },
            { rank: 4, username: "PuzzleWiz", score: 12789, avatar: "W" },
            { rank: 5, username: "ActionHero", score: 11234, avatar: "A" }
        ];
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        if (searchBtn) {
            searchBtn.addEventListener('click', this.handleSearch.bind(this));
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Login/Signup modals
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        }
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.showModal('signupModal'));
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', this.hideModals.bind(this));
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModals();
                }
            });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterGamesByCategory(category);
            });
        });

        // Chat functionality
        const chatToggle = document.getElementById('chatToggle');
        const chatClose = document.getElementById('chatClose');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const chatMessageInput = document.getElementById('chatMessageInput');

        if (chatToggle) {
            chatToggle.addEventListener('click', this.toggleChat.bind(this));
        }
        if (chatClose) {
            chatClose.addEventListener('click', this.closeChat.bind(this));
        }
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', this.sendMessage.bind(this));
        }
        if (chatMessageInput) {
            chatMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', this.handleSignup.bind(this));
        }
    }

    loadFeaturedGames() {
        const featuredGamesContainer = document.getElementById('featuredGames');
        if (!featuredGamesContainer) return;

        const featuredGames = this.games.filter(game => game.featured);
        featuredGamesContainer.innerHTML = featuredGames.map(game => this.createGameCard(game)).join('');
    }

    loadRecentGames() {
        const recentGamesContainer = document.getElementById('recentGames');
        if (!recentGamesContainer) return;

        const recentGames = this.games.slice(-4);
        recentGamesContainer.innerHTML = recentGames.map(game => this.createGameCard(game)).join('');
    }

    createGameCard(game) {
        return `
            <div class="game-card" data-game-id="${game.id}">
                <div class="game-image">
                    ${game.thumbnail}
                </div>
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-category">${game.category.charAt(0).toUpperCase() + game.category.slice(1)}</p>
                    <div class="game-rating">
                        <div class="stars">
                            ${'★'.repeat(Math.floor(game.rating))}${'☆'.repeat(5 - Math.floor(game.rating))}
                        </div>
                        <span>${game.rating}</span>
                    </div>
                    <button class="game-play-btn" onclick="gameSite.playGame(${game.id})">
                        Play Now
                    </button>
                </div>
            </div>
        `;
    }

    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Check if user is logged in
        if (!this.currentUser) {
            this.showModal('loginModal');
            return;
        }

        // Show pre-roll ad
        this.showPrerollAd(() => {
            this.openGamePlayer(game);
        });
    }

    showPrerollAd(callback) {
        const adModal = document.createElement('div');
        adModal.className = 'modal active';
        adModal.innerHTML = `
            <div class="modal-content">
                <div class="ad-container">
                    <h3>Advertisement</h3>
                    <div style="background: #333; height: 200px; display: flex; align-items: center; justify-content: center; margin: 1rem 0;">
                        <p>Ad Content Here</p>
                    </div>
                    <p id="adTimer">Skip in 5 seconds</p>
                    <button class="ad-skip" id="skipAd" style="display: none;" onclick="this.closest('.modal').remove(); ${callback.name}()">Skip Ad</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(adModal);
        
        let countdown = 5;
        const timer = setInterval(() => {
            countdown--;
            const timerEl = document.getElementById('adTimer');
            if (timerEl) {
                if (countdown > 0) {
                    timerEl.textContent = `Skip in ${countdown} seconds`;
                } else {
                    timerEl.textContent = 'You can skip this ad';
                    document.getElementById('skipAd').style.display = 'inline-block';
                    clearInterval(timer);
                }
            }
        }, 1000);
    }

    openGamePlayer(game) {
        // Create game player modal
        const gameModal = document.createElement('div');
        gameModal.className = 'modal active';
        gameModal.innerHTML = `
            <div class="modal-content" style="max-width: 90vw; max-height: 90vh;">
                <div class="modal-header">
                    <h3>${game.title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="game-player">
                    <iframe class="game-frame" src="${game.url}" allowfullscreen></iframe>
                </div>
            </div>
        `;
        
        document.body.appendChild(gameModal);
        
        // Update play count
        game.plays++;
        
        // Check for achievements
        this.checkAchievements();
    }

    checkAchievements() {
        if (!this.currentUser) return;
        
        // First game achievement
        if (!this.achievements[0].unlocked) {
            this.achievements[0].unlocked = true;
            this.showAchievementNotification(this.achievements[0]);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--background-card);
            border: 2px solid var(--accent-color);
            border-radius: 8px;
            padding: 1rem;
            z-index: 3000;
            animation: slideIn 0.5s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 2rem;">${achievement.icon}</div>
                <div>
                    <h4 style="margin: 0;">Achievement Unlocked!</h4>
                    <p style="margin: 0; color: var(--text-muted);">${achievement.name}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    filterGamesByCategory(category) {
        console.log(`Filtering games by category: ${category}`);
        // Implement category filtering logic
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        if (query) {
            console.log(`Searching for: ${query}`);
            // Implement search logic
        }
    }

    toggleMobileMenu() {
        console.log('Toggle mobile menu');
        // Implement mobile menu toggle
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
        const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
        
        // Simulate login
        this.currentUser = { email, username: email.split('@')[0] };
        this.hideModals();
        this.updateUserInterface();
        
        console.log('User logged in:', this.currentUser);
    }

    handleSignup(e) {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input');
        const username = inputs[0].value;
        const email = inputs[1].value;
        const password = inputs[2].value;
        
        // Simulate signup
        this.currentUser = { email, username };
        this.hideModals();
        this.updateUserInterface();
        
        console.log('User signed up:', this.currentUser);
    }

    updateUserInterface() {
        const userSection = document.querySelector('.user-section');
        if (userSection && this.currentUser) {
            userSection.innerHTML = `
                <span>Welcome, ${this.currentUser.username}!</span>
                <button class="btn btn-secondary" onclick="gameSite.logout()">Logout</button>
            `;
        }
    }

    logout() {
        this.currentUser = null;
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.innerHTML = `
                <button class="btn btn-primary" id="loginBtn">Login</button>
                <button class="btn btn-secondary" id="signupBtn">Sign Up</button>
            `;
            // Re-bind events for new buttons
            document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
            document.getElementById('signupBtn').addEventListener('click', () => this.showModal('signupModal'));
        }
    }

    // Chat functionality
    initChat() {
        this.chatMessages = [
            { username: 'GameMaster', message: 'Welcome to PlayInMo!', timestamp: new Date() },
            { username: 'ProGamer', message: 'Anyone up for a challenge?', timestamp: new Date() }
        ];
        this.renderChatMessages();
    }

    toggleChat() {
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) {
            chatPanel.classList.toggle('active');
        }
    }

    closeChat() {
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) {
            chatPanel.classList.remove('active');
        }
    }

    sendMessage() {
        const input = document.getElementById('chatMessageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.currentUser) {
            this.showModal('loginModal');
            return;
        }
        
        this.chatMessages.push({
            username: this.currentUser.username,
            message: message,
            timestamp: new Date()
        });
        
        input.value = '';
        this.renderChatMessages();
        
        // Check for chat achievement
        const userMessages = this.chatMessages.filter(msg => msg.username === this.currentUser.username);
        if (userMessages.length >= 50 && !this.achievements[3].unlocked) {
            this.achievements[3].unlocked = true;
            this.showAchievementNotification(this.achievements[3]);
        }
    }

    renderChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = this.chatMessages.map(msg => `
            <div class="chat-message" style="margin-bottom: 0.5rem;">
                <strong style="color: var(--primary-color);">${msg.username}:</strong>
                <span style="color: var(--text-primary);">${msg.message}</span>
            </div>
        `).join('');
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // API methods for WordPress integration
    async loadGamesFromAPI() {
        try {
            const response = await fetch('/wp-json/playinmo/v1/games');
            const games = await response.json();
            this.games = games;
            this.loadFeaturedGames();
            this.loadRecentGames();
        } catch (error) {
            console.error('Failed to load games:', error);
        }
    }

    async saveGamePlay(gameId, score) {
        if (!this.currentUser) return;
        
        try {
            await fetch('/wp-json/playinmo/v1/game-plays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: gameId,
                    user_id: this.currentUser.id,
                    score: score
                })
            });
        } catch (error) {
            console.error('Failed to save game play:', error);
        }
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('/wp-json/playinmo/v1/leaderboard');
            this.leaderboard = await response.json();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }
}

// Initialize the game site
const gameSite = new GameSite();

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal.active {
        animation: fadeIn 0.3s ease;
    }
    
    .game-card:hover {
        animation: none;
    }
`;
document.head.appendChild(style);