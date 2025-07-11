import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = "JPY"): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, format: "short" | "long" | "time" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  switch (format) {
    case "short":
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    case "long":
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    case "time":
      return d.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return d.toLocaleDateString("ja-JP");
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}