# ngx-entity-forms

Strongly-typed reactive forms for Angular. Define your entity interface — the library maps it to a fully-typed `FormGroup` with autocompletion, validation, and error messages out of the box.

---

## Requirements

- Angular 17+

---

## Installation

```bash
npm install @irv-labs/ngx-entity-forms
```

---

## Quick Start

```typescript
import { entity, entityForm } from '@irv-labs/ngx-entity-forms';

export interface ProductForm {
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  thumbnail: File | null;
}

protected form = entityForm<ProductForm>({
  name:        entity.required(''),
  description: entity.optional<string>(null),
  price:       entity.required(0),
  active:      entity.required(false),
  thumbnail:   entity.file(),
});

// TypeScript knows the exact type of every control
// form.controls.name        → FormControl<string>
// form.controls.description → FormControl<string | null>
// form.controls.thumbnail   → FormControl<File | null>
```

---

## API

### `entity.required(initialValue, config?)`

Creates a non-nullable `FormControl` with `Validators.required` applied automatically.

The initial value can be any valid value for the field type — including `null` when you want the field to start empty. The type of the control is always inferred from the generic parameter, not the initial value.

```typescript
entity.required(''); // starts empty
entity.required(0); // 0 is a valid initial value
entity.required(false); // false is a valid initial value
entity.required<string>(null); // starts null, control type is FormControl<string>
entity.required<number>(null); // starts null, control type is FormControl<number>
```

> When passing `null`, always annotate the generic explicitly — TypeScript cannot infer the type from `null` alone.

The second argument is flexible — pick whatever fits:

```typescript
entity.required('', Validators.minLength(3))                         // single validator
entity.required('', [Validators.minLength(3), myValidator])          // array
entity.required('', { validators: [...], disabled: true, updateOn: 'blur' }) // full options
```

---

### `entity.optional<T>(initialValue, config?)`

Creates a nullable `FormControl<T | null>`.

```typescript
entity.optional<string>(null)
entity.optional<number>(null, Validators.max(100))
entity.optional<string>(null, [Validators.maxLength(500), myValidator])
entity.optional<string>(null, { validators: [...], disabled: true })
```

---

### `entity.file(config?)`

Creates a `FormControl<File | null>`. The value is the native `File` object — no wrappers, no library types leaking into your entity.

```typescript
entity.file();
entity.file({ validators: [mimeTypeValidator, maxFileSizeValidator] });
```

---

### `entityForm<T>(controls, options?)`

Creates a fully-typed `FormGroup` from your entity. Supports single or multiple cross-field validators at the form level.

```typescript
// Basic
const form = entityForm<ProductForm>({ ... });

// With cross-field validator
const form = entityForm<ProductForm>(
  { ... },
  { validators: passwordMatchValidator },
);

// Multiple cross-field validators
const form = entityForm<ProductForm>(
  { ... },
  { validators: [passwordMatchValidator, priceRangeValidator] },
);
```

---

## File Handling

Declare the field as `File | null` in your entity — no library types needed.

```typescript
export interface ProductForm {
  thumbnail: File | null;
}
```

Use `patchFileControl` and `clearFileControl` to connect the native input:

```typescript
import { patchFileControl, clearFileControl } from '@irv-labs/ngx-entity-forms';

@Component({
  template: `
    <input #fileInput type="file" (change)="onFileChange($event)" />
    <button type="button" (click)="removeFile()">Remove</button>
    @if (form.controls.thumbnail.value; as file) {
      <span>{{ file.name }} — {{ (file.size / 1024).toFixed(1) }}KB</span>
    }
  `,
})
export class MyComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected form = entityForm<ProductForm>({
    thumbnail: entity.file({ validators: [mimeTypeValidator] }),
  });

  onFileChange(event: Event): void {
    patchFileControl(event, this.form.controls.thumbnail);
  }

  removeFile(): void {
    // Resets the native input so the browser forgets the previous selection
    clearFileControl(this.form.controls.thumbnail, this.fileInput.nativeElement);
  }

  onSubmit(): void {
    const { thumbnail } = this.form.getRawValue();
    const formData = new FormData();
    if (thumbnail) formData.append('thumbnail', thumbnail); // native File, ready to upload
  }
}
```

---

## Global Validators

Register validators once in `app.config.ts`. They are applied automatically to every control — no need to repeat them per field.

```typescript
// app.config.ts
import { provideDefaultValidators } from '@irv-labs/ngx-entity-forms';

provideDefaultValidators({
  all: [Validators.maxLength(255)], // every control
  required: [trimValidator], // required controls only
  optional: [], // optional controls only
});
```

Per-control validators are always **additive** — they stack on top of the global ones.

---

## Error Messages

Built-in Angular validators (`required`, `minlength`, `maxlength`, `min`, `max`, `email`, `pattern`) are resolved automatically. **English is the default locale.**

### `provideErrorMessages` — custom messages

Merges your custom messages on top of the English built-ins. Only define what you need.

```typescript
// app.config.ts
import { provideErrorMessages } from '@irv-labs/ngx-entity-forms';

provideErrorMessages({
  // Custom validator messages
  whitespace: 'Cannot contain only whitespace',
  passwordMismatch: 'Passwords do not match',
  slugTaken: (err) => `The slug "${err.value}" is already taken`,
  mimeType: (err) => `Invalid format. Allowed: ${err.allowed.join(', ')}`,
  maxFileSize: (err) => `File too large. Max size: ${err.maxMb}MB`,

  // Override a built-in if needed
  required: 'This field cannot be empty',
});
```

Message values can be a plain `string` or a function that receives the Angular error object:

```typescript
// Plain string
whitespace: 'Cannot contain only whitespace';

// Function with error data
minPrice: (err) => `Min price is ${err.min}`;
```

### `provideErrorMessagesLocale` — switch locale

Switches all built-in messages to a supported locale (`'en'` | `'es'`). Optionally extend with your custom messages on top.

```typescript
import { provideErrorMessagesLocale } from '@irv-labs/ngx-entity-forms';

// Spanish built-ins only
provideErrorMessagesLocale('es');

// Spanish + custom messages
provideErrorMessagesLocale('es', {
  whitespace: 'No puede contener solo espacios',
  passwordMismatch: 'Las contraseñas no coinciden',
  slugTaken: (err) => `El slug "${err.value}" ya está en uso`,

  // Override a Spanish built-in
  required: 'Campo requerido',
});
```

> Use either `provideErrorMessages` or `provideErrorMessagesLocale` — not both. If you need a locale other than English with custom messages, always use `provideErrorMessagesLocale`.

### `fieldErrors` pipe

Returns `FieldError[]` — only when the control is `touched` or `dirty`. Each item has a stable `key` and a resolved `message`.

```typescript
imports: [FieldErrorsPipe];
```

```html
<!-- Global messages -->
@for (error of form.controls.name | fieldErrors; track error.key) {
<small class="error">{{ error.message }}</small>
}

<!-- Local override — takes priority over global messages for this field only -->
@for ( error of form.controls.name | fieldErrors: { required: 'Product name is required' }; track
error.key ) {
<small class="error">{{ error.message }}</small>
}

<!-- Cross-field errors on the FormGroup -->
@for (error of form | fieldErrors; track error.key) {
<p class="error">{{ error.message }}</p>
}
```

Always use `track error.key` — the error key is stable and avoids Angular's `NG0956` warning.

---

## Async Validators

Pass them through the options object along with `updateOn: 'blur'` to avoid hammering the server on every keystroke.

```typescript
entity.required('', {
  validators: [Validators.minLength(3), Validators.pattern(/^[a-z0-9-]+$/)],
  asyncValidators: [slugAvailableValidator],
  updateOn: 'blur',
});
```

Always check `form.pending` before submitting — async validators may still be running:

```typescript
onSubmit(): void {
  this.form.markAllAsTouched();
  if (this.form.pending) return;  // async validators still running
  if (this.form.invalid) return;

  const value = this.form.getRawValue();
}
```

---

## Dynamic Fields

Start a field as disabled and toggle it based on business logic:

```typescript
protected form = entityForm<MyEntity>({
  featured:     entity.optional<boolean>(null),
  discountCode: entity.optional<string>(null, { disabled: true }), // starts disabled
});

onFeaturedChange(): void {
  if (this.form.controls.featured.value) {
    this.form.controls.discountCode.enable();
  } else {
    this.form.controls.discountCode.disable();
    this.form.controls.discountCode.setValue(null);
  }
}
```

`getRawValue()` includes disabled fields. `value` does not.

---

## Considerations

### Optional fields require `string | null` — not `name?`

Angular's `FormControl` does not support `undefined`. Use explicit null unions instead of optional properties.

```typescript
// will not work
export interface ProductForm {
  description?: string;
}

// correct
export interface ProductForm {
  description: string | null;
}
```

If your domain entity uses `?`, create a dedicated form interface:

```typescript
// Domain entity — keep as is
export interface Product {
  name: string;
  description?: string;
}

// Form interface — explicit nulls
export interface ProductForm {
  name: string;
  description: string | null;
}

protected form = entityForm<ProductForm>({ ... });
```

### `0`, `false`, and `null` are valid initial values

```typescript
entity.required(0); // stock starting at zero
entity.required(false); // checkbox starting unchecked
entity.required<string>(null); // field starting empty — annotate the generic explicitly
```

### Always use `getRawValue()` on submit

`form.value` omits disabled fields. `getRawValue()` includes them.

```typescript
const value = this.form.getRawValue(); // includes disabled fields
```

### The `fieldErrors` pipe is `pure: false`

It re-evaluates on every change detection cycle to react to control state changes (`touched`, `dirty`, `errors`). This is intentional — a pure pipe would miss mutations on the same `FormControl` reference. For large forms, pair it with `OnPush` change detection on your component.

---

## Full Example

```typescript
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  entity,
  entityForm,
  patchFileControl,
  clearFileControl,
  FieldErrorsPipe,
} from '@irv-labs/ngx-entity-forms';

export interface ProductForm {
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  thumbnail: File | null;
}

function noNegativePrice(control: AbstractControl): ValidationErrors | null {
  return (control.value as number) < 0 ? { negativePrice: true } : null;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FieldErrorsPipe],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Product name" />
      @for (e of form.controls.name | fieldErrors; track e.key) {
        <small>{{ e.message }}</small>
      }

      <input type="number" formControlName="price" />
      @for (e of form.controls.price | fieldErrors; track e.key) {
        <small>{{ e.message }}</small>
      }

      <input #fileInput type="file" (change)="onFileChange($event)" />
      @if (form.controls.thumbnail.value; as file) {
        <span>{{ file.name }}</span>
      }

      <button type="submit">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected form = entityForm<ProductForm>({
    name: entity.required('', Validators.minLength(3)),
    description: entity.optional<string>(null),
    price: entity.required(0, [Validators.min(0), noNegativePrice]),
    active: entity.required(false),
    thumbnail: entity.file(),
  });

  onFileChange(event: Event): void {
    patchFileControl(event, this.form.controls.thumbnail);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.pending || this.form.invalid) return;

    const value = this.form.getRawValue();
    // value.name      → string
    // value.price     → number
    // value.thumbnail → File | null
  }
}
```

---

## Public API

| Export                       | Description                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `entity`                     | Builder object — `entity.required`, `entity.optional`, `entity.file`                 |
| `entityForm`                 | Creates a typed `FormGroup<EntityFields<T>>`                                         |
| `patchFileControl`           | Updates a file control from a native input `change` event                            |
| `clearFileControl`           | Clears a file control and resets the native input element                            |
| `FieldErrorsPipe`            | Pipe that resolves control errors to `FieldError[]`                                  |
| `provideDefaultValidators`   | Registers global validators in `app.config`                                          |
| `provideErrorMessages`       | Registers custom error messages in `app.config` (English base)                       |
| `provideErrorMessagesLocale` | Switches built-in messages to a locale (`'en'` \| `'es'`) + optional custom messages |
| `EntityForm<T>`              | Type alias for `FormGroup<EntityFields<T>>`                                          |
| `EntityFields<T>`            | Maps entity fields to typed `FormControl`                                            |
| `ControlConfig`              | Second argument type for `entity.required` / `entity.optional`                       |
| `FieldError`                 | `{ key: string; message: string }` — returned by `fieldErrors` pipe                  |
| `ErrorMessages`              | Error messages map type                                                              |
| `SupportedLocale`            | `'en' \| 'es'`                                                                       |
| `DefaultValidatorsConfig`    | Config type for `provideDefaultValidators`                                           |

---

## Path Alias (optional)

If you prefer a shorter import, configure a path alias in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@entity-forms": ["./node_modules/@irv-labs/ngx-entity-forms"]
    }
  }
}
```

Then import from the alias instead:

```typescript
// Before
import { entity, entityForm, FieldErrorsPipe } from '@irv-labs/ngx-entity-forms';

// After
import { entity, entityForm, FieldErrorsPipe } from '@entity-forms';
```

> This is purely a local convenience — it does not affect the published package or your teammates unless they add the same alias to their `tsconfig.json`.

---

## Philosophy

Angular's reactive forms are powerful but verbose. Typed forms (introduced in Angular 14) improved the situation, but the boilerplate of creating controls, wiring validators, and displaying errors still adds up fast across a real project.

`ngx-entity-forms` takes the position that your form should follow your entity — not the other way around. You define the shape of your data once, and the library derives the form structure from it. TypeScript does the rest.

- **Entity-first** — your interface is the source of truth, the form follows it
- **Zero guessing** — full autocompletion on `form.controls.X` with the correct type
- **Flat API** — one builder object, three methods, one function to create the group
- **Additive** — global validators and error messages layer on top without touching your controls
- **No lock-in** — built entirely on Angular's own `FormControl` and `FormGroup`, no custom abstractions underneath

---

## License

MIT
