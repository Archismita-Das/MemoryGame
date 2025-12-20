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

// DOM Elements
const gameGrid = document.getElementById('gameGrid');
const moveCount = document.getElementById('moveCount');
const matchCount = document.getElementById('matchCount');
const timeCounter = document.getElementById('timeLeft');
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const startGameBtn = document.getElementById('startGameBtn');
const musicAudio = document.getElementById('backgroundMusic');

// Difficulty settings
const difficultySettings = {
    easy: { pairs: 6, time: 90, gridClass: 'grid-4x3' },
    medium: { pairs: 8, time: 100, gridClass: 'grid-4x4' },
    hard: { pairs: 12, time: 120, gridClass: 'grid-6x4' }
};

// Toggle Theme
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle.classList.toggle('active');
}

// Toggle Music
function toggleMusic() {
    const musicToggle = document.getElementById('musicToggle');
    musicToggle.classList.toggle('active');
    if (musicPlaying) {
        musicAudio.pause();
    } else {
        musicAudio.play();
    }
    musicPlaying = !musicPlaying;
}

// Select Difficulty
function selectDifficulty(level) {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn:not(.theme-btn)');
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector(`.difficulty-btn[data-difficulty="${level}"]`);
    selectedBtn.classList.add('selected');
    selectedDifficulty = level;
    startGameBtn.disabled = false;
}

// Show Screens
function showMenu() {
    hideAllScreens();
    document.getElementById('menuScreen').classList.add('active');
    clearInterval(timer);
    resetGame();
}

function startGame() {
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    initGame();
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    modal.classList.remove('active');
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function initGame() {
    moves = 0;
    matches = 0;

    // Set timeLeft based on selectedDifficulty
    if (selectedDifficulty === 'easy') {
        timeLeft = difficultySettings.easy.time;
    } else if (selectedDifficulty === 'medium') {
        timeLeft = difficultySettings.medium.time;
    } else if (selectedDifficulty === 'hard') {
        timeLeft = difficultySettings.hard.time;
    }

    moveCount.textContent = moves;
    matchCount.textContent = matches;
    timeCounter.textContent = formatTime(timeLeft);

    revealUsed = false;
    document.getElementById('revealBtn').disabled = false;
    isPaused = false;
    document.getElementById('pauseBtn').textContent = '⏸ Pause';

    let pairs = 0;
    let gridClass = '';
    if (selectedDifficulty === 'easy') {
        pairs = 6;
        gridClass = 'grid-4x3';
    } else if (selectedDifficulty === 'medium') {
        pairs = 8;
        gridClass = 'grid-4x4';
    } else if (selectedDifficulty === 'hard') {
        pairs = 12;
        gridClass = 'grid-6x4';
    }

    totalPairs = pairs;
    const themeSymbols = emojiThemes[selectedTheme];
    const symbols = shuffleArray([...themeSymbols.slice(0, pairs), ...themeSymbols.slice(0, pairs)]);

    gameGrid.className = `game-grid ${gridClass}`;
    gameGrid.innerHTML = '';

    symbols.forEach(symbol => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front">?</div>
                <div class="card-face card-back">${symbol}</div>
            </div>`;
        card.addEventListener('click', () => flipCard(card));
        gameGrid.appendChild(card);
    });

    timer = setInterval(() => {
        timeLeft--;
        timeCounter.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timer);
            showModal(false);
        }
    }, 1000);
}

// Shuffle Array Utility
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Flip Card Logic
function flipCard(card) {
    if (lockBoard || isPaused) return;
    if (card === firstCard || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;

    moves++;
    moveCount.textContent = moves;

    checkForMatch();
}

function checkForMatch() {
    const symbol1 = firstCard.querySelector('.card-back').textContent;
    const symbol2 = secondCard.querySelector('.card-back').textContent;

    if (symbol1 === symbol2) {
        disableCards();
        playSound('matchSound');
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matches++;
    matchCount.textContent = matches;

    resetBoard();

    if (matches === totalPairs) {
        clearInterval(timer);
        showModal(true);
    }
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// Modal
function showModal(win) {
    modal.classList.add('active');
    modalTitle.textContent = win ? 'You Win!' : 'Time’s Up!';
    modalTitle.className = win ? 'modal-title win' : 'modal-title lose';
    modalMessage.textContent = win
        ? `Great job! You completed the game in ${moves} moves.`
        : `You matched ${matches} pairs. Try again!`;

    if (win) {
        playSound('winSound');
    } else {
        playSound('loseSound');
    }
}

// Restart Game
function restartGame() {
    modal.classList.remove('active');
    initGame();
}

function resetGame() {
    gameGrid.innerHTML = '';
    moveCount.textContent = '0';
    matchCount.textContent = '0';
    timeCounter.textContent = '60';
    selectedDifficulty = null;
    const buttons = document.querySelectorAll('.difficulty-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    startGameBtn.disabled = true;
}

// Reveal All Cards
function revealAll() {
    if (revealUsed) return;

    const allCards = document.querySelectorAll('.card:not(.matched)');
    allCards.forEach(card => card.classList.add('flipped'));

    revealUsed = true;
    document.getElementById('revealBtn').disabled = true;

    setTimeout(() => {
        allCards.forEach(card => {
            card.classList.remove('flipped');
        });
    }, 3000);
}

// Pause/Resume Game
function togglePause() {
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseOverlay = document.getElementById('pauseOverlay');

    if (!isPaused) {
        // Pause
        clearInterval(timer);
        isPaused = true;
        lockBoard = true;
        pauseBtn.textContent = '▶ Resume';
        pauseOverlay.classList.add('active');
    } else {
        // Resume
        isPaused = false;
        lockBoard = false;
        pauseBtn.textContent = '⏸ Pause';
        pauseOverlay.classList.remove('active');

        timer = setInterval(() => {
            timeLeft--;
            timeCounter.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                showModal(false);
            }
        }, 1000);
    }
}

// Select Theme
function selectTheme(theme) {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => btn.classList.remove('selected'));

    const selectedBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    selectedBtn.classList.add('selected');

    selectedTheme = theme;
}

// Play Sound
function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log(`${id} play failed:`, e));
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