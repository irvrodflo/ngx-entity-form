import { FormControl, FormGroup } from '@angular/forms';

import { EntityFields, EntityForm, GroupOptions } from './types';

export function entityForm<T>(controls: EntityFields<T>, options?: GroupOptions): EntityForm<T> {
  return new FormGroup<EntityFields<T>>(controls, options);
}

export function patchFileControl(event: Event, control: FormControl<File | null>): void {
  if (!(event.target instanceof HTMLInputElement)) {
    throw new Error('patchFileControl expects an HTMLInputElement');
  }

  const file = event.target.files?.[0] ?? null;

  control.setValue(file);
  control.markAsTouched();
}

export function clearFileControl(
  control: FormControl<File | null>,
  inputElement?: HTMLInputElement,
): void {
  control.setValue(null);
  control.markAsTouched();

  if (inputElement) {
    inputElement.value = '';
  }
}
