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
  eu: ['all', 'fashion_beauty', 'travel', 'food_cooking', 'lifestyle', 'fitness_sport'],
  asia: ['all', 'gaming_anime', 'ai_tech', 'dance_music', 'food_cooking', 'technology' as any],
  cis: ['all', 'humor_memes', 'business_finance', 'auto_tech', 'lifestyle', 'ai_tech'],
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

export const INITIAL_REELS: Reel[] = [
  // TIKTOK - NORTH AMERICA (US)
  {
    id: 'tt-1',
    platform: 'tiktok',
    title: 'Claude 3.7 & Agentic Coding: 5-minute SaaS Demo',
    description: 'Built a full stack SaaS using agentic models in under 5 minutes. The paradigm has completely changed! 🤖⚡️ #ai #coding #tech #vibecoding #siliconvalley',
    authorName: 'Alex Byte',
    authorUsername: '@alex_tech_review',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 840000,
    niche: 'ai_tech',
    continent: 'na',
    country: 'us',
    countryFlag: '🇺🇸',
    countryName: 'США',
    hashtags: ['#ai', '#coding', '#tech', '#vibecoding', '#usa'],
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

  // TIKTOK - CIS (RU / KZ)
  {
    id: 'tt-2',
    platform: 'tiktok',
    title: 'Когда попытался объяснить коту, почему корм подорожал',
    description: 'Его взгляд на 0:12 секунде говорит больше тысячи слов 😂 Кажется, он готовит забастовку #catsoftiktok #humor #cats #мемы #юмор',
    authorName: 'Funny Whiskers',
    authorUsername: '@funnywhiskers_daily',
    authorAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
    authorVerified: false,
    authorFollowers: 1250000,
    niche: 'humor_memes',
    continent: 'cis',
    country: 'ru',
    countryFlag: '🇷🇺',
    countryName: 'Россия',
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

  // TIKTOK - ASIA (JAPAN)
  {
    id: 'tt-jp',
    platform: 'tiktok',
    title: 'Tokyo Cyber Night: Neon Alleyways in Shinjuku & Akihabara',
    description: 'Exploring hidden retro arcade bars and cyberpunk vibes in Tokyo 2026 🎮⛩️ #tokyo #japan #cyberpunk #anime #gaming',
    authorName: 'Kenji Neo',
    authorUsername: '@kenji_tokyo_vibe',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 950000,
    niche: 'gaming_anime',
    continent: 'asia',
    country: 'jp',
    countryFlag: '🇯🇵',
    countryName: 'Япония',
    hashtags: ['#tokyo', '#japan', '#cyberpunk', '#anime', '#gaming'],
    soundTitle: 'Anime Beat Tokyo Night Drive (Lofi Mix)',
    soundAuthor: 'NeoAkira Tokyo',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    trendingRank: 3,
    rankChange: 'new',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    originalUrl: 'https://www.tiktok.com/@kenji_tokyo_vibe/video/7345678901234567899',
    durationSeconds: 27,
    metrics: {
      views: 3120000,
      likes: 480000,
      comments: 19500,
      shares: 114000,
      saves: 165000,
      engagementRate: 24.9,
      velocityScore: 59.4,
      viewsGrowthLastHour: 285000,
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // TIKTOK - LATIN AMERICA (BRAZIL)
  {
    id: 'tt-latam',
    platform: 'tiktok',
    title: 'Passinho do Funk 2026: Novo ritmo viral no Rio de Janeiro',
    description: 'Quem consegue pegar essa transição? O baile pegou fogo no final de semana 🔥🕺 #funk #brasil #dance #trend #viral',
    authorName: 'Thiago Dança',
    authorUsername: '@thiagodance_rio',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 1780000,
    niche: 'dance_music',
    continent: 'latam',
    country: 'br',
    countryFlag: '🇧🇷',
    countryName: 'Бразилия',
    hashtags: ['#funk', '#brasil', '#dance', '#trend', '#dancatutorial'],
    soundTitle: 'Mega Funk Automotivo Viral Mix',
    soundAuthor: 'DJ Paulista',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    trendingRank: 4,
    rankChange: 'up',
    rankChangeDelta: 3,
    thumbnailUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    originalUrl: 'https://www.tiktok.com/@thiagodance_rio/video/7345678901234567893',
    durationSeconds: 22,
    metrics: {
      views: 3890000,
      likes: 540000,
      comments: 18200,
      shares: 125000,
      saves: 82000,
      engagementRate: 19.6,
      velocityScore: 57.2,
      viewsGrowthLastHour: 340000,
    },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // TIKTOK - EUROPE (GERMANY)
  {
    id: 'tt-de',
    platform: 'tiktok',
    title: 'Porsche GT3 RS Autobahn Acceleration test (No Speed Limit)',
    description: 'Raw exhaust sound at 9000 RPM on the unrestricted A8 highway 🇩🇪🏎️💨 #autobahn #porsche #supercars #germany #soundtest',
    authorName: 'Hans Velocity',
    authorUsername: '@hans_autobahn_crew',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 670000,
    niche: 'auto_tech',
    continent: 'eu',
    country: 'de',
    countryFlag: '🇩🇪',
    countryName: 'Германия',
    hashtags: ['#autobahn', '#porsche', '#supercars', '#germany', '#carporn'],
    soundTitle: 'Flat 6 Naturally Aspirated Pure Sound',
    soundAuthor: 'Apex Motorsport',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    trendingRank: 5,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    originalUrl: 'https://www.tiktok.com/@hans_autobahn_crew/video/7345678901234567894',
    durationSeconds: 31,
    metrics: {
      views: 2650000,
      likes: 395000,
      comments: 14100,
      shares: 98000,
      saves: 142000,
      engagementRate: 24.5,
      velocityScore: 43.1,
      viewsGrowthLastHour: 195000,
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // TIKTOK - MENA (UAE / DUBAI)
  {
    id: 'tt-ae',
    platform: 'tiktok',
    title: 'Top 3 High-Yield Real Estate Projects in Dubai Marina & Palm',
    description: 'ROI breakdown: cash flow vs capital appreciation in 2026. Tax-free investment guide 🇦🇪🏢 #dubai #realestate #investing #wealth #dxb',
    authorName: 'Rashid Al-Noor',
    authorUsername: '@rashid_dxb_properties',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 820000,
    niche: 'business_finance',
    continent: 'mena',
    country: 'ae',
    countryFlag: '🇦🇪',
    countryName: 'ОАЭ',
    hashtags: ['#dubai', '#realestate', '#investing', '#wealth', '#dxb'],
    soundTitle: 'Luxury Dubai Horizon Deep Beat',
    soundAuthor: 'Gulf Wave Sound',
    soundIsTrending: false,
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    trendingRank: 6,
    rankChange: 'down',
    rankChangeDelta: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    originalUrl: 'https://www.tiktok.com/@rashid_dxb_properties/video/7345678901234567895',
    durationSeconds: 38,
    metrics: {
      views: 1840000,
      likes: 185000,
      comments: 9200,
      shares: 51000,
      saves: 128000,
      engagementRate: 20.3,
      velocityScore: 32.7,
      viewsGrowthLastHour: 110000,
    },
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS - EUROPE (FRANCE)
  {
    id: 'ig-fr',
    platform: 'instagram',
    title: 'Paris Fashion Week Spring 2026: Backstage Haute Couture',
    description: 'Silhouette draping and silk textures up close. Pure Parisian elegance at Grand Palais 🇫🇷✨ #parisfashion #pfw #couture #styleguide #hautecouture',
    authorName: 'Camille Vogue',
    authorUsername: '@camille_in_paris',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 1420000,
    niche: 'fashion_beauty',
    continent: 'eu',
    country: 'fr',
    countryFlag: '🇫🇷',
    countryName: 'Франция',
    hashtags: ['#parisfashion', '#pfw', '#couture', '#styleguide', '#hautecouture'],
    soundTitle: 'Parisian Elegance Jazz Cafe',
    soundAuthor: 'Vogue Sounds Paris',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trendingRank: 1,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abd/',
    durationSeconds: 31,
    metrics: {
      views: 3100000,
      likes: 420000,
      comments: 11200,
      shares: 165000,
      saves: 290000,
      engagementRate: 28.6,
      velocityScore: 53.4,
      viewsGrowthLastHour: 220000,
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS - ASIA (SOUTH KOREA)
  {
    id: 'ig-kr',
    platform: 'instagram',
    title: 'Seoul Cafe Aesthetic: Floating Cloud Espresso in Seongsu-dong',
    description: 'The coolest cafe concept in South Korea right now. The foam reaction is mesmerizing! ☕️🇰🇷 #seoulcafe #aesthetic #koreancoffee #travelkorea #seongsu',
    authorName: 'Min-Ji Coffee',
    authorUsername: '@minji_seoul_vibes',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 890000,
    niche: 'lifestyle',
    continent: 'asia',
    country: 'kr',
    countryFlag: '🇰🇷',
    countryName: 'Южная Корея',
    hashtags: ['#seoulcafe', '#aesthetic', '#koreancoffee', '#travelkorea', '#seongsu'],
    soundTitle: 'K-Indie Acoustic Lo-Fi Rain',
    soundAuthor: 'Seoul Soundscape',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    trendingRank: 2,
    rankChange: 'up',
    rankChangeDelta: 2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abf/',
    durationSeconds: 24,
    metrics: {
      views: 2450000,
      likes: 340000,
      comments: 9800,
      shares: 112000,
      saves: 215000,
      engagementRate: 27.6,
      velocityScore: 49.8,
      viewsGrowthLastHour: 180000,
    },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS - NORTH AMERICA (US)
  {
    id: 'ig-us',
    platform: 'instagram',
    title: 'Autonomous Tesla Robotaxi Fleet spotted in Austin Texas',
    description: 'No drivers, flawless lane merges, and passenger pick-up at night. Autonomous robotics has arrived 🤖🇺🇸 #tesla #robotaxi #tech #austin #future',
    authorName: 'Silicon Austin Tech',
    authorUsername: '@silicon_austin',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 910000,
    niche: 'ai_tech',
    continent: 'na',
    country: 'us',
    countryFlag: '🇺🇸',
    countryName: 'США',
    hashtags: ['#tesla', '#robotaxi', '#tech', '#austin', '#future'],
    soundTitle: 'Future Beats Technology Innovation',
    soundAuthor: 'NextGen Sound',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trendingRank: 3,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abg/',
    durationSeconds: 38,
    metrics: {
      views: 2980000,
      likes: 310000,
      comments: 15400,
      shares: 145000,
      saves: 198000,
      engagementRate: 22.4,
      velocityScore: 46.5,
      viewsGrowthLastHour: 210000,
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS - EUROPE (ITALY)
  {
    id: 'ig-it',
    platform: 'instagram',
    title: 'Autentica Carbonara a Trastevere senza panna',
    description: 'Solo tuorli freschi, pecorino romano DOP, guanciale croccante e pepe nero. Il segreto di Roma 🍝🇮🇹 #roma #carbonara #foodporn #cucinaitaliana #pasta',
    authorName: 'Marco Chef Roma',
    authorUsername: '@marco_cucina_roma',
    authorAvatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 1100000,
    niche: 'food_cooking',
    continent: 'eu',
    country: 'it',
    countryFlag: '🇮🇹',
    countryName: 'Италия',
    hashtags: ['#roma', '#carbonara', '#foodporn', '#cucinaitaliana', '#pasta'],
    soundTitle: 'Tarantella Napoletana Acoustic Guitar',
    soundAuthor: 'Italian Traditional Music',
    soundIsTrending: false,
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    trendingRank: 4,
    rankChange: 'down',
    rankChangeDelta: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abh/',
    durationSeconds: 30,
    metrics: {
      views: 2250000,
      likes: 295000,
      comments: 11900,
      shares: 94000,
      saves: 185000,
      engagementRate: 26.0,
      velocityScore: 35.1,
      viewsGrowthLastHour: 115000,
    },
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS - CIS (KAZAKHSTAN)
  {
    id: 'ig-kz',
    platform: 'instagram',
    title: 'Озеро Кольсай и Каинды: бирюзовая сказка Тянь-Шаня',
    description: 'Затонувший лес на высоте 2000 метров. Маршрут выходного дня из Алматы в деталях 🇰🇿🏔️ #kazakhstan #kolsay #travel #nature #алматы',
    authorName: 'Aset Explorer',
    authorUsername: '@aset_nomad_travel',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 620000,
    niche: 'travel',
    continent: 'cis',
    country: 'kz',
    countryFlag: '🇰🇿',
    countryName: 'Казахстан',
    hashtags: ['#kazakhstan', '#kolsay', '#travel', '#nature', '#алматы'],
    soundTitle: 'Dombra Modern Nomad Cinematic',
    soundAuthor: 'Steppe Audio Studio',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    trendingRank: 5,
    rankChange: 'new',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abk/',
    durationSeconds: 35,
    metrics: {
      views: 1890000,
      likes: 245000,
      comments: 8700,
      shares: 78000,
      saves: 156000,
      engagementRate: 25.8,
      velocityScore: 41.5,
      viewsGrowthLastHour: 145000,
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // INSTAGRAM REELS - MENA (UAE / DUBAI)
  {
    id: 'ig-ae',
    platform: 'instagram',
    title: 'Supercar Garage in Downtown Dubai: Koenigsegg & Bugatti Tour',
    description: 'Walking inside the most exclusive hypercar private showroom in the Middle East 🇦🇪🏎️ #dubai #hypercars #bugatti #dxb #luxury',
    authorName: 'Sultan Motors',
    authorUsername: '@sultan_supercars_dxb',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    authorFollowers: 1350000,
    niche: 'auto_tech',
    continent: 'mena',
    country: 'ae',
    countryFlag: '🇦🇪',
    countryName: 'ОАЭ',
    hashtags: ['#dubai', '#hypercars', '#bugatti', '#dxb', '#luxury'],
    soundTitle: 'Desert Night Drive Trap Beat',
    soundAuthor: 'Emirates Bass Producer',
    soundIsTrending: true,
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    trendingRank: 6,
    rankChange: 'same',
    rankChangeDelta: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8xyz123abm/',
    durationSeconds: 28,
    metrics: {
      views: 2680000,
      likes: 315000,
      comments: 10400,
      shares: 92000,
      saves: 178000,
      engagementRate: 22.2,
      velocityScore: 38.6,
      viewsGrowthLastHour: 135000,
    },
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function simulateRealtimeTick(reels: Reel[]): Reel[] {
  const updated = reels.map((reel) => {
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

    const newEngagementRate = parseFloat(
      (((newLikes + newComments + newShares + newSaves) / newViews) * 100).toFixed(1)
    );

    const velocityDelta = Math.random() * 8 - 3;
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

  return updatePlatformRanks(updated);
}

function updatePlatformRanks(reels: Reel[]): Reel[] {
  const platforms: ('tiktok' | 'instagram')[] = ['tiktok', 'instagram'];
  let result: Reel[] = [];

  for (const plat of platforms) {
    const platReels = reels.filter((r) => r.platform === plat);
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
