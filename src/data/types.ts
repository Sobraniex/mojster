export type UserRole = 'customer' | 'worker' | 'both';

/** Active app mode — what the user is doing right now */
export type AppMode = 'customer' | 'worker';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

/** Worker subscription billing */
export type PaymentStatus = 'not_required' | 'unpaid' | 'active' | 'expired';

export type PlanId = 'monthly' | 'quarterly' | 'yearly';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  /** Current session mode: need work done vs looking for work */
  activeMode: AppMode;
  /** Category IDs the worker specializes in */
  specialties: string[];
  bio?: string;
  city?: string;
  avatarUri?: string;
  createdAt: string;
  /** Customers: not_required. Workers must pay to use platform. */
  paymentStatus: PaymentStatus;
  subscriptionPlan?: PlanId | null;
  paidAt?: string | null;
  /** Last 4 digits of card for display */
  paymentCardLast4?: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
}

export interface Job {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  city: string;
  /** Budget in EUR; null means "po dogovoru" (negotiable) */
  budget: number | null;
  photos: string[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  /** Accepted offer id when deal is made */
  acceptedOfferId?: string;
}

export interface Offer {
  id: string;
  jobId: string;
  workerId: string;
  /** Proposed price in EUR */
  price: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  jobs: Job[];
  offers: Offer[];
  onboardingComplete: boolean;
}
