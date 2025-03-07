/**
 * Firebase service for game persistence and real-time updates
 */
class FirebaseService {
    constructor(game) {
        this.database = firebase.database();
        this.game = game;
    }
    
    /**
     * Create a new game in Firebase
     * @param {string} gameId - The game ID
     * @returns {Promise} Promise that resolves when the game is created
     */
    createGame(gameId) {
        return this.database.ref(`games/${gameId}`).set({
            board: this.game.gameState,
            currentPlayer: this.game.currentPlayer,
            gameActive: this.game.gameActive,
            playerX: true,
            playerO: false,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    /**
     * Join an existing game
     * @param {string} gameId - The game ID to join
     * @returns {Promise} Promise that resolves with game data or null if not found
     */
    async joinGame(gameId) {
        const snapshot = await this.database.ref(`games/${gameId}`).once('value');
        const gameData = snapshot.val();
        
        if (gameData && gameData.gameActive) {
            // Mark player O as joined
            await this.database.ref(`games/${gameId}/playerO`).set(true);
            return gameData;
        }
        
        return null;
    }
    
    /**
     * Update game state in Firebase
     * @param {string} gameId - The game ID
     * @param {Object} gameState - The current game state
     * @returns {Promise} Promise that resolves when the update is complete
     */
    updateGame(gameId, gameState) {
        return this.database.ref(`games/${gameId}`).update(gameState);
    }
    
    /**
     * Listen for game updates from Firebase
     * @param {string} gameId - The game ID
     * @param {Function} callback - Callback function for game updates
     */
    listenForUpdates(gameId, callback) {
        this.database.ref(`games/${gameId}`).on('value', (snapshot) => {
            const gameData = snapshot.val();
            if (gameData) {
                callback(gameData);
            }
        });
    }
    
    /**
     * Stop listening for game updates
     * @param {string} gameId - The game ID
     */
    stopListening(gameId) {
        if (gameId) {
            this.database.ref(`games/${gameId}`).off();
        }
    }
    
    /**
     * Clean up old games (older than a day)
     * This could be called occasionally to clean up the database
     */
    cleanupOldGames() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.database.ref('games')
            .orderByChild('createdAt')
            .endAt(oneDayAgo)
            .once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    childSnapshot.ref.remove();
                });
            });
    }
}

// Create a global instance
const firebaseService = new FirebaseService(gameLogic);
