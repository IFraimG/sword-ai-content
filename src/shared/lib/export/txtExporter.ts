import { saveAs } from 'file-saver';
import type { Reel, ExportConfig } from '@/entities/reel/model/types';
import { formatCompactNumber, formatFullNumber, formatPercentage, formatDate } from '../formatters';

export function exportToTxt(reels: Reel[], config: ExportConfig): void {
  // Filter reels based on config scope
  let targetReels = reels;
  if (config.platformScope !== 'both') {
    targetReels = reels.filter((r) => r.platform === config.platformScope);
  }
  if (config.filterNiche && config.filterNiche !== 'all') {
    targetReels = targetReels.filter((r) => r.niche === config.filterNiche);
  }

  const dateStr = formatDate(new Date().toISOString());

  const lines: string[] = [
    '================================================================================',
    '                   SWORD — АНАЛИТИЧЕСКИЙ ОТЧЕТ ПО ТРЕНДАМ                       ',
    '                 TikTok & Instagram Reels Real-Time Monitoring                  ',
    '================================================================================',
    `Дата формирования отчета: ${dateStr}`,
    `Выборка: ${config.platformScope === 'both' ? 'TikTok + Instagram' : config.platformScope.toUpperCase()}`,
    `Всего трендов в отчете: ${targetReels.length}`,
    '--------------------------------------------------------------------------------',
    '',
  ];

  targetReels.forEach((reel) => {
    lines.push(`[#${reel.trendingRank}] [${reel.platform.toUpperCase()}] ${reel.title}`);
    lines.push(`Автор: ${reel.authorName} (${reel.authorUsername})${reel.authorVerified ? ' [VERIFIED]' : ''}`);
    lines.push(`Тематика/Ниша: ${reel.niche}`);
    lines.push(`Просмотры: ${formatCompactNumber(reel.metrics.views)} (${formatFullNumber(reel.metrics.views)})`);
    lines.push(`Лайки: ${formatCompactNumber(reel.metrics.likes)} | Комментарии: ${formatCompactNumber(reel.metrics.comments)} | Шеринг: ${formatCompactNumber(reel.metrics.shares)} | Сохранения: ${formatCompactNumber(reel.metrics.saves)}`);
    lines.push(`Вовлеченность (Engagement Rate): ${reel.metrics.engagementRate}%`);
    lines.push(`Скорость роста (Velocity): ${formatPercentage(reel.metrics.velocityScore)} / час`);
    lines.push(`Звук/Аудио: ${reel.soundTitle} — ${reel.soundAuthor} ${reel.soundIsTrending ? '(TRENDING SOUND)' : ''}`);
    lines.push(`Хештеги: ${reel.hashtags.join(' ')}`);
    lines.push(`Ссылка на видео: ${reel.originalUrl}`);
    lines.push('--------------------------------------------------------------------------------');
  });

  lines.push('');
  lines.push('Отчет сгенерирован веб-приложением Sword.');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `Sword_Trends_Report_${Date.now()}.txt`);
}
