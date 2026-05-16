---
name: custom-component-patterns
description: Repo guidance for shared custom UI components in this Angular workspace. Best used when consuming or extending repo-specific controls like the custom ButtonComponent. Keywords: button, custom component, app-button, color theme, variant, icon button, shared UI.
---

# Custom Component Patterns — Repo

## Scope

- Shared UI components live in `projects/my-app/src/app/shared/components/`
- Shared button styles are in `projects/my-app/src/styles/components/_buttons.scss`
- Button internal template styles belong in `projects/my-app/src/app/shared/components/button/button.component.scss`
- See `projects/my-app/src/app/shared/components/button/button-component-guidelines.md`

## ButtonComponent model

Inputs:

- `color: 'primary' | 'secondary'`
- `variant: 'fill' | 'outline' | 'transparent' | 'icon'`
- `size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `type: 'button' | 'submit' | 'reset'`

This separates theme color from visual variant behavior.

The `icon` variant is for icon-only buttons and defaults to theme text color. SVG icons should use `currentColor` so they inherit the button foreground.

## Recommended usage

- Prefer component inputs over ad hoc CSS classes.
- Keep reusable appearance in `_buttons.scss`.
- Keep button templates simple and avoid nested interactive content.
- Use component styles only for internals like spinner layout.

## Extension pattern

1. Add a typed input on the component.
2. Add its modifier in `btnClass`.
3. Add the selector in `_buttons.scss`.
4. Keep consumer markup unchanged except to opt in/out.

## Why this skill exists

It captures repo-specific custom UI patterns while staying generic enough to cover future shared controls.
