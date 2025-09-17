class AchievementsSystem {
    constructor() {
        this.achievements = [];
        this.userAchievements = new Set();
        this.currentFilter = 'all';
        this.currentSort = 'category';
        this.userPoints = 0;
        this.dailyStreak = 0;
        this.init();
    }

    init() {
        this.generateAchievementsData();
        this.loadUserProgress();
        this.bindEvents();
        this.displayAchievements();
        this.updateSummary();
        this.updateMilestones();
    }

    generateAchievementsData() {
        this.achievements = [
            // Gaming Achievements
            {
                id: 'first_game',
                title: 'First Steps',
                description: 'Play your first game',
                emoji: '🎮',
                points: 10,
                category: 'gaming',
                rarity: 'common',
                requirement: 'Play 1 game'
            },
            {
                id: 'game_master',
                title: 'Game Master',
                description: 'Play 100 games',
                emoji: '🏆',
                points: 100,
                category: 'gaming',
                rarity: 'rare',
                requirement: 'Play 100 games'
            },
            {
                id: 'score_hunter',
                title: 'Score Hunter',
                description: 'Reach 10,000 total points',
                emoji: '🎯',
                points: 50,
                category: 'gaming',
                rarity: 'uncommon',
                requirement: 'Reach 10,000 points'
            },
            {
                id: 'perfect_score',
                title: 'Perfectionist',
                description: 'Achieve a perfect score in any game',
                emoji: '⭐',
                points: 75,
                category: 'gaming',
                rarity: 'rare',
                requirement: 'Get perfect score'
            },
            {
                id: 'speed_demon',
                title: 'Speed Demon',
                description: 'Complete a game in under 30 seconds',
                emoji: '⚡',
                points: 40,
                category: 'gaming',
                rarity: 'uncommon',
                requirement: 'Complete game quickly'
            },
            {
                id: 'marathon_player',
                title: 'Marathon Player',
                description: 'Play for 5 hours in a single session',
                emoji: '🏃',
                points: 60,
                category: 'gaming',
                rarity: 'rare',
                requirement: 'Play 5 hours straight'
            },
            {
                id: 'category_explorer',
                title: 'Category Explorer',
                description: 'Play games from all 6 categories',
                emoji: '🗺️',
                points: 80,
                category: 'gaming',
                rarity: 'rare',
                requirement: 'Play all categories'
            },
            
            // Social Achievements
            {
                id: 'first_message',
                title: 'Breaking the Ice',
                description: 'Send your first chat message',
                emoji: '💬',
                points: 10,
                category: 'social',
                rarity: 'common',
                requirement: 'Send 1 message'
            },
            {
                id: 'chatty',
                title: 'Chatty',
                description: 'Send 100 chat messages',
                emoji: '🗣️',
                points: 50,
                category: 'social',
                rarity: 'uncommon',
                requirement: 'Send 100 messages'
            },
            {
                id: 'friend_maker',
                title: 'Friend Maker',
                description: 'Add 10 friends',
                emoji: '👥',
                points: 30,
                category: 'social',
                rarity: 'common',
                requirement: 'Add 10 friends'
            },
            {
                id: 'community_helper',
                title: 'Community Helper',
                description: 'Help 5 new players',
                emoji: '🤝',
                points: 70,
                category: 'social',
                rarity: 'rare',
                requirement: 'Help new players'
            },
            {
                id: 'reviewer',
                title: 'Game Reviewer',
                description: 'Rate 25 games',
                emoji: '⭐',
                points: 40,
                category: 'social',
                rarity: 'uncommon',
                requirement: 'Rate 25 games'
            },
            
            // Special Achievements
            {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Play a game before 6 AM',
                emoji: '🌅',
                points: 25,
                category: 'special',
                rarity: 'uncommon',
                requirement: 'Play before 6 AM'
            },
            {
                id: 'night_owl',
                title: 'Night Owl',
                description: 'Play a game after midnight',
                emoji: '🦉',
                points: 25,
                category: 'special',
                rarity: 'uncommon',
                requirement: 'Play after midnight'
            },
            {
                id: 'lucky_seven',
                title: 'Lucky Seven',
                description: 'Score exactly 7777 points',
                emoji: '🍀',
                points: 77,
                category: 'special',
                rarity: 'legendary',
                requirement: 'Score 7777 points'
            },
            {
                id: 'birthday_player',
                title: 'Birthday Player',
                description: 'Play on your birthday',
                emoji: '🎂',
                points: 50,
                category: 'special',
                rarity: 'rare',
                requirement: 'Play on birthday'
            },
            {
                id: 'streak_master',
                title: 'Streak Master',
                description: 'Maintain a 30-day playing streak',
                emoji: '🔥',
                points: 150,
                category: 'special',
                rarity: 'legendary',
                requirement: '30-day streak'
            },
            {
                id: 'completionist',
                title: 'Completionist',
                description: 'Unlock all other achievements',
                emoji: '👑',
                points: 500,
                category: 'special',
                rarity: 'legendary',
                requirement: 'Unlock all achievements'
            }
        ];
    }

    loadUserProgress() {
        // In a real app, this would load from the server
        // For demo, simulate some unlocked achievements
        const savedProgress = localStorage.getItem('moplay_achievements');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.userAchievements = new Set(progress.unlocked || []);
            this.userPoints = progress.points || 0;
            this.dailyStreak = progress.streak || 0;
        } else {
            // Demo: unlock a few achievements
            this.userAchievements.add('first_game');
            this.userAchievements.add('first_message');
            this.userPoints = 20;
            this.dailyStreak = 3;
            this.saveProgress();
        }
    }

    saveProgress() {
        const progress = {
            unlocked: Array.from(this.userAchievements),
            points: this.userPoints,
            streak: this.dailyStreak
        };
        localStorage.setItem('moplay_achievements', JSON.stringify(progress));
    }

    bindEvents() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
            });
        });

        // Sort dropdown
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.displayAchievements();
        });

        // Achievement clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.achievement-card')) {
                const achievementId = e.target.closest('.achievement-card').dataset.id;
                this.showAchievementDetails(achievementId);
            }
        });
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.displayAchievements();
    }

    displayAchievements() {
        let filteredAchievements = this.filterAchievements();
        filteredAchievements = this.sortAchievements(filteredAchievements);
        
        const grid = document.getElementById('achievementsGrid');
        
        if (filteredAchievements.length === 0) {
            grid.innerHTML = `
                <div class="no-achievements">
                    <i class="fas fa-trophy"></i>
                    <h3>No achievements found</h3>
                    <p>Try a different filter</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filteredAchievements.map(achievement => 
            this.createAchievementCard(achievement)
        ).join('');
    }

    filterAchievements() {
        return this.achievements.filter(achievement => {
            if (this.currentFilter === 'all') return true;
            if (this.currentFilter === 'unlocked') return this.userAchievements.has(achievement.id);
            if (this.currentFilter === 'locked') return !this.userAchievements.has(achievement.id);
            return achievement.category === this.currentFilter;
        });
    }

    sortAchievements(achievements) {
        return achievements.sort((a, b) => {
            switch (this.currentSort) {
                case 'points':
                    return b.points - a.points;
                case 'rarity':
                    const rarityOrder = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
                    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
                case 'date':
                    // Sort unlocked achievements first, then by unlock date (simulated)
                    const aUnlocked = this.userAchievements.has(a.id);
                    const bUnlocked = this.userAchievements.has(b.id);
                    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
                    return 0;
                default: // category
                    return a.category.localeCompare(b.category);
            }
        });
    }

    createAchievementCard(achievement) {
        const isUnlocked = this.userAchievements.has(achievement.id);
        const rarityClass = achievement.rarity;
        
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${rarityClass}" data-id="${achievement.id}">
                <div class="achievement-badge">
                    <span class="achievement-emoji">${achievement.emoji}</span>
                    ${isUnlocked ? '<div class="unlock-checkmark"><i class="fas fa-check"></i></div>' : ''}
                </div>
                <div class="achievement-info">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-meta">
                        <div class="achievement-points">
                            <i class="fas fa-star"></i>
                            ${achievement.points} points
                        </div>
                        <div class="achievement-rarity ${rarityClass}">
                            ${this.getRarityIcon(achievement.rarity)} ${this.capitalizeFirst(achievement.rarity)}
                        </div>
                    </div>
                    ${!isUnlocked ? `<div class="achievement-requirement">${achievement.requirement}</div>` : ''}
                </div>
                ${isUnlocked ? '<div class="achievement-glow"></div>' : ''}
            </div>
        `;
    }

    getRarityIcon(rarity) {
        const icons = {
            common: '<i class="fas fa-circle"></i>',
            uncommon: '<i class="fas fa-square"></i>',
            rare: '<i class="fas fa-star"></i>',
            legendary: '<i class="fas fa-crown"></i>'
        };
        return icons[rarity] || '';
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    updateSummary() {
        const unlockedCount = this.userAchievements.size;
        const totalCount = this.achievements.length;
        const percentage = Math.round((unlockedCount / totalCount) * 100);
        
        document.getElementById('unlockedCount').textContent = unlockedCount;
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressPercentage').textContent = `${percentage}%`;
        document.getElementById('totalPoints').textContent = this.userPoints;
        document.getElementById('streakCount').textContent = this.dailyStreak;
        
        // Update next milestone
        const milestones = [100, 500, 1000, 2500, 5000];
        const nextMilestone = milestones.find(m => m > this.userPoints) || milestones[milestones.length - 1];
        document.getElementById('nextMilestone').textContent = nextMilestone;
    }

    updateMilestones() {
        document.querySelectorAll('.milestone').forEach(milestone => {
            const points = parseInt(milestone.dataset.points);
            if (this.userPoints >= points) {
                milestone.classList.add('completed');
            }
        });
    }

    showAchievementDetails(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return;
        
        const isUnlocked = this.userAchievements.has(achievementId);
        
        // Create a detailed modal (simplified for demo)
        alert(`${achievement.title}\n\n${achievement.description}\n\nPoints: ${achievement.points}\nRarity: ${achievement.rarity}\nStatus: ${isUnlocked ? 'Unlocked' : 'Locked'}`);
    }

    unlockAchievement(achievementId) {
        if (this.userAchievements.has(achievementId)) return false;
        
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;
        
        this.userAchievements.add(achievementId);
        this.userPoints += achievement.points;
        this.saveProgress();
        
        this.showUnlockAnimation(achievement);
        this.updateSummary();
        this.updateMilestones();
        this.displayAchievements();
        
        return true;
    }

    showUnlockAnimation(achievement) {
        const modal = document.getElementById('achievementModal');
        document.getElementById('unlockedTitle').textContent = achievement.title;
        document.getElementById('unlockedDescription').textContent = achievement.description;
        document.getElementById('unlockedPoints').textContent = achievement.points;
        document.querySelector('.achievement-emoji').textContent = achievement.emoji;
        
        modal.classList.add('active');
        
        // Add particle animation
        this.createParticleAnimation();
    }

    createParticleAnimation() {
        const container = document.querySelector('.unlock-particles');
        container.innerHTML = '';
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(particle);
        }
    }

    // Public methods for triggering achievements
    checkGamePlayAchievements(gameData) {
        // Check various game-related achievements
        if (!this.userAchievements.has('first_game')) {
            this.unlockAchievement('first_game');
        }
        
        // Check score-based achievements
        if (gameData.score === 7777 && !this.userAchievements.has('lucky_seven')) {
            this.unlockAchievement('lucky_seven');
        }
        
        // Check time-based achievements
        const hour = new Date().getHours();
        if (hour < 6 && !this.userAchievements.has('early_bird')) {
            this.unlockAchievement('early_bird');
        }
        if (hour >= 0 && hour < 1 && !this.userAchievements.has('night_owl')) {
            this.unlockAchievement('night_owl');
        }
    }

    checkSocialAchievements(action, count = 1) {
        if (action === 'message' && !this.userAchievements.has('first_message')) {
            this.unlockAchievement('first_message');
        }
        
        if (action === 'message' && count >= 100 && !this.userAchievements.has('chatty')) {
            this.unlockAchievement('chatty');
        }
    }

    checkSpecialAchievements() {
        // Check if all other achievements are unlocked
        const nonCompletionistAchievements = this.achievements.filter(a => a.id !== 'completionist');
        const unlockedNonCompletionist = nonCompletionistAchievements.filter(a => this.userAchievements.has(a.id));
        
        if (unlockedNonCompletionist.length === nonCompletionistAchievements.length && 
            !this.userAchievements.has('completionist')) {
            this.unlockAchievement('completionist');
        }
    }
}

// Global function to close achievement modal
function closeAchievementModal() {
    document.getElementById('achievementModal').classList.remove('active');
}

// Initialize achievements system
const achievementsSystem = new AchievementsSystem();

// Make it globally available for other scripts
window.achievementsSystem = achievementsSystem;

// Add achievements-specific styles
const style = document.createElement('style');
style.textContent = `
    .achievements-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
    
    .progress-card,
    .points-card,
    .streak-card {
        background: var(--background-card);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .progress-icon,
    .points-icon,
    .streak-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--background-secondary);
        border-radius: 4px;
        margin: 0.5rem 0;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: var(--gradient-primary);
        border-radius: 4px;
        transition: width 0.5s ease;
    }
    
    .points-total,
    .streak-count {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
    }
    
    .points-next,
    .streak-text {
        color: var(--text-muted);
        font-size: 0.9rem;
    }
    
    .achievements-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .filter-tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .filter-tab {
        padding: 0.5rem 1rem;
        background: var(--background-card);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .filter-tab.active,
    .filter-tab:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
    
    .achievement-card {
        background: var(--background-card);
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    
    .achievement-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
    }
    
    .achievement-card.locked {
        opacity: 0.6;
        background: var(--background-secondary);
    }
    
    .achievement-card.unlocked {
        border-color: var(--accent-color);
        background: linear-gradient(135deg, var(--background-card) 0%, rgba(16, 185, 129, 0.05) 100%);
    }
    
    .achievement-card.rare {
        border-color: #3b82f6;
    }
    
    .achievement-card.legendary {
        border-color: #f59e0b;
        background: linear-gradient(135deg, var(--background-card) 0%, rgba(245, 158, 11, 0.05) 100%);
    }
    
    .achievement-badge {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        position: relative;
        font-size: 2rem;
    }
    
    .achievement-card.locked .achievement-badge {
        background: var(--background-secondary);
        border: 2px dashed var(--border-color);
    }
    
    .unlock-checkmark {
        position: absolute;
        bottom: -5px;
        right: -5px;
        width: 24px;
        height: 24px;
        background: var(--accent-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.8rem;
        border: 2px solid var(--background-card);
    }
    
    .achievement-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        text-align: center;
    }
    
    .achievement-description {
        color: var(--text-muted);
        font-size: 0.9rem;
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .achievement-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .achievement-points {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--secondary-color);
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .achievement-rarity {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .achievement-rarity.common { color: #9ca3af; }
    .achievement-rarity.uncommon { color: #10b981; }
    .achievement-rarity.rare { color: #3b82f6; }
    .achievement-rarity.legendary { color: #f59e0b; }
    
    .achievement-requirement {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: center;
        font-style: italic;
    }
    
    .achievement-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
        pointer-events: none;
    }
    
    .milestones-section {
        margin: 3rem 0;
    }
    
    .milestones-track {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        margin: 2rem 0;
        padding: 1rem 0;
    }
    
    .milestones-track::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--border-color);
        z-index: 1;
    }
    
    .milestone {
        background: var(--background-card);
        border: 2px solid var(--border-color);
        border-radius: 50%;
        width: 100px;
        height: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
    }
    
    .milestone.completed {
        background: var(--gradient-primary);
        border-color: var(--primary-color);
        color: white;
    }
    
    .milestone-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
    }
    
    .milestone-info h4 {
        font-size: 0.7rem;
        font-weight: 600;
        margin: 0;
        text-align: center;
    }
    
    .milestone-info p {
        font-size: 0.6rem;
        margin: 0;
        opacity: 0.8;
    }
    
    .achievement-modal .modal-content {
        background: var(--background-card);
        border-radius: 20px;
        padding: 3rem;
        text-align: center;
        max-width: 500px;
        border: 2px solid var(--primary-color);
    }
    
    .achievement-unlock h2 {
        font-size: 2rem;
        margin-bottom: 2rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .unlock-animation {
        position: relative;
        margin-bottom: 2rem;
    }
    
    .unlock-icon {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: var(--gradient-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
        margin: 0 auto;
        animation: pulse 2s infinite;
    }
    
    .unlock-particles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }
    
    .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: particle-float 3s infinite;
    }
    
    .unlocked-achievement {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 2rem 0;
        padding: 1.5rem;
        background: var(--background-secondary);
        border-radius: 12px;
    }
    
    .unlocked-achievement .achievement-badge {
        width: 60px;
        height: 60px;
        margin: 0;
        font-size: 1.5rem;
    }
    
    .achievement-reward {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--secondary-color);
        font-weight: 600;
        margin-top: 0.5rem;
    }
    
    .no-achievements {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-muted);
    }
    
    .no-achievements i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .loading-container {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem;
        color: var(--text-muted);
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    @keyframes particle-float {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    @media (max-width: 768px) {
        .achievements-filters {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-tabs {
            justify-content: center;
        }
        
        .achievements-grid {
            grid-template-columns: 1fr;
        }
        
        .milestones-track {
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
        }
        
        .milestones-track::before {
            display: none;
        }
        
        .unlocked-achievement {
            flex-direction: column;
            text-align: center;
        }
    }
`;
document.head.appendChild(style);