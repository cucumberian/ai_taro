// Spread configurations
const spreads = {
    single: { name: 'Карта дня', cards: 1 },
    celtic: { name: 'Кельтский крест', cards: 10 },
    love: { name: 'Отношения', cards: 6 },
    career: { name: 'Карьера', cards: 7 }
};

let tarotCards = [];
let selectedSpread = localStorage.getItem('selectedSpread') || 'single';
let selectedCards = [];
let currentSpread = spreads[selectedSpread];

// Modal elements
let modal, modalImage, modalName, modalMeaning, modalCloseBtn;

document.addEventListener('DOMContentLoaded', async function() {
    await loadCardData();
    initializePage();
    generateCards();
    setupEventListeners();
    setupModal(); // Initialize modal elements and listeners

    // Animate elements
    anime({
        targets: '.fade-in',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: anime.stagger(100)
    });
});

async function loadCardData() {
    try {
        const response = await fetch('data/cards.json');
        tarotCards = await response.json();
    } catch (error) {
        console.error('Failed to load card data:', error);
        showMessage('Не удалось загрузить данные карт. Пожалуйста, попробуйте позже.');
    }
}

function initializePage() {
    document.getElementById('spread-name').textContent = currentSpread.name;
    document.getElementById('cards-needed').textContent = currentSpread.cards;
}

function generateCards() {
    const container = document.getElementById('cards-container');
    const shuffledCards = [...tarotCards].sort(() => Math.random() - 0.5);

    container.innerHTML = '';

    // Ensure we have enough cards to avoid errors
    if (shuffledCards.length < 22) {
        console.error("Not enough cards in data source.");
        return;
    }

    for (let i = 0; i < 22; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'tarot-card';
        cardElement.dataset.cardIndex = i;
        cardElement.dataset.cardId = shuffledCards[i].name;

        cardElement.innerHTML = `
            <div class="card-front">
                <div class="w-full h-full golden-gradient rounded-lg flex items-center justify-center">
                    <span class="text-2xl">✨</span>
                </div>
            </div>
            <div class="card-back">
                <img src="${shuffledCards[i].image}" alt="${shuffledCards[i].name}" class="rounded-lg">
            </div>
        `;

        container.appendChild(cardElement);
    }
}

function setupEventListeners() {
    document.querySelectorAll('.tarot-card').forEach(card => {
        card.addEventListener('click', function() {
            selectCard(this);
        });
    });

    document.getElementById('get-reading-btn').addEventListener('click', function() {
        getReading();
    });

    // Navigation handlers
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateToPage(page);
        });
    });

    const backButton = document.querySelector('header button');
    if (backButton) {
        backButton.onclick = goBack;
    }
}

function selectCard(cardElement) {
    const cardName = cardElement.dataset.cardId;
    const cardData = tarotCards.find(card => card.name === cardName);

    if (cardElement.classList.contains('flipped')) {
        // If card is already flipped, just show the modal
        showCardModal(cardData);
        return;
    }

    if (selectedCards.length >= currentSpread.cards) {
        showMessage('Вы уже выбрали достаточно карт');
        return;
    }

    // Add card to selected list
    selectedCards.push(cardData);

    // Flip card animation
    anime({
        targets: cardElement,
        rotateY: 180,
        duration: 600,
        easing: 'easeInOutQuad',
        complete: function() {
            cardElement.classList.add('flipped', 'card-selected');
            // Show modal after animation
            showCardModal(cardData);
        }
    });

    updateProgress();
    updateSelectedCardsDisplay();
}

function updateProgress() {
    const selected = selectedCards.length;
    const needed = currentSpread.cards;
    const progress = (selected / needed) * 100;

    document.getElementById('cards-selected').textContent = selected;
    document.getElementById('progress-bar').style.width = progress + '%';

    if (selected === needed) {
        document.getElementById('get-reading-btn').classList.remove('hidden');
        anime({
            targets: '#get-reading-btn',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500
        });
    }
}

function updateSelectedCardsDisplay() {
    const container = document.getElementById('selected-cards-display');
    const cardsContainer = document.getElementById('selected-cards-container');

    if (selectedCards.length > 0) {
        container.classList.remove('hidden');

        cardsContainer.innerHTML = '';
        selectedCards.forEach((card) => {
            const cardElement = document.createElement('div');
            // Make the preview clickable
            cardElement.className = 'flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer';
            cardElement.innerHTML = `
                <img src="${card.image}" alt="${card.name}" class="w-full h-full object-cover">
                <p class="text-xs text-center mt-1 text-gray-400">${card.name}</p>
            `;
            // Add listener to show modal on click
            cardElement.addEventListener('click', () => showCardModal(card));
            cardsContainer.appendChild(cardElement);
        });
    }
}

function getReading() {
    // Show loading
    document.getElementById('loading-overlay').classList.remove('hidden');

    // Save reading data
    const readingData = {
        spreadType: selectedSpread,
        spreadName: currentSpread.name,
        cards: selectedCards,
        date: new Date().toISOString()
    };

    localStorage.setItem('currentReading', JSON.stringify(readingData));

    // Save to history
    const history = JSON.parse(localStorage.getItem('taroHistory') || '[]');
    history.unshift(readingData);
    if (history.length > 10) history.pop(); // Keep only last 10
    localStorage.setItem('taroHistory', JSON.stringify(history));

    // Navigate to reading page after delay
    setTimeout(() => {
        window.location.href = 'reading.html';
    }, 2000);
}

function showMessage(message) {
    // Simple toast message
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-4 right-4 bg-gray-800 text-white p-3 rounded-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);

    anime({
        targets: toast,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 300,
        complete: function() {
            setTimeout(() => {
                anime({
                    targets: toast,
                    opacity: 0,
                    translateY: -20,
                    duration: 300,
                    complete: function() {
                        document.body.removeChild(toast);
                    }
                });
            }, 2000);
        }
    });
}

function navigateToPage(page) {
    const pageMap = {
        home: 'index.html',
        cards: 'cards.html',
        history: 'history.html'
    };
    if (pageMap[page] && window.location.pathname.indexOf(pageMap[page]) === -1) {
        window.location.href = pageMap[page];
    }
}

function goBack() {
    window.location.href = 'index.html';
}

// --- Modal Logic ---

function setupModal() {
    modal = document.getElementById('card-modal');
    modalImage = document.getElementById('modal-card-image');
    modalName = document.getElementById('modal-card-name');
    modalMeaning = document.getElementById('modal-card-meaning');
    modalCloseBtn = document.getElementById('modal-close-btn');

    // Close modal when clicking the overlay or the close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideCardModal();
        }
    });
    modalCloseBtn.addEventListener('click', hideCardModal);
}

function showCardModal(card) {
    if (!card) return;
    modalImage.src = card.image;
    modalImage.alt = card.name;
    modalName.textContent = card.name;
    modalMeaning.textContent = card.full_meaning || card.meaning; // Use full meaning
    modal.classList.add('visible');
}

function hideCardModal() {
    modal.classList.remove('visible');
}

// Export functions for testing if needed in the future
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        spreads,
        loadCardData,
        initializePage,
        generateCards,
        selectCard,
        getReading,
        showCardModal,
        hideCardModal
    };
}