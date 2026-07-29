import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Blend `hexColor` towards white. Used for the drawing surface: a child who
 * picks 검정 as their character colour still needs a light canvas to draw on.
 */
export function tintColor(hexColor: string, strength = 0.22, fallback = '#FDDDB8') {
  const hex = (hexColor || '').replace('#', '');
  if (hex.length !== 6) return fallback;

  const mix = (v: number) => Math.round(255 - (255 - v) * strength);
  const r = mix(parseInt(hex.substring(0, 2), 16));
  const g = mix(parseInt(hex.substring(2, 4), 16));
  const b = mix(parseInt(hex.substring(4, 6), 16));

  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function getContrastColor(hexColor: string) {
  if (!hexColor) return '#FFFFFF';
  
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#FFFFFF';
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}