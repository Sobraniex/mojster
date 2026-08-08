export function formatPrice(budget: number | null): string {
  if (budget === null || budget === undefined) return 'Po dogovoru';
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

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'pravkar';
  if (mins < 60) return `pred ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `pred ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'včeraj';
  if (days < 7) return `pred ${days} dnevi`;
  return formatDate(iso);
}

export function statusLabel(status: string): string {
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

export function roleLabel(role: string): string {
  switch (role) {
    case 'customer':
      return 'Stranka';
    case 'worker':
      return 'Mojster';
    case 'both':
      return 'Stranka in mojster';
    default:
      return role;
  }
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
