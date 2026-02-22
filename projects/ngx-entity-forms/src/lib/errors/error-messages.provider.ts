import { Provider } from '@angular/core';

import {
  BUILT_IN_ERROR_MESSAGES,
  ERROR_MESSAGES_TOKEN,
  ErrorMessages,
  SupportedLocale,
} from './error-messages.token';

export function provideErrorMessages(messages: ErrorMessages): Provider {
  return {
    provide: ERROR_MESSAGES_TOKEN,
    useValue: { ...BUILT_IN_ERROR_MESSAGES['en'], ...messages },
  };
}

export function provideErrorMessagesLocale(
  locale: SupportedLocale,
  messages: ErrorMessages = {},
): Provider {
  return {
    provide: ERROR_MESSAGES_TOKEN,
    useValue: { ...BUILT_IN_ERROR_MESSAGES[locale], ...messages },
  };
}
