# Theme System

This directory contains the theme system implementation for the Creditcoin Invoice Financing Platform.

## Components

### ThemeProvider (`theme-provider.tsx`)
A wrapper around `next-themes` that provides light/dark mode functionality.

### ActiveThemeProvider (`active-theme.tsx`)
Manages the active theme selection (claude, mono, neobrutualism, notebook, supabase, vercel) with localStorage persistence.

## Usage

### Getting the current theme

```tsx
import { useThemeConfig } from '@/components/themes/active-theme';

function MyComponent() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  
  return (
    <div>
      <p>Current theme: {activeTheme}</p>
      <button onClick={() => setActiveTheme('vercel')}>
        Switch to Vercel theme
      </button>
    </div>
  );
}
```

### Getting light/dark mode

```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current mode: {theme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to dark mode
      </button>
    </div>
  );
}
```

## Storage

- **Theme selection** (claude, vercel, etc.): Stored in `localStorage` under the key `app-theme`
- **Light/Dark mode**: Managed by `next-themes` (stored in `localStorage` under the key `theme`)
- **Cookie fallback**: Theme selection is also stored in a cookie (`active_theme`) for SSR

## Available Themes

1. **Claude** - Orange accent with modern design
2. **Mono** - Monochrome grayscale theme
3. **Neobrutualism** - Bold, high-contrast design
4. **Notebook** - Paper-like aesthetic
5. **Supabase** - Green accent theme
6. **Vercel** - Black and white minimalist theme

## Configuration

Default theme can be changed in `theme.config.ts`:

```typescript
export const DEFAULT_THEME = 'vercel';
```
