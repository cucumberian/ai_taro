export default {
  props: ['currentPath'],
  emits: ['navigate'],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div class="flex justify-around items-center">
            <button @click="$emit('navigate', '/')" class="nav-btn flex flex-col items-center space-y-1" :class="{'text-golden-400': currentPath === '/', 'text-gray-400': currentPath !== '/'}">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span class="text-xs">Главная</span>
            </button>
            <button @click="$emit('navigate', '/cards')" class="nav-btn flex flex-col items-center space-y-1" :class="{'text-golden-400': currentPath === '/cards', 'text-gray-400': currentPath !== '/cards'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <span class="text-xs">Карты</span>
            </button>
            <button @click="$emit('navigate', '/history')" class="nav-btn flex flex-col items-center space-y-1" :class="{'text-golden-400': currentPath === '/history', 'text-gray-400': currentPath !== '/history'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-xs">История</span>
            </button>
        </div>
    </nav>
  `
};