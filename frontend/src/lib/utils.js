import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
