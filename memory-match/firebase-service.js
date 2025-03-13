/**
 * Firebase service for Memory Match game
 */
class MemoryMatchFirebaseService {
    constructor(game) {
        this.database = firebase.database();
        this.game = game;
    }
    
    /**
     * Create a new game in Firebase
     * @param {string} gameId - The game ID
     * @param {string} difficulty - The difficulty level
     * @param {string} playerName - The name of the player creating the game
     * @returns {Promise} Promise that resolves when the game is created
     */
    createGame(gameId, difficulty, playerName) {
        const gameData = this.game.initializeGame(difficulty);
        
        return this.database.ref(`memory-match/games/${gameId}`).set({
            player1Connected: true,
            player2Connected: false,
            player1Name: playerName,
            player2Name: null,
            player1Score: 0,
            player2Score: 0,
            cards: gameData.cards,
            currentPlayer: gameData.currentPlayer,
            gameActive: true,
            matchedPairs: 0,
            difficulty: difficulty,
            timeRemaining: gameData.timeRemaining,
            lastAction: null,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    /**
     * Join an existing game
     * @param {string} gameId - The game ID to join
     * @param {string} playerName - The name of the player joining the game
     * @returns {Promise} Promise that resolves with game data or null if not found
     */
    async joinGame(gameId, playerName) {
        const snapshot = await this.database.ref(`memory-match/games/${gameId}`).once('value');
        const gameData = snapshot.val();
        
        if (gameData && !gameData.player2Connected) {
            // Mark player 2 as joined
            await this.database.ref(`memory-match/games/${gameId}`).update({
                player2Connected: true,
                player2Name: playerName
            });
            return gameData;
        }
        
        return null;
    }
    
    /**
     * Update when a card is flipped
     * @param {string} gameId - The game ID
     * @param {Object} result - Result from the flipCard method
     * @returns {Promise} Promise that resolves when the update is complete
     */
    updateCardFlip(gameId, result) {
        // Find the card that was flipped and update its state
        return this.database.ref(`memory-match/games/${gameId}`).transaction((gameData) => {
            if (!gameData) return null;
            
            // Update the card state
            const cards = gameData.cards.map(card => {
                if (card.id === result.cardId) {
                    return { ...card, state: 'revealed' };
                }
                return card;
            });
            
            let updates = {
                cards: cards,
                lastAction: {
                    type: 'CARD_FLIP',
                    cardId: result.cardId,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }
            };
            
            // If it's a match
            if (result.matchFound) {
                // Update matched pairs and score
                updates.matchedPairs = (gameData.matchedPairs || 0) + 1;
                
                if (this.game.playerNumber === 1) {
                    updates.player1Score = (gameData.player1Score || 0) + 1;
                } else {
                    updates.player2Score = (gameData.player2Score || 0) + 1;
                }
                
                // Update game state if game is complete
                if (result.gameComplete) {
                    updates.gameActive = false;
                }
            }
            
            // If turn is complete, schedule to end turn
            if (result.turnComplete) {
                updates.pendingTurnEnd = {
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    nextPlayer: result.nextPlayer
                };
            }
            
            return { ...gameData, ...updates };
        });
    }
    
    /**
     * End the current turn and switch players
     * @param {string} gameId - The game ID
     * @param {number} nextPlayer - The next player (1 or 2)
     * @returns {Promise} Promise that resolves when the update is complete
     */
    endTurn(gameId, nextPlayer) {
        return this.database.ref(`memory-match/games/${gameId}`).transaction((gameData) => {
            if (!gameData) return null;
            
            // Reset all revealed but not matched cards to hidden
            const cards = gameData.cards.map(card => {
                if (card.state === 'revealed') {
                    return { ...card, state: 'hidden' };
                }
                return card;
            });
            
            return {
                ...gameData,
                cards: cards,
                currentPlayer: nextPlayer,
                pendingTurnEnd: null,
                lastAction: {
                    type: 'TURN_END',
                    nextPlayer: nextPlayer,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }
            };
        });
    }
    
    /**
     * Update the time remaining
     * @param {string} gameId - The game ID
     * @param {number} timeRemaining - The time remaining in seconds
     * @returns {Promise} Promise that resolves when the update is complete
     */
    updateTimeRemaining(gameId, timeRemaining) {
        return this.database.ref(`memory-match/games/${gameId}/timeRemaining`).set(timeRemaining);
    }
    
    /**
     * Listen for game updates from Firebase
     * @param {string} gameId - The game ID
     * @param {Function} callback - Callback function for game updates
     */
    listenForUpdates(gameId, callback) {
        this.database.ref(`memory-match/games/${gameId}`).on('value', (snapshot) => {
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
            this.database.ref(`memory-match/games/${gameId}`).off();
        }
    }
    
    /**
     * Clean up old games (older than a day)
     */
    cleanupOldGames() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.database.ref('memory-match/games')
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
const memoryMatchFirebaseService = new MemoryMatchFirebaseService(memoryMatchGame);