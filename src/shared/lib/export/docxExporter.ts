import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  ShadingType
} from 'docx';
import { saveAs } from 'file-saver';
import type { Reel, ExportConfig } from '@/entities/reel/model/types';
import { formatCompactNumber, formatFullNumber, formatPercentage, formatDate } from '../formatters';

export async function exportToDocx(reels: Reel[], config: ExportConfig): Promise<void> {
  const title = `Отчет по трендовым рилсам — Платформа Sword`;
  const dateStr = formatDate(new Date().toISOString());

  // Filter reels based on config scope
  let targetReels = reels;
  if (config.platformScope !== 'both') {
    targetReels = reels.filter((r) => r.platform === config.platformScope);
  }
  if (config.filterNiche && config.filterNiche !== 'all') {
    targetReels = targetReels.filter((r) => r.niche === config.filterNiche);
  }

  // Create document table headers
  const headerCells = [
    new TableCell({
      width: { size: 6, type: WidthType.PERCENTAGE },
      shading: { fill: '121824', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: '№', bold: true, color: '00F0FF' })], alignment: AlignmentType.CENTER })],
    }),
    new TableCell({
      width: { size: 14, type: WidthType.PERCENTAGE },
      shading: { fill: '121824', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: 'Платформа', bold: true, color: 'FFFFFF' })] })],
    }),
    new TableCell({
      width: { size: 30, type: WidthType.PERCENTAGE },
      shading: { fill: '121824', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: 'Название и Автор', bold: true, color: 'FFFFFF' })] })],
    }),
    new TableCell({
      width: { size: 16, type: WidthType.PERCENTAGE },
      shading: { fill: '121824', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: 'Просмотры', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
    }),
    new TableCell({
      width: { size: 16, type: WidthType.PERCENTAGE },
      shading: { fill: '121824', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: 'Вовлеченность (ER)', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
    }),
    new TableCell({
      width: { size: 18, type: WidthType.PERCENTAGE },
      shading: { fill: '121824', type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: 'Velocity (Рост)', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
    }),
  ];

  const rows = [
    new TableRow({
      tableHeader: true,
      children: headerCells,
    }),
  ];

  // Populate data rows
  targetReels.forEach((reel, idx) => {
    const isEven = idx % 2 === 0;
    const bg = isEven ? 'F8FAFC' : 'FFFFFF';
    const platformLabel = reel.platform === 'tiktok' ? 'TikTok' : 'Instagram Reels';

    const row = new TableRow({
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          shading: { fill: bg, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: String(reel.trendingRank), bold: true })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          shading: { fill: bg, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: platformLabel, bold: true, color: reel.platform === 'tiktok' ? '00B4D8' : 'C13584' })] })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: bg, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: reel.title, bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${reel.authorName} (${reel.authorUsername})`, italics: true, color: '64748B', size: 18 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Ссылка: ${reel.originalUrl}`, color: '0077B6', size: 16 }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          shading: { fill: bg, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: formatCompactNumber(reel.metrics.views), bold: true }),
                new TextRun({ text: ` (${formatFullNumber(reel.metrics.views)})`, size: 16, color: '64748B' }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 16, type: WidthType.PERCENTAGE },
          shading: { fill: bg, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: `${reel.metrics.engagementRate}%`, bold: true, color: '16A34A' }),
                new TextRun({ text: `\nЛайки: ${formatCompactNumber(reel.metrics.likes)}`, size: 16, color: '64748B' }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          shading: { fill: bg, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: formatPercentage(reel.metrics.velocityScore), bold: true, color: 'D97706' }),
                new TextRun({ text: ` / час`, size: 16, color: '64748B' }),
              ],
            }),
          ],
        }),
      ],
    });
    rows.push(row);
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: [
          new Paragraph({
            text: 'SWORD TREND ANALYZER',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Аналитический отчет по вирусным трендам (TikTok & Instagram)', bold: true, size: 24, color: '0F172A' }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Дата генерации: ${dateStr}  |  Всего трендов в отчете: ${targetReels.length}`, color: '64748B' }),
            ],
            spacing: { after: 300 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
          new Paragraph({
            spacing: { before: 300 },
            children: [
              new TextRun({ text: 'Отчет сгенерирован автоматически приложением Sword. Метрики актуализированы в режиме реального времени.', italics: true, color: '94A3B8', size: 18 }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Sword_Trends_Report_${Date.now()}.docx`);
}
