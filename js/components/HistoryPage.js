import useStore from '../store.js';

const { ref, onMounted, computed } = Vue;

export default {
  emits: ['navigate'],
  setup(props, { emit }) {
    const { history, setCurrentReading, clearHistory: clearHistoryAction, loadHistory } = useStore();
    const showConfirmModal = ref(false);

    const totalReadings = computed(() => history.value.length);

    const favoriteSpread = computed(() => {
      if (history.value.length === 0) return '-';
      const spreadCounts = history.value.reduce((acc, reading) => {
        acc[reading.spreadName] = (acc[reading.spreadName] || 0) + 1;
        return acc;
      }, {});
      const favSpread = Object.keys(spreadCounts).reduce((a, b) => spreadCounts[a] > spreadCounts[b] ? a : b);
      return favSpread.length > 8 ? favSpread.substring(0, 8) + '...' : favSpread;
    });

    const daysSinceLastReading = computed(() => {
      if (history.value.length === 0) return '-';
      const lastReadingDate = new Date(history.value[0].date);
      const today = new Date();
      return Math.floor((today - lastReadingDate) / (1000 * 60 * 60 * 24));
    });

    function viewReading(reading) {
      setCurrentReading(reading);
      emit('navigate', '/reading');
    }

    function confirmClearHistory() {
        showConfirmModal.value = true;
    }

    function clearHistory() {
      clearHistoryAction();
      showConfirmModal.value = false;
    }

    function newReading() {
      emit('navigate', '/');
    }

    function goBack() {
        emit('navigate', '/');
    }

    onMounted(() => {
      loadHistory(); // Ensure history is fresh on mount
      anime({
          targets: '.fade-in',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          delay: anime.stagger(100)
      });
    });

    return {
      history,
      totalReadings,
      favoriteSpread,
      daysSinceLastReading,
      viewReading,
      showConfirmModal,
      confirmClearHistory,
      clearHistory,
      newReading,
      goBack,
      formatDate: (date) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  },
  template: `
    <!-- Header -->
    <header class="px-4 py-6 text-center fade-in">
        <button @click="goBack" class="absolute left-4 top-6 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h1 class="text-xl font-bold golden-text">История предсказаний</h1>
        <p class="text-gray-400 text-sm">Ваши прошлые расклады</p>
    </header>

    <!-- Stats Section -->
    <section class="px-4 mb-6 fade-in">
        <div class="grid grid-cols-3 gap-3">
            <div class="history-card rounded-xl p-4 text-center">
                <div class="text-2xl font-bold golden-text">{{ totalReadings }}</div>
                <div class="text-xs text-gray-400">Всего</div>
            </div>
            <div class="history-card rounded-xl p-4 text-center">
                <div class="text-2xl font-bold golden-text">{{ favoriteSpread }}</div>
                <div class="text-xs text-gray-400">Любимый</div>
            </div>
            <div class="history-card rounded-xl p-4 text-center">
                <div class="text-2xl font-bold golden-text">{{ daysSinceLastReading }}</div>
                <div class="text-xs text-gray-400">Дней назад</div>
            </div>
        </div>
    </section>

    <!-- History List -->
    <main class="px-4 pb-24">
        <div v-if="history.length > 0" class="space-y-4">
            <div v-for="(reading, index) in history" :key="index" class="history-card rounded-xl p-4 fade-in">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="font-semibold text-white">{{ reading.spreadName }}</h3>
                        <p class="text-sm text-gray-400">{{ formatDate(reading.date) }}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">{{ reading.cards.length }} карт</span>
                        <button @click="viewReading(reading)" class="text-gray-400 hover:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="flex space-x-2 overflow-x-auto pb-2">
                    <div v-for="card in reading.cards" :key="card.name" class="mini-card">
                        <img :src="card.image" :alt="card.name">
                    </div>
                </div>
                <div class="mt-3 text-xs text-gray-400">
                    {{ reading.cards.map(card => card.name).join(', ') }}
                </div>
            </div>
            <button @click="confirmClearHistory" class="w-full bg-red-600 text-white font-semibold py-3 rounded-xl mt-6">
                🗑️ Очистить историю
            </button>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state rounded-xl p-8 text-center fade-in">
            <div class="text-4xl mb-4">🔮</div>
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Нет предсказаний</h3>
            <p class="text-gray-400 text-sm mb-6">Сделайте свой первый расклад, чтобы увидеть историю</p>
            <button @click="newReading" class="golden-gradient text-white font-semibold py-3 px-6 rounded-lg">
                Новое предсказание
            </button>
        </div>
    </main>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 mx-4 max-w-sm w-full">
            <h3 class="text-lg font-semibold text-white mb-2">Очистить историю?</h3>
            <p class="text-gray-400 text-sm mb-6">Все сохраненные предсказания будут удалены безвозвратно.</p>
            <div class="flex space-x-3">
                <button @click="showConfirmModal = false" class="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg">Отмена</button>
                <button @click="clearHistory" class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg">Очистить</button>
            </div>
        </div>
    </div>
  `
};