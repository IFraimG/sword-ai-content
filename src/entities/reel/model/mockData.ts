import type { Reel, NicheInfo, Niche, ContinentInfo, CountryInfo, ContinentId, CountryId } from './types';

export const CONTINENTS: ContinentInfo[] = [
  { id: 'all', label: 'Весь мир (Global)', icon: 'Globe' },
  { id: 'na', label: 'Северная Америка', icon: 'Compass' },
  { id: 'eu', label: 'Европа', icon: 'Landmark' },
  { id: 'asia', label: 'Азия', icon: 'Sun' },
  { id: 'cis', label: 'СНГ и Вост. Европа', icon: 'MapPin' },
  { id: 'latam', label: 'Латинская Америка', icon: 'Palmtree' },
  { id: 'mena', label: 'Ближний Восток (MENA)', icon: 'Flame' },
];

export const COUNTRIES: CountryInfo[] = [
  // North America
  { id: 'us', label: 'США', continent: 'na', flag: '🇺🇸', code: 'USA' },
  { id: 'ca', label: 'Канада', continent: 'na', flag: '🇨🇦', code: 'CAN' },

  // Europe
  { id: 'gb', label: 'Великобритания', continent: 'eu', flag: '🇬🇧', code: 'GBR' },
  { id: 'de', label: 'Германия', continent: 'eu', flag: '🇩🇪', code: 'DEU' },
  { id: 'fr', label: 'Франция', continent: 'eu', flag: '🇫🇷', code: 'FRA' },
  { id: 'it', label: 'Италия', continent: 'eu', flag: '🇮🇹', code: 'ITA' },
  { id: 'es', label: 'Испания', continent: 'eu', flag: '🇪🇸', code: 'ESP' },

  // Asia
  { id: 'jp', label: 'Япония', continent: 'asia', flag: '🇯🇵', code: 'JPN' },
  { id: 'kr', label: 'Южная Корея', continent: 'asia', flag: '🇰🇷', code: 'KOR' },
  { id: 'in', label: 'Индия', continent: 'asia', flag: '🇮🇳', code: 'IND' },

  // CIS
  { id: 'ru', label: 'Россия', continent: 'cis', flag: '🇷🇺', code: 'RUS' },
  { id: 'kz', label: 'Казахстан', continent: 'cis', flag: '🇰🇿', code: 'KAZ' },

  // Latin America
  { id: 'br', label: 'Бразилия', continent: 'latam', flag: '🇧🇷', code: 'BRA' },
  { id: 'mx', label: 'Мексика', continent: 'latam', flag: '🇲🇽', code: 'MEX' },

  // MENA
  { id: 'ae', label: 'ОАЭ (Дубай)', continent: 'mena', flag: '🇦🇪', code: 'UAE' },
  { id: 'tr', label: 'Турция', continent: 'mena', flag: '🇹🇷', code: 'TUR' },
];

export const REGION_POPULAR_NICHES: Record<ContinentId, Niche[]> = {
  all: [
    'all',
    'ai_tech',
    'humor_memes',
    'business_finance',
    'fitness_sport',
    'dance_music',
    'food_cooking',
    'travel',
    'fashion_beauty',
    'lifestyle',
    'gaming_anime',
    'auto_tech',
  ],
  na: ['all', 'ai_tech', 'business_finance', 'humor_memes', 'auto_tech', 'fitness_sport'],
  eu: ['all', 'fashion_beauty', 'travel', 'food_cooking', 'lifestyle', 'auto_tech'],
  asia: ['all', 'gaming_anime', 'ai_tech', 'dance_music', 'food_cooking', 'lifestyle'],
  cis: ['all', 'humor_memes', 'business_finance', 'auto_tech', 'travel', 'lifestyle'],
  latam: ['all', 'dance_music', 'fitness_sport', 'humor_memes', 'lifestyle'],
  mena: ['all', 'business_finance', 'auto_tech', 'travel', 'fashion_beauty'],
};

export const ALL_NICHES: NicheInfo[] = [
  { id: 'all', label: 'Все тренды', icon: 'Flame', color: 'from-amber-500 to-rose-500' },
  { id: 'ai_tech', label: 'ИИ и Технологии', icon: 'Cpu', color: 'from-cyan-500 to-blue-500' },
  { id: 'humor_memes', label: 'Юмор и Мемы', icon: 'Laugh', color: 'from-yellow-400 to-amber-500' },
  { id: 'business_finance', label: 'Бизнес и Финансы', icon: 'TrendingUp', color: 'from-emerald-400 to-teal-600' },
  { id: 'fitness_sport', label: 'Фитнес и Спорт', icon: 'Dumbbell', color: 'from-orange-500 to-red-500' },
  { id: 'dance_music', label: 'Танцы и Музыка', icon: 'Music', color: 'from-pink-500 to-purple-600' },
  { id: 'food_cooking', label: 'Еда и Рецепты', icon: 'Utensils', color: 'from-amber-600 to-orange-500' },
  { id: 'travel', label: 'Путешествия', icon: 'Plane', color: 'from-sky-400 to-indigo-500' },
  { id: 'fashion_beauty', label: 'Мода и Стиль', icon: 'Sparkles', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'lifestyle', label: 'Лайфстайл', icon: 'Coffee', color: 'from-violet-400 to-purple-500' },
  { id: 'gaming_anime', label: 'Гейминг и Аниме', icon: 'Gamepad2', color: 'from-indigo-500 to-purple-600' },
  { id: 'auto_tech', label: 'Авто и Гаджеты', icon: 'Car', color: 'from-red-500 to-amber-500' },
];

export const NICHES = ALL_NICHES;

/**
 * Dynamic reels feed initialization.
 * Real videos are continuously loaded live from the Fastify backend API.
 */
export const INITIAL_REELS: Reel[] = [];

export function simulateRealtimeTick(reels: Reel[]): Reel[] {
  return reels.map((reel) => {
    const viewsInc = Math.floor(Math.random() * 850) + 50;
    const likesInc = Math.floor(viewsInc * 0.08);
    const commentsInc = Math.floor(likesInc * 0.04);
    const sharesInc = Math.floor(likesInc * 0.06);
    const savesInc = Math.floor(likesInc * 0.12);

    const newViews = reel.metrics.views + viewsInc;
    const newLikes = reel.metrics.likes + likesInc;
    const newComments = reel.metrics.comments + commentsInc;
    const newShares = reel.metrics.shares + sharesInc;
    const newSaves = reel.metrics.saves + savesInc;

    const newEngagementRate = Math.min(
      38,
      Math.round(((newLikes + newComments + newShares) / (newViews || 1)) * 1000) / 10
    );
    const newVelocity = Math.min(99, Math.max(10, reel.metrics.velocityScore + (Math.floor(Math.random() * 3) - 1)));

    return {
      ...reel,
      metrics: {
        ...reel.metrics,
        views: newViews,
        likes: newLikes,
        comments: newComments,
        shares: newShares,
        saves: newSaves,
        engagementRate: newEngagementRate,
        velocityScore: newVelocity,
        viewsGrowthLastHour: viewsInc,
      },
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Transparent pass-through: no fake URLs or mock records are generated.
 * Live filtering is performed against real data.
 */
export function ensureRichContent(
  currentReels: Reel[],
  _continent: ContinentId,
  _country: CountryId,
  _niche: Niche
): Reel[] {
  return currentReels;
}
