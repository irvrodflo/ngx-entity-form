import { inject } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';

import { ControlOptions, ControlConfig } from './types';
import { DEFAULT_VALIDATORS_TOKEN } from '../validation/validation.token';

export function normalizeConfig(config: ControlConfig): ControlOptions {
  if (typeof config === 'function') {
    return { validators: [config as ValidatorFn] };
  }

  if (Array.isArray(config)) {
    return { validators: config as ValidatorFn[] };
  }

  return config as ControlOptions;
}

export function resolveGlobalValidators(type: 'required' | 'optional'): ValidatorFn[] {
  const config = inject(DEFAULT_VALIDATORS_TOKEN);
  return [...(config.all ?? []), ...(config[type] ?? [])];
}

export function requiredControl<T>(
  initialValue: NonNullable<T>,
  config: ControlConfig = [],
): FormControl<NonNullable<T>> {
  const {
    validators = [],
    asyncValidators = [],
    disabled = false,
    updateOn,
  } = normalizeConfig(config);

  const globalValidators = resolveGlobalValidators('required');

  return new FormControl<NonNullable<T>>(
    { value: initialValue, disabled },
    {
      nonNullable: true,
      validators: [Validators.required, ...globalValidators, ...validators],
      asyncValidators,
      updateOn,
    },
  ) as FormControl<NonNullable<T>>;
}

export function optionalControl<T>(
  initialValue: T | null,
  config: ControlConfig = [],
): FormControl<T | null> {
  const {
    validators = [],
    asyncValidators = [],
    disabled = false,
    updateOn,
  } = normalizeConfig(config);

  const globalValidators = resolveGlobalValidators('optional');

  return new FormControl<T | null>(
    { value: initialValue, disabled },
    {
      validators: [...globalValidators, ...validators],
      asyncValidators,
      updateOn,
    },
  );
}
