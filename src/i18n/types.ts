export type Lang = 'sl' | 'ro' | 'en' | 'it' | 'de' | 'nl';

export const LANGS: { id: Lang; label: string; native: string }[] = [
  { id: 'sl', label: 'Slovenian', native: 'Slovenščina' },
  { id: 'ro', label: 'Romanian', native: 'Română' },
  { id: 'en', label: 'English', native: 'English' },
  { id: 'it', label: 'Italian', native: 'Italiano' },
  { id: 'de', label: 'German', native: 'Deutsch' },
  { id: 'nl', label: 'Dutch', native: 'Nederlands' },
];

export type TranslationKey = keyof typeof import('./translations').sl;
