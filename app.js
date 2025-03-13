/**
 * Main application that handles game selection and navigation
 */
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    
    // Current active game controller
    let activeGame = null;
    
    // Player name handling
    let playerName = localStorage.getItem('playerName') || 'Player';
    
    /**
     * Show the game selection screen
     */
    window.showGameSelection = function() {
        DOMUtils.clearElement(appContainer);
        
        const heading = DOMUtils.createElement('h1', {}, 'Game Center');
        
        // Player name control
        const nameContainer = DOMUtils.createElement('div', { className: 'player-name-container' });
        
        const nameLabel = DOMUtils.createElement('label', { for: 'player-name' }, 'Your Name: ');
        
        const nameInput = DOMUtils.createElement('input', { 
            type: 'text',
            id: 'player-name',
            value: playerName,
            placeholder: 'Enter your name'
        });
        
        const saveNameButton = DOMUtils.createElement('button', { 
            className: 'save-name-button',
            onClick: () => {
                const newName = nameInput.value.trim();
                if (newName) {
                    playerName = newName;
                    localStorage.setItem('playerName', playerName);
                    // Update the displayed name
                    nameDisplay.textContent = `Playing as: ${playerName}`;
                }
            }
        }, 'Save');
        
        const nameDisplay = DOMUtils.createElement('div', { className: 'current-player-name' }, `Playing as: ${playerName}`);
        
        DOMUtils.appendChildren(nameContainer, [nameLabel, nameInput, saveNameButton, nameDisplay]);
        
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
        
        // Memory Match card
        const memoryCard = DOMUtils.createElement('div', { 
            className: 'game-card',
            onClick: () => showGame('memory-match')
        });
        
        const memoryIcon = DOMUtils.createElement('div', { className: 'game-icon' }, '🃏🎴');
        const memoryTitle = DOMUtils.createElement('div', { className: 'game-title' }, 'Memory Match');
        const memoryDesc = DOMUtils.createElement('div', { className: 'game-description' }, 
            'Test your memory by finding matching pairs of cards!'
        );
        const memoryButton = DOMUtils.createElement('button', {}, 'Play');
        
        DOMUtils.appendChildren(memoryCard, [
            memoryIcon,
            memoryTitle,
            memoryDesc,
            memoryButton
        ]);
        
        // High Card game
        const highCardCard = DOMUtils.createElement('div', { 
            className: 'game-card',
            onClick: () => showGame('high-card')
        });
        
        const highCardIcon = DOMUtils.createElement('div', { className: 'game-icon' }, '🂡♠️');
        const highCardTitle = DOMUtils.createElement('div', { className: 'game-title' }, 'High Card');
        const highCardDesc = DOMUtils.createElement('div', { className: 'game-description' }, 
            'Play your cards wisely! Highest card wins each round.'
        );
        const highCardButton = DOMUtils.createElement('button', {}, 'Play');
        
        DOMUtils.appendChildren(highCardCard, [
            highCardIcon,
            highCardTitle,
            highCardDesc,
            highCardButton
        ]);
        
        // Add game cards to grid
        DOMUtils.appendChildren(gamesGrid, [ticTacToeCard, rpsCard, memoryCard, highCardCard]);
        
        // Add to selection container
        DOMUtils.appendChildren(selectionContainer, [gamesGrid]);
        
        // Add all to the app container
        DOMUtils.appendChildren(appContainer, [heading, nameContainer, selectionContainer]);
    };
    
    /**
     * Show a specific game
     * @param {string} gameType - The type of game to show
     */
    function showGame(gameType) {
        // Clean up previous game if exists
        if (activeGame && activeGame.cleanup) {
            activeGame.cleanup();
        }
        
        DOMUtils.clearElement(appContainer);
        const gameContainer = DOMUtils.createElement('div', { className: 'container' });
        appContainer.appendChild(gameContainer);
        
        // Add player name display at the top
        const playerNameDisplay = DOMUtils.createElement('div', { className: 'player-name-display' }, `Playing as: ${playerName}`);
        
        // Add name editing feature
        const editNameButton = DOMUtils.createElement('button', {
            className: 'edit-name-button',
            onClick: () => {
                const newName = prompt('Enter your name:', playerName);
                if (newName && newName.trim()) {
                    playerName = newName.trim();
                    localStorage.setItem('playerName', playerName);
                    playerNameDisplay.textContent = `Playing as: ${playerName}`;
                    
                    // Update name in active game if applicable
                    if (activeGame && activeGame.updatePlayerName) {
                        activeGame.updatePlayerName(playerName);
                    }
                }
            }
        }, 'Edit Name');
        
        const nameContainer = DOMUtils.createElement('div', { className: 'game-name-container' });
        DOMUtils.appendChildren(nameContainer, [playerNameDisplay, editNameButton]);
        
        gameContainer.appendChild(nameContainer);
        
        // Initialize the appropriate game
        if (gameType === 'tic-tac-toe') {
            ticTacToeUIController.init(gameContainer);
            ticTacToeUIController.setPlayerName(playerName);
            activeGame = ticTacToeUIController;
        } else if (gameType === 'rock-paper-scissors') {
            rpsUIController.init(gameContainer);
            rpsUIController.setPlayerName(playerName);
            activeGame = rpsUIController;
        } else if (gameType === 'memory-match') {
            memoryMatchUIController.init(gameContainer);
            memoryMatchUIController.setPlayerName(playerName);
            activeGame = memoryMatchUIController;
        } else if (gameType === 'high-card') {
            highCardUIController.init(gameContainer);
            highCardUIController.setPlayerName(playerName);
            activeGame = highCardUIController;
        }
    }
    
    // Expose function to update player name
    window.updatePlayerName = function(name) {
        if (name && name.trim()) {
            playerName = name.trim();
            localStorage.setItem('playerName', playerName);
            
            // Update name in active game if applicable
            if (activeGame && activeGame.updatePlayerName) {
                activeGame.updatePlayerName(playerName);
            }
        }
    };
    
    // Show the game selection screen initially
    window.showGameSelection();
    
    // Optional: clean up old games on app start
    ticTacToeFirebaseService.cleanupOldGames();
    rpsFirebaseService.cleanupOldGames();
    memoryMatchFirebaseService.cleanupOldGames();
    highCardFirebaseService.cleanupOldGames();
    
    // Log app startup
    console.log('Game Center initialized');
});