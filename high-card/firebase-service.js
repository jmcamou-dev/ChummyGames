/**
 * Firebase service for High Card game
 */
class HighCardFirebaseService {
    constructor(game) {
        this.database = firebase.database();
        this.game = game;
    }
    
    /**
     * Create a new game in Firebase
     * @param {string} gameId - The game ID
     * @param {string} playerName - The name of the player creating the game
     * @returns {Promise} Promise that resolves when the game is created
     */
    createGame(gameId, playerName) {
        const gameData = this.game.initializeGame();
        
        // Only send the player1Hand to Firebase, but keep track of the count of player2Hand
        const { player1Hand, player2Hand, ...restData } = gameData;
        
        return this.database.ref(`high-card/games/${gameId}`).set({
            ...restData,
            player1Hand: player1Hand,
            player2Hand: [], // Initialize empty, will be filled when player 2 joins
            player1HandCount: player1Hand.length,
            player2HandCount: player2Hand.length,
            player1Connected: true,
            player2Connected: false,
            player1Name: playerName,
            player2Name: null,
            roundActive: false,
            player1Card: null,
            player2Card: null,
            roundWinner: null,
            gameWinner: null,
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
        const snapshot = await this.database.ref(`high-card/games/${gameId}`).once('value');
        const gameData = snapshot.val();
        
        if (gameData && !gameData.player2Connected) {
            // Create player 2's hand
            this.game.createDeck();
            this.game.shuffleDeck();
            const player2Hand = this.game.deck.splice(0, this.game.MAX_ROUNDS);
            
            // Mark player 2 as joined
            await this.database.ref(`high-card/games/${gameId}`).update({
                player2Connected: true,
                player2Name: playerName,
                player2Hand: player2Hand,
                player2HandCount: player2Hand.length
            });
            
            return {
                ...gameData,
                player2Hand: player2Hand
            };
        }
        
        return null;
    }
    
    /**
     * Start a new round
     * @param {string} gameId - The game ID
     * @returns {Promise} Promise that resolves when the round is started
     */
    startRound(gameId) {
        const result = this.game.startRound();
        
        if (result.valid) {
            return this.database.ref(`high-card/games/${gameId}`).update({
                currentRound: result.round,
                roundActive: true,
                player1Card: null,
                player2Card: null,
                roundWinner: null,
                roundStartTime: firebase.database.ServerValue.TIMESTAMP
            });
        }
        
        return Promise.resolve(null);
    }
    
    /**
     * Play a card
     * @param {string} gameId - The game ID
     * @param {number} playerNum - The player number (1 or 2)
     * @param {number} cardIndex - Index of the card in the player's hand
     * @returns {Promise} Promise that resolves when the card is played
     */
    playCard(gameId, playerNum, cardIndex) {
        const result = this.game.playCard(playerNum, cardIndex);
        
        if (result.valid) {
            const updates = {};
            
            // Update the appropriate fields based on player number
            if (playerNum === 1) {
                updates.player1Card = result.card;
                updates.player1HandCount = this.game.player1Hand.length;
                updates.player1Hand = this.game.player1Hand;
            } else {
                updates.player2Card = result.card;
                updates.player2HandCount = this.game.player2Hand.length;
                updates.player2Hand = this.game.player2Hand;
            }
            
            // If the round is complete, update scores and winner
            if (result.roundComplete) {
                updates.player1Score = result.player1Score;
                updates.player2Score = result.player2Score;
                updates.roundWinner = result.roundWinner;
                updates.roundActive = false;
                updates.dealerNumber = result.dealerNumber;
                
                // If the game is over, update game winner
                if (result.gameOver) {
                    updates.gameWinner = result.gameWinner;
                    updates.gameActive = false;
                }
            }
            
            return this.database.ref(`high-card/games/${gameId}`).update(updates);
        }
        
        return Promise.resolve(null);
    }
    
    /**
     * Listen for game updates from Firebase
     * @param {string} gameId - The game ID
     * @param {Function} callback - Callback function for game updates
     */
    listenForUpdates(gameId, callback) {
        this.database.ref(`high-card/games/${gameId}`).on('value', (snapshot) => {
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
            this.database.ref(`high-card/games/${gameId}`).off();
        }
    }
    
    /**
     * Clean up old games (older than a day)
     */
    cleanupOldGames() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.database.ref('high-card/games')
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
const highCardFirebaseService = new HighCardFirebaseService(highCardGame);