import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names and deduplicates tailwind classes.
 * Essential for Shadcn UI components.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a given date to a human readable format (e.g. "Oct 24, 2024").
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && { hour: 'numeric', minute: '2-digit' })
    };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Delays execution. Useful for simulating network latency in UI development mapping.
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
