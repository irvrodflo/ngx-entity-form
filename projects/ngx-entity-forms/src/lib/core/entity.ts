import { FormControl } from '@angular/forms';

import { ControlConfig } from './types';
import { optionalControl, requiredControl } from './controls';

function required<T>(initialValue: null, config?: ControlConfig): FormControl<T>;
function required<T>(
  initialValue: NonNullable<T>,
  config?: ControlConfig,
): FormControl<NonNullable<T>>;
function required<T>(
  initialValue: NonNullable<T> | null,
  config: ControlConfig = [],
): FormControl<T> {
  return requiredControl<T>(initialValue as NonNullable<T>, config);
}

export const entity = {
  required,

  optional<T>(initialValue: T | null, config: ControlConfig = []): FormControl<T | null> {
    return optionalControl<T>(initialValue, config);
  },

  file(config: ControlConfig = []): FormControl<File | null> {
    return optionalControl<File>(null, config);
  },
};
