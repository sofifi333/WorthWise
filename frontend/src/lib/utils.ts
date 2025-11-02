import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as USD currency
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format decimal number
 */
export function formatNumber(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * Format ratio (like ROI)
 */
export function formatRatio(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}
