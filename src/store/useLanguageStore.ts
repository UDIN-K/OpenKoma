import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, LanguageCode, TranslationKey } from '../i18n';

interface LanguageState {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      t: (key, params) => {
        const { locale } = get();
        let text = translations[locale]?.[key] || translations['en'][key] || key;
        
        if (params && text) {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(`{${paramKey}}`, String(paramValue));
          });
        }
        return text;
      },
    }),
    {
      name: 'openkoma-language',
    }
  )
);
