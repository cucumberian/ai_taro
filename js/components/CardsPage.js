import useStore from '../store.js';

const { ref, onMounted, computed } = Vue;

const spreads = {
    single: { name: "Карта дня", cards: 1 },
    celtic: { name: "Кельтский крест", cards: 10 },
    love: { name: "Отношения", cards: 6 },
    career: { name: "Карьера", cards: 7 },
};

export default {
  emits: ['navigate'],
  setup(props, { emit }) {
    const { selectedSpread, setCurrentReading } = useStore();

    const tarotCards = ref([]);
    const currentSpread = computed(() => spreads[selectedSpread.value]);
    const localSelectedCards = ref([]);
    const shuffledDeck = ref([]);
    const fullscreenCard = ref(null);

    const cardsNeeded = computed(() => currentSpread.value.cards);
    const cardsSelectedCount = computed(() => localSelectedCards.value.length);
    const progress = computed(() => (cardsSelectedCount.value / cardsNeeded.value) * 100);

    async function loadCardData() {
        try {
            const response = await fetch("data/cards.json");
            tarotCards.value = await response.json();
            shuffleCards();
        } catch (error) {
            console.error("Failed to load card data:", error);
        }
    }

    function shuffleCards() {
        shuffledDeck.value = [...tarotCards.value].sort(() => Math.random() - 0.5).slice(0, 22);
    }

    function selectCard(cardData, index) {
        const cardElement = document.querySelector(`[data-card-index="${index}"]`);

        if (cardElement.classList.contains("flipped")) {
            showCardFullscreen(cardData);
            return;
        }

        if (localSelectedCards.value.length >= cardsNeeded.value) {
            return;
        }

        localSelectedCards.value.push(cardData);

        anime({
            targets: cardElement,
            rotateY: 180,
            duration: 600,
            easing: "easeInOutQuad",
            complete: () => {
                cardElement.classList.add("flipped", "card-selected");
                showCardFullscreen(cardData);
            },
        });
    }

    function getReading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if(loadingOverlay) loadingOverlay.classList.remove('hidden');

        const readingData = {
            spreadType: selectedSpread.value,
            spreadName: currentSpread.value.name,
            cards: localSelectedCards.value,
            date: new Date().toISOString(),
        };

        setCurrentReading(readingData);

        setTimeout(() => {
            if(loadingOverlay) loadingOverlay.classList.add('hidden');
            emit('navigate', '/reading');
        }, 2000);
    }

    function showCardFullscreen(card) {
        fullscreenCard.value = card;
    }

    function hideCardFullscreen() {
        fullscreenCard.value = null;
    }

    function goBack() {
        emit('navigate', '/');
    }

    onMounted(() => {
        loadCardData();
        localSelectedCards.value = []; // Reset on mount
        anime({
            targets: ".fade-in",
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            delay: anime.stagger(100),
        });
    });

    return {
        currentSpread,
        cardsNeeded,
        cardsSelectedCount,
        progress,
        shuffledDeck,
        selectedCards: localSelectedCards,
        selectCard,
        getReading,
        goBack,
        fullscreenCard,
        showCardFullscreen,
        hideCardFullscreen
    };
  },
  template: `
    <!-- Header -->
    <header class="px-4 py-6 text-center fade-in">
        <button @click="goBack" class="absolute left-4 top-6 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>
        <h1 class="text-xl font-bold golden-text">Выбор карт</h1>
        <p class="text-gray-400 text-sm">{{ currentSpread.name }}</p>
    </header>

    <!-- Spread Info -->
    <div class="spread-info mx-4 mb-6 rounded-xl p-4 fade-in">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-400">Необходимо выбрать:</span>
            <span class="text-sm font-semibold golden-text">{{ cardsNeeded }}</span>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-400">Выбрано:</span>
            <span class="text-sm font-semibold text-white">{{ cardsSelectedCount }}</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div class="golden-gradient h-2 rounded-full transition-all duration-300" :style="{width: progress + '%'}"></div>
        </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-4 gap-3 justify-items-center fade-in px-4">
        <div v-for="(card, index) in shuffledDeck" :key="card.name"
             class="tarot-card"
             :data-card-index="index"
             @click="selectCard(card, index)">
            <div class="card-front">
                <div class="w-full h-full golden-gradient rounded-lg flex items-center justify-center">
                    <span class="text-2xl">✨</span>
                </div>
            </div>
            <div class="card-back">
                <img :src="card.image" :alt="card.name" class="rounded-lg">
            </div>
        </div>
    </div>

    <!-- Selected Cards Display -->
    <div v-if="selectedCards.length > 0" class="mt-8 px-4">
        <h3 class="text-lg font-semibold text-gray-300 mb-4">Выбранные карты</h3>
        <div class="flex space-x-2 overflow-x-auto pb-4">
            <div v-for="card in selectedCards" :key="card.name" @click="showCardFullscreen(card)" class="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer">
                <img :src="card.image" :alt="card.name" class="w-full h-full object-cover">
                <p class="text-xs text-center mt-1 text-gray-400">{{ card.name }}</p>
            </div>
        </div>
    </div>

    <!-- Get Reading Button -->
    <div class="px-4">
        <button v-if="cardsSelectedCount === cardsNeeded" @click="getReading" class="w-full golden-gradient text-white font-semibold py-4 rounded-xl mt-6 fade-in">
            Получить предсказание
        </button>
    </div>

    <!-- Loading Overlay -->
    <div id="loading-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-gray-800 rounded-xl p-6 text-center">
            <div class="w-12 h-12 golden-gradient rounded-full flex items-center justify-center mx-auto mb-4 loading-spinner">
                <span class="text-xl">🔮</span>
            </div>
            <p class="text-white font-semibold">Тасую карты...</p>
            <p class="text-gray-400 text-sm">Приготовьтесь к предсказанию</p>
        </div>
    </div>

    <!-- Card Fullscreen Overlay -->
    <div v-if="fullscreenCard" @click="hideCardFullscreen" class="fullscreen-overlay visible">
        <div class="fullscreen-content">
            <img :src="fullscreenCard.image" :alt="fullscreenCard.name" class="fullscreen-card-image">
        </div>
        <div class="card-description">
            <h3 class="text-2xl font-bold golden-text mb-2">{{ fullscreenCard.name }}</h3>
            <p class="text-gray-300 text-sm leading-relaxed">{{ fullscreenCard.full_meaning || fullscreenCard.meaning }}</p>
        </div>
    </div>
  `
};