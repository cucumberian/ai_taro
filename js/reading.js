let currentReading = null;

document.addEventListener('DOMContentLoaded', function() {
    loadReading();
    if (currentReading) {
        displayCards();
        generateReading();
        setupEventListeners();
        runAnimations();
    }
});

function runAnimations() {
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
}

function loadReading() {
    const readingData = localStorage.getItem('currentReading');
    if (!readingData) {
        window.location.href = 'index.html';
        return;
    }

    currentReading = JSON.parse(readingData);
    document.getElementById('spread-type').textContent = currentReading.spreadName;
}

function displayCards() {
    const container = document.getElementById('cards-display');
    container.innerHTML = '';

    currentReading.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-position flex-shrink-0';

        cardElement.innerHTML = `
            <div class="tarot-card-display mystical-glow">
                <img src="${card.image}" alt="${card.name}">
            </div>
            <div class="position-number">${index + 1}</div>
            <p class="text-xs text-center mt-2 text-gray-300">${card.name}</p>
        `;

        container.appendChild(cardElement);
    });
}

function generateReading() {
    const spreadType = currentReading.spreadType;
    const cards = currentReading.cards;

    const generalReading = generateGeneralReading(cards);
    document.getElementById('general-reading').textContent = generalReading;

    generateIndividualCards(cards, spreadType);

    const advice = generateAdvice(cards);
    document.getElementById('advice-reading').textContent = advice;
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
    const container = document.getElementById('individual-cards');
    container.innerHTML = '';

    const positions = {
        single: ['Карта дня'],
        celtic: ['1. Настоящий момент', '2. Препятствие', '3. Основа ситуации', '4. Недавнее прошлое', '5. Возможный исход', '6. Ближайшее будущее', '7. Ваше отношение', '8. Внешние влияния', '9. Надежды и страхи', '10. Окончательный итог'],
        love: ['1. Ваша роль', '2. Роль партнера', '3. Суть отношений', '4. Что укрепляет союз', '5. Что ослабляет союз', '6. Перспектива'],
        career: ['1. Текущая позиция', '2. Ваши амбиции', '3. Препятствия', '4. Ваши сильные стороны', '5. Что нужно развить', '6. Следующий шаг', '7. Потенциальный результат']
    };

    const spreadPositions = positions[spreadType] || cards.map((_, i) => `Позиция ${i + 1}`);

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'reading-card rounded-xl p-6';

        const positionTitle = spreadPositions[index] || `Позиция ${index + 1}`;
        const interpretation = card.full_meaning || card.meaning;

        cardElement.innerHTML = `
            <div class="flex items-start space-x-4">
                <div class="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src="${card.image}" alt="${card.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-white mb-1">${card.name}</h4>
                    <p class="text-sm golden-text mb-2">${positionTitle}</p>
                    <p class="text-gray-300 text-sm leading-relaxed">${interpretation}</p>
                </div>
            </div>
        `;

        container.appendChild(cardElement);
    });
}

function generateAdvice(cards) {
    let advice = '';
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
        advice = "Расклад в целом благоприятен. Карты советуют вам действовать смело и с оптимизмом. Доверяйте своим силам и идите к цели, сейчас для этого подходящее время.";
    } else if (challengingScore > positiveScore) {
        advice = "Карты указывают на наличие трудностей. Вам рекомендуется проявить осторожность, терпение и мудрость. Не торопите события и обдумайте каждый шаг. Это время для внутренней работы и преодоления препятствий.";
    } else {
        advice = "Ситуация неоднозначна и требует баланса. Сочетайте решительные действия с обдуманностью. Прислушивайтесь к своей интуиции, но не забывайте о логике. Гармония между этими аспектами приведет вас к успеху.";
    }

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const adviceSnippets = [
        `Особенно обратите внимание на карту '${randomCard.name}', которая призывает к ${randomCard.meaning.split(',')[0].toLowerCase()}.`,
        `Ключевой совет дает карта '${randomCard.name}': ${randomCard.meaning.split(',')[1] || randomCard.meaning.split(',')[0]}.`,
    ];
    advice += ' ' + adviceSnippets[Math.floor(Math.random() * adviceSnippets.length)];

    return advice;
}

function setupEventListeners() {
    document.getElementById('save-reading-btn').addEventListener('click', saveReading);
    document.getElementById('new-reading-btn').addEventListener('click', newReading);
    document.getElementById('share-reading-btn').addEventListener('click', shareReading);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            navigateToPage(this.dataset.page);
        });
    });

    const backButton = document.querySelector('header button');
    if (backButton) {
        backButton.onclick = goBack;
    }
}

function saveReading() {
    showSuccessMessage();
}

function newReading() {
    window.location.href = 'index.html';
}

function shareReading() {
    const shareText = `Моё таро-предсказание (${currentReading.spreadName}): ${currentReading.cards.map(card => card.name).join(', ')}`;

    if (navigator.share) {
        navigator.share({
            title: 'Taro Telegram - Моё предсказание',
            text: shareText
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showMessage('Предсказание скопировано в буфер обмена');
        });
    }
}

function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.classList.remove('hidden');

    anime({
        targets: message,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 300,
        complete: function() {
            setTimeout(() => {
                anime({
                    targets: message,
                    opacity: 0,
                    translateY: -20,
                    duration: 300,
                    complete: function() {
                        message.classList.add('hidden');
                    }
                });
            }, 3000);
        }
    });
}

function showMessage(message) {
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
    if (pageMap[page]) {
        window.location.href = pageMap[page];
    }
}

function goBack() {
    window.location.href = 'cards.html';
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateGeneralReading,
        generateAdvice,
        generateIndividualCards,
        loadReading,
        displayCards,
        generateReading
    };
}