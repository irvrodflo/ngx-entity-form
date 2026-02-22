import { FormControl } from '@angular/forms';

import { ControlConfig } from './types';
import { optionalControl, requiredControl } from './controls';

export const entity = {
  required<T>(
    initialValue: NonNullable<T>,
    config: ControlConfig = [],
  ): FormControl<NonNullable<T>> {
    return requiredControl<T>(initialValue, config);
  },

  optional<T>(initialValue: T | null, config: ControlConfig = []): FormControl<T | null> {
    return optionalControl<T>(initialValue, config);
  },

  file(config: ControlConfig = []): FormControl<File | null> {
    return optionalControl<File>(null, config);
  },
};
