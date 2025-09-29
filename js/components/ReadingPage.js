import useStore from '../store.js';

const { ref, onMounted, computed, watch } = Vue;

export default {
  emits: ['navigate'],
  setup(props, { emit }) {
    const { currentReading, setCurrentReading } = useStore();

    const fullscreenCard = ref(null);
    const successMessageVisible = ref(false);

    const generalInterpretation = ref('');
    const individualInterpretations = ref([]);
    const advice = ref('');

    function generateReading() {
        if (!currentReading.value) return;
        const cards = currentReading.value.cards;
        generalInterpretation.value = generateGeneralReading(cards);
        individualInterpretations.value = generateIndividualCards(cards, currentReading.value.spreadType);
        advice.value = generateAdvice(cards);
    }

    function generateGeneralReading(cards) {
        const majorArcana = cards.filter(c => ['Шут', 'Маг', 'Жрица', 'Императрица', 'Император', 'Жрец', 'Влюбленные', 'Колесница', 'Сила', 'Отшельник', 'Колесо Фортуны', 'Справедливость', 'Повешенный', 'Смерть', 'Умеренность', 'Дьявол', 'Башня', 'Звезда', 'Луна', 'Солнце', 'Суд', 'Мир'].includes(c.name));
        let theme = "Ваш расклад затрагивает несколько ключевых аспектов вашей жизни. ";
        if (majorArcana.length > cards.length / 2) {
            theme = "Ваш расклад указывает на значительные жизненные события и уроки, так как в нем преобладают Старшие Арканы. ";
        }
        const centralCard = cards[Math.floor(cards.length / 2)];
        const conclusionCard = cards[cards.length - 1];
        return theme + `Центральной темой является '${centralCard.name}', что говорит о важности ${centralCard.meaning.toLowerCase()}. Расклад завершается картой '${conclusionCard.name}', указывая на исход, связанный с ${conclusionCard.meaning.toLowerCase()}.`;
    }

    function generateIndividualCards(cards, spreadType) {
        const positions = {
            single: ['Карта дня'],
            celtic: ['1. Настоящий момент', '2. Препятствие', '3. Основа ситуации', '4. Недавнее прошлое', '5. Возможный исход', '6. Ближайшее будущее', '7. Ваше отношение', '8. Внешние влияния', '9. Надежды и страхи', '10. Окончательный итог'],
            love: ['1. Ваша роль', '2. Роль партнера', '3. Суть отношений', '4. Что укрепляет союз', '5. Что ослабляет союз', '6. Перспектива'],
            career: ['1. Текущая позиция', '2. Ваши амбиции', '3. Препятствия', '4. Ваши сильные стороны', '5. Что нужно развить', '6. Следующий шаг', '7. Потенциальный результат']
        };
        const spreadPositions = positions[spreadType] || cards.map((_, i) => `Позиция ${i + 1}`);
        return cards.map((card, index) => ({
            ...card,
            positionTitle: spreadPositions[index] || `Позиция ${index + 1}`,
            interpretation: card.full_meaning || card.meaning
        }));
    }

    function generateAdvice(cards) {
        let adviceText = '';
        const positiveKeywords = ['успех', 'радость', 'надежда', 'сила', 'гармония', 'начало', 'любовь'];
        const challengingKeywords = ['разрушение', 'иллюзия', 'зависимость', 'жертва', 'конец', 'препятствие'];
        let positiveScore = 0;
        let challengingScore = 0;
        cards.forEach(card => {
            const meaning = card.meaning.toLowerCase();
            if (positiveKeywords.some(kw => meaning.includes(kw))) positiveScore++;
            if (challengingKeywords.some(kw => meaning.includes(kw))) challengingScore++;
        });
        if (positiveScore > challengingScore) {
            adviceText = "Расклад в целом благоприятен. Карты советуют вам действовать смело и с оптимизмом. Доверяйте своим силам и идите к цели, сейчас для этого подходящее время.";
        } else if (challengingScore > positiveScore) {
            adviceText = "Карты указывают на наличие трудностей. Вам рекомендуется проявить осторожность, терпение и мудрость. Не торопите события и обдумайте каждый шаг. Это время для внутренней работы и преодоления препятствий.";
        } else {
            adviceText = "Ситуация неоднозначна и требует баланса. Сочетайте решительные действия с обдуманностью. Прислушивайтесь к своей интуиции, но не забывайте о логике. Гармония между этими аспектами приведет вас к успеху.";
        }
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        const adviceSnippets = [
            `Особенно обратите внимание на карту '${randomCard.name}', которая призывает к ${randomCard.meaning.split(',')[0].toLowerCase()}.`,
            `Ключевой совет дает карта '${randomCard.name}': ${randomCard.meaning.split(',')[1] || randomCard.meaning.split(',')[0]}.`,
        ];
        return adviceText + ' ' + adviceSnippets[Math.floor(Math.random() * adviceSnippets.length)];
    }

    function showCardFullscreen(card) {
        fullscreenCard.value = card;
    }

    function hideCardFullscreen() {
        fullscreenCard.value = null;
    }

    function saveReading() {
        successMessageVisible.value = true;
        setTimeout(() => successMessageVisible.value = false, 3000);
    }

    function newReading() {
        emit('navigate', '/');
    }

    function shareReading() {
        const shareText = `Моё таро-предсказание (${currentReading.value.spreadName}): ${currentReading.value.cards.map(card => card.name).join(', ')}`;
        if (navigator.share) {
            navigator.share({ title: 'Taro Telegram - Моё предсказание', text: shareText });
        } else {
            navigator.clipboard.writeText(shareText);
        }
    }

    function goBack() {
        emit('navigate', '/cards');
    }

    watch(currentReading, (newReading) => {
        if (newReading) {
            generateReading();
        } else {
            emit('navigate', '/');
        }
    }, { immediate: true });

    onMounted(() => {
        anime.timeline()
            .add({
                targets: '.fade-in',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                delay: anime.stagger(200)
            })
            .add({
                targets: '.slide-in-up',
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 600
            }, '-=400');
    });

    return {
      currentReading,
      generalInterpretation,
      individualInterpretations,
      advice,
      fullscreenCard,
      successMessageVisible,
      showCardFullscreen,
      hideCardFullscreen,
      saveReading,
      newReading,
      shareReading,
      goBack
    };
  },
  template: `
    <div v-if="currentReading">
        <!-- Header -->
        <header class="px-4 py-6 text-center fade-in">
            <button @click="goBack" class="absolute left-4 top-6 text-gray-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h1 class="text-xl font-bold golden-text">Ваше предсказание</h1>
            <p class="text-gray-400 text-sm">{{ currentReading.spreadName }}</p>
        </header>

        <!-- Selected Cards -->
        <section class="px-4 mb-6 slide-in-up">
            <h2 class="text-lg font-semibold text-gray-300 mb-4">Ваши карты</h2>
            <div class="flex space-x-3 overflow-x-auto pb-4">
                <div v-for="(card, index) in currentReading.cards" :key="index" @click="showCardFullscreen(card)" class="card-position flex-shrink-0 cursor-pointer">
                    <div class="tarot-card-display mystical-glow"><img :src="card.image" :alt="card.name"></div>
                    <div class="position-number">{{ index + 1 }}</div>
                    <p class="text-xs text-center mt-2 text-gray-300">{{ card.name }}</p>
                </div>
            </div>
        </section>

        <!-- Reading Content -->
        <main class="px-4 pb-24 space-y-6">
            <div class="reading-card rounded-xl p-6 fade-in">
                <h3 class="text-lg font-semibold golden-text mb-4">Общая интерпретация</h3>
                <p class="text-gray-300 leading-relaxed">{{ generalInterpretation }}</p>
            </div>

            <div class="space-y-4 fade-in">
                <div v-for="card in individualInterpretations" :key="card.name" @click="showCardFullscreen(card)" class="reading-card rounded-xl p-6 cursor-pointer">
                    <div class="flex items-start space-x-4">
                        <div class="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img :src="card.image" :alt="card.name" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-white mb-1">{{ card.name }}</h4>
                            <p class="text-sm golden-text mb-2">{{ card.positionTitle }}</p>
                            <p class="text-gray-300 text-sm leading-relaxed">{{ card.interpretation }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="reading-card rounded-xl p-6 fade-in">
                <h3 class="text-lg font-semibold golden-text mb-4">Совет карт</h3>
                <p class="text-gray-300 leading-relaxed">{{ advice }}</p>
            </div>

            <div class="space-y-3 fade-in">
                <button @click="saveReading" class="w-full golden-gradient text-white font-semibold py-4 rounded-xl">💾 Сохранить предсказание</button>
                <button @click="newReading" class="w-full bg-gray-700 text-white font-semibold py-4 rounded-xl">🔮 Новое предсказание</button>
                <button @click="shareReading" class="w-full bg-gray-700 text-white font-semibold py-4 rounded-xl">📱 Поделиться предсказанием</button>
            </div>
        </main>

        <!-- Success Message -->
        <div v-if="successMessageVisible" class="fixed top-20 left-4 right-4 bg-green-600 text-white p-4 rounded-lg z-50">
             <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                <span>Предсказание сохранено!</span>
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
    </div>
  `
};