import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemePreference } from '../utils/themeManager';
import { playTactileClick } from '../utils/audio';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'expanded';
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'compact',
  showLabels = false,
}) => {
  const { preference, resolvedTheme, setTheme } = useTheme();

  const handleSelect = (mode: ThemePreference) => {
    playTactileClick();
    setTheme(mode);
  };

  const options: Array<{ id: ThemePreference; label: string; icon: React.ReactNode; tooltip: string }> = [
    {
      id: 'system',
      label: 'System',
      icon: <Monitor size={13} strokeWidth={2.2} />,
      tooltip: 'Match your OS theme dynamically',
    },
    {
      id: 'light',
      label: 'Light',
      icon: <Sun size={13} strokeWidth={2.2} />,
      tooltip: 'Apple / Stripe clean daylight mode',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon size={13} strokeWidth={2.2} />,
      tooltip: 'Obsidian Titanium OLED dark mode',
    },
  ];

  if (variant === 'expanded') {
    return (
      <div className={`flex flex-col gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-[#111C33] border border-slate-200 dark:border-white/10 ${className}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Appearance</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {preference === 'system' ? `Auto (${resolvedTheme})` : preference}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-white/10">
          {options.map((opt) => {
            const isSelected = preference === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                title={opt.tooltip}
                aria-pressed={isSelected}
                className={`relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeThemeHighlightExpanded"
                    className="absolute inset-0 rounded-lg bg-slate-100 dark:bg-white/15 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{opt.icon}</span>
                <span className="relative z-10 text-[11.5px]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-[#111C33] border border-slate-200 dark:border-white/10 transition-colors ${className}`}
    >
      {options.map((opt) => {
        const isSelected = preference === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(opt.id)}
            title={opt.tooltip}
            className={`relative flex items-center justify-center rounded-full transition-colors cursor-pointer select-none ${
              showLabels ? 'px-2.5 h-8 gap-1.5' : 'w-8 h-8'
            } ${
              isSelected
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeThemeHighlightCompact"
                className="absolute inset-0 rounded-full bg-white dark:bg-blue-600 shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center">
              {opt.icon}
            </span>
            {showLabels && (
              <span className="relative z-10 text-[11px] font-semibold">{opt.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
