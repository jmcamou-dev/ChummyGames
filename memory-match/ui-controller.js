/**
 * UI Controller for Memory Match game
 */
class MemoryMatchUIController {
    constructor(game, firebaseService) {
        this.game = game;
        this.firebaseService = firebaseService;
        this.elements = {};
        this.playerName = localStorage.getItem('playerName') || 'Player';
        this.opponentName = 'Opponent';
        this.selectedDifficulty = 'EASY';
        this.turnEndTimeout = null;
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
        if (this.elements.playerScore) {
            this.updateScoreDisplay();
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
            this.firebaseService.database.ref(`memory-match/games/${this.game.gameId}/${playerField}`).set(name);
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
        const heading = DOMUtils.createElement('h1', {}, 'Memory Match');
        
        const gameContainer = DOMUtils.createElement('div', { className: 'memory-container' });
        
        // Game status and info
        this.elements.status = DOMUtils.createElement('div', { 
            className: 'memory-status', 
            id: 'memory-status' 
        }, 'Start a new game or join an existing one');
        
        // Timer display
        this.elements.timer = DOMUtils.createElement('div', {
            className: 'memory-timer',
            style: { display: 'none' }
        }, 'Time: 60s');
        
        // Score display
        this.elements.scoreContainer = DOMUtils.createElement('div', {
            className: 'memory-score-container',
            style: { display: 'none' }
        });
        
        this.elements.playerScore = DOMUtils.createElement('div', {
            className: 'memory-player-score'
        }, `${this.playerName}: 0`);
        
        this.elements.opponentScore = DOMUtils.createElement('div', {
            className: 'memory-opponent-score'
        }, `${this.opponentName}: 0`);
        
        DOMUtils.appendChildren(this.elements.scoreContainer, [
            this.elements.playerScore,
            this.elements.opponentScore
        ]);
        
        // Game board
        this.elements.gameBoard = DOMUtils.createElement('div', {
            className: 'memory-board',
            style: { display: 'none' }
        });
        
        // Difficulty selection
        const difficultyContainer = DOMUtils.createElement('div', {
            className: 'memory-difficulty'
        });
        
        const difficultyLabel = DOMUtils.createElement('div', {
            className: 'memory-difficulty-label'
        }, 'Select Difficulty:');
        
        const difficultyButtons = DOMUtils.createElement('div', {
            className: 'memory-difficulty-buttons'
        });
        
        this.elements.easyButton = DOMUtils.createElement('button', {
            className: 'memory-difficulty-button selected',
            'data-difficulty': 'EASY',
            onClick: (e) => this.selectDifficulty(e.target)
        }, 'Easy');
        
        this.elements.mediumButton = DOMUtils.createElement('button', {
            className: 'memory-difficulty-button',
            'data-difficulty': 'MEDIUM',
            onClick: (e) => this.selectDifficulty(e.target)
        }, 'Medium');
        
        this.elements.hardButton = DOMUtils.createElement('button', {
            className: 'memory-difficulty-button',
            'data-difficulty': 'HARD',
            onClick: (e) => this.selectDifficulty(e.target)
        }, 'Hard');
        
        DOMUtils.appendChildren(difficultyButtons, [
            this.elements.easyButton,
            this.elements.mediumButton,
            this.elements.hardButton
        ]);
        
        DOMUtils.appendChildren(difficultyContainer, [
            difficultyLabel,
            difficultyButtons
        ]);
        
        // Game controls
        const controlsContainer = DOMUtils.createElement('div', {
            className: 'memory-controls'
        });
        
        this.elements.newGameButton = DOMUtils.createElement('button', {
            className: 'memory-new-game-button',
            onClick: () => this.startNewGame()
        }, 'Start New Game');
        
        this.elements.gameCode = DOMUtils.createElement('div', {
            className: 'memory-game-code',
            style: { display: 'none' }
        });
        
        DOMUtils.appendChildren(controlsContainer, [
            this.elements.newGameButton,
            this.elements.gameCode
        ]);
        
        // Join game section
        const joinContainer = DOMUtils.createElement('div', {
            className: 'memory-join-container'
        });
        
        this.elements.joinCodeInput = DOMUtils.createElement('input', {
            type: 'text',
            className: 'memory-join-input',
            placeholder: 'Enter game code'
        });
        
        this.elements.joinGameButton = DOMUtils.createElement('button', {
            className: 'memory-join-button',
            onClick: () => this.joinGame()
        }, 'Join Game');
        
        DOMUtils.appendChildren(joinContainer, [
            this.elements.joinCodeInput,
            this.elements.joinGameButton
        ]);
        
        // Add all elements to the game container
        DOMUtils.appendChildren(gameContainer, [
            this.elements.status,
            this.elements.timer,
            this.elements.scoreContainer,
            this.elements.gameBoard,
            difficultyContainer,
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
     * Select difficulty level
     * @param {HTMLElement} button - The clicked difficulty button
     */
    selectDifficulty(button) {
        // Remove selected class from all buttons
        this.elements.easyButton.classList.remove('selected');
        this.elements.mediumButton.classList.remove('selected');
        this.elements.hardButton.classList.remove('selected');
        
        // Add selected class to the clicked button
        button.classList.add('selected');
        
        // Update selected difficulty
        this.selectedDifficulty = button.getAttribute('data-difficulty');
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
        
        // Show game elements
        this.elements.timer.style.display = 'block';
        this.elements.scoreContainer.style.display = 'flex';
        this.updateScoreDisplay();
        
        // Hide difficulty and join sections
        this.elements.easyButton.parentNode.parentNode.style.display = 'none';
        this.elements.joinCodeInput.parentNode.style.display = 'none';
        
        // Create game in Firebase
        this.firebaseService.createGame(this.game.gameId, this.selectedDifficulty, this.playerName);
        
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
            // Initialize game state
            this.game.updateFromData(gameData);
            
            // Store opponent name if available
            if (gameData.player1Name) {
                this.opponentName = gameData.player1Name;
            }
            
            // Update UI
            this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
            this.elements.gameCode.style.display = 'block';
            this.elements.status.textContent = `Game joined! ${gameData.currentPlayer === 2 ? 'Your' : this.opponentName + "'s"} turn`;
            
            // Show game elements
            this.elements.timer.style.display = 'block';
            this.elements.scoreContainer.style.display = 'flex';
            this.elements.gameBoard.style.display = 'grid';
            this.updateScoreDisplay();
            
            // Render the game board
            this.renderGameBoard(gameData.cards);
            
            // Hide difficulty and join sections
            this.elements.easyButton.parentNode.parentNode.style.display = 'none';
            this.elements.joinCodeInput.parentNode.style.display = 'none';
            
            // Listen for game updates
            this.listenForGameUpdates();
            
            // Start timer if it's a timed game
            this.updateTimerDisplay(gameData.timeRemaining);
        } else {
            this.elements.status.textContent = 'Game not found or already full';
        }
    }
    
    /**
     * Render the game board
     * @param {Array} cards - Array of card objects
     */
    renderGameBoard(cards) {
        // Clear the board
        DOMUtils.clearElement(this.elements.gameBoard);
        
        // Set grid columns based on card count
        let columns;
        const cardCount = cards.length;
        
        if (cardCount <= 12) {
            columns = 4;
        } else if (cardCount <= 16) {
            columns = 4;
        } else {
            columns = 6;
        }
        
        // Set the grid template columns
        this.elements.gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        this.elements.gameBoard.style.display = 'grid';
        
        // Create card elements
        cards.forEach(card => {
            console.log("click_card_id "+card.id.toString())
            const cardElement = DOMUtils.createElement('div', {
                className: `memory-card ${card.state}`,
                'data-id': card.id,
                onClick: (e) => this.handleCardClick(e.target)
            });
            
            const cardFront = DOMUtils.createElement('div', {
                className: 'memory-card-front'
            }, '?');
            const cardBack = DOMUtils.createElement('div', {
                className: 'memory-card-back'
            }, card.symbol);
            
            DOMUtils.appendChildren(cardElement, [cardFront, cardBack]);
            this.elements.gameBoard.appendChild(cardElement);
        });
    }
            
    /**
     * Handle card click
     * @param {HTMLElement} cardElement - The clicked card element
     */
    handleCardClick(cardElement) {
        // Get card ID
        const cardId = cardElement.getAttribute('data-id');
        console.log("handleCardClick_1 "+cardId.toString())
        
        // Attempt to flip the card
        const result = this.game.flipCard(cardId);
        
        console.log("handleCardClick_2")
        if (result.valid) {
            console.log("handleCardClick_3")
            // Update card appearance
            cardElement.className = 'memory-card revealed';
            
            // Update Firebase
            this.firebaseService.updateCardFlip(this.game.gameId, result);
            
            // If turn is complete, we'll let Firebase trigger the end of turn
            if (result.turnComplete) {
                this.elements.status.textContent = 'No match! Waiting...';
            }
            
            // If match found
            if (result.matchFound) {
                this.elements.status.textContent = 'Match found! Continue your turn.';
                
                // Update score
                this.updateScoreDisplay();
                
                // Check if game is complete
                if (result.gameComplete) {
                    let statusText;
                    if (result.winner === 0) {
                        statusText = 'Game over! It\'s a tie!';
                    } else if ((this.game.playerNumber === 1 && result.winner === 1) ||
                                (this.game.playerNumber === 2 && result.winner === 2)) {
                        statusText = 'Game over! You win!';
                    } else {
                        statusText = `Game over! ${this.opponentName} wins!`;
                    }
                    
                    this.elements.status.textContent = statusText;
                    this.game.stopTimer();
                }
            }
        }
    }
    
    /**
     * Update the cards based on game state
     * @param {Array} cards - Array of card objects
     */
    updateCardStates(cards) {
        // Find all card elements
        const cardElements = this.elements.gameBoard.querySelectorAll('.memory-card');
        
        // Update each card's state
        cardElements.forEach(cardElement => {
            const cardId = cardElement.getAttribute('data-id');
            const card = cards.find(c => c.id === cardId);
            
            if (card) {
                cardElement.className = `memory-card ${card.state}`;
            }
        });
    }
    
    /**
     * Update the score display
     */
    updateScoreDisplay() {
        this.elements.playerScore.textContent = `${this.playerName}: ${this.game.playerScore}`;
        this.elements.opponentScore.textContent = `${this.opponentName}: ${this.game.opponentScore}`;
    }
    
    /**
     * Update the timer display
     * @param {number} timeRemaining - Time remaining in seconds
     */
    updateTimerDisplay(timeRemaining) {
        this.elements.timer.textContent = `Time: ${timeRemaining}s`;
    }
    
    /**
     * Process turn end
     * @param {Object} pendingTurnEnd - Pending turn end data
     */
    processTurnEnd(pendingTurnEnd) {
        if (this.turnEndTimeout) {
            clearTimeout(this.turnEndTimeout);
        }
        
        this.turnEndTimeout = setTimeout(() => {
            this.firebaseService.endTurn(this.game.gameId, pendingTurnEnd.nextPlayer);
        }, 1500); // Delay to allow players to see the cards
    }
    
    /**
     * Listen for game updates from Firebase
     */
    listenForGameUpdates() {
        this.firebaseService.listenForUpdates(this.game.gameId, (gameData) => {
            // Update opponent name if available
            if (this.game.playerNumber === 1 && gameData.player2Name) {
                this.opponentName = gameData.player2Name;
                this.updateScoreDisplay();
            }
            
            // Update game state
            this.game.updateFromData(gameData);
            
            // Update timer
            if (gameData.timeRemaining !== undefined) {
                this.updateTimerDisplay(gameData.timeRemaining);
            }
            
            // Process pending turn end if it exists
            if (gameData.pendingTurnEnd && 
                ((this.game.playerNumber === 1 && gameData.currentPlayer === 1) ||
                    (this.game.playerNumber === 2 && gameData.currentPlayer === 2))) {
                this.processTurnEnd(gameData.pendingTurnEnd);
            }
            
            // Check if opponent just joined
            if (this.game.playerNumber === 1 && gameData.player2Connected && 
                this.elements.gameBoard.children.length === 0) {
                // Render the board for player 1 when player 2 joins
                this.renderGameBoard(gameData.cards);
                this.elements.status.textContent = 'Opponent joined! Your turn.';
            }
            
            // Update the board if it exists
            if (this.elements.gameBoard.children.length > 0) {
                this.updateCardStates(gameData.cards);
            }
            
            // Update status based on whose turn it is
            if (gameData.gameActive) {
                if (gameData.currentPlayer === this.game.playerNumber) {
                    if (!gameData.lastAction || 
                        gameData.lastAction.type === 'TURN_END') {
                        this.elements.status.textContent = 'Your turn! Find a matching pair.';
                    }
                } else {
                    this.elements.status.textContent = `${this.opponentName}'s turn.`;
                }
            }
            
            // Check for game completion
            if (gameData.matchedPairs === this.game.difficulty.pairs / 2) {
                let player1Score = gameData.player1Score || 0;
                let player2Score = gameData.player2Score || 0;
                
                let statusText;
                if (player1Score === player2Score) {
                    statusText = 'Game over! It\'s a tie!';
                } else if ((this.game.playerNumber === 1 && player1Score > player2Score) ||
                            (this.game.playerNumber === 2 && player2Score > player1Score)) {
                    statusText = 'Game over! You win!';
                } else {
                    statusText = `Game over! ${this.opponentName} wins!`;
                }
                
                this.elements.status.textContent = statusText;
                this.game.stopTimer();
            }
        });
        
        // Start timer if player 1
        if (this.game.playerNumber === 1) {
            this.game.startTimer(
                (timeRemaining) => {
                    this.updateTimerDisplay(timeRemaining);
                    this.firebaseService.updateTimeRemaining(this.game.gameId, timeRemaining);
                },
                () => {
                    this.elements.status.textContent = 'Time\'s up! Game over.';
                    // Update Firebase to end the game
                    this.firebaseService.database.ref(`memory-match/games/${this.game.gameId}/gameActive`).set(false);
                }
            );
        }
    }
    
    /**
     * Clean up when leaving the game
     */
    cleanup() {
        if (this.turnEndTimeout) {
            clearTimeout(this.turnEndTimeout);
            this.turnEndTimeout = null;
        }
        
        this.game.cleanup();
        this.firebaseService.stopListening(this.game.gameId);
    }
}
            
// Create a global instance
const memoryMatchUIController = new MemoryMatchUIController(memoryMatchGame, memoryMatchFirebaseService);