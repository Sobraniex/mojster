import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { dictionaries, Dict } from './translations';
import { Lang } from './types';

const LANG_KEY = '@mojster/lang';

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  t: Dict;
  /** Replace {n} placeholders */
  tf: (key: keyof Dict, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('sl');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (
          saved === 'sl' ||
          saved === 'ro' ||
          saved === 'en' ||
          saved === 'it' ||
          saved === 'de' ||
          saved === 'nl'
        ) {
          setLangState(saved);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLang = useCallback(async (next: Lang) => {
    setLangState(next);
    await AsyncStorage.setItem(LANG_KEY, next);
  }, []);

  const t = dictionaries[lang];

  const tf = useCallback(
    (key: keyof Dict, vars?: Record<string, string | number>) => {
      let s = dictionaries[lang][key] ?? String(key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return s;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, tf }),
    [lang, setLang, t, tf]
  );

  if (!ready) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
