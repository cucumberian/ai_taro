const { reactive, toRefs } = Vue;

const state = reactive({
  history: [],
  currentReading: null,
  selectedSpread: 'single'
});

function loadHistory() {
  state.history = JSON.parse(localStorage.getItem('taroHistory') || '[]');
}

function saveHistory() {
  localStorage.setItem('taroHistory', JSON.stringify(state.history));
}

function selectSpread(spreadType) {
  state.selectedSpread = spreadType;
  localStorage.setItem('selectedSpread', spreadType);
}

function setCurrentReading(readingData) {
  state.currentReading = readingData;
  localStorage.setItem('currentReading', JSON.stringify(readingData));

  // Add to history
  state.history.unshift(readingData);
  if (state.history.length > 10) {
    state.history.pop();
  }
  saveHistory();
}

function clearHistory() {
  state.history = [];
  saveHistory();
}

// Load initial state
loadHistory();
state.selectedSpread = localStorage.getItem('selectedSpread') || 'single';
const storedCurrentReading = localStorage.getItem('currentReading');
if (storedCurrentReading) {
    state.currentReading = JSON.parse(storedCurrentReading);
}


export default function useStore() {
  return {
    ...toRefs(state),
    selectSpread,
    setCurrentReading,
    clearHistory,
    loadHistory
  };
}