import { createRouter, createWebHashHistory } from 'vue-router';
import SplitViewPage from '@/pages/SplitViewPage.vue';
import TikTokPage from '@/pages/TikTokPage.vue';
import InstagramPage from '@/pages/InstagramPage.vue';
import AnalyticsPage from '@/pages/AnalyticsPage.vue';

const routes = [
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

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
