/**
 * Main application that handles game selection and navigation
 */
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    
    // Current active game controller
    let activeGame = null;
    
    /**
     * Show the game selection screen
     */
    window.showGameSelection = function() {
        DOMUtils.clearElement(appContainer);
        
        const heading = DOMUtils.createElement('h1', {}, 'Game Center');
        
        const selectionContainer = DOMUtils.createElement('div', { className: 'game-selection' });
        
        const gamesGrid = DOMUtils.createElement('div', { className: 'games-grid' });
        
        // Tic-Tac-Toe card
        const ticTacToeCard = DOMUtils.createElement('div', { 
            className: 'game-card',
            onClick: () => showGame('tic-tac-toe')
        });
        
        const ticTacToeIcon = DOMUtils.createElement('div', { className: 'game-icon' }, '❌⭕');
        const ticTacToeTitle = DOMUtils.createElement('div', { className: 'game-title' }, 'Tic-Tac-Toe');
        const ticTacToeDesc = DOMUtils.createElement('div', { className: 'game-description' }, 
            'The classic game of X\'s and O\'s. Get three in a row to win!'
        );
        const ticTacToeButton = DOMUtils.createElement('button', {}, 'Play');
        
        DOMUtils.appendChildren(ticTacToeCard, [
            ticTacToeIcon,
            ticTacToeTitle,
            ticTacToeDesc,
            ticTacToeButton
        ]);
        
        // Rock-Paper-Scissors card
        const rpsCard = DOMUtils.createElement('div', { 
            className: 'game-card',
            onClick: () => showGame('rock-paper-scissors')
        });
        
        const rpsIcon = DOMUtils.createElement('div', { className: 'game-icon' }, '👊✋✌️');
        const rpsTitle = DOMUtils.createElement('div', { className: 'game-title' }, 'Rock-Paper-Scissors');
        const rpsDesc = DOMUtils.createElement('div', { className: 'game-description' }, 
            'Play the classic hand game against a friend!'
        );
        const rpsButton = DOMUtils.createElement('button', {}, 'Play');
        
        DOMUtils.appendChildren(rpsCard, [
            rpsIcon,
            rpsTitle,
            rpsDesc,
            rpsButton
        ]);
        
        // Add game cards to grid
        DOMUtils.appendChildren(gamesGrid, [ticTacToeCard, rpsCard]);
        
        // Add to selection container
        DOMUtils.appendChildren(selectionContainer, [gamesGrid]);
        
        // Add all to the app container
        DOMUtils.appendChildren(appContainer, [heading, selectionContainer]);
    };
    
    /**
     * Show a specific game
     * @param {string} gameType - The type of game to show ('tic-tac-toe' or 'rock-paper-scissors')
     */
    function showGame(gameType) {
        // Clean up previous game if exists
        if (activeGame && activeGame.cleanup) {
            activeGame.cleanup();
        }
        
        DOMUtils.clearElement(appContainer);
        const gameContainer = DOMUtils.createElement('div', { className: 'container' });
        appContainer.appendChild(gameContainer);
        
        // Initialize the appropriate game
        if (gameType === 'tic-tac-toe') {
            ticTacToeUIController.init(gameContainer);
            activeGame = ticTacToeUIController;
        } else if (gameType === 'rock-paper-scissors') {
            rpsUIController.init(gameContainer);
            activeGame = rpsUIController;
        }
    }
    
    // Show the game selection screen initially
    window.showGameSelection();
    
    // Optional: clean up old games on app start
    ticTacToeFirebaseService.cleanupOldGames();
    rpsFirebaseService.cleanupOldGames();
    
    // Log app startup
    console.log('Game Center initialized');
});