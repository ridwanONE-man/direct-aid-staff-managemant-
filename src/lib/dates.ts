// Date as YYYY-MM-DD (today when no date is given)
export const isoDate = (date: Date = new Date()) => date.toISOString().split('T')[0];

// e.g. "5 Nov 2026"
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// "Just now", "12 min ago", "3 h ago", "2 d ago", then the date itself after a week
export const timeAgo = (iso: string, showYear = true) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return showYear ? formatDate(iso) : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
