/**
 * UI Controller for Tic-Tac-Toe game
 */
class TicTacToeUIController {
    constructor(game, firebaseService) {
        this.game = game;
        this.firebaseService = firebaseService;
        this.elements = {};
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
     * Create the UI elements
     * @param {HTMLElement} container - The container element for the game
     */
    createUI(container) {
        DOMUtils.clearElement(container);
        
        // Create back button
        const backButton = DOMUtils.createElement('button', { 
            className: 'back-button',
            onClick: () => window.showGameSelection()
        }, '← Back to Games');
        container.appendChild(backButton);
        
        // Create the game elements
        const heading = DOMUtils.createElement('h1', {}, 'Tic-Tac-Toe');
        
        const gameContainer = DOMUtils.createElement('div', { className: 'game-container' });
        
        this.elements.status = DOMUtils.createElement('div', { 
            className: 'status', 
            id: 'ttt-status' 
        }, 'Start a new game or join an existing one');
        
        // Create the game board
        this.elements.board = DOMUtils.createElement('div', { className: 'board', id: 'ttt-board' });
        
        // Create the 9 cells
        this.elements.cells = [];
        for (let i = 0; i < 9; i++) {
            const cell = DOMUtils.createElement('div', { 
                className: 'cell', 
                'data-index': i,
                onClick: (event) => this.handleCellClick(event.target)
            });
            this.elements.cells.push(cell);
            this.elements.board.appendChild(cell);
        }
        
        // Create controls
        const controls = DOMUtils.createElement('div', { className: 'controls' });
        
        this.elements.newGameButton = DOMUtils.createElement('button', { 
            id: 'ttt-new-game',
            onClick: () => this.startNewGame()
        }, 'Start New Game');
        
        this.elements.gameCode = DOMUtils.createElement('div', { 
            className: 'game-code', 
            id: 'ttt-game-code',
            style: { display: 'none' }
        });
        
        this.elements.playerInfo = DOMUtils.createElement('div', { 
            className: 'player-info', 
            id: 'ttt-player-info' 
        });
        
        DOMUtils.appendChildren(controls, [
            this.elements.newGameButton,
            this.elements.gameCode,
            this.elements.playerInfo
        ]);
        
        // Create join container
        const joinContainer = DOMUtils.createElement('div', { className: 'join-container' });
        
        this.elements.joinCodeInput = DOMUtils.createElement('input', { 
            type: 'text', 
            id: 'ttt-join-code', 
            placeholder: 'Enter game code' 
        });
        
        this.elements.joinGameButton = DOMUtils.createElement('button', { 
            id: 'ttt-join-game',
            onClick: () => this.joinGame()
        }, 'Join Game');
        
        DOMUtils.appendChildren(joinContainer, [
            this.elements.joinCodeInput,
            this.elements.joinGameButton
        ]);
        
        // Add everything to the game container
        DOMUtils.appendChildren(gameContainer, [
            this.elements.status,
            this.elements.board,
            controls,
            joinContainer
        ]);
        
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
     * Handle cell click
     * @param {HTMLElement} cell - The clicked cell
     */
    handleCellClick(cell) {
        const index = parseInt(cell.getAttribute('data-index'));
        const result = this.game.makeMove(index);
        
        if (result.valid) {
            // Update the board UI
            this.updateBoard();
            
            // Update game status message
            this.updateStatus(result);
            
            // Update Firebase
            this.firebaseService.updateGame(this.game.gameId, {
                board: this.game.gameState,
                currentPlayer: this.game.currentPlayer,
                gameActive: this.game.gameActive
            });
        }
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        this.game.gameId = this.game.generateGameId();
        this.game.playerSymbol = 'X';
        this.game.resetGame();
        
        // Update UI
        this.updateBoard();
        this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
        this.elements.gameCode.style.display = 'block';
        this.elements.playerInfo.textContent = `You are playing as X`;
        this.elements.status.textContent = `Game started! Waiting for player O to join...`;
        
        // Create game in Firebase
        this.firebaseService.createGame(this.game.gameId);
        
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
        this.game.playerSymbol = 'O';
        
        // Try to join the game
        const gameData = await this.firebaseService.joinGame(code);
        
        if (gameData) {
            // Update game state
            this.game.updateFromData(gameData);
            this.game.gameActive = gameData.gameActive;
            
            // Update UI
            this.updateBoard();
            this.elements.gameCode.textContent = `Game Code: ${this.game.gameId}`;
            this.elements.gameCode.style.display = 'block';
            this.elements.playerInfo.textContent = `You are playing as O`;
            this.elements.status.textContent = `Game joined! ${this.game.currentPlayer}'s turn`;
            
            // Listen for game updates
            this.listenForGameUpdates();
        } else {
            this.elements.status.textContent = 'Game not found or already ended';
        }
    }
    
    /**
     * Listen for game updates from Firebase
     */
    listenForGameUpdates() {
        this.firebaseService.listenForUpdates(this.game.gameId, (gameData) => {
            // Update game state
            this.game.updateFromData(gameData);
            
            // Update UI
            this.updateBoard();
            
            if (!this.game.gameActive) {
                // Check for winner or draw
                const winner = this.game.checkWinner();
                if (winner) {
                    this.elements.status.textContent = `Player ${winner} has won!`;
                } else if (!this.game.gameState.includes('')) {
                    this.elements.status.textContent = `Game ended in a draw!`;
                }
            } else {
                // Both players joined
                if (gameData.playerX && gameData.playerO) {
                    this.elements.status.textContent = `Player ${this.game.currentPlayer}'s turn`;
                }
            }
        });
    }
    
    /**
     * Update the game board UI
     */
    updateBoard() {
        this.elements.cells.forEach((cell, index) => {
            cell.textContent = this.game.gameState[index];
            
            // Add styling based on symbol
            if (this.game.gameState[index] === 'X') {
                cell.style.color = '#E74C3C';
            } else if (this.game.gameState[index] === 'O') {
                cell.style.color = '#3498DB';
            } else {
                cell.style.color = '';
            }
        });
    }
    
    /**
     * Update the game status message
     * @param {Object} result - The result of the last move
     */
    updateStatus(result) {
        if (result.winner) {
            this.elements.status.textContent = `Player ${result.winner} has won!`;
        } else if (result.isDraw) {
            this.elements.status.textContent = `Game ended in a draw!`;
        } else {
            this.elements.status.textContent = `Player ${this.game.currentPlayer}'s turn`;
        }
    }
    
    /**
     * Clean up when leaving the game
     */
    cleanup() {
        this.firebaseService.stopListening(this.game.gameId);
    }
}

// Create a global instance
const ticTacToeUIController = new TicTacToeUIController(ticTacToeGame, ticTacToeFirebaseService);