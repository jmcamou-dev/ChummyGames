/**
 * UI Controller for Rock-Paper-Scissors game
 */
class RPSUIController {
    constructor(game, firebaseService) {
        this.game = game;
        this.firebaseService = firebaseService;
        this.elements = {};
        this.playerName = localStorage.getItem('playerName') || 'Player';
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
        if (this.elements.player1Label) {
            this.elements.player1Label.textContent = this.playerName;
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
            this.firebaseService.database.ref(`rps/games/${this.game.gameId}/${playerField}`).set(name);
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
        const heading = DOMUtils.createElement('h1', {}, 'Rock-Paper-Scissors');
        
        const gameContainer = DOMUtils.createElement('div', { className: 'rps-container' });
        
        this.elements.status = DOMUtils.createElement('div', { 
            className: 'rps-status', 
            id: 'rps-status' 
        }, 'Start a new game or join an existing one');
        
        // Create the result display area
        this.elements.result = DOMUtils.createElement('div', { className: 'rps-result' });
        
        // Player 1 display
        const player1Display = DOMUtils.createElement('div', { className: 'rps-player' });
        this.elements.player1Label = DOMUtils.createElement('div', { className: 'rps-player-label' }, this.playerName);
        this.elements.playerChoice = DOMUtils.createElement('div', { className: 'rps-player-choice' });
        DOMUtils.appendChildren(player1Display, [this.elements.player1Label, this.elements.playerChoice]);
        
        // VS label
        const vsLabel = DOMUtils.createElement('div', { className: 'rps-vs' }, 'VS');
        
        // Player 2 display
        const player2Display = DOMUtils.createElement('div', { className: 'rps-player' });
        this.elements.player2Label = DOMUtils.createElement('div', { className: 'rps-player-label' }, 'Opponent');
        this.elements.opponentChoice = DOMUtils.createElement('div', { className: 'rps-player-choice' });
        DOMUtils.appendChildren(player2Display, [this.elements.player2Label, this.elements.opponentChoice]);
        
        DOMUtils.appendChildren(this.elements.result, [player1Display, vsLabel, player2Display]);
        
        // Create score display
        this.elements.score = DOMUtils.createElement('div', { className: 'rps-score' });
        this.updateScore(0, 0);
        
        // Create the choice buttons
        this.elements.choices = DOMUtils.createElement('div', { className: 'rps-choices' });
        
        // Rock button
        this.elements.rockButton = DOMUtils.createElement('div', { 
            className: 'rps-choice rock', 
            onClick: () => this.makeChoice(this.game.CHOICES.ROCK)
        }, '👊');
        
        // Paper button
        this.elements.paperButton = DOMUtils.createElement('div', { 
            className: 'rps-choice paper', 
            onClick: () => this.makeChoice(this.game.CHOICES.PAPER)
        }, '✋');
        
        // Scissors button
        this.elements.scissorsButton = DOMUtils.createElement('div', { 
            className: 'rps-choice scissors', 
            onClick: () => this.makeChoice(this.game.CHOICES.SCISSORS)
        }, '✌️');
        
        DOMUtils.appendChildren(this.elements.choices, [
            this.elements.rockButton,
            this.elements.paperButton,
            this.elements.scissorsButton
        ]);
        
        // Create controls
        const controls = DOMUtils.createElement('div', { className: 'rps-controls' });
        
        this.elements.newGameButton = DOMUtils.createElement('button', { 
            id: 'rps-new-game',
            onClick: () => this.startNewGame()
        }, 'Start New Game');
        
        this.elements.nextRoundButton = DOMUtils.createElement('button', { 
            id: 'rps-next-round',
            style: { display: 'none' },
            onClick: () => this.startNextRound()
        }, 'Next Round');
        
        this.elements.gameCode = DOMUtils.createElement('div', { 
            className: 'rps-game-code', 
            id: 'rps-game-code',
            style: { display: 'none' }
        });
        
        DOMUtils.appendChildren(controls, [
            this.elements.newGameButton,
            this.elements.nextRoundButton,
            this.elements.gameCode
        ]);
        
        // Create join container
        const joinContainer = DOMUtils.createElement('div', { className: 'rps-join-container' });
        
        this.elements.joinCodeInput = DOMUtils.createElement('input', { 
            type: 'text', 
            id: 'rps-join-code', 
            placeholder: 'Enter game code' 
        });
        
        this.elements.joinGameButton = DOMUtils.createElement('button', { 
            id: 'rps-join-game',
            onClick: () => this.joinGame()
        }, 'Join Game');
        
        DOMUtils.appendChildren(joinContainer, [
            this.elements.joinCodeInput,
            this.elements.joinGameButton
        ]);
        
        // Add everything to the game container
        DOMUtils.appendChildren(gameContainer, [
            this.elements.status,
            this.elements.result,
            this.elements.score,
            this.elements.choices,
            controls,
            joinContainer
        ]);
        
        // Hide choices until game starts
        this.elements.choices.style.display = 'none';
        this.elements.result.style.display = 'none';
        this.elements.score.style.display = 'none';
        
        // Add all to the container
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
     * Make a choice (rock, paper, or scissors)
     * @param {string} choice - The player's choice
     */
    makeChoice(choice) {
        const result = this.game.makeChoice(choice);
        
        if (result.valid) {
            // Update UI to show player's choice
            this.updatePlayerChoice(choice);
            
            // Disable choice buttons
            this.disableChoices();
            
            // Update status
            this.elements.status.textContent = 'Waiting for opponent...';
            
            // Submit choice to Firebase
            this.firebaseService.submitChoice(
                this.game.gameId, 
                this.game.playerNumber, 
                choice
            );
        }
    }
    
    /**
     * Update display of player's choice
     * @param {string} choice - The player's choice
     */
    updatePlayerChoice(choice) {
        const emoji = this.getChoiceEmoji(choice);
        this.elements.playerChoice.textContent = emoji;
        this.elements.playerChoice.style.backgroundColor = this.getChoiceColor(choice);
    }
    
    /**
     * Update display of opponent's choice
     * @param {string} choice - The opponent's choice
     */
    updateOpponentChoice(choice) {
        const emoji = this.getChoiceEmoji(choice);
        this.elements.opponentChoice.textContent = emoji;
        this.elements.opponentChoice.style.backgroundColor = this.getChoiceColor(choice);
    }
    
    /**
     * Get the emoji for a choice
     * @param {string} choice - The choice
     * @returns {string} The emoji for the choice
     */
    getChoiceEmoji(choice) {
        switch (choice) {
            case this.game.CHOICES.ROCK: return '👊';
            case this.game.CHOICES.PAPER: return '✋';
            case this.game.CHOICES.SCISSORS: return '✌️';
            default: return '';
        }
    }
    
    /**
     * Get the background color for a choice
     * @param {string} choice - The choice
     * @returns {string} The background color for the choice
     */
    getChoiceColor(choice) {
        switch (choice) {
            case this.game.CHOICES.ROCK: return '#f1c40f';
            case this.game.CHOICES.PAPER: return '#3498db';
            case this.game.CHOICES.SCISSORS: return '#e74c3c';
            default: return '#f1f1f1';
        }
    }
    
    /**
     * Enable choice buttons
     */
    enableChoices() {
        this.elements.rockButton.style.opacity = '1';
        this.elements.paperButton.style.opacity = '1';
        this.elements.scissorsButton.style.opacity = '1';
        this.elements.rockButton.style.pointerEvents = 'auto';
        this.elements.paperButton.style.pointerEvents = 'auto';
        this.elements.scissorsButton.style.pointerEvents = 'auto';
    }
    
    /**
     * Disable choice buttons
     */
    disableChoices() {
        this.elements.rockButton.style.opacity = '0.5';
        this.elements.paperButton.style.opacity = '0.5';
        this.elements.scissorsButton.style.opacity = '0.5';
        this.elements.rockButton.style.pointerEvents = 'none';
        this.elements.paperButton.style.pointerEvents = 'none';
        this.elements.scissorsButton.style.pointerEvents = 'none';
    }
    
    /**
     * Update the score display
     * @param {number} playerScore - The player's score
     * @param {number} opponentScore - The opponent's score
     */
    updateScore(playerScore, opponentScore) {
        this.elements.score.textContent = `Score: ${this.playerName} ${playerScore} - ${opponentScore} Opponent`;
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        this.game.gameId = this.game.generateGameId();
        this.game.playerNumber = 1;
        this.game.resetGame();
        
        // Update UI
        this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
        this.elements.gameCode.style.display = 'block';
        this.elements.status.textContent = `Game started! Waiting for opponent to join...`;
        
        // Show game elements
        this.elements.score.style.display = 'flex';
        this.updateScore(0, 0);
        
        // Hide join container
        this.elements.joinCodeInput.parentNode.style.display = 'none';
        
        // Create game in Firebase with player name
        this.firebaseService.database.ref(`rps/games/${this.game.gameId}`).set({
            player1Connected: true,
            player2Connected: false,
            player1Choice: null,
            player2Choice: null,
            player1Score: 0,
            player2Score: 0,
            player1Name: this.playerName,
            player2Name: null,
            roundActive: true,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
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
        const snapshot = await this.firebaseService.database.ref(`rps/games/${code}`).once('value');
        const gameData = snapshot.val();
        
        if (gameData && !gameData.player2Connected) {
            // Mark player 2 as joined with name
            await this.firebaseService.database.ref(`rps/games/${code}`).update({
                player2Connected: true,
                player2Name: this.playerName
            });
            
            // Initialize game state
            this.game.gameActive = true;
            this.game.resetRound();
            
            // Update UI
            this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
            this.elements.gameCode.style.display = 'block';
            this.elements.status.textContent = `Game joined! Make your choice.`;
            
            // Show game elements
            this.elements.choices.style.display = 'flex';
            this.elements.result.style.display = 'flex';
            this.elements.score.style.display = 'flex';
            this.updateScore(0, 0);
            
            // Hide join container
            this.elements.joinCodeInput.parentNode.style.display = 'none';
            
            // Enable choices
            this.enableChoices();
            
            // Listen for game updates
            this.listenForGameUpdates();
            
            return gameData;
        } else {
            this.elements.status.textContent = 'Game not found or already full';
            return null;
        }
    }
    
    /**
     * Start the next round
     */
    startNextRound() {
        this.game.resetRound();
        
        // Clear choices display
        this.elements.playerChoice.textContent = '';
        this.elements.playerChoice.style.backgroundColor = '#f1f1f1';
        this.elements.opponentChoice.textContent = '';
        this.elements.opponentChoice.style.backgroundColor = '#f1f1f1';
        
        // Enable choices
        this.enableChoices();
        
        // Update UI
        this.elements.status.textContent = 'New round! Make your choice.';
        this.elements.nextRoundButton.style.display = 'none';
    }
    
    /**
 * Process round result
 * @param {Object} gameData - The current game data from Firebase
 */
processRoundResult(gameData) {
    // Process the result
    const playerChoice = this.game.playerChoice;
    const opponentChoice = this.game.playerNumber === 1 ? gameData.player2Choice : gameData.player1Choice;
    
    if (playerChoice && opponentChoice) {
        // Both players have made choices
        const result = this.game.processRoundResult(opponentChoice);
        
        // Update UI
        this.updatePlayerChoice(playerChoice);
        this.updateOpponentChoice(opponentChoice);
        this.updateScore(result.playerScore, result.opponentScore);
        
        // Show result message
        if (result.result === 'win') {
            this.elements.status.textContent = 'You win this round!';
        } else if (result.result === 'lose') {
            this.elements.status.textContent = 'You lose this round!';
        } else {
            this.elements.status.textContent = "It's a tie!";
        }
        
        // Show next round button
        this.elements.nextRoundButton.style.display = 'block';
        
        // Reset round in Firebase after a delay
        setTimeout(() => {
            this.firebaseService.resetRound(
                this.game.gameId,
                this.game.playerNumber === 1 ? result.playerScore : result.opponentScore,
                this.game.playerNumber === 1 ? result.opponentScore : result.playerScore
            );
        }, 2000);
    }
}

/**
 * Listen for game updates from Firebase
 */
listenForGameUpdates() {
    this.firebaseService.listenForUpdates(this.game.gameId, (gameData) => {
        if (!gameData) return;
        
        // Update opponent name if available
        if (this.game.playerNumber === 1 && gameData.player2Name) {
            this.elements.player2Label.textContent = gameData.player2Name;
        } else if (this.game.playerNumber === 2 && gameData.player1Name) {
            this.elements.player2Label.textContent = gameData.player1Name;
        }
        
        // Check if both players have connected
        if (gameData.player1Connected && gameData.player2Connected) {
            // Game is ready to play
            if (!this.elements.choices.style.display || this.elements.choices.style.display === 'none') {
                this.elements.choices.style.display = 'flex';
                this.elements.result.style.display = 'flex';
                this.elements.status.textContent = 'Both players connected! Make your choice.';
            }
            
            // Process round results if both players have made choices
            if (gameData.player1Choice && gameData.player2Choice) {
                this.processRoundResult(gameData);
            }
            // Check if opponent has made a choice
            else if (
                (this.game.playerNumber === 1 && gameData.player2Choice && this.game.playerChoice) ||
                (this.game.playerNumber === 2 && gameData.player1Choice && this.game.playerChoice)
            ) {
                this.elements.status.textContent = 'Opponent has made their choice. Waiting for you...';
            }
            // Check if we are waiting for the opponent
            else if (
                (this.game.playerNumber === 1 && gameData.player1Choice && !gameData.player2Choice) ||
                (this.game.playerNumber === 2 && gameData.player2Choice && !gameData.player1Choice)
            ) {
                this.elements.status.textContent = 'Waiting for opponent...';
            }
            // Check if we need to start a new round
            else if (!gameData.player1Choice && !gameData.player2Choice) {
                this.elements.nextRoundButton.style.display = 'none';
                if (this.game.playerChoice || this.game.opponentChoice) {
                    this.startNextRound();
                }
            }
        }
    });
}

/**
 * Clean up when leaving the game
 */
cleanup() {
    this.firebaseService.stopListening(this.game.gameId);
}

// Create a global instance
const rpsUIController = new RPSUIController(rpsGame, rpsFirebaseService);