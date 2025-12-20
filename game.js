// Game Variables
let selectedDifficulty = null;
let selectedTheme = 'fruits';

const emojiThemes = {
    fruits: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🍉', '🥥', '🍋', '🥭'],
    animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵'],
    shapes: [
        '⬛', '⬜', '🔲', '🔳', '🔺', '🔻', '🔵', '🟠', '🟣', '🟤', '🟢', '🟡', '⚫', '⚪',
        '🔶', '🔷', '🔸', '🔹', '◼️', '◻️', '◽️', '◾️', '▪️', '▫️', '▲', '▼', '◆', '◇',
        '○', '●', '■', '□', '▭', '▯', '▮', '▰', '▱', '◯', '◉', '◊', '⬒', '⬓', '⬔', '⬕'
    ]
};


let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let totalPairs = 0;
let timer;
let timeLeft = 60;
let musicPlaying = false;
let isPaused = false;
let revealUsed = false;


// Reveal All Cards
// Reveal All Cards
// Reveal All Cards
function revealAll() {
    if (revealUsed) return;

    // Reset game state completely
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    
    // Reset the flippedCards array from gameState (defined in index.html)
    if (typeof gameState !== 'undefined') {
        gameState.flippedCards = [];
    }

    const allCards = document.querySelectorAll('.card:not(.matched)');
    allCards.forEach(card => card.classList.add('flipped'));

    revealUsed = true;
    document.getElementById('revealBtn').disabled = true;

    setTimeout(() => {
        allCards.forEach(card => {
            card.classList.remove('flipped');
        });
        // Ensure everything is reset after reveal
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        if (typeof gameState !== 'undefined') {
            gameState.flippedCards = [];
        }
    }, 3000);
}

// Pause/Resume Game function - FIXED VERSION
        function togglePause() {
            const pauseBtn = document.getElementById('pauseBtn');
            const pauseOverlay = document.getElementById('pauseOverlay');
            const revealBtn = document.getElementById('revealBtn');

            if (!gameState.isPaused) {
                // Pause
                if (gameState.timer) {
                    clearInterval(gameState.timer);
                    gameState.timer = null;
                }
                gameState.isPaused = true;
                gameState.gameActive = false;
                pauseBtn.textContent = '▶ Resume';
                pauseOverlay.classList.add('active');
                if (revealBtn) revealBtn.disabled = true;  // Disable reveal when paused
            } else {
                // Resume
                gameState.isPaused = false;
                gameState.gameActive = true;
                pauseBtn.textContent = '⏸ Pause';
                pauseOverlay.classList.remove('active');
                if (revealBtn && !revealUsed) revealBtn.disabled = false;  // Re-enable if not used

                // Restart timer from where it left off
                gameState.timer = setInterval(() => {
                    gameState.timeLeft--;
                    updateGameStats();
                    
                    if (gameState.timeLeft <= 10) {
                        const timeElement = document.getElementById('timeLeft');
                        timeElement.style.color = 'var(--error)';
                        timeElement.style.animation = 'winPulse 1s ease-in-out infinite';
                    }
                    
                    if (gameState.timeLeft <= 0) {
                        clearInterval(gameState.timer);
                        gameState.timer = null;
                        loseGame();
                    }
                }, 1000);
            }
        }


// Attach Global Functions
window.toggleTheme = toggleTheme;
window.toggleMusic = toggleMusic;
window.selectDifficulty = selectDifficulty;
window.showMenu = showMenu;
window.startGame = startGame;
window.restartGame = restartGame;
window.revealAll = revealAll;
window.togglePause = togglePause;
window.selectTheme = selectTheme;
