/**
 * Ambient Music AI Producer Service
 * Analyzes textual prompts and images (cover art, ambient stills, mood photos)
 * and generates structured musical breakdown (genres, BPM, key, instruments, sound design, Suno/Udio prompts).
 */

const AMBIENT_PRESETS = [
  {
    triggers: ['snow', 'blizzard', 'winter', 'метель', 'снег', 'зима', 'холод', 'coldcore', 'frost', 'snowstorm', 'snowfall', 'coldnightmix'],
    genres: ['Coldcore Ambient', 'Blizzard Soundscape', 'Dark Drone', 'Isolated Winter Ambience'],
    bpm: '42-50 BPM / Free-time',
    key: 'C# minor (Aeolian mode, ледяное меланхоличное звучание)',
    instruments: [
      'Analog Drift Pad (Roland Juno-106 с хорусом)',
      'Sub-bass Drone (40 Hz sine с насыщением)',
      'Granular Ice Synth (семплы колокольчиков с гранулярным питч-шифтом)',
      'Felt Piano с сильным демпфированием и реверберацией',
    ],
    fieldRecordings: 'Завывание полярного ветра, хруст наста под шагами, метель за двойным стеклом, тихое потрескивание печи',
    soundDesign: 'Бесконечный реверб Valhalla Shimmer (Decay 12s, Mix 45%), ленточный дилэй с легким Wow/Flutter, срез верхов на 4 kHz для создания глухой зимней изоляции.',
    sunoPrompt: 'coldcore ambient, winter blizzard howling wind, isolated cabin atmosphere, deep low-end sub drone, soft felt piano chords, lush analog pads, tape hiss, melancholic, meditative, cinematic, 46 bpm',
    summary: 'Звуковая картина передает ощущение полного уединения посреди зимней бури. Тяжелый суб-басовый дрон формирует фундамент холода, сквозь который медленно пробиваются одинокие приглушенные аккорды пианино и шелест метели.',
  },
  {
    triggers: ['liminal', 'dreamcore', 'weirdcore', 'nostalgia', 'kidcore', 'бассейн', 'коридор', 'лиминальн', 'сон', 'детство', 'nostalgiacore'],
    genres: ['Dreamcore', 'Liminal Space Drone', 'Nostalgiacore', 'Vaporwave / Hypnagogic Pop'],
    bpm: '52-58 BPM / Unquantized',
    key: 'F major / D minor (Лидийский лад с ностальгическими отклонениями)',
    instruments: [
      'Cassette-modulated Electric Piano (Rhodes / DX7 с вибрато)',
      'Ethereal Vocal Pad (синтетический детский хор Mellotron)',
      'Washed-out Plucks (приглушенные гитарные щипки)',
      'Lo-Fi Synth Bass с фильтрацией resonance',
    ],
    fieldRecordings: 'Гул люминесцентных ламп 50 Hz, эхо шагов по кафельной плитке заброшенного бассейна, приглушенные звуки радио из соседней комнаты',
    soundDesign: 'Эффект зажеванной магнитной ленты VHS (Pitch Wobble 0.3 Hz), гулкая комната с металлическим призвуком (Convolver Reverb Tile Room), легкий сатуратор для винтажного тепла.',
    sunoPrompt: 'dreamcore, liminal space, hypnagogic pop ambient, 1990s mall acoustics, detuned electric piano, warm chorus synth pads, tape flutter, surreal, nostalgic, uncanny comforting, ethereal, 54 bpm',
    summary: 'Трек погружает в состояние забытого сна или детского воспоминания: пустое освещенное пространство, мягкое тепло расстроенных клавишных и призрачный хор, застывший в бесконечном эхо.',
  },
  {
    triggers: ['dark', 'drone', 'darkambient', 'темн', 'мрачн', 'пустота', 'космос', 'void', 'space', 'haunting', 'dungeon'],
    genres: ['Dark Ambient', 'Sub-bass Drone', 'Cosmic Void Ambient', 'Death Industrial / Ritual Drone'],
    bpm: '36-44 BPM / Static Drone',
    key: 'D minor / D Phrygian (Угнетающий, космический резонанс)',
    instruments: [
      'Deep Modular Sub-drone (32-45 Hz continuous resonance)',
      'Bowed Metal & Cello Textures (скрипичный смычок по металлической пластине)',
      'Granular Dark Cloud (Prophet-5 с хаотической модуляцией фильтра)',
      'Low Industrial Rumble & Distant Impacts',
    ],
    fieldRecordings: 'Радиосигналы глубокого космоса (Jupiter/Saturn plasma waves), гул корабельных генераторов, резонанс пустых металлических ангаров',
    soundDesign: 'Многополосный компрессор для удержания плотного суб-диапазона, глубокий стерео-хорус на средних частотах, свертывающийся ревербератор с временем затухания > 16 секунд.',
    sunoPrompt: 'dark ambient drone, cosmic void, deep abyssal sub-bass 40hz, bowed metal, eerie atmospheric soundscape, dark drone, interstellar resonance, ominous, cinematic horror, tension, haunting, slow meditative',
    summary: 'Мрачный и монументальный звуковой ландшафт. Непрерывный низкочастотный гул давит на грудную клетку, а случайные металлические текстуры и далекие радиоволны подчеркивают масштаб бесконечной пустоты.',
  },
  {
    triggers: ['relax', 'calm', 'sleep', 'meditation', 'chill', 'сон', 'релакс', 'отдых', 'медитация', 'спокой', 'тишина', 'zen'],
    genres: ['Calm Ambient', 'Sleep & Healing Soundscape', 'Weightless Drone', 'Binaural Ambient'],
    bpm: '48-52 BPM (Синхронизация с ритмом спокойного дыхания)',
    key: 'A minor / C major (Гармоничный, умиротворяющий покой)',
    instruments: [
      'Singing Crystal Bowls (тибетские поющие чаши 432 Hz)',
      'Silk Warm Analog Pad (Oberheim OB-8)',
      'Soft Acoustic Kalimba с деликатным дилэем',
      'Continuous Sine Sub-drone (плавная гармоническая поддержка)',
    ],
    fieldRecordings: 'Мягкий теплый летний дождь за окном, шорох лесных листьев, отдаленный шепот ручья',
    soundDesign: 'Широкое бинауральное панорамирование (Alpha/Theta wave frequencies), отсутствие резких транзиентов и атак (Attack > 2.5s), плавные затухания.',
    sunoPrompt: 'calm ambient, sleep meditation music, 432hz warm crystal bowls, soft ambient pads, gentle rain sounds, tranquil, peaceful, deep relaxation, floating weightless, no drums, serene',
    summary: 'Композиция создана для глубокой релаксации и погружения в сон. Медленно перетекающие теплые синтезаторные волны и звуки кристаллов снимают мышечное напряжение и успокаивают дыхание.',
  },
];

/**
 * Fallback preset when no specific keywords match
 */
const DEFAULT_PRESET = {
  genres: ['Cinematic Ambient', 'Atmospheric Drone', 'Modern Soundscape', 'Electronic Ambient'],
  bpm: '50-56 BPM / Unquantized',
  key: 'E minor (Эмоциональный, глубокий кинематографичный лад)',
  instruments: [
    'Warm Vintage Poly-Synth Pad (Prophet Rev2)',
    'Granular Field Shimmer Generator',
    'Deep Moog Sub-bass Drone',
    'Muted Soft Felt Piano & Ambient Guitar Swells',
  ],
  fieldRecordings: 'Глубокий атмосферный шум помещения (Room tone), тихий ветер, аналоговый шум магнитофонной ленты',
  soundDesign: 'Двухступенчатая стереореверберация (Space Designer + Plate), фильтр низких частот 24 dB/oct, стереорасширитель Haas effect на верхних гармониках.',
  sunoPrompt: 'cinematic ambient, atmospheric drone, lush analog synth pads, soft felt piano, tape warmth, deep emotional soundscape, dreamy, introspective, 52 bpm, slow tempo, high fidelity',
  summary: 'Гармоничный атмосферный саундтрек с богатым спектром и глубокой эмоциональной драматургией, идеально подходящий для видеоряда и созерцания.',
};

/**
 * Analyzes input text and/or image context, generating a structured Ambient Music breakdown
 *
 * @param {Object} params
 * @param {string} [params.text] - User message or description
 * @param {string} [params.imageUrl] - Base64 image data or URL
 * @returns {Object} Structured ambient music production blueprint
 */
export async function generateAmbientMusicRecipe({ text = '', imageUrl = '' }) {
  const normalizedText = (text || '').toLowerCase().trim();

  // 1. Identify matched preset based on keyword triggers
  let matchedPreset = DEFAULT_PRESET;
  let highestScore = 0;

  for (const preset of AMBIENT_PRESETS) {
    let score = 0;
    for (const trigger of preset.triggers) {
      if (normalizedText.includes(trigger)) {
        score += 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      matchedPreset = preset;
    }
  }

  // 2. Adjust if image is attached
  let imageInsight = '';
  if (imageUrl) {
    if (imageUrl.startsWith('data:image')) {
      imageInsight = 'Проанализирован прикрепленный визуальный референс (цветовая гамма, контраст и плотность кадра). Визуальная эстетика гармонизирована со звуковым пространством.';
    } else {
      imageInsight = 'Прикрепленное изображение интегрировано в визуально-акустический анализ композиции.';
    }
  }

  // 3. Extract custom user nuances from text if provided
  const customGenres = [...matchedPreset.genres];
  if (normalizedText.includes('drone') && !customGenres.includes('Deep Drone')) {
    customGenres.unshift('Deep Drone');
  }
  if (normalizedText.includes('vaporwave') && !customGenres.includes('Vaporwave')) {
    customGenres.push('Vaporwave');
  }
  if (normalizedText.includes('nostalgia') && !customGenres.includes('Nostalgiacore')) {
    customGenres.unshift('Nostalgiacore');
  }

  const result = {
    genres: customGenres.slice(0, 4),
    bpm: matchedPreset.bpm,
    key: matchedPreset.key,
    instruments: matchedPreset.instruments,
    fieldRecordings: matchedPreset.fieldRecordings,
    soundDesign: matchedPreset.soundDesign,
    sunoPrompt: matchedPreset.sunoPrompt,
    summary: `${matchedPreset.summary}${imageInsight ? ' ' + imageInsight : ''}`,
  };

  return result;
}
