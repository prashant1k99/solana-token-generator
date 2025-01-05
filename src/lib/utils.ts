import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(content: string) {
  navigator.clipboard.writeText(content)
    .catch((err) => console.error('Failed to copy text: ', err));
}
