import HomePage from './components/HomePage.js';
import CardsPage from './components/CardsPage.js';
import ReadingPage from './components/ReadingPage.js';
import HistoryPage from './components/HistoryPage.js';
import NavigationBar from './components/NavigationBar.js';

const { createApp, ref, computed, onMounted } = Vue;

const routes = {
  '/': HomePage,
  '/cards': CardsPage,
  '/reading': ReadingPage,
  '/history': HistoryPage,
};

const app = createApp({
  setup() {
    const currentPath = ref(window.location.hash.slice(1) || '/');

    const currentView = computed(() => {
      return routes[currentPath.value] || HomePage;
    });

    function navigate(path) {
      window.location.hash = path;
      currentPath.value = path;
    }

    onMounted(() => {
      window.addEventListener('hashchange', () => {
        currentPath.value = window.location.hash.slice(1) || '/';
      });

      // Particle background initialization
      if (window.PIXI) {
        initParticles();
      }
    });

    function initParticles() {
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1a1a1a,
            backgroundAlpha: 0
        });

        const container = document.getElementById('particle-container');
        if (container.children.length > 0) {
            container.innerHTML = ''; // Clear previous canvas if any
        }
        container.appendChild(app.view);

        const particles = [];
        for (let i = 0; i < 50; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xd4af37, 0.3);
            particle.drawCircle(0, 0, Math.random() * 2 + 1);
            particle.endFill();

            particle.x = Math.random() * app.screen.width;
            particle.y = Math.random() * app.screen.height;
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = (Math.random() - 0.5) * 0.5;

            app.stage.addChild(particle);
            particles.push(particle);
        }

        app.ticker.add(() => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0) particle.x = app.screen.width;
                if (particle.x > app.screen.width) particle.x = 0;
                if (particle.y < 0) particle.y = app.screen.height;
                if (particle.y > app.screen.height) particle.y = 0;
            });
        });
    }

    return {
      currentView,
      navigate,
      currentPath
    };
  },
  components: {
    NavigationBar
  },
  template: `
    <main class="px-4 pb-24">
        <component :is="currentView" @navigate="navigate"></component>
    </main>
    <navigation-bar :current-path="currentPath" @navigate="navigate"></navigation-bar>
  `
});

app.mount('#app');