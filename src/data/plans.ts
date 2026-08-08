export type PlanId = 'monthly' | 'quarterly' | 'yearly';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  priceEur: number;
  periodLabel: string;
  /** Price per month for comparison */
  monthlyEquivalent: number;
  badge?: string;
  features: string[];
}

/** Mojster platform access — required for worker profiles */
export const WORKER_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Mesečno',
    priceEur: 29,
    periodLabel: '/ mesec',
    monthlyEquivalent: 29,
    features: [
      'Neomejen dostop do odprtih del',
      'Pošiljanje ponudb',
      'Profil mojstra viden strankam',
      'Podpora v app-u',
    ],
  },
  {
    id: 'quarterly',
    name: 'Četrtletno',
    priceEur: 69,
    periodLabel: '/ 3 mesece',
    monthlyEquivalent: 23,
    badge: 'Priljubljeno',
    features: [
      'Vse iz mesečnega paketa',
      'Prioriteta v iskanju',
      'Prihranek ~20 %',
    ],
  },
  {
    id: 'yearly',
    name: 'Letno',
    priceEur: 199,
    periodLabel: '/ leto',
    monthlyEquivalent: 16.6,
    badge: 'Najboljša vrednost',
    features: [
      'Vse iz četrtletnega paketa',
      'Značka Preverjen mojster',
      'Prihranek ~40 %',
    ],
  },
];

export function getPlanById(id: PlanId | null | undefined): SubscriptionPlan | undefined {
  if (!id) return undefined;
  return WORKER_PLANS.find((p) => p.id === id);
}
