export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date));
  } catch (_err) {
    return '';
  }
}

export function formatCurrency(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 'just now';
    if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ago`;
    if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ago`;
    return `${Math.floor(absDiff / 86400)} days ago`;
  }

  if (diffInSeconds < 60) return 'in a few seconds';
  if (diffInSeconds < 3600) return `in ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `in ${Math.floor(diffInSeconds / 3600)} hours`;
  if (diffInSeconds < 2592000) return `in ${Math.floor(diffInSeconds / 86400)} days`;
  if (diffInSeconds < 31536000) return `in ${Math.floor(diffInSeconds / 2592000)} months`;
  return `in ${Math.floor(diffInSeconds / 31536000)} years`;
}
