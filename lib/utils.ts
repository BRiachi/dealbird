
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-500", label: "Draft" },
  SENT: { bg: "bg-blue-100", text: "text-blue-600", label: "Sent" },
  SIGNED: { bg: "bg-green-100", text: "text-green-600", label: "Signed" },
  PAID: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  OVERDUE: { bg: "bg-red-100", text: "text-red-600", label: "Overdue" },
  DECLINED: { bg: "bg-red-100", text: "text-red-600", label: "Declined" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
  FULFILLED: { bg: "bg-purple-100", text: "text-purple-600", label: "Fulfilled" },
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export const downloadCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  const separator = ",";
  const keys = Object.keys(data[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    data.map((row) => {
      return keys.map((k) => {
        let cell = row[k] === null || row[k] === undefined ? "" : row[k];
        cell = cell instanceof Date ? cell.toISOString() : cell.toString();
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export function generateSlug(): string {
  return Math.random().toString(36).substring(2, 14);
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export function calculateTotal(items: { price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function canCreateProposal(plan: string | null, currentCount: number): boolean {
  const p = (plan || "").toUpperCase();
  if (p === "PRO" || p === "CREATOR" || p === "AGENCY") return true;
  return currentCount < 3; // Free tier: 3 proposals/month
}

