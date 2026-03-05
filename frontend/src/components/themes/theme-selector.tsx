'use client';

import { useThemeConfig } from '@/components/themes/active-theme';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { Icons } from '../icons';
import { THEMES } from './theme.config';

// Theme preview colors matching the design specification
const THEME_PREVIEWS: Record<string, string> = {
  claude: 'bg-orange-500',
  mono: 'bg-gray-900 dark:bg-gray-100',
  neobrutualism: 'bg-black dark:bg-white',
  notebook: 'bg-yellow-50 dark:bg-yellow-900',
  supabase: 'bg-green-500',
  vercel: 'bg-black dark:bg-white',
};

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  const handleThemeChange = (newTheme: string) => {
    // Apply smooth transition when switching themes
    const root = document.documentElement;

    // Add transition class for smooth theme switching
    root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');

    setActiveTheme(newTheme);

    // Remove transition after animation completes
    setTimeout(() => {
      root.style.removeProperty('transition');
    }, 300);
  };

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id='theme-selector'
          className='justify-start *:data-[slot=select-value]:w-24'
        >
          <span className='text-muted-foreground hidden sm:block'>
            <Icons.palette />
          </span>
          <span className='text-muted-foreground block sm:hidden'>Theme</span>
          <SelectValue placeholder='Select a theme' />
        </SelectTrigger>
        <SelectContent align='end'>
          {THEMES.length > 0 && (
            <>
              <SelectGroup>
                <SelectLabel>Themes</SelectLabel>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn(
                          'w-4 h-4 rounded border border-border',
                          THEME_PREVIEWS[theme.value] || 'bg-primary'
                        )}
                        aria-hidden='true'
                      />
                      <span>{theme.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
