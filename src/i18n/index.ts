import { en } from './locales/en';
import { id } from './locales/id';

export const translations = {
  en,
  id,
};

export type LanguageCode = keyof typeof translations;
export type TranslationKey = keyof typeof en;
