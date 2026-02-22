import { Provider } from '@angular/core';

import { DEFAULT_VALIDATORS_TOKEN, DefaultValidatorsConfig } from './validation.token';

export function provideDefaultValidators(config: DefaultValidatorsConfig): Provider {
  return {
    provide: DEFAULT_VALIDATORS_TOKEN,
    useValue: config,
  };
}
