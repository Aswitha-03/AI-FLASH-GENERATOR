// API Configuration
const email = localStorage.getItem("email");

if (!email) {
    window.location.href = "login.html";
}
const API_URL = fetch("https://ai-flash-generator.onrender.com/login");

// Core State variables
let flashcards = [];        // Master list of generated flashcards
let studiedIndexes = new Set();  // Set of reviewed card indices
let bookmarkedCards = [];   // List of bookmarked card objects

// Quiz Session State variables
let quizQuestions = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let incorrectQuizCards = [];
let quizSessionTotal = 0;

// Demo Science Notes Data
const SAMPLE_NOTES = `A computer network is a collection of interconnected devices that communicate with each other.

The Internet is a global network that connects millions of computers worldwide.

A protocol is a set of rules that governs data communication.

TCP stands for Transmission Control Protocol and provides reliable communication.

IP stands for Internet Protocol and is responsible for addressing and routing packets.

HTTP is a protocol used for transferring web pages over the Internet.

HTTPS is the secure version of HTTP that uses encryption.

A router is a networking device that forwards data packets between networks.

A switch is a device that connects multiple devices within a local area network.

A hub is a basic networking device that broadcasts data to all connected devices.

DNS stands for Domain Name System and translates domain names into IP addresses.

An IP address is a unique identifier assigned to a device on a network.

A firewall is a security system that monitors and controls network traffic.

LAN stands for Local Area Network and covers a small geographic area.

WAN stands for Wide Area Network and covers large geographic areas.

MAN stands for Metropolitan Area Network and covers a city or metropolitan region.

Bandwidth refers to the maximum amount of data that can be transmitted over a network.

Network topology refers to the arrangement of devices and connections in a network.

Star topology is a network topology where all devices are connected to a central hub.

Bus topology is a network topology that uses a single communication line.

Ring topology is a network topology in which devices form a circular structure.

OSI stands for Open Systems Interconnection and consists of seven layers.

The Physical Layer is responsible for transmitting raw bits over a communication channel.

The Data Link Layer provides node-to-node communication and error detection.

The Network Layer is responsible for routing and logical addressing.

The Transport Layer ensures reliable end-to-end communication.

The Session Layer manages communication sessions between applications.

The Presentation Layer handles data translation, encryption, and compression.

The Application Layer provides services directly to end users.`;

// DOM Selectors
const tabButtons = document.querySelectorAll('.nav-tab');
const tabViews = document.querySelectorAll('.tab-view');
const notesInput = document.getElementById('notes-input');
const loadSampleBtn = document.getElementById('load-sample-btn');
const generateBtn = document.getElementById('generate-btn');
const downloadJsonBtn = document.getElementById('download-json-btn');
const printPdfBtn = document.getElementById('print-pdf-btn');
const resultsCountBadge = document.getElementById('results-count');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterReviewed = document.getElementById('filter-reviewed');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const gridEmptyState = document.getElementById('grid-empty-state');
const cardsGrid = document.getElementById('cards-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const favoritesEmptyState = document.getElementById('favorites-empty-state');
const favoritesBadgeCount = document.getElementById('favorites-badge-count');
const themeToggleBtn = document.getElementById('theme-toggle');

// Dashboard DOM Selectors
const currentStreakText = document.getElementById('current-streak');
const statTotalCards = document.getElementById('stat-total-cards');
const statReviewedCards = document.getElementById('stat-reviewed-cards');
const statReviewedPct = document.getElementById('stat-reviewed-pct');
const statFavoritesCount = document.getElementById('stat-favorites-count');
const statQuizAccuracy = document.getElementById('stat-quiz-accuracy');
const statQuizAttempts = document.getElementById('stat-quiz-attempts');
const streakHeadline = document.getElementById('streak-headline');
const streakDaysVal = document.getElementById('streak-days-val');
const streakBestVal = document.getElementById('streak-best-val');
const dashboardProgressFill = document.getElementById('dashboard-progress-fill');
const dashboardProgressTxt = document.getElementById('dashboard-progress-txt');
const weakTopicsCloud = document.getElementById('weak-topics-cloud');
const recommendationsList = document.getElementById('recommendations-list');

// Quiz DOM Selectors
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizSetupScreen = document.getElementById('quiz-setup-screen');
const quizActiveScreen = document.getElementById('quiz-active-screen');
const quizResultScreen = document.getElementById('quiz-result-screen');
const quizProgressText = document.getElementById('quiz-progress-text');
const quizDifficultyBadge = document.getElementById('quiz-difficulty-badge');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsList = document.getElementById('quiz-options-list');
const quizFeedbackBanner = document.getElementById('quiz-feedback-banner');
const quizFeedbackIcon = document.getElementById('quiz-feedback-icon');
const quizFeedbackText = document.getElementById('quiz-feedback-text');
const quizNextBtn = document.getElementById('quiz-next-btn');
const quizResultScore = document.getElementById('quiz-result-score');
const quizResultPercentage = document.getElementById('quiz-result-percentage');
const quizReviewList = document.getElementById('quiz-review-list');
const quizRestartBtn = document.getElementById('quiz-restart-btn');
const quizDashboardBtn = document.getElementById('quiz-dashboard-btn');

// Toast Notification DOM Selectors
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initStreak();
    loadBookmarksFromStorage();
    setupEventListeners();
    updateDashboardUI();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Theme switched to ${newTheme} mode!`, 'success');
}

// Study Streak Tracker
function initStreak() {
    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0', 10);
    let bestStreak = parseInt(localStorage.getItem('bestStreak') || '0', 10);

    if (lastActiveDate) {
        if (lastActiveDate !== today) {
            const lastDate = new Date(lastActiveDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive active day
                currentStreak += 1;
            } else if (diffDays > 1) {
                // Streak broken, reset
                currentStreak = 1;
            }
            localStorage.setItem('currentStreak', currentStreak);
        }
    } else {
        // First active run
        currentStreak = 1;
        localStorage.setItem('currentStreak', currentStreak);
    }
    
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        localStorage.setItem('bestStreak', bestStreak);
    }
    
    // Save today's date
    localStorage.setItem('lastActiveDate', today);
    
    // Update badge values
    currentStreakText.textContent = currentStreak;
    streakDaysVal.textContent = `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`;
    streakBestVal.textContent = `${bestStreak} day${bestStreak !== 1 ? 's' : ''}`;
    
    if (currentStreak > 0) {
        streakHeadline.textContent = `Keep going! You are on a ${currentStreak}-day streak.`;
    } else {
        streakHeadline.textContent = `Start your study streak today!`;
    }
}

// Local Storage Bookmarks
function loadBookmarksFromStorage() {
    const saved = localStorage.getItem('bookmarkedCards');
    if (saved) {
        try {
            bookmarkedCards = JSON.parse(saved);
        } catch (e) {
            bookmarkedCards = [];
        }
    }
    updateFavoritesBadge();
}

function saveBookmarksToStorage() {
    localStorage.setItem('bookmarkedCards', JSON.stringify(bookmarkedCards));
    updateFavoritesBadge();
    updateDashboardUI();
    renderFavorites();
}

function updateFavoritesBadge() {
    favoritesBadgeCount.textContent = bookmarkedCards.length;
}

// Global Event Listeners
function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Navigation Tab Switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Demo Notes Loader
    loadSampleBtn.addEventListener('click', () => {
        notesInput.value = SAMPLE_NOTES;
        showToast('Demo notes pasted into editor!', 'success');
    });

    // Generate Flashcards Call
    generateBtn.addEventListener('click', handleGenerate);

    // Export formats
    downloadJsonBtn.addEventListener('click', downloadJSON);
    printPdfBtn.addEventListener('click', () => window.print());

    // Search and filters triggers
    searchInput.addEventListener('input', triggerFilters);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        triggerFilters();
        searchInput.focus();
    });
    filterDifficulty.addEventListener('change', triggerFilters);
    filterReviewed.addEventListener('change', triggerFilters);

    // Quiz Session Buttons
    startQuizBtn.addEventListener('click', startQuizSession);
    quizNextBtn.addEventListener('click', goToNextQuestion);
    quizRestartBtn.addEventListener('click', () => {
        setQuizUIState('setup');
    });
    quizDashboardBtn.addEventListener('click', () => {
        switchTab('dashboard');
    });
}

// Switch navigation view tab
function switchTab(tabId) {
    // Nav active styles
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Tab view active state
    tabViews.forEach(view => {
        if (view.getAttribute('id') === `view-${tabId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Sub-view updates
    if (tabId === 'favorites') {
        renderFavorites();
    } else if (tabId === 'dashboard') {
        updateDashboardUI();
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Speak Voice Assistant Helper
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Stop current speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('Text-to-speech not supported in this browser.', 'error');
    }
}

// POST generate request
async function handleGenerate() {
    const text = notesInput.value.trim();
    if (!text) {
        showToast('Paste study notes first!', 'error');
        notesInput.focus();
        return;
    }

    setCardsUIState('loading');

    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
    text: text,
    email: email
})
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `API error code: ${response.status}`);
        }

        const data = await response.json();
        flashcards = data.flashcards || [];

        if (flashcards.length === 0) {
            showToast('No key concepts detected. Use trigger terms: is, are, means...', 'error');
            setCardsUIState('empty');
            return;
        }

        // Reset session study tracking
        studiedIndexes.clear();

        renderFlashcardGrid();
        setCardsUIState('display');
        updateDashboardUI();
        showToast(`Extracted ${flashcards.length} cards successfully!`, 'success');
        
        // Auto navigate to the grid tab
        switchTab('flashcards');

    } catch (err) {
        console.error(err);
        errorText.textContent = `Unable to generate. Error detail: ${err.message}. Confirm Python Flask backend is running.`;
        setCardsUIState('error');
    }
}

// Cards UI States
function setCardsUIState(state) {
    loadingSpinner.classList.add('hidden');
    errorMessage.classList.add('hidden');
    gridEmptyState.classList.add('hidden');
    cardsGrid.classList.add('hidden');

    if (state === 'loading') {
        loadingSpinner.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Generating...';
    } else {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
            Generate Flashcards
        `;
    }

    if (state === 'empty') {
        gridEmptyState.classList.remove('hidden');
        downloadJsonBtn.disabled = true;
        printPdfBtn.disabled = true;
    } else if (state === 'error') {
        errorMessage.classList.remove('hidden');
        downloadJsonBtn.disabled = true;
        printPdfBtn.disabled = true;
    } else if (state === 'display') {
        cardsGrid.classList.remove('hidden');
        downloadJsonBtn.disabled = false;
        printPdfBtn.disabled = false;
    }
}

// Render Master Grid Cards
function renderFlashcardGrid() {
    cardsGrid.innerHTML = '';
    
    flashcards.forEach((card, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'flashcard-card';
        cardContainer.setAttribute('data-index', index);
        cardContainer.setAttribute('data-difficulty', card.difficulty);
        cardContainer.setAttribute('tabindex', '0');

        const isBookmarked = bookmarkedCards.some(item => item.question === card.question);

        cardContainer.innerHTML = `
            <div class="flashcard-inner">
                <!-- Front (Question) -->
                <div class="flashcard-front">
                    <div class="card-top-row">
                        <span class="difficulty-badge diff-${card.difficulty.toLowerCase()}">${card.difficulty}</span>
                        <div class="card-actions-wrapper">
                            <!-- Voice speaker Button -->
                            <button class="action-icon-btn voice-btn" title="Listen to question">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                            </button>
                            <!-- Bookmark Star Button -->
                            <button class="action-icon-btn bookmark-btn ${isBookmarked ? 'active' : ''}" title="Add to bookmarks">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-txt">${escapeHTML(card.question)}</p>
                    </div>
                    <div class="card-bottom-row">
                        <span class="studied-check">✓ Reviewed</span>
                        <span class="flip-hint">Click to flip</span>
                    </div>
                </div>
                <!-- Back (Answer) -->
                <div class="flashcard-back">
                    <div class="card-top-row">
                        <span class="difficulty-badge diff-${card.difficulty.toLowerCase()}">${card.difficulty}</span>
                        <button class="action-icon-btn voice-btn-back" title="Listen to answer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                        </button>
                    </div>
                    <div class="card-body">
                        <p class="card-txt">${escapeHTML(card.answer)}</p>
                    </div>
                    <div class="card-bottom-row">
                        <span>Answer</span>
                        <span class="flip-hint">Click to flip back</span>
                    </div>
                </div>
            </div>
        `;

        // Add Handlers
        // Prevent flipping when voice or bookmark actions are triggered
        const voiceBtn = cardContainer.querySelector('.voice-btn');
        voiceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            speakText(card.question);
        });

        const voiceBtnBack = cardContainer.querySelector('.voice-btn-back');
        voiceBtnBack.addEventListener('click', (e) => {
            e.stopPropagation();
            speakText(card.answer);
        });

        const bookmarkBtn = cardContainer.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(card, bookmarkBtn);
        });

        // Click to Flip
        cardContainer.addEventListener('click', () => {
            flipCard(cardContainer, index);
        });

        cardContainer.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                flipCard(cardContainer, index);
            }
        });

        cardsGrid.appendChild(cardContainer);
    });

    // Reset filter controls inputs
    searchInput.value = '';
    filterDifficulty.value = 'all';
    filterReviewed.value = 'all';
}

// Flip logic
function flipCard(cardEl, index) {
    cardEl.classList.toggle('flipped');
    
    if (cardEl.classList.contains('flipped') && !studiedIndexes.has(index)) {
        cardEl.classList.add('studied');
        studiedIndexes.add(index);
        updateDashboardUI();
    }
}

// Bookmark Toggle Actions
function toggleBookmark(card, btnElement) {
    const isBookmarked = bookmarkedCards.some(item => item.question === card.question);
    
    if (isBookmarked) {
        bookmarkedCards = bookmarkedCards.filter(item => item.question !== card.question);
        btnElement.classList.remove('active');
        showToast('Card removed from bookmarks.', 'success');
    } else {
        bookmarkedCards.push(card);
        btnElement.classList.add('active');
        showToast('Card added to bookmarks!', 'success');
    }
    
    saveBookmarksToStorage();
    
    // Refresh bookmark grid if currently viewed
    renderFavorites();
}

// Render Bookmarks Grid
function renderFavorites() {
    favoritesGrid.innerHTML = '';
    
    if (bookmarkedCards.length === 0) {
        favoritesEmptyState.classList.remove('hidden');
        favoritesGrid.classList.add('hidden');
        return;
    }
    
    favoritesEmptyState.classList.add('hidden');
    favoritesGrid.classList.remove('hidden');
    
    bookmarkedCards.forEach((card, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'flashcard-card';
        cardContainer.setAttribute('tabindex', '0');
        
        cardContainer.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="card-top-row">
                        <span class="difficulty-badge diff-${card.difficulty.toLowerCase()}">${card.difficulty}</span>
                        <div class="card-actions-wrapper">
                            <button class="action-icon-btn fav-voice-btn" title="Listen">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                            </button>
                            <button class="action-icon-btn bookmark-btn active" title="Remove bookmark">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-txt">${escapeHTML(card.question)}</p>
                    </div>
                    <div class="card-bottom-row">
                        <span>Bookmarked</span>
                        <span class="flip-hint">Click to flip</span>
                    </div>
                </div>
                <div class="flashcard-back">
                    <div class="card-top-row">
                        <span class="difficulty-badge diff-${card.difficulty.toLowerCase()}">${card.difficulty}</span>
                        <button class="action-icon-btn fav-voice-btn-back" title="Listen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                        </button>
                    </div>
                    <div class="card-body">
                        <p class="card-txt">${escapeHTML(card.answer)}</p>
                    </div>
                    <div class="card-bottom-row">
                        <span>Answer</span>
                        <span class="flip-hint">Click to flip back</span>
                    </div>
                </div>
            </div>
        `;
        
        // Handlers
        const voiceBtn = cardContainer.querySelector('.fav-voice-btn');
        voiceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            speakText(card.question);
        });
        
        const voiceBtnBack = cardContainer.querySelector('.fav-voice-btn-back');
        voiceBtnBack.addEventListener('click', (e) => {
            e.stopPropagation();
            speakText(card.answer);
        });
        
        const bookmarkBtn = cardContainer.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Direct remove from bookmark list
            bookmarkedCards = bookmarkedCards.filter(item => item.question !== card.question);
            showToast('Card removed from bookmarks.', 'success');
            saveBookmarksToStorage();
        });
        
        cardContainer.addEventListener('click', () => {
            cardContainer.classList.toggle('flipped');
        });
        
        favoritesGrid.appendChild(cardContainer);
    });
}

// Search & Filtering logic
function triggerFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const diffFilter = filterDifficulty.value;
    const reviewedFilter = filterReviewed.value;
    
    const cards = cardsGrid.getElementsByClassName('flashcard-card');
    let visibleCount = 0;
    
    if (query) {
        clearSearchBtn.style.display = 'flex';
    } else {
        clearSearchBtn.style.display = 'none';
    }

    Array.from(cards).forEach(cardEl => {
        const index = parseInt(cardEl.getAttribute('data-index'), 10);
        const cardData = flashcards[index];
        const isStudied = cardEl.classList.contains('studied');
        
        // 1. Keyword search match
        const keyMatch = cardData.question.toLowerCase().includes(query) || 
                         cardData.answer.toLowerCase().includes(query);
        
        // 2. Difficulty selector match
        const diffMatch = (diffFilter === 'all') || (cardData.difficulty === diffFilter);
        
        // 3. Reviewed status match
        const statusMatch = (reviewedFilter === 'all') || 
                            (reviewedFilter === 'reviewed' && isStudied) || 
                            (reviewedFilter === 'unreviewed' && !isStudied);
                            
        if (keyMatch && diffMatch && statusMatch) {
            cardEl.classList.remove('hidden');
            visibleCount++;
        } else {
            cardEl.classList.add('hidden');
        }
    });

    resultsCountBadge.textContent = `${visibleCount} of ${flashcards.length} Cards`;
}

// Export Flashcards as JSON
function downloadJSON() {
    if (flashcards.length === 0) return;
    
    const fileContent = JSON.stringify({ flashcards: flashcards }, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai_smart_flashcards.json';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Flashcards downloaded as JSON!', 'success');
}

// Update Dashboard Widgets
function updateDashboardUI() {
    const total = flashcards.length;
    const reviewed = studiedIndexes.size;
    const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;

    statTotalCards.textContent = total;
    statReviewedCards.textContent = reviewed;
    statReviewedPct.textContent = `${percentage}% of deck`;
    statFavoritesCount.textContent = bookmarkedCards.length;

    // Load quiz accuracy metrics
    const accuracy = localStorage.getItem('quizAccuracy') || '0%';
    const attempts = localStorage.getItem('quizAttempts') || '0';
    statQuizAccuracy.textContent = accuracy;
    statQuizAttempts.textContent = `${attempts} attempt${attempts !== '1' ? 's' : ''}`;

    // Fill progress bar
    dashboardProgressFill.style.width = `${percentage}%`;
    if (total > 0) {
        dashboardProgressTxt.textContent = `${reviewed} / ${total} cards reviewed (${percentage}%)`;
    } else {
        dashboardProgressTxt.textContent = 'No active cards generated yet.';
    }
}

// =========================================
// 📝 INTERACTIVE QUIZ MODE ENGINE
// =========================================

function setQuizUIState(state) {
    quizSetupScreen.classList.add('hidden');
    quizActiveScreen.classList.add('hidden');
    quizResultScreen.classList.add('hidden');

    if (state === 'setup') {
        quizSetupScreen.classList.remove('hidden');
    } else if (state === 'active') {
        quizActiveScreen.classList.remove('hidden');
    } else if (state === 'result') {
        quizResultScreen.classList.remove('hidden');
    }
}

// Fetch shuffled MCQ questions from Python
async function startQuizSession() {
    if (flashcards.length === 0) {
        showToast('Please generate some flashcards before starting the quiz!', 'error');
        switchTab('notes');
        return;
    }

    showToast('Configuring quiz options...', 'success');

    try {
        const response = await fetch(`${API_URL}/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flashcards: flashcards })
        });

        if (!response.ok) {
            throw new Error(`Server returned code ${response.status}`);
        }

        const data = await response.json();
        quizQuestions = data.quiz || [];
        
        if (quizQuestions.length === 0) {
            showToast('Unable to start quiz.', 'error');
            return;
        }

        // Initialize quiz parameters
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        incorrectQuizCards = [];
        quizSessionTotal = quizQuestions.length;

        setQuizUIState('active');
        displayQuestion();

    } catch (err) {
        console.error(err);
        showToast('Failed to fetch quiz questions. Make sure Flask is online.', 'error');
    }
}

// Render active quiz item
function displayQuestion() {
    // Reset state
    quizFeedbackBanner.classList.add('hidden');
    quizNextBtn.disabled = true;

    const questionItem = quizQuestions[currentQuestionIndex];
    
    // UI Progress
    quizProgressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizSessionTotal}`;
    quizDifficultyBadge.textContent = questionItem.difficulty;
    quizDifficultyBadge.className = `badge diff-${questionItem.difficulty.toLowerCase()}`;
    
    const pct = Math.round(((currentQuestionIndex) / quizSessionTotal) * 100);
    quizProgressFill.style.width = `${pct}%`;

    quizQuestionText.textContent = questionItem.question;
    
    // Render options
    quizOptionsList.innerHTML = '';
    questionItem.options.forEach((option, index) => {
        const char = String.fromCharCode(65 + index); // A, B, C, D
        const button = document.createElement('button');
        button.className = 'quiz-option-btn';
        button.innerHTML = `<span class="option-marker">${char}</span> <span class="option-txt-content">${escapeHTML(option)}</span>`;
        
        button.addEventListener('click', () => {
            handleAnswerSelection(button, option, questionItem.correct_answer);
        });
        
        quizOptionsList.appendChild(button);
    });
}

// Handle multiple choice selection
function handleAnswerSelection(selectedButton, selectedText, correctText) {
    const buttons = quizOptionsList.querySelectorAll('.quiz-option-btn');
    
    // Disable all options once clicked
    buttons.forEach(btn => btn.disabled = true);
    
    // Check answer correctness
    if (selectedText === correctText) {
        selectedButton.classList.add('correct-choice');
        selectedButton.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-green);"><polyline points="20 6 9 17 4 12"/></svg>');
        
        // Show correct feedback
        quizFeedbackBanner.className = 'quiz-feedback correct';
        quizFeedbackIcon.textContent = '✓';
        quizFeedbackText.textContent = 'Correct Answer! Well done.';
        
        correctAnswersCount++;
    } else {
        selectedButton.classList.add('incorrect-choice');
        selectedButton.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>');
        
        // Highlight the correct one
        buttons.forEach(btn => {
            const txt = btn.querySelector('.option-txt-content').textContent;
            if (txt === correctText) {
                btn.classList.add('correct-choice');
            }
        });

        // Show incorrect feedback
        quizFeedbackBanner.className = 'quiz-feedback incorrect';
        quizFeedbackIcon.textContent = '✗';
        quizFeedbackText.textContent = 'Incorrect Answer.';

        // Store incorrect item details
        const cardIndex = quizQuestions[currentQuestionIndex].id;
        incorrectQuizCards.push(flashcards[cardIndex]);
    }
    
    quizFeedbackBanner.classList.remove('hidden');
    quizNextBtn.disabled = false;
}

// Next question routing
function goToNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizSessionTotal) {
        displayQuestion();
    } else {
        finishQuizSession();
    }
}

// Calculate score & call recommend engine
async function finishQuizSession() {
    setQuizUIState('result');
    
    // Save accuracy parameters
    const accuracyPercentage = quizSessionTotal > 0 ? Math.round((correctAnswersCount / quizSessionTotal) * 100) : 0;
    quizResultScore.textContent = `${correctAnswersCount} / ${quizSessionTotal}`;
    quizResultPercentage.textContent = `${accuracyPercentage}% Accuracy`;
    
    // Set icon graphic based on accuracy
    if (accuracyPercentage >= 80) {
        quizResultIcon.textContent = '🏆';
        quizResultHeadline.textContent = 'Outstanding Job!';
    } else if (accuracyPercentage >= 50) {
        quizResultIcon.textContent = '🥈';
        quizResultHeadline.textContent = 'Good Effort!';
    } else {
        quizResultIcon.textContent = '📚';
        quizResultHeadline.textContent = 'Keep Practicing!';
    }

    // Persist stats in local storage
    let prevAttempts = parseInt(localStorage.getItem('quizAttempts') || '0', 10);
    prevAttempts += 1;
    localStorage.setItem('quizAttempts', prevAttempts);
    localStorage.setItem('quizAccuracy', `${accuracyPercentage}%`);

    // Render wrong answers list
    quizReviewList.innerHTML = '';
    if (incorrectQuizCards.length === 0) {
        quizReviewList.innerHTML = '<p class="tip-placeholder" style="text-align:center;">Flawless session! No incorrect cards to review.</p>';
    } else {
        incorrectQuizCards.forEach(card => {
            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
                <div class="review-question">${escapeHTML(card.question)}</div>
                <div class="review-ans-row">Correct Answer: <span class="review-correct">${escapeHTML(card.answer)}</span></div>
            `;
            quizReviewList.appendChild(item);
        });
    }

    // Request AI recommendations from backend
    try {
        const response = await fetch(`${API_URL}/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incorrect_cards: incorrectQuizCards })
        });
        
        if (response.ok) {
            const data = await response.json();
            updateRecommendationsUI(data.weak_topics, data.recommendations);
        }
    } catch (e) {
        console.error("Failed to fetch recommendations:", e);
    }
    
    updateDashboardUI();
}

// Update dashboard suggestions
function updateRecommendationsUI(weakTopics, recommendations) {
    // 1. Render weak topics cloud
    weakTopicsCloud.innerHTML = '';
    if (!weakTopics || weakTopics.length === 0) {
        weakTopicsCloud.innerHTML = '<span class="placeholder-text">None detected. Excellent work!</span>';
    } else {
        weakTopics.forEach(topic => {
            const tag = document.createElement('span');
            tag.className = 'topic-tag';
            tag.textContent = topic;
            weakTopicsCloud.appendChild(tag);
        });
    }

    // 2. Render tips list
    recommendationsList.innerHTML = '';
    if (!recommendations || recommendations.length === 0) {
        recommendationsList.innerHTML = '<li class="tip-placeholder">No recommendations needed. You are ready!</li>';
    } else {
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }
}

// Prevent HTML injections
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function logout() {
    localStorage.removeItem("email");
    window.location.href = "login.html";
}
