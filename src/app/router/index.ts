import { createRouter, createWebHashHistory } from 'vue-router';
import SplitViewPage from '@/pages/SplitViewPage.vue';
import TikTokPage from '@/pages/TikTokPage.vue';
import InstagramPage from '@/pages/InstagramPage.vue';
import AnalyticsPage from '@/pages/AnalyticsPage.vue';
import YouTubeAmbientPage from '@/pages/YouTubeAmbientPage.vue';
import YouTubeFavoritesPage from '@/pages/YouTubeFavoritesPage.vue';
import AuthPage from '@/pages/AuthPage.vue';
import UsersPage from '@/pages/UsersPage.vue';
import { getCookie, JWT_COOKIE_NAME } from '@/shared/lib/cookie';

const routes = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthPage,
    meta: { title: 'Sword — Вход и Регистрация', public: true },
  },
  {
    path: '/',
    name: 'split-view',
    component: SplitViewPage,
    meta: { title: 'Sword — Split View (TikTok & Instagram)' },
  },
  {
    path: '/tiktok',
    name: 'tiktok',
    component: TikTokPage,
    meta: { title: 'Sword — TikTok Trends' },
  },
  {
    path: '/instagram',
    name: 'instagram',
    component: InstagramPage,
    meta: { title: 'Sword — Instagram Reels' },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsPage,
    meta: { title: 'Sword — Analytics & Comparison' },
  },
  {
    path: '/youtube',
    name: 'youtube-ambient',
    component: YouTubeAmbientPage,
    meta: { title: 'Sword — YouTube Ambient, Dreamcore & Coldcore (>1h)' },
  },
  {
    path: '/youtube/favorites',
    name: 'youtube-favorites',
    component: YouTubeFavoritesPage,
    meta: { title: 'Sword — Избранные YouTube сеты (>1h)' },
  },
  {
    path: '/users',
    name: 'users',
    component: UsersPage,
    meta: { title: 'Sword — Пользователи платформы' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

/**
 * Global Navigation Guard:
 * Unauthenticated users are redirected from ANY URL to /auth.
 * Authenticated users visiting /auth are redirected to home page.
 */
router.beforeEach((to, from, next) => {
  const hasToken = !!getCookie(JWT_COOKIE_NAME);
  const isAuthPage = to.path === '/auth';

  if (!hasToken) {
    if (isAuthPage) {
      next();
    } else {
      next({ path: '/auth', query: { redirect: to.fullPath } });
    }
  } else {
    if (isAuthPage) {
      next({ path: '/' });
    } else {
      next();
    }
  }
});

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
