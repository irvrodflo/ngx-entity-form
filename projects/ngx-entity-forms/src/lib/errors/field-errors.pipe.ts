import { inject, Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { ErrorMessageValue, ERROR_MESSAGES_TOKEN, ErrorMessages } from './error-messages.token';

function resolveMessage(messageValue: ErrorMessageValue, errorData: unknown): string {
  return typeof messageValue === 'function' ? messageValue(errorData) : messageValue;
}

export interface FieldError {
  key: string;
  message: string;
}

@Pipe({
  name: 'fieldErrors',
  standalone: true,
  pure: false,
})
export class FieldErrorsPipe implements PipeTransform {
  private readonly globalMessages = inject(ERROR_MESSAGES_TOKEN);
  transform(control: AbstractControl | null | undefined, overrides?: ErrorMessages): FieldError[] {
    if (!control || !control.errors) return [];

    if (!control.touched && !control.dirty) return [];

    const messages: ErrorMessages = overrides
      ? { ...this.globalMessages, ...overrides }
      : this.globalMessages;

    return Object.entries(control.errors).map(([key, errorData]) => {
      const messageValue = messages[key];
      const message = messageValue ? resolveMessage(messageValue, errorData) : `[${key}]`;
      return { key, message };
    });
  }
}
