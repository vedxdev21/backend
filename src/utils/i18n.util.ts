import fs from 'fs';
import path from 'path';

type TranslationMap = Record<string, string>;
type Translations = Record<string, TranslationMap>;

const translations: Translations = {};

/**
 * Load translation files from locales directory
 */
const loadTranslations = (): void => {
  const localesDir = path.join(__dirname, '..', 'locales');
  const languages = ['en', 'hi'];

  for (const lang of languages) {
    const filePath = path.join(localesDir, `${lang}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        translations[lang] = JSON.parse(content);
      } else {
        translations[lang] = {};
      }
    } catch {
      translations[lang] = {};
    }
  }
};

// Load on module import
loadTranslations();

/**
 * Translate a key to the specified language
 * Falls back to English if key not found in target language
 * Falls back to key itself if not found anywhere
 */
export const t = (key: string, lang: string = 'en', params?: Record<string, string>): string => {
  let text = translations[lang]?.[key] || translations['en']?.[key] || key;

  // Replace parameters like {{name}} with actual values
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
    }
  }

  return text;
};

export default t;
