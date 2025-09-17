// Game Loader - Dynamically loads games from Contentful
class GameLoader {
    constructor() {
        this.gamesContainer = document.getElementById('games-container');
        this.categoriesContainer = document.getElementById('categories-container');
        this.loadingSpinner = this.createLoadingSpinner();
    }

    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'has-text-centered py-6';
        spinner.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin fa-2x has-text-primary"></i>
                <p class="mt-3">Loading games...</p>
            </div>
        `;
        return spinner;
    }

    showLoading(container) {
        if (container) {
            container.innerHTML = '';
            container.appendChild(this.loadingSpinner.cloneNode(true));
        }
    }

    // Load and display games
    async loadGames(featured = false, categoryId = null, limit = 12) {
        try {
            this.showLoading(this.gamesContainer);

            let data;
            if (categoryId) {
                data = await contentfulService.getGamesByCategory(categoryId, limit);
            } else {
                data = await contentfulService.getGames(limit, featured);
            }

            if (!data) {
                this.showError(this.gamesContainer, 'Failed to load games');
                return;
            }

            const games = contentfulService.processEntries(data);
            this.renderGames(games);

        } catch (error) {
            console.error('Error loading games:', error);
            this.showError(this.gamesContainer, 'Error loading games');
        }
    }

    // Load and display categories with game counts
    async loadCategories() {
        try {
            this.showLoading(this.categoriesContainer);

            const data = await contentfulService.getCategories();
            if (!data) {
                this.showError(this.categoriesContainer, 'Failed to load categories');
                return;
            }

            const categories = contentfulService.processEntries(data);
            
            // Get game counts for each category
            const categoriesWithCounts = await Promise.all(
                categories.map(async (category) => {
                    const gameData = await contentfulService.getGamesByCategory(category.sys.id, 1000);
                    const gameCount = gameData ? gameData.total : 0;
                    return {
                        ...category,
                        gameCount: gameCount
                    };
                })
            );
            
            this.renderCategories(categoriesWithCounts);

        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError(this.categoriesContainer, 'Error loading categories');
        }
    }

    // Render games in the container
    renderGames(games) {
        if (!this.gamesContainer) return;

        if (games.length === 0) {
            this.gamesContainer.innerHTML = `
                <div class="has-text-centered py-6">
                    <i class="fas fa-gamepad fa-3x has-text-grey-light mb-3"></i>
                    <p class="title is-5 has-text-grey">No games found</p>
                    <p class="has-text-grey">Check back soon for new games!</p>
                </div>
            `;
            return;
        }

        const gamesHTML = games.map(game => this.createGameCard(game)).join('');
        this.gamesContainer.innerHTML = `<div class="columns is-multiline">${gamesHTML}</div>`;
    }

    // Create individual game card with performance optimizations
    createGameCard(game) {
        const fields = game.fields;
        const thumbnailUrl = fields.thumbnailImage 
            ? contentfulService.getAssetUrl(fields.thumbnailImage, 300, 200)
            : 'https://via.placeholder.com/300x200?text=Game';

        const difficulty = fields.difficulty || 3;
        const rating = fields.rating || 4;
        const playCount = fields.playCount || 0;

        return `
            <div class="column is-12-mobile is-6-tablet is-4-desktop is-3-widescreen">
                <div class="card game-card" data-game-id="${game.sys.id}">
                    <div class="card-image">
                        <figure class="image is-4by3">
                            <img src="${thumbnailUrl}" 
                                 alt="${fields.title}" 
                                 loading="lazy" 
                                 decoding="async"
                                 width="300" 
                                 height="200"
                                 style="object-fit: cover;">
                        </figure>
                        ${fields.featured ? '<span class="tag is-warning is-small featured-badge">Featured</span>' : ''}
                    </div>
                    <div class="card-content">
                        <h3 class="title is-5 mb-2">${fields.title}</h3>
                        <p class="content is-size-7 has-text-grey mb-3">${fields.description || 'Fun game to play!'}</p>
                        
                        <div class="game-meta mb-3">
                            <div class="level is-mobile">
                                <div class="level-left">
                                    <div class="level-item">
                                        <div class="tags has-addons">
                                            <span class="tag is-light">Difficulty</span>
                                            <span class="tag is-info">${'★'.repeat(difficulty)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="level-right">
                                    <div class="level-item">
                                        <span class="tag is-light">
                                            <i class="fas fa-play mr-1"></i>
                                            ${this.formatPlayCount(playCount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="game-rating mb-3">
                            ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}
                        </div>

                        <button class="button is-primary is-fullwidth play-game-btn" 
                                data-game-url="${fields.playUrl}" 
                                data-game-title="${fields.title}">
                            <span class="icon">
                                <i class="fas fa-play"></i>
                            </span>
                            <span>Play Now</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render categories
    renderCategories(categories) {
        if (!this.categoriesContainer) return;

        if (categories.length === 0) {
            this.categoriesContainer.innerHTML = `
                <div class="has-text-centered py-6">
                    <p class="has-text-grey">No categories available</p>
                </div>
            `;
            return;
        }

        const categoriesHTML = categories.map(category => this.createCategoryCard(category)).join('');
        this.categoriesContainer.innerHTML = `<div class="columns is-multiline">${categoriesHTML}</div>`;
    }

    // Create individual category card
    createCategoryCard(category) {
        const fields = category.fields;
        const iconClass = fields.icon || 'fas fa-gamepad';
        const gradient = fields.backgroundGradient || 'linear-gradient(45deg, #667eea, #764ba2)';
        const gameCount = category.gameCount || 0;

        return `
            <div class="column is-6-mobile is-4-tablet is-2-desktop">
                <div class="card category-card has-text-centered interactive-element" 
                     style="background: ${gradient}; height: 100%; cursor: pointer;"
                     data-category-id="${category.sys.id}"
                     data-category-name="${fields.name}"
                     data-category-slug="${fields.slug}">
                    <div class="card-content">
                        <div class="icon-wrapper" style="background: rgba(255, 255, 255, 0.2);">
                            <i class="${iconClass} fa-2x has-text-white"></i>
                        </div>
                        <p class="title is-6 has-text-white">${fields.name}</p>
                        <p class="subtitle is-7 has-text-white-ter">${gameCount} games</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility function to format play count
    formatPlayCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    // Show error message
    showError(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="has-text-centered py-6">
                    <i class="fas fa-exclamation-triangle fa-2x has-text-danger mb-3"></i>
                    <p class="title is-5 has-text-danger">${message}</p>
                    <button class="button is-primary" onclick="location.reload()">
                        <span class="icon"><i class="fas fa-redo"></i></span>
                        <span>Retry</span>
                    </button>
                </div>
            `;
        }
    }

    // Search games
    async searchGames(query) {
        try {
            this.showLoading(this.gamesContainer);

            const data = await contentfulService.searchGames(query);
            if (!data) {
                this.showError(this.gamesContainer, 'Search failed');
                return;
            }

            const games = contentfulService.processEntries(data);
            this.renderGames(games);

        } catch (error) {
            console.error('Error searching games:', error);
            this.showError(this.gamesContainer, 'Search error');
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Play game button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-game-btn')) {
                const btn = e.target.closest('.play-game-btn');
                const gameUrl = btn.dataset.gameUrl;
                const gameTitle = btn.dataset.gameTitle;
                
                if (gameUrl) {
                    this.playGame(gameUrl, gameTitle);
                }
            }

            // Category click
            if (e.target.closest('.category-card')) {
                const card = e.target.closest('.category-card');
                const categoryId = card.dataset.categoryId;
                const categoryName = card.dataset.categoryName;
                
                if (categoryId) {
                    // Track category click event
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'select_category', {
                            event_category: 'Navigation',
                            event_label: categoryName,
                            category_name: categoryName,
                            category_id: categoryId
                        });
                    }
                    
                    // Update section title to show filtered category
                    this.updateSectionTitle(categoryName);
                    
                    // Add visual feedback
                    this.highlightSelectedCategory(card);
                    
                    // Load games for this category
                    this.loadGames(false, categoryId, 24);
                    
                    // Scroll to games section
                    this.scrollToGames();
                }
            }
        });

        // Search functionality
        const searchInput = document.getElementById('game-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length >= 2) {
                    searchTimeout = setTimeout(() => {
                        // Track search event
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'search', {
                                event_category: 'Search',
                                search_term: query,
                                event_label: query
                            });
                        }
                        this.searchGames(query);
                    }, 300);
                } else if (query.length === 0) {
                    this.loadGames(true, null, 8); // Load featured games when search is cleared
                }
            });
        }

        // View All Games button functionality
        const viewAllGamesBtn = document.getElementById('view-all-games-btn');
        if (viewAllGamesBtn) {
            viewAllGamesBtn.addEventListener('click', () => {
                // Track view all games event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'view_all_games', {
                        event_category: 'Navigation',
                        event_label: 'View All Games Button'
                    });
                }
                this.loadAllGames();
            });
        }

        // Start Playing Now button functionality
        const startPlayingBtn = document.getElementById('start-playing-btn');
        if (startPlayingBtn) {
            startPlayingBtn.addEventListener('click', () => {
                // Track start playing event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'start_playing_now', {
                        event_category: 'Engagement',
                        event_label: 'Hero CTA Button',
                        value: 1
                    });
                }
                this.playRandomGame();
            });
        }
    }

    // Play game function
    playGame(gameUrl, gameTitle) {
        // Track game play event with GA4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'play_game', {
                event_category: 'Games',
                event_label: gameTitle,
                game_name: gameTitle,
                game_url: gameUrl,
                value: 1
            });
        }
        
        // Create a masked URL by encoding the game data
        const gameData = btoa(JSON.stringify({
            url: gameUrl,
            title: gameTitle,
            timestamp: Date.now()
        }));
        
        // Open game through our player page with masked URL
        const maskedUrl = `game-player.html?g=${gameData}`;
        const playWindow = window.open(maskedUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
        
        if (!playWindow) {
            alert('Please allow popups to play games');
            
            // Track popup blocked event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'popup_blocked', {
                    event_category: 'User Experience',
                    event_label: gameTitle,
                    game_name: gameTitle
                });
            }
        } else {
            // Optional: Set a custom title for the new window
            playWindow.document.title = `Playing: ${gameTitle}`;
        }
    }
    
    // Update section title when category is selected
    updateSectionTitle(categoryName) {
        const gamesSection = document.querySelector('.section .container h2');
        if (gamesSection) {
            gamesSection.innerHTML = `
                <span class="icon is-large has-text-primary">
                    <i class="fas fa-filter"></i>
                </span>
                ${categoryName} Games
            `;
            
            // Add a "Show All Games" button
            const showAllBtn = document.createElement('button');
            showAllBtn.className = 'button is-light is-small ml-3';
            showAllBtn.innerHTML = '<span class="icon"><i class="fas fa-times"></i></span><span>Show All</span>';
            showAllBtn.onclick = () => {
                this.resetToAllGames();
            };
            gamesSection.appendChild(showAllBtn);
        }
    }
    
    // Reset to show all games
    resetToAllGames() {
        const gamesSection = document.querySelector('.section .container h2');
        if (gamesSection) {
            gamesSection.innerHTML = `
                <span class="icon is-large has-text-primary">
                    <i class="fas fa-star"></i>
                </span>
                Featured Games
            `;
        }
        
        // Remove category highlights
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('selected-category');
        });
        
        // Load all featured games
        this.loadGames(true, null, 8);
    }
    
    // Highlight selected category
    highlightSelectedCategory(selectedCard) {
        // Remove previous highlights
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('selected-category');
        });
        
        // Add highlight to selected category
        selectedCard.classList.add('selected-category');
    }
    
    // Scroll to games section
    scrollToGames() {
        // Try to scroll to the section title first, then fallback to games container
        const sectionTitle = document.querySelector('.section .container h2');
        const targetElement = sectionTitle || document.getElementById('games-container');
        
        if (targetElement) {
            // Get the element position and account for fixed header
            const elementRect = targetElement.getBoundingClientRect();
            const headerHeight = 80; // Fixed header height
            const offsetTop = window.pageYOffset + elementRect.top - headerHeight - 20; // 20px extra padding
            
            window.scrollTo({
                top: Math.max(0, offsetTop), // Ensure we don't scroll to negative position
                behavior: 'smooth'
            });
        }
    }

    // Load all games (not just featured)
    async loadAllGames() {
        try {
            // Reset section title
            const gamesSection = document.querySelector('.section .container h2');
            if (gamesSection) {
                gamesSection.innerHTML = `
                    <span class="icon is-large has-text-primary">
                        <i class="fas fa-th"></i>
                    </span>
                    All Games
                `;
            }
            
            // Remove category highlights
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('selected-category');
            });
            
            // Load all games directly using contentful service
            this.showLoading(this.gamesContainer);
            const data = await contentfulService.getGames(50, null); // null = get all games
            
            if (!data) {
                this.showError(this.gamesContainer, 'Failed to load games');
                return;
            }

            const games = contentfulService.processEntries(data);
            this.renderGames(games);
            
            // Scroll to games section
            this.scrollToGames();
            
        } catch (error) {
            console.error('Error loading all games:', error);
            this.showError(this.gamesContainer, 'Error loading games');
        }
    }

    // Play a random game from available games
    async playRandomGame() {
        try {
            // Show loading state on button
            const startBtn = document.getElementById('start-playing-btn');
            const originalHTML = startBtn.innerHTML;
            startBtn.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Loading...</span>';
            startBtn.disabled = true;
            
            // Get random games from Contentful
            const data = await contentfulService.getGames(100, null); // Get more games for better randomness
            
            if (!data || !data.items || data.items.length === 0) {
                // Fallback to demo game if no games available
                this.playDemoGame();
                return;
            }

            const games = contentfulService.processEntries(data);
            
            // Select a random game
            const randomIndex = Math.floor(Math.random() * games.length);
            const randomGame = games[randomIndex];
            
            // Extract game info
            const gameUrl = randomGame.fields.playUrl;
            const gameTitle = randomGame.fields.title;
            
            if (gameUrl && gameTitle) {
                this.playGame(gameUrl, gameTitle);
            } else {
                this.playDemoGame();
            }
            
        } catch (error) {
            console.error('Error loading random game:', error);
            this.playDemoGame();
        } finally {
            // Restore button state
            const startBtn = document.getElementById('start-playing-btn');
            if (startBtn) {
                startBtn.innerHTML = originalHTML;
                startBtn.disabled = false;
            }
        }
    }

    // Fallback demo game if no games are available
    playDemoGame() {
        const demoGames = [
            {
                url: 'https://html5games.com/Game/2048/2048.html',
                title: '2048 - Number Puzzle Game'
            },
            {
                url: 'https://www.crazygames.com/embed/agar-io',
                title: 'Agar.io - Multiplayer Game'
            },
            {
                url: 'https://krunker.io/',
                title: 'Krunker.io - Shooter Game'
            }
        ];
        
        const randomDemo = demoGames[Math.floor(Math.random() * demoGames.length)];
        this.playGame(randomDemo.url, randomDemo.title);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof contentfulService !== 'undefined') {
        window.gameLoader = new GameLoader();
        window.gameLoader.initializeEventListeners();
        
        // Load initial content
        window.gameLoader.loadCategories();
        window.gameLoader.loadGames(true, null, 8); // Load 8 featured games initially
    }
});

// Add CSS for game cards
const style = document.createElement('style');
style.textContent = `
    .game-card {
        transition: all 0.3s ease;
        height: 100%;
    }
    
    .game-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .featured-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 10;
    }
    
    .game-card .card-image {
        position: relative;
    }
    
    .category-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .category-card:hover {
        transform: scale(1.05);
    }
    
    .category-card.selected-category {
        transform: scale(1.05);
        border: 3px solid #ffd700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }
    
    .game-meta .level {
        margin-bottom: 0;
    }
    
    .game-rating {
        color: #ffd700;
        font-size: 1.2rem;
    }
    
    .loading-spinner {
        padding: 2rem;
    }
`;
document.head.appendChild(style);