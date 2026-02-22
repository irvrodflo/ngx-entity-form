import { InjectionToken } from '@angular/core';

export type ErrorMessageFn = (err: unknown) => string;
export type ErrorMessageValue = string | ErrorMessageFn;
export type ErrorMessages = Record<string, ErrorMessageValue>;

export type SupportedLocale = 'en' | 'es';

const BUILT_IN_ERROR_MESSAGES_EN: ErrorMessages = {
  required: 'This field is required',
  email: 'Invalid email format',
  pattern: 'Invalid format',
  minlength: (err: unknown) =>
    `Minimum ${(err as { requiredLength: number }).requiredLength} characters`,
  maxlength: (err: unknown) =>
    `Maximum ${(err as { requiredLength: number }).requiredLength} characters`,
  min: (err: unknown) => `Minimum value is ${(err as { min: number }).min}`,
  max: (err: unknown) => `Maximum value is ${(err as { max: number }).max}`,
};

const BUILT_IN_ERROR_MESSAGES_ES: ErrorMessages = {
  required: 'Este campo es obligatorio',
  email: 'El formato del email no es válido',
  pattern: 'El formato no es válido',
  minlength: (err: unknown) =>
    `Mínimo ${(err as { requiredLength: number }).requiredLength} caracteres`,
  maxlength: (err: unknown) =>
    `Máximo ${(err as { requiredLength: number }).requiredLength} caracteres`,
  min: (err: unknown) => `El valor mínimo es ${(err as { min: number }).min}`,
  max: (err: unknown) => `El valor máximo es ${(err as { max: number }).max}`,
};

export const BUILT_IN_ERROR_MESSAGES: Record<SupportedLocale, ErrorMessages> = {
  en: BUILT_IN_ERROR_MESSAGES_EN,
  es: BUILT_IN_ERROR_MESSAGES_ES,
};

export const ERROR_MESSAGES_TOKEN = new InjectionToken<ErrorMessages>(
  'NG_ENTITY_FORMS_ERROR_MESSAGES',
  {
    providedIn: 'root',
    factory: () => ({ ...BUILT_IN_ERROR_MESSAGES_EN }),
  },
);
