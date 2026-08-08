import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createSeedData } from '../data/seed';
import {
  AppMode,
  Job,
  JobStatus,
  Offer,
  OfferStatus,
  PlanId,
  User,
} from '../data/types';
import {
  clearAll,
  loadAppState,
  saveCurrentUser,
  saveJobs,
  saveOffers,
  saveOnboardingComplete,
  saveUsers,
  uid,
  workerNeedsPayment,
} from '../lib/storage';

interface CreateProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Initial mode: need work done vs looking for work */
  activeMode: AppMode;
  city?: string;
  specialties?: string[];
}

interface CreateJobInput {
  categoryId: string;
  title: string;
  description: string;
  location: string;
  city: string;
  budget: number | null;
  photos: string[];
}

interface CreateOfferInput {
  jobId: string;
  price: number;
  message: string;
}

interface AppContextValue {
  ready: boolean;
  currentUser: User | null;
  users: User[];
  jobs: Job[];
  offers: Offer[];
  onboardingComplete: boolean;
  /** true when activeMode is worker */
  isWorkerMode: boolean;
  /** true when activeMode is customer */
  isCustomerMode: boolean;
  /** Worker profile exists but subscription not paid */
  needsPayment: boolean;
  setActiveMode: (mode: AppMode) => Promise<void>;
  createProfile: (input: CreateProfileInput) => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  /** Complete worker subscription payment */
  completePayment: (input: {
    planId: PlanId;
    cardLast4: string;
  }) => Promise<void>;
  createJob: (input: CreateJobInput) => Promise<Job>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  createOffer: (input: CreateOfferInput) => Promise<Offer>;
  acceptOffer: (offerId: string) => Promise<void>;
  rejectOffer: (offerId: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getOffersForJob: (jobId: string) => Offer[];
  getMyJobs: () => Job[];
  getOpenJobs: (categoryId?: string) => Job[];
  getJobsMatchingWorker: () => Job[];
  logout: () => Promise<void>;
  resetDemo: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    (async () => {
      const state = await loadAppState();
      setCurrentUser(state.currentUser ?? null);
      setUsers(state.users ?? []);
      setJobs(state.jobs ?? []);
      setOffers(state.offers ?? []);
      setOnboardingComplete(state.onboardingComplete ?? false);
      setReady(true);
    })();
  }, []);

  const createProfile = useCallback(async (input: CreateProfileInput) => {
    const isWorker = input.activeMode === 'worker';
    const user: User = {
      id: uid('user'),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      role: isWorker ? 'worker' : 'customer',
      activeMode: input.activeMode,
      specialties: input.specialties ?? [],
      city: input.city?.trim() || '',
      createdAt: new Date().toISOString(),
      // Workers must complete payment before full access
      paymentStatus: isWorker ? 'unpaid' : 'not_required',
      subscriptionPlan: null,
      paidAt: null,
      paymentCardLast4: null,
    };

    const seed = createSeedData(user.id);
    const allUsers = [user, ...seed.users];

    setCurrentUser(user);
    setUsers(allUsers);
    setJobs(seed.jobs);
    setOffers(seed.offers);
    setOnboardingComplete(true);

    await Promise.all([
      saveCurrentUser(user),
      saveUsers(allUsers),
      saveJobs(seed.jobs),
      saveOffers(seed.offers),
      saveOnboardingComplete(true),
    ]);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...patch, id: currentUser.id };
      setCurrentUser(updated);
      const nextUsers = users.map((u) => (u.id === updated.id ? updated : u));
      setUsers(nextUsers);
      await Promise.all([saveCurrentUser(updated), saveUsers(nextUsers)]);
    },
    [currentUser, users]
  );

  const setActiveMode = useCallback(
    async (mode: AppMode) => {
      if (!currentUser) return;
      const updated: User = {
        ...currentUser,
        activeMode: mode,
      };
      setCurrentUser(updated);
      const nextUsers = users.map((u) => (u.id === updated.id ? updated : u));
      setUsers(nextUsers);
      await Promise.all([saveCurrentUser(updated), saveUsers(nextUsers)]);
    },
    [currentUser, users]
  );

  const completePayment = useCallback(
    async (input: { planId: PlanId; cardLast4: string }) => {
      if (!currentUser) throw new Error('Ni prijavljenega uporabnika');
      const updated: User = {
        ...currentUser,
        paymentStatus: 'active',
        subscriptionPlan: input.planId,
        paidAt: new Date().toISOString(),
        paymentCardLast4: input.cardLast4,
        activeMode: 'worker',
        role: 'worker',
      };
      setCurrentUser(updated);
      const nextUsers = users.map((u) => (u.id === updated.id ? updated : u));
      setUsers(nextUsers);
      await Promise.all([saveCurrentUser(updated), saveUsers(nextUsers)]);
    },
    [currentUser, users]
  );

  const createJob = useCallback(
    async (input: CreateJobInput): Promise<Job> => {
      if (!currentUser) throw new Error('Ni prijavljenega uporabnika');
      const now = new Date().toISOString();
      const job: Job = {
        id: uid('job'),
        userId: currentUser.id,
        categoryId: input.categoryId,
        title: input.title.trim(),
        description: input.description.trim(),
        location: input.location.trim(),
        city: input.city.trim(),
        budget: input.budget,
        photos: input.photos,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      };
      const next = [job, ...jobs];
      setJobs(next);
      await saveJobs(next);
      return job;
    },
    [currentUser, jobs]
  );

  const updateJobStatus = useCallback(
    async (jobId: string, status: JobStatus) => {
      const next = jobs.map((j) =>
        j.id === jobId ? { ...j, status, updatedAt: new Date().toISOString() } : j
      );
      setJobs(next);
      await saveJobs(next);
    },
    [jobs]
  );

  const deleteJob = useCallback(
    async (jobId: string) => {
      const nextJobs = jobs.filter((j) => j.id !== jobId);
      const nextOffers = offers.filter((o) => o.jobId !== jobId);
      setJobs(nextJobs);
      setOffers(nextOffers);
      await Promise.all([saveJobs(nextJobs), saveOffers(nextOffers)]);
    },
    [jobs, offers]
  );

  const createOffer = useCallback(
    async (input: CreateOfferInput): Promise<Offer> => {
      if (!currentUser) throw new Error('Ni prijavljenega uporabnika');
      if (workerNeedsPayment(currentUser)) {
        throw new Error('Za ponudbe je potrebna aktivna naročnina');
      }
      const offer: Offer = {
        id: uid('offer'),
        jobId: input.jobId,
        workerId: currentUser.id,
        price: input.price,
        message: input.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const next = [offer, ...offers];
      setOffers(next);
      await saveOffers(next);
      return offer;
    },
    [currentUser, offers]
  );

  const acceptOffer = useCallback(
    async (offerId: string) => {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) return;

      const nextOffers = offers.map((o) => {
        if (o.id === offerId) return { ...o, status: 'accepted' as OfferStatus };
        if (o.jobId === offer.jobId && o.status === 'pending') {
          return { ...o, status: 'rejected' as OfferStatus };
        }
        return o;
      });

      const nextJobs = jobs.map((j) =>
        j.id === offer.jobId
          ? {
              ...j,
              status: 'in_progress' as JobStatus,
              acceptedOfferId: offerId,
              updatedAt: new Date().toISOString(),
            }
          : j
      );

      setOffers(nextOffers);
      setJobs(nextJobs);
      await Promise.all([saveOffers(nextOffers), saveJobs(nextJobs)]);
    },
    [offers, jobs]
  );

  const rejectOffer = useCallback(
    async (offerId: string) => {
      const next = offers.map((o) =>
        o.id === offerId ? { ...o, status: 'rejected' as OfferStatus } : o
      );
      setOffers(next);
      await saveOffers(next);
    },
    [offers]
  );

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id) ?? (currentUser?.id === id ? currentUser : undefined),
    [users, currentUser]
  );

  const getOffersForJob = useCallback(
    (jobId: string) =>
      offers
        .filter((o) => o.jobId === jobId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [offers]
  );

  const getMyJobs = useCallback(() => {
    if (!currentUser) return [];
    return jobs
      .filter((j) => j.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, jobs]);

  const getOpenJobs = useCallback(
    (categoryId?: string) =>
      jobs
        .filter((j) => j.status === 'open' && (!categoryId || j.categoryId === categoryId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [jobs]
  );

  const getJobsMatchingWorker = useCallback(() => {
    if (!currentUser) return [];
    const specs = currentUser.specialties;
    return jobs
      .filter(
        (j) =>
          j.status === 'open' &&
          j.userId !== currentUser.id &&
          (specs.length === 0 || specs.includes(j.categoryId))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, jobs]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    setOnboardingComplete(false);
    await Promise.all([saveCurrentUser(null), saveOnboardingComplete(false)]);
  }, []);

  const resetDemo = useCallback(async () => {
    setCurrentUser(null);
    setUsers([]);
    setJobs([]);
    setOffers([]);
    setOnboardingComplete(false);
    await clearAll();
  }, []);

  const isWorkerMode = currentUser?.activeMode === 'worker';
  const isCustomerMode = currentUser?.activeMode !== 'worker';
  const needsPayment = workerNeedsPayment(currentUser);

  const value = useMemo(
    () => ({
      ready,
      currentUser,
      users,
      jobs,
      offers,
      onboardingComplete,
      isWorkerMode,
      isCustomerMode,
      needsPayment,
      setActiveMode,
      createProfile,
      updateProfile,
      completePayment,
      createJob,
      updateJobStatus,
      deleteJob,
      createOffer,
      acceptOffer,
      rejectOffer,
      getUserById,
      getOffersForJob,
      getMyJobs,
      getOpenJobs,
      getJobsMatchingWorker,
      logout,
      resetDemo,
    }),
    [
      ready,
      currentUser,
      users,
      jobs,
      offers,
      onboardingComplete,
      isWorkerMode,
      isCustomerMode,
      needsPayment,
      setActiveMode,
      createProfile,
      updateProfile,
      completePayment,
      createJob,
      updateJobStatus,
      deleteJob,
      createOffer,
      acceptOffer,
      rejectOffer,
      getUserById,
      getOffersForJob,
      getMyJobs,
      getOpenJobs,
      getJobsMatchingWorker,
      logout,
      resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
