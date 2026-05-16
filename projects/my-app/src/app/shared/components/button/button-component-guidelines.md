# Button Component Guidelines

## Purpose

These guidelines explain how to consume the shared `ButtonComponent` and how to evolve it with future opt-in/out features.

## Component location

- `projects/my-app/src/app/shared/components/button/button.component.ts`
- `projects/my-app/src/app/shared/components/button/button.component.html`
- `projects/my-app/src/app/shared/components/button/button.component.scss`
- global button styles in `projects/my-app/src/styles/components/_buttons.scss`

## Basic usage

Use the component as a drop-in button wrapper.

```html
<app-button variant="primary">Primary action</app-button>
<app-button variant="secondary">Secondary action</app-button>
<app-button size="sm">Small button</app-button>
<app-button size="lg">Large button</app-button>
<app-button type="submit">Submit</app-button>
```

## Supported inputs

This implementation includes optional hover behavior via the `hover` input. The default is `true`, so hover is enabled unless explicitly disabled.

- `variant: 'primary' | 'secondary' | 'transparent'`
- `size: 'sm' | 'md' | 'lg'`
- `type: 'button' | 'submit' | 'reset'`
- `loading: boolean`
- `disabled: boolean`
- `hover: boolean` (default `true`, opt-in/out modifier)

### Example

```html
<app-button
  variant="primary"
  size="md"
  [loading]="isSaving"
  [disabled]="isFormInvalid"
  [hover]="false"
>
  Save
</app-button>
```

## Template behavior

- The component forwards button content using `<ng-content />`.
- It renders a native `<button>` element with the computed BEM class string.
- It uses `aria-busy` and `aria-disabled` to expose loading/disabled state to assistive technologies.

## Styling and extension rules

The component relies on global BEM button styles in `_buttons.scss`. Use component inputs rather than adding ad hoc CSS classes in feature templates.

### Component stylesheet scope

`button.component.scss` should be reserved for internal template-only styles, such as the spinner and keyframes. Do not define reusable button variants or hover logic there. Shared button appearance belongs in `_buttons.scss`, and consumer-specific overrides belong in the consuming component stylesheet.

### Recommended rule for future feature flags

When adding a new boolean opt-in/out feature, follow this pattern:

1. add a new `input<boolean>(true)` on `ButtonComponent`
2. include the input in the computed `btnClass` value as either a modifier or no modifier
3. add the corresponding SCSS selector in `_buttons.scss`
4. keep the template markup unchanged unless the feature needs an extra wrapper or internal element

### Example extension pattern

If adding a `shadow` opt-out feature:

```ts
readonly shadow = input<boolean>(true);

protected readonly btnClass = computed(() => {
  const base = `btn btn--${this.variant()} btn--${this.size()}`;
  const noHover = this.hover() ? '' : ' btn--no-hover';
  const noShadow = this.shadow() ? '' : ' btn--no-shadow';
  return `${base}${noHover}${noShadow}`.trim();
});
```

```scss
.btn--no-shadow {
  box-shadow: none;
}
```

## Best practices

- Use the component input API for behavior changes instead of direct CSS overrides.
- Keep button content simple and avoid nested interactive elements inside `<app-button>`.
- Prefer `type="submit"` only on buttons within forms.
- Use `[loading]="true"` for async actions and rely on the internal spinner.
- Prefer `_buttons.scss` for shared appearance and the consuming component stylesheet for UI-specific overrides.

## Notes

- The component is designed to support independent configuration per instance.
- New button options should remain opt-in/out and reusable across the app.
- Maintain consistency by defining visual options in `_buttons.scss` and behavioral options in `ButtonComponent`.
