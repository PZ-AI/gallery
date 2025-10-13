import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './locales/en';

export const i18n = new I18n({ en });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = Localization.locale ?? 'en';

export const translate = (key: string, options?: Record<string, any>) =>
  i18n.t(key, options);
