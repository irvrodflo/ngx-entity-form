import { InjectionToken } from '@angular/core';
import { ValidatorFn } from '@angular/forms';

export interface DefaultValidatorsConfig {
  all?: ValidatorFn[];
  required?: ValidatorFn[];
  optional?: ValidatorFn[];
}

export const DEFAULT_VALIDATORS_TOKEN = new InjectionToken<DefaultValidatorsConfig>(
  'NG_ENTITY_FORMS_DEFAULT_VALIDATORS',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);
