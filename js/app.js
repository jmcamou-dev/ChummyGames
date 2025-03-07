/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create UI controller and initialize the app
    const uiController = new UIController(gameLogic, firebaseService);
    uiController.init();
    
    // Optional: clean up old games on app start
    // firebaseService.cleanupOldGames();
    
    // Log app startup
    console.log('Tic-Tac-Toe app initialized');
});
