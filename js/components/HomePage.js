import useStore from '../store.js';

const { onMounted, computed } = Vue;

export default {
  emits: ['navigate'],
  setup(props, { emit }) {
    const { history, selectSpread: selectSpreadAction } = useStore();

    const spreads = [
        { id: 'single', name: 'Карта дня', description: 'Быстрое предсказание на день', cards: '1 карта', icon: '🌟', animation: 'slide-in-left' },
        { id: 'celtic', name: 'Кельтский крест', description: 'Полный анализ ситуации', cards: '10 карт', icon: '✨', animation: 'slide-in-right' },
        { id: 'love', name: 'Отношения', description: 'Анализ любовных отношений', cards: '6 карт', icon: '💕', animation: 'slide-in-left' },
        { id: 'career', name: 'Карьера', description: 'Профессиональные перспективы', cards: '7 карт', icon: '💼', animation: 'slide-in-right' }
    ];

    const recentHistory = computed(() => history.value.slice(0, 3));

    function selectSpread(spreadType) {
      const card = document.querySelector(`[data-spread="${spreadType}"]`);

      anime({
          targets: card,
          scale: [1, 0.95, 1],
          duration: 200,
          complete: function() {
              selectSpreadAction(spreadType);
              emit('navigate', '/cards');
          }
      });
    }

    onMounted(() => {
      // Animate elements on load
      anime.timeline()
          .add({
              targets: '.fade-in',
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 800,
              delay: anime.stagger(100)
          })
          .add({
              targets: '.slide-in-left',
              opacity: [0, 1],
              translateX: [-50, 0],
              duration: 600,
              delay: anime.stagger(100)
          }, '-=400')
          .add({
              targets: '.slide-in-right',
              opacity: [0, 1],
              translateX: [50, 0],
              duration: 600,
              delay: anime.stagger(100)
          }, '-=400');
    });

    return {
      recentHistory,
      spreads,
      selectSpread,
      formatDate: (date) => new Date(date).toLocaleDateString()
    };
  },
  template: `
    <!-- Header -->
    <header class="px-4 py-6 text-center fade-in">
        <h1 class="text-3xl font-bold golden-text mb-2">Taro Telegram</h1>
        <p class="text-gray-400 text-sm">Откройте тайны судьбы</p>
    </header>

    <!-- Hero Section -->
    <section class="text-center mb-8 fade-in">
        <div class="w-24 h-24 mx-auto mb-4 golden-gradient rounded-full flex items-center justify-center">
            <span class="text-2xl">🔮</span>
        </div>
        <h2 class="text-xl font-semibold mb-2">Добро пожаловать в мир таро</h2>
        <p class="text-gray-400 text-sm">Выберите расклад и получите предсказание</p>
    </section>

    <!-- Tarot Spreads -->
    <section class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-300 mb-4 slide-in-left">Доступные расклады</h3>

        <div v-for="spread in spreads" :key="spread.id"
             class="tarot-spread-card bg-gray-800 rounded-xl p-4 card-hover"
             :class="spread.animation"
             :data-spread="spread.id"
             @click="selectSpread(spread.id)">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 golden-gradient rounded-lg flex items-center justify-center">
                    <span class="text-lg">{{ spread.icon }}</span>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-white mb-1">{{ spread.name }}</h4>
                    <p class="text-gray-400 text-sm">{{ spread.description }}</p>
                    <span class="text-xs text-gray-500">{{ spread.cards }}</span>
                </div>
                <div class="text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        </div>
    </section>

    <!-- History Section -->
    <section class="mt-8">
        <h3 class="text-lg font-semibold text-gray-300 mb-4 slide-in-left">История предсказаний</h3>
        <div class="space-y-3">
            <div v-if="recentHistory.length === 0" class="bg-gray-800 rounded-lg p-3 text-center">
                <p class="text-gray-400 text-sm">История предсказаний появится здесь</p>
            </div>
            <div v-else v-for="item in recentHistory" :key="item.date" class="bg-gray-800 rounded-lg p-3">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm font-medium text-white">{{ item.spreadName }}</p>
                        <p class="text-xs text-gray-400">{{ formatDate(item.date) }}</p>
                    </div>
                    <span class="text-xs text-gray-500">{{ item.cards.length }} карт</span>
                </div>
            </div>
        </div>
    </section>
  `
};