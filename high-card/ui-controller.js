/**
 * UI Controller for High Card game
 */
class HighCardUIController {
    constructor(game, firebaseService) {
        this.game = game;
        this.firebaseService = firebaseService;
        this.elements = {};
        this.playerName = localStorage.getItem('playerName') || 'Player';
        this.opponentName = 'Opponent';
        this.cardAnimationTimeout = null;
    }
    
    /**
     * Initialize the UI
     * @param {HTMLElement} container - The container element for the game
     */
    init(container) {
        this.createUI(container);
        this.attachEventListeners();
    }
    
    /**
     * Set player name
     * @param {string} name - The player's name
     */
    setPlayerName(name) {
        this.playerName = name;
        
        // Update UI if elements exist
        if (this.elements.playerInfo) {
            this.elements.playerInfo.textContent = this.playerName;
        }
    }
    
    /**
     * Update player name during gameplay
     * @param {string} name - The player's name
     */
    updatePlayerName(name) {
        this.setPlayerName(name);
        
        // Update game data in Firebase if game is active
        if (this.game.gameActive && this.game.gameId) {
            const playerField = this.game.playerNumber === 1 ? 'player1Name' : 'player2Name';
            this.firebaseService.database.ref(`high-card/games/${this.game.gameId}/${playerField}`).set(name);
        }
    }
    
    /**
     * Create the UI elements
     * @param {HTMLElement} container - The container element for the game
     */
    createUI(container) {
        DOMUtils.clearElement(container);
        
        // Create back button
        const backButton = DOMUtils.createElement('button', { 
            className: 'back-button',
            onClick: () => {
                this.cleanup();
                window.showGameSelection();
            }
        }, '← Back to Games');
        container.appendChild(backButton);
        
        // Create the game elements
        const heading = DOMUtils.createElement('h1', {}, 'High Card');
        
        const gameContainer = DOMUtils.createElement('div', { className: 'high-card-container' });
        
        // Game status and info
        this.elements.status = DOMUtils.createElement('div', { 
            className: 'high-card-status'
        }, 'Start a new game or join an existing one');
        
        // Round info
        this.elements.roundInfo = DOMUtils.createElement('div', {
            className: 'high-card-round-info',
            style: { display: 'none' }
        }, 'Round 0 of 10');
        
        // Player info and scores
        const playerInfoContainer = DOMUtils.createElement('div', {
            className: 'high-card-player-info-container',
            style: { display: 'none' }
        });
        
        const playerInfoColumn = DOMUtils.createElement('div', {
            className: 'high-card-player-column'
        });
        
        this.elements.playerInfo = DOMUtils.createElement('div', {
            className: 'high-card-player-name'
        }, this.playerName);
        
        this.elements.playerScore = DOMUtils.createElement('div', {
            className: 'high-card-player-score'
        }, 'Score: 0');
        
        DOMUtils.appendChildren(playerInfoColumn, [
            this.elements.playerInfo,
            this.elements.playerScore
        ]);
        
        // VS separator
        const vsElement = DOMUtils.createElement('div', {
            className: 'high-card-vs'
        }, 'VS');
        
        // Opponent info
        const opponentInfoColumn = DOMUtils.createElement('div', {
            className: 'high-card-opponent-column'
        });
        
        this.elements.opponentInfo = DOMUtils.createElement('div', {
            className: 'high-card-opponent-name'
        }, this.opponentName);
        
        this.elements.opponentScore = DOMUtils.createElement('div', {
            className: 'high-card-opponent-score'
        }, 'Score: 0');
        
        DOMUtils.appendChildren(opponentInfoColumn, [
            this.elements.opponentInfo,
            this.elements.opponentScore
        ]);
        
        DOMUtils.appendChildren(playerInfoContainer, [
            playerInfoColumn,
            vsElement,
            opponentInfoColumn
        ]);
        
        // Playing area
        const playingArea = DOMUtils.createElement('div', {
            className: 'high-card-playing-area',
            style: { display: 'none' }
        });
        
        // Player card area
        const playerCardArea = DOMUtils.createElement('div', {
            className: 'high-card-player-area'
        });
        
        this.elements.playerCardPlayed = DOMUtils.createElement('div', {
            className: 'high-card-card-played'
        });
        
        DOMUtils.appendChildren(playerCardArea, [
            this.elements.playerCardPlayed
        ]);
        
        // Center area
        const centerArea = DOMUtils.createElement('div', {
            className: 'high-card-center-area'
        });
        
        this.elements.roundResult = DOMUtils.createElement('div', {
            className: 'high-card-round-result',
            style: { display: 'none' }
        });
        
        DOMUtils.appendChildren(centerArea, [
            this.elements.roundResult
        ]);
        
        // Opponent card area
        const opponentCardArea = DOMUtils.createElement('div', {
            className: 'high-card-opponent-area'
        });
        
        this.elements.opponentCardPlayed = DOMUtils.createElement('div', {
            className: 'high-card-card-played'
        });
        
        DOMUtils.appendChildren(opponentCardArea, [
            this.elements.opponentCardPlayed
        ]);
        
        DOMUtils.appendChildren(playingArea, [
            playerCardArea,
            centerArea,
            opponentCardArea
        ]);
        
        // Player hand
        this.elements.playerHand = DOMUtils.createElement('div', {
            className: 'high-card-hand',
            style: { display: 'none' }
        });
        
        // Game controls
        const controlsContainer = DOMUtils.createElement('div', {
            className: 'high-card-controls'
        });
        
        this.elements.newGameButton = DOMUtils.createElement('button', {
            className: 'high-card-new-game-button',
            onClick: () => this.startNewGame()
        }, 'Start New Game');
        
        this.elements.startRoundButton = DOMUtils.createElement('button', {
            className: 'high-card-start-round-button',
            style: { display: 'none' },
            onClick: () => this.startRound()
        }, 'Deal Next Round');
        
        this.elements.gameCode = DOMUtils.createElement('div', {
            className: 'high-card-game-code',
            style: { display: 'none' }
        });
        
        DOMUtils.appendChildren(controlsContainer, [
            this.elements.newGameButton,
            this.elements.startRoundButton,
            this.elements.gameCode
        ]);
        
        // Join game section
        const joinContainer = DOMUtils.createElement('div', {
            className: 'high-card-join-container'
        });
        
        this.elements.joinCodeInput = DOMUtils.createElement('input', {
            type: 'text',
            className: 'high-card-join-input',
            placeholder: 'Enter game code'
        });
        
        this.elements.joinGameButton = DOMUtils.createElement('button', {
            className: 'high-card-join-button',
            onClick: () => this.joinGame()
        }, 'Join Game');
        
        DOMUtils.appendChildren(joinContainer, [
            this.elements.joinCodeInput,
            this.elements.joinGameButton
        ]);
        
        // Add all elements to the game container
        DOMUtils.appendChildren(gameContainer, [
            this.elements.status,
            this.elements.roundInfo,
            playerInfoContainer,
            playingArea,
            this.elements.playerHand,
            controlsContainer,
            joinContainer
        ]);
        
        // Add all to the main container
        DOMUtils.appendChildren(container, [heading, gameContainer]);
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Add keyboard support for the join input
        this.elements.joinCodeInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.joinGame();
            }
        });
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        this.game.gameId = this.game.generateGameId();
        this.game.playerNumber = 1;
        
        // Update UI
        this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
        this.elements.gameCode.style.display = 'block';
        this.elements.status.textContent = `Game started! Waiting for opponent to join...`;
        
        // Show player info
        this.elements.roundInfo.parentNode.parentNode.querySelector('.high-card-player-info-container').style.display = 'flex';
        
        // Hide join section
        this.elements.joinCodeInput.parentNode.style.display = 'none';
        
        // Create game in Firebase
        this.firebaseService.createGame(this.game.gameId, this.playerName);
        
        // Listen for game updates
        this.listenForGameUpdates();
    }
    
    /**
     * Join an existing game
     */
    async joinGame() {
        const code = this.elements.joinCodeInput.value.trim().toUpperCase();
        if (!code) return;
        
        this.game.gameId = code;
        this.game.playerNumber = 2;
        
        // Try to join the game
        const gameData = await this.firebaseService.joinGame(code, this.playerName);
        
        if (gameData) {
            // Update game state
            this.game.updateFromData(gameData);
            
            // Store opponent name if available
            if (gameData.player1Name) {
                this.opponentName = gameData.player1Name;
                this.elements.opponentInfo.textContent = this.opponentName;
            }
            
            // Update UI
            this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
            this.elements.gameCode.style.display = 'block';
            this.elements.status.textContent = `Game joined! Waiting for dealer to start the round...`;
            
            // Show player info and scores
            this.elements.roundInfo.textContent = `Round ${this.game.currentRound} of ${this.game.MAX_ROUNDS}`;
            this.elements.roundInfo.style.display = 'block';
            this.elements.roundInfo.parentNode.parentNode.querySelector('.high-card-player-info-container').style.display = 'flex';
            this.elements.playerScore.textContent = `Score: ${this.game.player1Score}`;
            this.elements.opponentScore.textContent = `Score: ${this.game.player2Score}`;
            
            // Show playing area
            this.elements.roundInfo.parentNode.parentNode.querySelector('.high-card-playing-area').style.display = 'flex';
            
            // Render player's hand
            this.renderPlayerHand();
            
            // Hide join section
            this.elements.joinCodeInput.parentNode.style.display = 'none';
            
            // Listen for game updates
            this.listenForGameUpdates();
        } else {
            this.elements.status.textContent = 'Game not found or already full';
        }
    }
    
    /**
     * Render player's hand
     */
    renderPlayerHand() {
        // Clear the hand
        DOMUtils.clearElement(this.elements.playerHand);
        
        if (this.game.player1Hand.length === 0) {
            this.elements.playerHand.style.display = 'none';
            return;
        }
        
        // Create card elements
        this.game.player1Hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.elements.playerHand.appendChild(cardElement);
        });
        
        // Show the hand
        this.elements.playerHand.style.display = 'flex';
    }
    
    /**
     * Create a card element
     * @param {Object} card - The card object
     * @param {number} index - Index in the hand
     * @returns {HTMLElement} The card element
     */
    createCardElement(card, index) {
        const cardElement = DOMUtils.createElement('div', {
            className: `high-card-card ${card.hidden ? 'hidden' : ''}`,
            'data-index': index,
            onClick: (e) => this.handleCardClick(e.currentTarget)
        });
        
        if (!card.hidden) {
            const valueElement = DOMUtils.createElement('div', {
                className: `high-card-card-value ${card.color}`
            }, card.value);
            
            const suitElement = DOMUtils.createElement('div', {
                className: `high-card-card-suit ${card.color}`
            }, card.suit);
            
            DOMUtils.appendChildren(cardElement, [valueElement, suitElement]);
        } else {
            // Card back design
            const backDesign = DOMUtils.createElement('div', {
                className: 'high-card-card-back'
            }, '?');
            
            cardElement.appendChild(backDesign);
        }
        
        return cardElement;
    }
    
    /**
     * Handle card click
     * @param {HTMLElement} cardElement - The clicked card element
     */
    handleCardClick(cardElement) {
        // Only allow card selection during an active round
        if (!this.game.roundActive) {
            return;
        }
        
        // Get card index
        const cardIndex = parseInt(cardElement.getAttribute('data-index'));
        
        // Try to play the card
        this.firebaseService.playCard(this.game.gameId, this.game.playerNumber, cardIndex);
    }
    
    /**
     * Start a new round
     */
    startRound() {
        // Only the dealer can start a round
        if (this.game.dealerNumber !== this.game.playerNumber) {
            return;
        }
        
        this.firebaseService.startRound(this.game.gameId);
        this.elements.startRoundButton.style.display = 'none';
    }
    
    /**
     * Display played cards
     * @param {Object} player1Card - Player 1's card
     * @param {Object} player2Card - Player 2's card
     */
    displayPlayedCards(player1Card, player2Card) {
        // Clear any previous cards
        DOMUtils.clearElement(this.elements.playerCardPlayed);
        DOMUtils.clearElement(this.elements.opponentCardPlayed);
        
        // Create elements for played cards
        if (this.game.playerNumber === 1) {
            if (player1Card) {
                const cardElement = this.createCardElement(player1Card, -1);
                cardElement.classList.add('played');
                this.elements.playerCardPlayed.appendChild(cardElement);
            }
            
            if (player2Card) {
                const cardElement = this.createCardElement(player2Card, -1);
                cardElement.classList.add('played');
                this.elements.opponentCardPlayed.appendChild(cardElement);
            }
        } else {
            if (player1Card) {
                const cardElement = this.createCardElement(player1Card, -1);
                cardElement.classList.add('played');
                this.elements.opponentCardPlayed.appendChild(cardElement);
            }
            
            if (player2Card) {
                const cardElement = this.createCardElement(player2Card, -1);
                cardElement.classList.add('played');
                this.elements.playerCardPlayed.appendChild(cardElement);
            }
        }
    }
    
    /**
     * Display round result
     * @param {number} roundWinner - The winner of the round (0 for tie, 1 for player 1, 2 for player 2)
     */
    displayRoundResult(roundWinner) {
        // Check if the result is already being displayed
        if (this.elements.roundResult.style.display === 'block') {
            return;
        }
        
        let resultText;
        let resultClass;
        
        if (roundWinner === 0) {
            resultText = "It's a Tie!";
            resultClass = 'tie';
        } else if ((this.game.playerNumber === 1 && roundWinner === 1) || 
                   (this.game.playerNumber === 2 && roundWinner === 2)) {
            resultText = "You Win!";
            resultClass = 'win';
        } else {
            resultText = "Opponent Wins!";
            resultClass = 'lose';
        }
        
        this.elements.roundResult.textContent = resultText;
        this.elements.roundResult.className = `high-card-round-result ${resultClass}`;
        this.elements.roundResult.style.display = 'block';
        
        // Show round result with animation
        this.elements.roundResult.style.animation = 'fadeInOut 2s ease-in-out';
        
        // Hide result after animation
        setTimeout(() => {
            this.elements.roundResult.style.display = 'none';
            
            // Show start round button for dealer if game is still active
            if (this.game.gameActive && this.game.dealerNumber === this.game.playerNumber) {
                this.elements.startRoundButton.style.display = 'block';
            }
        }, 2000);
    }
    
    /**
     * Display game result
     * @param {number} gameWinner - The winner of the game (0 for tie, 1 for player 1, 2 for player 2)
     */
    displayGameResult(gameWinner) {
        let resultText;
        
        if (gameWinner === 0) {
            resultText = "Game Over! It's a Tie!";
        } else if ((this.game.playerNumber === 1 && gameWinner === 1) || 
                   (this.game.playerNumber === 2 && gameWinner === 2)) {
            resultText = "Game Over! You Win!";
        } else {
            resultText = "Game Over! Opponent Wins!";
        }
        
        // Show game result
        this.elements.status.textContent = resultText;
        
        // Show new game button
        this.elements.newGameButton.style.display = 'block';
        this.elements.startRoundButton.style.display = 'none';
    }
    
    /**
     * Update UI based on game state
     * @param {Object} gameData - Game data from Firebase
     */
    updateUI(gameData) {
        // Update round info
        this.elements.roundInfo.textContent = `Round ${gameData.currentRound} of ${this.game.MAX_ROUNDS}`;
        this.elements.roundInfo.style.display = 'block';
        
        // Update scores
        if (this.game.playerNumber === 1) {
            this.elements.playerScore.textContent = `Score: ${gameData.player1Score}`;
            this.elements.opponentScore.textContent = `Score: ${gameData.player2Score}`;
        } else {
            this.elements.playerScore.textContent = `Score: ${gameData.player2Score}`;
            this.elements.opponentScore.textContent = `Score: ${gameData.player1Score}`;
        }
        
        // Update played cards
        this.displayPlayedCards(gameData.player1Card, gameData.player2Card);
        
        // Update player's hand
        this.renderPlayerHand();
        
        // Show playing area
        this.elements.roundInfo.parentNode.parentNode.querySelector('.high-card-playing-area').style.display = 'flex';
        
        // Update dealer button
        if (gameData.dealerNumber === this.game.playerNumber && !gameData.roundActive && gameData.gameActive) {
            if (!gameData.roundWinner || gameData.roundWinner === undefined) {
                this.elements.startRoundButton.style.display = 'block';
            }
        } else {
            this.elements.startRoundButton.style.display = 'none';
        }
        
        // Update game status
        if (!gameData.player2Connected) {
            this.elements.status.textContent = 'Waiting for opponent to join...';
        } else if (!gameData.roundActive && gameData.currentRound === 0) {
            if (gameData.dealerNumber === this.game.playerNumber) {
                this.elements.status.textContent = 'You are the dealer. Start the first round!';
            } else {
                this.elements.status.textContent = 'Waiting for dealer to start the round...';
            }
        } else if (gameData.roundActive) {
            this.elements.status.textContent = 'Round active! Select a card to play.';
        } else if (gameData.roundWinner !== null && gameData.roundWinner !== undefined) {
            // Display round result
            this.displayRoundResult(gameData.roundWinner);
            
            if (gameData.gameWinner !== null && gameData.gameWinner !== undefined) {
                // Display game result
                this.displayGameResult(gameData.gameWinner);
            } else {
                // Show status for next round
                if (gameData.dealerNumber === this.game.playerNumber) {
                    this.elements.status.textContent = 'You are the dealer. Start the next round!';
                } else {
                    this.elements.status.textContent = 'Waiting for dealer to start the next round...';
                }
            }
        }
    }
    
    /**
     * Listen for game updates from Firebase
     */
    listenForGameUpdates() {
        this.firebaseService.listenForUpdates(this.game.gameId, (gameData) => {
            // Update opponent name if available
            if (this.game.playerNumber === 1 && gameData.player2Name) {
                this.opponentName = gameData.player2Name;
                this.elements.opponentInfo.textContent = this.opponentName;
            }
            
            // Update game state
            this.game.updateFromData(gameData);
            
            // Update UI
            this.updateUI(gameData);
        });
    }
    
    /**
     * Clean up resources when leaving the game
     */
    cleanup() {
        if (this.cardAnimationTimeout) {
            clearTimeout(this.cardAnimationTimeout);
            this.cardAnimationTimeout = null;
        }
        
        this.game.cleanup();
        this.firebaseService.stopListening(this.game.gameId);
    }
}

// Create a global instance
const highCardUIController = new HighCardUIController(highCardGame, highCardFirebaseService);