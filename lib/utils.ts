import { customAlphabet } from "nanoid";

// Generate short readable slugs for shareable links
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);
export const generateSlug = () => nanoid();

// Format cents to dollars
export const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

// Format date
export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

// Generate invoice number
export const generateInvoiceNumber = (count: number) => {
  const year = new Date().getFullYear();
  return `DB-${year}-${String(count + 1).padStart(4, "0")}`;
};

// Calculate total from items (in cents)
export const calculateTotal = (items: { price: number }[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Check if user can create proposal (free tier limit)
export const canCreateProposal = (plan: string, count: number) => {
  if (plan === "pro" || plan === "agency") return true;
  return count < 3;
};

// Status colors
export const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  SENT: { bg: "bg-blue-50", text: "text-blue-700", label: "Sent" },
  VIEWED: { bg: "bg-purple-50", text: "text-purple-700", label: "Viewed" },
  SIGNED: { bg: "bg-green-50", text: "text-green-700", label: "Signed" },
  EXPIRED: { bg: "bg-red-50", text: "text-red-700", label: "Expired" },
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
  PAID: { bg: "bg-green-50", text: "text-green-700", label: "Paid" },
  OVERDUE: { bg: "bg-red-50", text: "text-red-700", label: "Overdue" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
};
