// High Score System - Local storage based with IP identification

export const HighScoreManager = {
    userIP: null,
    ipReady: false,

    init() {
        // Try cached IP first for immediate use
        if (typeof localStorage !== 'undefined') {
            const cachedIP = localStorage.getItem('user_ip_cache');
            if (cachedIP) this.userIP = cachedIP;
        }
        // Fetch fresh IP in background
        this.fetchIP();
    },

    async fetchIP() {
        if (this.ipReady) return this.userIP;
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            this.userIP = data.ip;
            localStorage.setItem('user_ip_cache', data.ip);
        } catch (e) {
            this.userIP = this.userIP || 'local';
        }
        this.ipReady = true;
        return this.userIP;
    },

    getStorageKey(game) {
        // Use cached IP or 'local' - consistent within session
        return `highscore_${game}_${this.userIP || 'local'}`;
    },

    saveHighScore(game, score) {
        const key = this.getStorageKey(game);
        const current = localStorage.getItem(key);
        if (!current || score > parseInt(current, 10)) {
            localStorage.setItem(key, score.toString());
            return true;
        }
        return false;
    },

    getHighScore(game) {
        const key = this.getStorageKey(game);
        return parseInt(localStorage.getItem(key) || '0', 10);
    }
};

// Initialize on module load
HighScoreManager.init();

export default HighScoreManager;
