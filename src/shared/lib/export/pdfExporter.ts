import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Reel, ExportConfig } from '@/entities/reel/model/types';
import { formatCompactNumber, formatPercentage, formatDate } from '../formatters';

export function exportToPdf(reels: Reel[], config: ExportConfig): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Filter reels based on config scope
  let targetReels = reels;
  if (config.continentScope && config.continentScope !== 'all') {
    targetReels = targetReels.filter((r) => r.continent === config.continentScope);
  }
  if (config.countryScope && config.countryScope !== 'all') {
    targetReels = targetReels.filter((r) => r.country === config.countryScope);
  }
  if (config.platformScope !== 'both') {
    targetReels = targetReels.filter((r) => r.platform === config.platformScope);
  }
  if (config.filterNiche && config.filterNiche !== 'all') {
    targetReels = targetReels.filter((r) => r.niche === config.filterNiche);
  }

  const dateStr = formatDate(new Date().toISOString());

  // Background and Header Branding
  doc.setFillColor(18, 24, 36); // #121824
  doc.rect(0, 0, 297, 26, 'F');

  // Sword Title
  doc.setTextColor(0, 240, 255); // Neon Cyan
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SWORD // TREND ANALYZER', 14, 12);

  // Subtitle
  doc.setTextColor(200, 210, 230);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const geoLabel = config.countryScope !== 'all' ? `Geo: ${config.countryScope.toUpperCase()}` : config.continentScope !== 'all' ? `Region: ${config.continentScope.toUpperCase()}` : 'Global';
  doc.text(`Viral Reels Report — ${geoLabel} | Generated: ${dateStr}`, 14, 20);

  // Stats badge on header right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Total Trending Reels: ${targetReels.length}`, 240, 15);

  // Prepare table data
  const tableData = targetReels.map((reel) => [
    `#${reel.trendingRank}`,
    reel.platform.toUpperCase(),
    `${reel.title}\n(${reel.authorName} - [${reel.country.toUpperCase()}] ${reel.countryName})`,
    formatCompactNumber(reel.metrics.views),
    formatCompactNumber(reel.metrics.likes),
    formatCompactNumber(reel.metrics.shares),
    `${reel.metrics.engagementRate}%`,
    formatPercentage(reel.metrics.velocityScore),
    reel.originalUrl,
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['Rank', 'Platform', 'Title & Creator', 'Views', 'Likes', 'Shares', 'ER', 'Growth', 'Source Link']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [18, 24, 36],
      textColor: [0, 240, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 80 },
      3: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 60, textColor: [0, 119, 182] },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 165);
      doc.text(
        `Sword Reels Intelligence — Page ${data.pageNumber} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 8
      );
    },
  });

  doc.save(`Sword_Trends_Report_${Date.now()}.pdf`);
}
