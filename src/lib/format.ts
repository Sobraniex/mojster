import { Dict } from '../i18n/translations';

export function formatPrice(budget: number | null): string {
  if (budget === null || budget === undefined) return '—';
  return `${budget.toLocaleString('sl-SI')} €`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelative(iso: string, t?: Dict): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t?.justNow ?? 'pravkar';
  if (mins < 60) {
    return (t?.minAgo ?? 'pred {n} min').replace('{n}', String(mins));
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return (t?.hAgo ?? 'pred {n} h').replace('{n}', String(hours));
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return t?.yesterday ?? 'včeraj';
  if (days < 7) {
    return (t?.daysAgo ?? 'pred {n} dnevi').replace('{n}', String(days));
  }
  return formatDate(iso);
}

export function statusLabel(status: string, t?: Dict): string {
  if (!t) {
    switch (status) {
      case 'open':
        return 'Odprto';
      case 'in_progress':
        return 'V teku';
      case 'completed':
        return 'Končano';
      case 'cancelled':
        return 'Preklicano';
      case 'pending':
        return 'Čaka';
      case 'accepted':
        return 'Sprejeto';
      case 'rejected':
        return 'Zavrnjeno';
      case 'withdrawn':
        return 'Umaknjeno';
      default:
        return status;
    }
  }
  switch (status) {
    case 'open':
      return t.statusOpen;
    case 'in_progress':
      return t.statusInProgress;
    case 'completed':
      return t.statusCompleted;
    case 'cancelled':
      return t.statusCancelled;
    case 'pending':
      return t.statusPending;
    case 'accepted':
      return t.statusAccepted;
    case 'rejected':
      return t.statusRejected;
    case 'withdrawn':
      return t.statusWithdrawn;
    default:
      return status;
  }
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
