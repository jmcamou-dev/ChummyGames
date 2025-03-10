/**
 * Firebase service for Rock-Paper-Scissors game
 */
class RPSFirebaseService {
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
        return this.database.ref(`rps/games/${gameId}`).set({
            player1Connected: true,
            player2Connected: false,
            player1Choice: null,
            player2Choice: null,
            player1Score: 0,
            player2Score: 0,
            roundActive: true,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    /**
     * Join an existing game
     * @param {string} gameId - The game ID to join
     * @returns {Promise} Promise that resolves with game data or null if not found
     */
    async joinGame(gameId) {
        const snapshot = await this.database.ref(`rps/games/${gameId}`).once('value');
        const gameData = snapshot.val();
        
        if (gameData && !gameData.player2Connected) {
            // Mark player 2 as joined
            await this.database.ref(`rps/games/${gameId}/player2Connected`).set(true);
            return gameData;
        }
        
        return null;
    }
    
    /**
     * Submit player choice
     * @param {string} gameId - The game ID
     * @param {number} playerNumber - The player number (1 or 2)
     * @param {string} choice - The player's choice
     * @returns {Promise} Promise that resolves when the choice is submitted
     */
    submitChoice(gameId, playerNumber, choice) {
        const choiceField = `player${playerNumber}Choice`;
        return this.database.ref(`rps/games/${gameId}/${choiceField}`).set(choice);
    }
    
    /**
     * Reset round after both players have made choices
     * @param {string} gameId - The game ID
     * @param {number} player1Score - Player 1's score
     * @param {number} player2Score - Player 2's score
     * @returns {Promise} Promise that resolves when the round is reset
     */
    resetRound(gameId, player1Score, player2Score) {
        return this.database.ref(`rps/games/${gameId}`).update({
            player1Choice: null,
            player2Choice: null,
            player1Score: player1Score,
            player2Score: player2Score,
            roundActive: true
        });
    }
    
    /**
     * Listen for game updates from Firebase
     * @param {string} gameId - The game ID
     * @param {Function} callback - Callback function for game updates
     */
    listenForUpdates(gameId, callback) {
        this.database.ref(`rps/games/${gameId}`).on('value', (snapshot) => {
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
            this.database.ref(`rps/games/${gameId}`).off();
        }
    }
    
    /**
     * Clean up old games (older than a day)
     */
    cleanupOldGames() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.database.ref('rps/games')
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
const rpsFirebaseService = new RPSFirebaseService(rpsGame);