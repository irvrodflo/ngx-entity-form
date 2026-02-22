import { AsyncValidatorFn, FormControl, FormGroup, ValidatorFn } from '@angular/forms';

export type EntityFields<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export type EntityForm<T> = FormGroup<EntityFields<T>>;

export interface ControlOptions {
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
  disabled?: boolean;
  updateOn?: 'change' | 'blur' | 'submit';
}

export type ControlConfig = ValidatorFn | ValidatorFn[] | ControlOptions;

export interface GroupOptions {
  validators?: ValidatorFn | ValidatorFn[];
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
  updateOn?: 'change' | 'blur' | 'submit';
}
