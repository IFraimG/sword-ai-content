/**
 * Format numbers into compact readable representations (e.g. 1.2M, 450K)
 */
export function formatCompactNumber(value: number): string {
  if (value === undefined || value === null) return '0';
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toLocaleString('ru-RU');
}

/**
 * Format exact numbers with commas/spaces
 */
export function formatFullNumber(value: number): string {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('ru-RU').format(value);
}

/**
 * Format percentage (e.g. +14.2% or -3.1%)
 */
export function formatPercentage(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format seconds into mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format relative or absolute date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Get human readable relative time (e.g. "5 мин назад", "2 часа назад")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'только что';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} мин назад`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ч назад`;
  return `${Math.floor(diffSec / 86400)} дн назад`;
}
