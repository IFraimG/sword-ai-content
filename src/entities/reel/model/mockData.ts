import type { Reel, NicheInfo, Niche } from './types';

export const NICHES: NicheInfo[] = [
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
];

export const INITIAL_REELS: Reel[] = [
  // TIKTOK TRENDS
  {
    id: 'tt-1',
    platform: 'tiktok',
    title: 'Революция Claude 3.7 & нейросети пишут код за 5 секунд',
    description: 'Показал как за 5 минут собрать полноценный сервис на новых моделях рассуждений. Кодинг изменился навсегда! 🤖⚡️ #ai #coding #tech #vibecoding',
    authorName: 'Alex Byte',
    authorUsername: '@alex_tech_review',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 840000,
    niche: 'ai_tech',
    hashtags: ['#ai', '#coding', '#tech', '#vibecoding', '#future'],
    soundTitle: 'Cyberpunk Synthwave 2077 - Original Audio',
    soundAuthor: 'SynthMaster Lab',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trendingRank: 1,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    originalUrl: 'https://www.tiktok.com/@alex_tech_review/video/7345678901234567890',
    durationSeconds: 34,
    metrics: {
      views: 3450200,
      likes: 412000,
      comments: 18900,
      shares: 92400,
      saves: 154000,
      engagementRate: 19.6,
      velocityScore: 48.2,
      viewsGrowthLastHour: 245000,
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-2',
    platform: 'tiktok',
    title: 'Когда попытался объяснить коту, почему корм подорожал',
    description: 'Его взгляд на 0:12 секунде говорит больше тысячи слов 😂 Кажется, он готовит забастовку #catsoftiktok #humor #cats #мемы',
    authorName: 'Funny Whiskers',
    authorUsername: '@funnywhiskers_daily',
    authorAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
    authorVerified: false,
    authorFollowers: 1250000,
    niche: 'humor_memes',
    hashtags: ['#catsoftiktok', '#humor', '#cats', '#мемы', '#жиза'],
    soundTitle: 'Funny Suspense Comedy Sound - Track 4',
    soundAuthor: 'MemeAudioStudio',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    trendingRank: 2,
    rankChange: 'up',
    rankChangeDelta: 2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    originalUrl: 'https://www.tiktok.com/@funnywhiskers_daily/video/7345678901234567891',
    durationSeconds: 18,
    metrics: {
      views: 4890100,
      likes: 680000,
      comments: 32400,
      shares: 210000,
      saves: 89000,
      engagementRate: 20.7,
      velocityScore: 62.5,
      viewsGrowthLastHour: 380000,
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-3',
    platform: 'tiktok',
    title: '3 неочевидных правила инвестирования в 2026 году',
    description: 'Почему индексные фонды все еще выигрывают у 95% активных трейдеров. Разбор портфеля на реальных цифрах 📈 #инвестиции #деньги #finance #passiveincome',
    authorName: 'Denis Capital',
    authorUsername: '@denis_invest',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 490000,
    niche: 'business_finance',
    hashtags: ['#инвестиции', '#деньги', '#finance', '#passiveincome', '#акции'],
    soundTitle: 'Success Motivation Ambient Beat',
    soundAuthor: 'FinAudio',
    soundIsTrending: false,
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    trendingRank: 3,
    rankChange: 'down',
    rankChangeDelta: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    originalUrl: 'https://www.tiktok.com/@denis_invest/video/7345678901234567892',
    durationSeconds: 52,
    metrics: {
      views: 1840000,
      likes: 195000,
      comments: 14200,
      shares: 58000,
      saves: 112000,
      engagementRate: 20.6,
      velocityScore: 31.4,
      viewsGrowthLastHour: 115000,
    },
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-4',
    platform: 'tiktok',
    title: 'Новый вирусный shuffle-шаг, который взорвал тренды',
    description: 'Повторяй в слоумо! Кто сможет повторить без остановки 30 секунд? Отмечайте меня в дуэтах 🔥💃 #dance #shuffledance #trend #танцы',
    authorName: 'Maya Groove',
    authorUsername: '@maya_dancefit',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 2100000,
    niche: 'dance_music',
    hashtags: ['#dance', '#shuffledance', '#trend', '#танцы', '#dancetutorial'],
    soundTitle: 'Electro Bass Drop (Sped Up Viral)',
    soundAuthor: 'DJ Nova Viral',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    trendingRank: 4,
    rankChange: 'up',
    rankChangeDelta: 4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    originalUrl: 'https://www.tiktok.com/@maya_dancefit/video/7345678901234567893',
    durationSeconds: 22,
    metrics: {
      views: 2950000,
      likes: 430000,
      comments: 11200,
      shares: 88000,
      saves: 67000,
      engagementRate: 20.2,
      velocityScore: 54.8,
      viewsGrowthLastHour: 310000,
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-5',
    platform: 'tiktok',
    title: 'Тренировка пресса за 7 минут без инвентаря',
    description: 'Жжение почувствуешь уже на 3-й минуте! Сохраняй и делай каждое утро перед душем 💪🔥 #фитнес #пресс #воркаут #sport #fitnessmotivation',
    authorName: 'Igor Iron',
    authorUsername: '@igor_iron_coach',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorVerified: false,
    authorFollowers: 320000,
    niche: 'fitness_sport',
    hashtags: ['#фитнес', '#пресс', '#воркаут', '#sport', '#fitnessmotivation'],
    soundTitle: 'Hardstyle Beast Mode Workout',
    soundAuthor: 'GymAudioPro',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    trendingRank: 5,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    originalUrl: 'https://www.tiktok.com/@igor_iron_coach/video/7345678901234567894',
    durationSeconds: 40,
    metrics: {
      views: 1420000,
      likes: 184000,
      comments: 6300,
      shares: 45000,
      saves: 98000,
      engagementRate: 23.4,
      velocityScore: 28.5,
      viewsGrowthLastHour: 98000,
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-6',
    platform: 'tiktok',
    title: 'Японский хрустящий омлет Тамаго за 3 минуты',
    description: 'Главный секрет — температура сковороды и капля соевого соуса с мирином. Рецепт пальчики оближешь! 🍳🥢 #рецепты #еда #cooking #foodtiktok',
    authorName: 'Chef Kenji',
    authorUsername: '@kenji_quick_recipes',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 980000,
    niche: 'food_cooking',
    hashtags: ['#рецепты', '#еда', '#cooking', '#foodtiktok', '#япония'],
    soundTitle: 'Cozy Morning Coffee Lo-Fi',
    soundAuthor: 'LoFi Beats Studio',
    soundIsTrending: false,
    publishedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    trendingRank: 6,
    rankChange: 'new',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    originalUrl: 'https://www.tiktok.com/@kenji_quick_recipes/video/7345678901234567895',
    durationSeconds: 28,
    metrics: {
      views: 1980000,
      likes: 215000,
      comments: 8900,
      shares: 63000,
      saves: 142000,
      engagementRate: 21.6,
      velocityScore: 39.1,
      viewsGrowthLastHour: 140000,
    },
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS
  {
    id: 'ig-1',
    platform: 'instagram',
    title: 'Закатный закат на Бали: скрытые скалы Улувату',
    description: 'Точка без туристов на высоте 70 метров над океаном. Сохраняйте координаты в описании профиля! 🌅🌊 #bali #travelreels #wanderlust #sunsetvibes',
    authorName: 'Elena Nomad',
    authorUsername: '@elena_in_wanderland',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 1650000,
    niche: 'travel',
    hashtags: ['#bali', '#travelreels', '#wanderlust', '#sunsetvibes', '#adventure'],
    soundTitle: 'Golden Hour (Acoustic Ambient Dream)',
    soundAuthor: 'Cinematic Travel Audio',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    trendingRank: 1,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abc/',
    durationSeconds: 24,
    metrics: {
      views: 2890000,
      likes: 385000,
      comments: 9400,
      shares: 145000,
      saves: 240000,
      engagementRate: 26.9,
      velocityScore: 51.3,
      viewsGrowthLastHour: 195000,
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ig-2',
    platform: 'instagram',
    title: 'Капсульный гардероб на весну 2026: 8 вещей — 24 образа',
    description: 'Минимализм, качественные ткани и нейтральная палитра. Ссылки на артикулы в актуальном "Lookbook" ✨🧥 #fashionreels #capsulewardrobe #styleguide #ootd',
    authorName: 'Sofia Chic',
    authorUsername: '@sofiachic_style',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 720000,
    niche: 'fashion_beauty',
    hashtags: ['#fashionreels', '#capsulewardrobe', '#styleguide', '#ootd', '#minimalism'],
    soundTitle: 'Parisian Elegance Jazz Cafe',
    soundAuthor: 'Vogue Sounds',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    trendingRank: 2,
    rankChange: 'up',
    rankChangeDelta: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abd/',
    durationSeconds: 31,
    metrics: {
      views: 1750000,
      likes: 210000,
      comments: 7800,
      shares: 98000,
      saves: 189000,
      engagementRate: 28.8,
      velocityScore: 42.1,
      viewsGrowthLastHour: 130000,
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ig-3',
    platform: 'instagram',
    title: 'Утренняя рутина фаундера с оборотом $5M в год',
    description: 'Без криованн и 4 утра. Реальные привычки: фокусные блоки, глубокая работа и цифровой детокс до полудня ☕️💻 #entrepreneur #morningroutine #productivity #business',
    authorName: 'Roman V.',
    authorUsername: '@roman_founder',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 580000,
    niche: 'business_finance',
    hashtags: ['#entrepreneur', '#morningroutine', '#productivity', '#business', '#startup'],
    soundTitle: 'Deep Focus Ambient Atmosphere',
    soundAuthor: 'SoundFlow Labs',
    soundIsTrending: false,
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    trendingRank: 3,
    rankChange: 'down',
    rankChangeDelta: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abe/',
    durationSeconds: 45,
    metrics: {
      views: 1420000,
      likes: 132000,
      comments: 6100,
      shares: 41000,
      saves: 87000,
      engagementRate: 18.7,
      velocityScore: 24.3,
      viewsGrowthLastHour: 72000,
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ig-4',
    platform: 'instagram',
    title: 'Уютная осенне-весенняя студия: рум-тур и эстетика',
    description: 'Как организовать рабочее пространство с подсветкой и винтажной мебелью. Список всех предметов в комментариях 🕯️📖 #interiordesign #aesthetic #cozyhome #lifestyle',
    authorName: 'Anya Home',
    authorUsername: '@anya_cozylife',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    authorVerified: false,
    authorFollowers: 390000,
    niche: 'lifestyle',
    hashtags: ['#interiordesign', '#aesthetic', '#cozyhome', '#lifestyle', '#roomtour'],
    soundTitle: 'Warm Coffee Shop Bossa Nova',
    soundAuthor: 'Acoustic Aesthetic Co',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    trendingRank: 4,
    rankChange: 'up',
    rankChangeDelta: 3,
    thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abf/',
    durationSeconds: 38,
    metrics: {
      views: 980000,
      likes: 124000,
      comments: 5300,
      shares: 34000,
      saves: 79000,
      engagementRate: 24.7,
      velocityScore: 36.8,
      viewsGrowthLastHour: 89000,
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ig-5',
    platform: 'instagram',
    title: 'AI агенты в 2026: как создать автоматического ассистента',
    description: 'Интеграция Telegram бота с локальной LLM за 15 минут. Исходный код в закрепе! 🤖🚀 #ai #artificialintelligence #futuretech #automation',
    authorName: 'Tech Pulse Hub',
    authorUsername: '@techpulse_official',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 910000,
    niche: 'ai_tech',
    hashtags: ['#ai', '#artificialintelligence', '#futuretech', '#automation', '#llm'],
    soundTitle: 'Future Beats Technology Innovation',
    soundAuthor: 'NextGen Sound',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trendingRank: 5,
    rankChange: 'new',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abg/',
    durationSeconds: 42,
    metrics: {
      views: 1650000,
      likes: 187000,
      comments: 9200,
      shares: 64000,
      saves: 138000,
      engagementRate: 24.1,
      velocityScore: 47.9,
      viewsGrowthLastHour: 160000,
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ig-6',
    platform: 'instagram',
    title: 'Идеальная паста Карбонара без сливок по канонам Рима',
    description: 'Только желтки, пекорино романо, гуанчале и черный свежемолотый перец. Никаких сливок! 🍝🇮🇹 #итальянскаякухня #карбонара #foodporn #рецепт',
    authorName: 'Marco Chef',
    authorUsername: '@marco_cucina',
    authorAvatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 1100000,
    niche: 'food_cooking',
    hashtags: ['#итальянскаякухня', '#карбонара', '#foodporn', '#рецепт', '#pasta'],
    soundTitle: 'Tarantella Napoletana Acoustic Guitar',
    soundAuthor: 'Italian Traditional Music',
    soundIsTrending: false,
    publishedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    trendingRank: 6,
    rankChange: 'down',
    rankChangeDelta: 2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abh/',
    durationSeconds: 30,
    metrics: {
      views: 2150000,
      likes: 275000,
      comments: 11400,
      shares: 89000,
      saves: 165000,
      engagementRate: 25.1,
      velocityScore: 33.4,
      viewsGrowthLastHour: 105000,
    },
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Simulates real-time viral growth and metrics evolution on tick
 */
export function simulateRealtimeTick(reels: Reel[]): Reel[] {
  const updated = reels.map((reel) => {
    // Random increment to simulate viral traffic (between 1,500 and 18,000 views per 2-min tick)
    const baseGrowth = Math.floor(Math.random() * 16500) + 1500;
    const velocityMultiplier = 1 + reel.metrics.velocityScore / 100;
    const viewsInc = Math.floor(baseGrowth * velocityMultiplier);

    const likesInc = Math.floor(viewsInc * (Math.random() * 0.08 + 0.04));
    const commentsInc = Math.floor(likesInc * (Math.random() * 0.05 + 0.01));
    const sharesInc = Math.floor(likesInc * (Math.random() * 0.25 + 0.1));
    const savesInc = Math.floor(likesInc * (Math.random() * 0.35 + 0.15));

    const newViews = reel.metrics.views + viewsInc;
    const newLikes = reel.metrics.likes + likesInc;
    const newComments = reel.metrics.comments + commentsInc;
    const newShares = reel.metrics.shares + sharesInc;
    const newSaves = reel.metrics.saves + savesInc;

    // Recalculate engagement rate: ((likes + comments + shares + saves) / views) * 100
    const newEngagementRate = parseFloat(
      (((newLikes + newComments + newShares + newSaves) / newViews) * 100).toFixed(1)
    );

    // Dynamic velocity drift (-3% to +5%)
    const velocityDelta = (Math.random() * 8 - 3);
    const newVelocity = Math.max(5, parseFloat((reel.metrics.velocityScore + velocityDelta).toFixed(1)));

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
        viewsGrowthLastHour: reel.metrics.viewsGrowthLastHour + viewsInc,
      },
      updatedAt: new Date().toISOString(),
    };
  });

  // Re-rank items within each platform based on velocity and views
  return updatePlatformRanks(updated);
}

function updatePlatformRanks(reels: Reel[]): Reel[] {
  const platforms: ('tiktok' | 'instagram')[] = ['tiktok', 'instagram'];
  let result: Reel[] = [];

  for (const plat of platforms) {
    const platReels = reels.filter((r) => r.platform === plat);
    // Sort primarily by a viral score (views * 0.4 + velocity * 10000 * 0.6)
    const sorted = [...platReels].sort((a, b) => {
      const scoreA = a.metrics.views * 0.3 + a.metrics.velocityScore * 50000;
      const scoreB = b.metrics.views * 0.3 + b.metrics.velocityScore * 50000;
      return scoreB - scoreA;
    });

    const reranked = sorted.map((item, index) => {
      const newRank = index + 1;
      let rankChange: 'up' | 'down' | 'same' | 'new' = 'same';
      let delta = 0;

      if (item.trendingRank > newRank) {
        rankChange = 'up';
        delta = item.trendingRank - newRank;
      } else if (item.trendingRank < newRank) {
        rankChange = 'down';
        delta = newRank - item.trendingRank;
      }

      return {
        ...item,
        trendingRank: newRank,
        rankChange,
        rankChangeDelta: delta,
      };
    });

    result = [...result, ...reranked];
  }

  return result;
}
