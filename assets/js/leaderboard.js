class Leaderboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalPages = 1;
        this.currentFilters = {
            timePeriod: 'all',
            category: 'overall',
            metric: 'score'
        };
        this.leaderboardData = [];
        this.stats = {};
        this.init();
    }

    init() {
        this.generateSampleData();
        this.bindEvents();
        this.loadLeaderboard();
        this.loadStats();
    }

    generateSampleData() {
        // Generate sample leaderboard data
        const names = [
            'ProGamer2023', 'GameMaster', 'SpeedRacer', 'PuzzleWiz', 'ActionHero',
            'StrategistX', 'ArcadeKing', 'NightOwl', 'GameChanger', 'PixelPro',
            'RetroGamer', 'FastFingers', 'BrainBox', 'GameGenius', 'HighScorer',
            'GameBeast', 'UltraPlayer', 'MegaGamer', 'SuperSonic', 'GameLord',
            'ElitePlayer', 'ChampionX', 'VictoryLap', 'TopPlayer', 'GameStar'
        ];

        this.leaderboardData = names.map((name, index) => ({
            rank: index + 1,
            username: name,
            avatar: name.charAt(0).toUpperCase(),
            totalScore: Math.floor(Math.random() * 50000) + (25000 - index * 800),
            gamesPlayed: Math.floor(Math.random() * 500) + 50,
            achievements: Math.floor(Math.random() * 30) + 5,
            playTime: Math.floor(Math.random() * 200) + 20, // hours
            joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            isOnline: Math.random() > 0.7,
            level: Math.floor((index + 1) / 5) + 1,
            badge: index < 3 ? ['gold', 'silver', 'bronze'][index] : null
        }));

        // Sort by score
        this.leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
        
        // Update ranks after sorting
        this.leaderboardData.forEach((player, index) => {
            player.rank = index + 1;
        });

        this.stats = {
            totalPlayers: this.leaderboardData.length,
            totalGames: this.leaderboardData.reduce((sum, player) => sum + player.gamesPlayed, 0),
            totalScore: this.leaderboardData.reduce((sum, player) => sum + player.totalScore, 0),
            totalTime: this.leaderboardData.reduce((sum, player) => sum + player.playTime, 0)
        };
    }

    bindEvents() {
        // Filter changes
        document.getElementById('timePeriod').addEventListener('change', this.onFilterChange.bind(this));
        document.getElementById('categoryFilter').addEventListener('change', this.onFilterChange.bind(this));
        document.getElementById('metricFilter').addEventListener('change', this.onFilterChange.bind(this));

        // Pagination
        document.getElementById('prevPage').addEventListener('click', this.prevPage.bind(this));
        document.getElementById('nextPage').addEventListener('click', this.nextPage.bind(this));
    }

    onFilterChange() {
        this.currentFilters = {
            timePeriod: document.getElementById('timePeriod').value,
            category: document.getElementById('categoryFilter').value,
            metric: document.getElementById('metricFilter').value
        };
        
        this.currentPage = 1;
        this.loadLeaderboard();
    }

    async loadLeaderboard() {
        try {
            // In a real implementation, this would fetch from the API
            // const response = await fetch(`/wp-json/moplay/v1/leaderboard?${this.getQueryParams()}`);
            // const data = await response.json();
            
            // For demo, use sample data
            let filteredData = [...this.leaderboardData];
            
            // Apply filters (simplified for demo)
            if (this.currentFilters.metric === 'games') {
                filteredData.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
            } else if (this.currentFilters.metric === 'achievements') {
                filteredData.sort((a, b) => b.achievements - a.achievements);
            } else if (this.currentFilters.metric === 'time') {
                filteredData.sort((a, b) => b.playTime - a.playTime);
            } else {
                filteredData.sort((a, b) => b.totalScore - a.totalScore);
            }
            
            // Update ranks after sorting
            filteredData.forEach((player, index) => {
                player.rank = index + 1;
            });
            
            this.displayTopPlayers(filteredData.slice(0, 3));
            this.displayLeaderboardTable(filteredData);
            this.updatePagination(filteredData.length);
            
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            this.showError('Failed to load leaderboard data');
        }
    }

    displayTopPlayers(topPlayers) {
        const positions = ['secondPlace', 'firstPlace', 'thirdPlace'];
        const actualOrder = [1, 0, 2]; // Second, First, Third
        
        actualOrder.forEach((playerIndex, positionIndex) => {
            const player = topPlayers[playerIndex];
            const element = document.getElementById(positions[positionIndex]);
            
            if (player) {
                const metricValue = this.getMetricValue(player);
                const metricLabel = this.getMetricLabel();
                
                element.innerHTML = `
                    <div class="podium-avatar ${player.badge || ''}">
                        <span>${player.avatar}</span>
                        ${player.isOnline ? '<div class="online-indicator"></div>' : ''}
                    </div>
                    <div class="podium-info">
                        <h3>${player.username}</h3>
                        <p>${metricValue.toLocaleString()} ${metricLabel}</p>
                        <div class="podium-level">Level ${player.level}</div>
                    </div>
                    <div class="podium-rank">
                        ${positionIndex === 1 ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-medal"></i>'}
                    </div>
                `;
            } else {
                element.innerHTML = `
                    <div class="podium-avatar">
                        <span>-</span>
                    </div>
                    <div class="podium-info">
                        <h3>-</h3>
                        <p>No data</p>
                    </div>
                `;
            }
        });
    }

    displayLeaderboardTable(data) {
        const tbody = document.getElementById('leaderboardTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, data.length);
        const pageData = data.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fas fa-trophy"></i>
                        <p>No players found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = pageData.map(player => `
            <tr class="leaderboard-row ${player.isOnline ? 'online' : ''}">
                <td class="rank-cell">
                    <div class="rank-number ${player.badge || ''}">${player.rank}</div>
                    ${player.badge ? `<div class="rank-badge ${player.badge}"></div>` : ''}
                </td>
                <td class="player-cell">
                    <div class="player-info">
                        <div class="player-avatar">
                            <span>${player.avatar}</span>
                            ${player.isOnline ? '<div class="online-indicator"></div>' : ''}
                        </div>
                        <div class="player-details">
                            <div class="player-name">${player.username}</div>
                            <div class="player-level">Level ${player.level}</div>
                        </div>
                    </div>
                </td>
                <td class="score-cell">
                    <strong>${player.totalScore.toLocaleString()}</strong>
                </td>
                <td class="games-cell">
                    ${player.gamesPlayed.toLocaleString()}
                </td>
                <td class="achievements-cell">
                    <div class="achievement-count">
                        <i class="fas fa-trophy"></i>
                        ${player.achievements}
                    </div>
                </td>
                <td class="date-cell">
                    ${player.joinDate.toLocaleDateString()}
                </td>
            </tr>
        `).join('');
    }

    updatePagination(totalItems) {
        this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.querySelector('.page-info');
        
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
        
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadLeaderboard();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadLeaderboard();
        }
    }

    loadStats() {
        document.getElementById('totalPlayers').textContent = this.stats.totalPlayers.toLocaleString();
        document.getElementById('totalGames').textContent = this.stats.totalGames.toLocaleString();
        document.getElementById('totalScore').textContent = this.stats.totalScore.toLocaleString();
        document.getElementById('totalTime').textContent = `${this.stats.totalTime.toLocaleString()}h`;
    }

    getMetricValue(player) {
        switch(this.currentFilters.metric) {
            case 'games': return player.gamesPlayed;
            case 'achievements': return player.achievements;
            case 'time': return player.playTime;
            default: return player.totalScore;
        }
    }

    getMetricLabel() {
        switch(this.currentFilters.metric) {
            case 'games': return 'games';
            case 'achievements': return 'achievements';
            case 'time': return 'hours';
            default: return 'points';
        }
    }

    getQueryParams() {
        const params = new URLSearchParams();
        Object.entries(this.currentFilters).forEach(([key, value]) => {
            if (value !== 'all' && value !== 'overall') {
                params.append(key, value);
            }
        });
        params.append('page', this.currentPage);
        params.append('limit', this.itemsPerPage);
        return params.toString();
    }

    showError(message) {
        const tbody = document.getElementById('leaderboardTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="error-cell">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </td>
            </tr>
        `;
    }
}

// Initialize leaderboard
const leaderboard = new Leaderboard();

// Add leaderboard-specific styles
const style = document.createElement('style');
style.textContent = `
    .page-header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem 0;
    }
    
    .page-header h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .leaderboard-filters {
        display: flex;
        gap: 2rem;
        margin-bottom: 3rem;
        padding: 1.5rem;
        background: var(--background-card);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        flex-wrap: wrap;
    }
    
    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .filter-group label {
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .filter-select {
        padding: 0.5rem;
        background: var(--background-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 0.9rem;
    }
    
    .top-players {
        margin-bottom: 3rem;
    }
    
    .podium {
        display: flex;
        justify-content: center;
        align-items: end;
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .podium-place {
        background: var(--background-card);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        border: 1px solid var(--border-color);
        position: relative;
        transition: transform 0.3s ease;
    }
    
    .podium-place:hover {
        transform: translateY(-5px);
    }
    
    .podium-place.first {
        order: 2;
        transform: scale(1.1);
        border-color: var(--primary-color);
        background: linear-gradient(135deg, var(--background-card) 0%, rgba(99, 102, 241, 0.1) 100%);
    }
    
    .podium-place.second {
        order: 1;
    }
    
    .podium-place.third {
        order: 3;
    }
    
    .podium-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 auto 1rem;
        position: relative;
    }
    
    .first .podium-avatar {
        width: 100px;
        height: 100px;
        font-size: 2rem;
        background: var(--gradient-secondary);
    }
    
    .podium-level {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.5rem;
    }
    
    .online-indicator {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        background: var(--accent-color);
        border-radius: 50%;
        border: 2px solid var(--background-card);
    }
    
    .current-user-rank {
        background: var(--background-card);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        margin-bottom: 3rem;
    }
    
    .user-rank-card {
        display: flex;
        align-items: center;
        gap: 2rem;
    }
    
    .rank-position {
        font-size: 3rem;
        font-weight: 700;
        color: var(--primary-color);
        min-width: 80px;
    }
    
    .rank-stats {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-muted);
    }
    
    .rank-change {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent-color);
        font-weight: 600;
    }
    
    .table-container {
        background: var(--background-card);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        overflow: hidden;
    }
    
    .leaderboard-list {
        width: 100%;
        border-collapse: collapse;
    }
    
    .leaderboard-list th {
        background: var(--background-secondary);
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-color);
    }
    
    .leaderboard-list td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .leaderboard-row:hover {
        background: rgba(99, 102, 241, 0.05);
    }
    
    .leaderboard-row.online {
        border-left: 3px solid var(--accent-color);
    }
    
    .rank-cell {
        width: 80px;
        text-align: center;
    }
    
    .rank-number {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
    }
    
    .rank-number.gold { color: #ffd700; }
    .rank-number.silver { color: #c0c0c0; }
    .rank-number.bronze { color: #cd7f32; }
    
    .player-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .player-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        position: relative;
    }
    
    .player-name {
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .player-level {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .score-cell {
        font-size: 1.1rem;
        color: var(--primary-color);
    }
    
    .achievement-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--secondary-color);
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .page-info {
        color: var(--text-muted);
        font-size: 0.9rem;
    }
    
    .leaderboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 3rem;
    }
    
    .stat-card {
        background: var(--background-card);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-icon {
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
    
    .stat-info h3 {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }
    
    .stat-info p {
        color: var(--text-muted);
        font-size: 0.9rem;
    }
    
    .loading-row,
    .no-data,
    .error-cell {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted);
    }
    
    .nav-link.active {
        color: var(--primary-color);
        font-weight: 600;
    }
    
    @media (max-width: 768px) {
        .leaderboard-filters {
            flex-direction: column;
            gap: 1rem;
        }
        
        .podium {
            flex-direction: column;
            align-items: center;
        }
        
        .podium-place {
            width: 100%;
            max-width: 300px;
        }
        
        .podium-place.first {
            order: 1;
            transform: none;
        }
        
        .user-rank-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        
        .rank-stats {
            justify-content: center;
        }
        
        .leaderboard-list {
            font-size: 0.9rem;
        }
        
        .leaderboard-list th,
        .leaderboard-list td {
            padding: 0.75rem 0.5rem;
        }
        
        .player-info {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
        }
    }
`;
document.head.appendChild(style);