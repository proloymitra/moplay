class GamePlayer {
    constructor() {
        this.currentGame = null;
        this.gameStartTime = null;
        this.gameScore = 0;
        this.adCountdownInterval = null;
        this.init();
    }

    init() {
        this.loadGameFromURL();
        this.bindEvents();
    }

    loadGameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const gameData = urlParams.get('g');
        const gameId = urlParams.get('id');
        
        if (gameData) {
            // Handle masked URL
            this.loadMaskedGame(gameData);
        } else if (gameId) {
            // Handle legacy URL format
            this.loadGame(gameId);
        } else {
            this.showError('No game specified');
        }
    }

    loadMaskedGame(encodedData) {
        try {
            // Decode the base64 encoded game data
            const decodedData = atob(encodedData);
            const gameInfo = JSON.parse(decodedData);
            
            // Create game object from decoded data
            const game = {
                id: 'masked_' + Date.now(),
                title: gameInfo.title,
                description: `Playing ${gameInfo.title}`,
                instructions: "Use mouse and keyboard to play",
                category: ["Game"],
                rating: 4.5,
                plays: Math.floor(Math.random() * 50000) + 1000,
                url: gameInfo.url,
                preroll_ad: false, // Disable ads for masked games to improve experience
                postroll_ad: false,
                width: 1000,
                height: 600
            };
            
            this.currentGame = game;
            this.displayGameInfo(game);
            
            // Also set the title immediately for masked games
            document.title = `moplay - ${gameInfo.title}`;
            
            this.startMaskedGame(gameInfo.url);
            
        } catch (error) {
            console.error('Failed to decode game data:', error);
            this.showError('Invalid game data');
        }
    }

    startMaskedGame(gameUrl) {
        const gameFrame = document.getElementById('gameFrame');
        const gameLoading = document.getElementById('gameLoading');
        
        this.gameStartTime = Date.now();
        
        // Track game start event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'game_start', {
                event_category: 'Game Engagement',
                event_label: this.currentGame.title,
                game_name: this.currentGame.title,
                game_url: gameUrl,
                value: 1
            });
        }
        
        // Set the iframe source to the actual game URL
        gameFrame.src = gameUrl;
        
        // Handle loading state
        gameFrame.onload = () => {
            gameLoading.style.display = 'none';
            gameFrame.style.display = 'block';
            
            // Track successful game load
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_loaded', {
                    event_category: 'Game Engagement',
                    event_label: this.currentGame.title,
                    game_name: this.currentGame.title,
                    load_time: Date.now() - this.gameStartTime
                });
            }
        };
        
        gameFrame.onerror = () => {
            // Track game load error
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_load_error', {
                    event_category: 'Game Errors',
                    event_label: this.currentGame.title,
                    game_name: this.currentGame.title,
                    game_url: gameUrl
                });
            }
            this.showError('Failed to load game');
        };
        
        // Fallback timeout in case onload doesn't fire
        setTimeout(() => {
            if (gameFrame.style.display === 'none') {
                gameLoading.style.display = 'none';
                gameFrame.style.display = 'block';
            }
        }, 10000);
        
        // Record game start
        this.recordGamePlay('start');
    }

    async loadGame(gameId) {
        try {
            // In a real implementation, this would fetch from the WordPress API
            const response = await fetch(`/wp-json/moplay/v1/games/${gameId}`);
            const game = await response.json();
            
            this.currentGame = game;
            this.displayGameInfo(game);
            
            if (game.preroll_ad) {
                this.showPrerollAd(() => this.startGame());
            } else {
                this.startGame();
            }
            
        } catch (error) {
            console.error('Failed to load game:', error);
            // Fallback to sample data for demo
            this.loadSampleGame(gameId);
        }
    }

    loadSampleGame(gameId) {
        // Sample game data for demo purposes
        const sampleGames = {
            '1': {
                id: 1,
                title: "Space Adventure",
                description: "Embark on an epic journey through space",
                instructions: "Use arrow keys to move, spacebar to shoot",
                category: ["Action", "Arcade"],
                rating: 4.5,
                plays: 15420,
                url: "https://www.example.com/games/space-adventure/",
                preroll_ad: true,
                postroll_ad: true,
                width: 800,
                height: 600
            },
            '2': {
                id: 2,
                title: "Puzzle Master",
                description: "Challenge your mind with complex puzzles",
                instructions: "Click and drag pieces to solve the puzzle",
                category: ["Puzzle", "Brain"],
                rating: 4.8,
                plays: 8932,
                url: "https://www.example.com/games/puzzle-master/",
                preroll_ad: true,
                postroll_ad: false,
                width: 800,
                height: 600
            }
        };

        const game = sampleGames[gameId] || sampleGames['1'];
        this.currentGame = game;
        this.displayGameInfo(game);
        
        if (game.preroll_ad) {
            this.showPrerollAd(() => this.startGame());
        } else {
            this.startGame();
        }
    }

    displayGameInfo(game) {
        // Update page title with game name
        document.title = `moplay - ${game.title}`;
        
        // Track page title change
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                game_name: game.title
            });
        }
        
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('gameRating').textContent = game.rating.toFixed(1);
        document.getElementById('gamePlays').textContent = game.plays.toLocaleString();
        document.getElementById('gameDescription').textContent = game.description;
        
        // Display instructions
        const instructionsEl = document.getElementById('gameInstructions');
        if (game.instructions) {
            instructionsEl.innerHTML = `
                <h4>How to Play</h4>
                <p>${game.instructions}</p>
            `;
        }
        
        // Display categories
        const categoriesEl = document.getElementById('gameCategories');
        if (game.category && game.category.length > 0) {
            categoriesEl.innerHTML = `
                <div class="game-tags">
                    ${game.category.map(cat => `<span class="tag">${cat}</span>`).join('')}
                </div>
            `;
        }

        // Set game frame dimensions
        const gameFrame = document.getElementById('gameFrame');
        if (game.width && game.height) {
            gameFrame.style.width = `${game.width}px`;
            gameFrame.style.height = `${game.height}px`;
            gameFrame.style.maxWidth = '100%';
        }
    }

    showPrerollAd(callback) {
        const prerollAd = document.getElementById('prerollAd');
        const gameContainer = document.getElementById('gameContainer');
        
        prerollAd.style.display = 'block';
        gameContainer.style.display = 'none';
        
        let countdown = 5;
        const countdownEl = document.getElementById('adCountdown');
        const skipBtn = document.getElementById('skipPrerollAd');
        
        this.adCountdownInterval = setInterval(() => {
            countdown--;
            countdownEl.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(this.adCountdownInterval);
                skipBtn.style.display = 'inline-block';
                countdownEl.parentElement.textContent = 'You can skip this ad';
            }
        }, 1000);
        
        skipBtn.onclick = () => {
            clearInterval(this.adCountdownInterval);
            prerollAd.style.display = 'none';
            gameContainer.style.display = 'block';
            callback();
        };
    }

    showPostrollAd() {
        const postrollAd = document.getElementById('postrollAd');
        postrollAd.style.display = 'block';
        
        let countdown = 10;
        const countdownEl = document.getElementById('postAdCountdown');
        const skipBtn = document.getElementById('skipPostrollAd');
        
        const postAdInterval = setInterval(() => {
            countdown--;
            countdownEl.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(postAdInterval);
                skipBtn.style.display = 'inline-block';
                countdownEl.parentElement.textContent = 'Thank you for watching!';
            }
        }, 1000);
        
        skipBtn.onclick = () => {
            clearInterval(postAdInterval);
            postrollAd.style.display = 'none';
            this.showGameCompleteOptions();
        };
    }

    startGame() {
        const gameFrame = document.getElementById('gameFrame');
        const gameLoading = document.getElementById('gameLoading');
        
        this.gameStartTime = Date.now();
        
        // For demo purposes, we'll show a placeholder
        // In real implementation, load the actual game URL
        setTimeout(() => {
            gameLoading.style.display = 'none';
            gameFrame.style.display = 'block';
            
            // Create a demo game placeholder
            const gameContent = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    background: linear-gradient(45deg, #1a1a2e, #16213e);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    text-align: center;
                    padding: 2rem;
                ">
                    <h2 style="margin-bottom: 1rem; color: #6366f1;">${this.currentGame.title}</h2>
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎮</div>
                    <p style="margin-bottom: 2rem; color: #9ca3af;">${this.currentGame.description}</p>
                    <div style="background: rgba(99, 102, 241, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid #6366f1;">
                        <p style="margin: 0; font-size: 0.9rem;">Demo Mode: Actual game would load here</p>
                        <button onclick="parent.gamePlayer.simulateGameEnd()" style="
                            margin-top: 1rem;
                            padding: 0.5rem 1rem;
                            background: #6366f1;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Simulate Game Complete</button>
                    </div>
                </div>
            `;
            
            gameFrame.srcdoc = gameContent;
            
        }, 2000);
        
        // Record game start
        this.recordGamePlay('start');
    }

    simulateGameEnd() {
        this.gameScore = Math.floor(Math.random() * 10000) + 1000;
        const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // Record game completion
        this.recordGamePlay('complete', this.gameScore, playTime);
        
        if (this.currentGame.postroll_ad) {
            this.showPostrollAd();
        } else {
            this.showGameCompleteOptions();
        }
    }

    showGameCompleteOptions() {
        const gameFrame = document.getElementById('gameFrame');
        
        const completeContent = `
            <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(45deg, #10b981, #6366f1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: 'Inter', sans-serif;
                text-align: center;
                padding: 2rem;
            ">
                <h2 style="margin-bottom: 1rem;">🎉 Game Complete!</h2>
                <p style="font-size: 1.5rem; margin-bottom: 1rem;">Score: ${this.gameScore.toLocaleString()}</p>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button onclick="parent.gamePlayer.playAgain()" style="
                        padding: 0.75rem 1.5rem;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 6px;
                        cursor: pointer;
                        backdrop-filter: blur(10px);
                    ">Play Again</button>
                    <button onclick="parent.gamePlayer.goBackToGames()" style="
                        padding: 0.75rem 1.5rem;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 6px;
                        cursor: pointer;
                        backdrop-filter: blur(10px);
                    ">More Games</button>
                </div>
            </div>
        `;
        
        gameFrame.srcdoc = completeContent;
    }

    playAgain() {
        const gameFrame = document.getElementById('gameFrame');
        const gameLoading = document.getElementById('gameLoading');
        
        gameFrame.style.display = 'none';
        gameLoading.style.display = 'flex';
        
        // Restart the game
        setTimeout(() => this.startGame(), 1000);
    }

    async recordGamePlay(action, score = 0, playTime = 0) {
        try {
            await fetch('/wp-json/moplay/v1/game-plays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: this.currentGame.id,
                    action: action,
                    score: score,
                    play_time: playTime,
                    completed: action === 'complete'
                })
            });
        } catch (error) {
            console.error('Failed to record game play:', error);
        }
    }

    bindEvents() {
        // Back to Games button
        const backToGamesBtn = document.getElementById('back-to-games-btn');
        if (backToGamesBtn) {
            backToGamesBtn.addEventListener('click', this.goBackToGames.bind(this));
        }
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', this.refreshGame.bind(this));
        
        // Report button
        const reportBtn = document.getElementById('reportBtn');
        reportBtn.addEventListener('click', this.reportIssue.bind(this));
        
        // Rating stars
        const ratingStars = document.querySelectorAll('#userRating i');
        ratingStars.forEach(star => {
            star.addEventListener('click', this.rateGame.bind(this));
            star.addEventListener('mouseenter', this.highlightStars.bind(this));
        });
        
        document.getElementById('userRating').addEventListener('mouseleave', this.resetStars.bind(this));
        
        // Comment submission
        const submitCommentBtn = document.getElementById('submitComment');
        submitCommentBtn.addEventListener('click', this.submitComment.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    toggleFullscreen() {
        const gameFrame = document.getElementById('gameFrame');
        
        if (!document.fullscreenElement) {
            // Track fullscreen enter event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'fullscreen_enter', {
                    event_category: 'Game Controls',
                    event_label: this.currentGame?.title || 'Unknown',
                    game_name: this.currentGame?.title || 'Unknown'
                });
            }
            
            gameFrame.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            // Track fullscreen exit event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'fullscreen_exit', {
                    event_category: 'Game Controls',
                    event_label: this.currentGame?.title || 'Unknown',
                    game_name: this.currentGame?.title || 'Unknown'
                });
            }
            
            document.exitFullscreen();
        }
    }

    refreshGame() {
        const gameFrame = document.getElementById('gameFrame');
        if (gameFrame.src) {
            gameFrame.src = gameFrame.src;
        } else if (gameFrame.srcdoc) {
            // For demo games, restart
            this.playAgain();
        }
    }

    reportIssue() {
        const issue = prompt('Please describe the issue:');
        if (issue) {
            console.log('Issue reported:', issue);
            alert('Thank you for your report. We will investigate the issue.');
        }
    }

    rateGame(event) {
        const rating = parseInt(event.target.dataset.rating);
        this.setUserRating(rating);
        
        // Track rating event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'rate_game', {
                event_category: 'User Engagement',
                event_label: this.currentGame?.title || 'Unknown',
                game_name: this.currentGame?.title || 'Unknown',
                rating: rating,
                value: rating
            });
        }
        
        // Send rating to server
        this.submitRating(rating);
    }

    setUserRating(rating) {
        const stars = document.querySelectorAll('#userRating i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star';
                star.style.color = '#f59e0b';
            } else {
                star.className = 'far fa-star';
                star.style.color = '#6b7280';
            }
        });
        
        document.querySelector('.rating-text').textContent = `You rated this game ${rating} star${rating !== 1 ? 's' : ''}`;
    }

    highlightStars(event) {
        const rating = parseInt(event.target.dataset.rating);
        const stars = document.querySelectorAll('#userRating i');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#f59e0b';
            } else {
                star.style.color = '#6b7280';
            }
        });
    }

    resetStars() {
        const stars = document.querySelectorAll('#userRating i');
        stars.forEach(star => {
            if (star.className === 'fas fa-star') {
                star.style.color = '#f59e0b';
            } else {
                star.style.color = '#6b7280';
            }
        });
    }

    async submitRating(rating) {
        try {
            await fetch('/wp-json/moplay/v1/games/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: this.currentGame.id,
                    rating: rating
                })
            });
        } catch (error) {
            console.error('Failed to submit rating:', error);
        }
    }

    submitComment() {
        const commentText = document.getElementById('commentText').value.trim();
        
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }
        
        if (commentText.length > 500) {
            alert('Comment is too long (max 500 characters)');
            return;
        }
        
        // Add comment to the list
        this.addCommentToList('You', commentText, new Date());
        
        // Clear the input
        document.getElementById('commentText').value = '';
        
        // Submit to server
        this.sendCommentToServer(commentText);
    }

    addCommentToList(username, comment, timestamp) {
        const commentsList = document.getElementById('commentsList');
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.innerHTML = `
            <div class="comment-header">
                <strong>${username}</strong>
                <span class="comment-time">${timestamp.toLocaleDateString()}</span>
            </div>
            <div class="comment-body">${comment}</div>
        `;
        
        commentsList.insertBefore(commentEl, commentsList.firstChild);
    }

    async sendCommentToServer(comment) {
        try {
            await fetch('/wp-json/moplay/v1/games/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: this.currentGame.id,
                    comment: comment
                })
            });
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    }

    handleKeyboard(event) {
        switch(event.key) {
            case 'f':
            case 'F':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.refreshGame();
                }
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    }

    goBackToGames() {
        // Reset page title
        document.title = 'moplay - Free Online Games';
        
        // Track back to games event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'back_to_games', {
                event_category: 'Navigation',
                event_label: 'Back Button',
                game_name: this.currentGame?.title || 'Unknown'
            });
        }
        
        // Check if there's a referrer and it's from the same domain
        const referrer = document.referrer;
        const currentDomain = window.location.origin;
        
        if (referrer && referrer.startsWith(currentDomain)) {
            // If user came from our site, go back
            window.history.back();
        } else {
            // Otherwise, navigate to the main page
            window.location.href = '/';
        }
    }

    showError(message) {
        // Update page title for error state
        document.title = `moplay - Error Loading Game`;
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="error-message">
                <h2>Error Loading Game</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="gamePlayer.goBackToGames()">Go Back</button>
            </div>
        `;
    }
}

// Initialize the game player
const gamePlayer = new GamePlayer();

// Add additional CSS for game player specific styles
const style = document.createElement('style');
style.textContent = `
    .game-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .game-stats {
        display: flex;
        gap: 2rem;
    }
    
    .game-stats .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
    }
    
    .game-container {
        margin-bottom: 2rem;
    }
    
    .game-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 600px;
        background: var(--background-card);
        border-radius: 12px;
        gap: 1rem;
    }
    
    .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .ad-content {
        text-align: center;
        padding: 2rem;
        background: var(--background-card);
        border-radius: 12px;
        margin: 2rem 0;
    }
    
    .ad-placeholder {
        background: var(--background-secondary);
        padding: 4rem 2rem;
        border-radius: 8px;
        margin: 1rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
    }
    
    .ad-timer {
        margin-top: 1rem;
        font-size: 1.1rem;
        color: var(--primary-color);
        font-weight: 600;
    }
    
    .game-controls {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        justify-content: center;
    }
    
    .game-info-section {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin: 3rem 0;
    }
    
    .game-details {
        background: var(--background-card);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    
    .game-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .related-games,
    .game-rating-section {
        background: var(--background-card);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    
    .game-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .tag {
        background: var(--primary-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .rating-stars {
        display: flex;
        gap: 0.25rem;
        margin: 1rem 0;
    }
    
    .rating-stars i {
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.2s ease;
    }
    
    .comments-section {
        background: var(--background-card);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        margin-top: 2rem;
    }
    
    .comment-form {
        margin-bottom: 2rem;
    }
    
    .comment-form textarea {
        width: 100%;
        padding: 1rem;
        background: var(--background-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        resize: vertical;
        margin-bottom: 1rem;
    }
    
    .comment {
        background: var(--background-primary);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid var(--border-color);
    }
    
    .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .comment-time {
        color: var(--text-muted);
        font-size: 0.9rem;
    }
    
    .error-message {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--background-card);
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    
    @media (max-width: 768px) {
        .game-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
        
        .game-info-section {
            grid-template-columns: 1fr;
        }
        
        .game-controls {
            flex-wrap: wrap;
        }
        
        .game-stats {
            justify-content: center;
        }
    }
`;
document.head.appendChild(style);