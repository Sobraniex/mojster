import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode, AppState, Job, Offer, User } from '../data/types';

const KEYS = {
  user: '@mojster/currentUser',
  users: '@mojster/users',
  jobs: '@mojster/jobs',
  offers: '@mojster/offers',
  onboarding: '@mojster/onboardingComplete',
};

/** Migrate older profiles that lack activeMode / payment fields */
export function normalizeUser(user: User | null): User | null {
  if (!user) return null;
  const activeMode: AppMode =
    user.activeMode === 'customer' || user.activeMode === 'worker'
      ? user.activeMode
      : user.role === 'worker'
        ? 'worker'
        : 'customer';

  const isWorker = activeMode === 'worker' || user.role === 'worker';
  let paymentStatus = user.paymentStatus;
  if (!paymentStatus) {
    paymentStatus = isWorker ? 'unpaid' : 'not_required';
  }

  return {
    ...user,
    activeMode,
    paymentStatus,
    subscriptionPlan: user.subscriptionPlan ?? null,
    paidAt: user.paidAt ?? null,
    paymentCardLast4: user.paymentCardLast4 ?? null,
  };
}

export function workerNeedsPayment(user: User | null): boolean {
  if (!user) return false;
  if (user.activeMode !== 'worker' && user.role !== 'worker') return false;
  return user.paymentStatus !== 'active';
}

export async function loadAppState(): Promise<Partial<AppState>> {
  try {
    const [user, users, jobs, offers, onboarding] = await Promise.all([
      AsyncStorage.getItem(KEYS.user),
      AsyncStorage.getItem(KEYS.users),
      AsyncStorage.getItem(KEYS.jobs),
      AsyncStorage.getItem(KEYS.offers),
      AsyncStorage.getItem(KEYS.onboarding),
    ]);

    const rawUser = user ? (JSON.parse(user) as User) : null;
    const rawUsers: User[] = users ? JSON.parse(users) : [];

    return {
      currentUser: normalizeUser(rawUser),
      users: rawUsers.map((u) => normalizeUser(u)!),
      jobs: jobs ? JSON.parse(jobs) : [],
      offers: offers ? JSON.parse(offers) : [],
      onboardingComplete: onboarding === 'true',
    };
  } catch {
    return {};
  }
}

export async function saveCurrentUser(user: User | null): Promise<void> {
  if (user) {
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(KEYS.user);
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.users, JSON.stringify(users));
}

export async function saveJobs(jobs: Job[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.jobs, JSON.stringify(jobs));
}

export async function saveOffers(offers: Offer[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.offers, JSON.stringify(offers));
}

export async function saveOnboardingComplete(done: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarding, done ? 'true' : 'false');
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
