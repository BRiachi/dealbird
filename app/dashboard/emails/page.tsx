import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const typeLabels: Record<string, string> = {
  PROPOSAL_SENT: "Proposal",
  INVOICE_SENT: "Invoice",
  REMINDER: "Reminder",
  DEAL_SIGNED: "Deal Signed",
  PAYMENT_CONFIRMATION: "Payment",
};

const typeColors: Record<string, string> = {
  PROPOSAL_SENT: "bg-blue-50 text-blue-700",
  INVOICE_SENT: "bg-purple-50 text-purple-700",
  REMINDER: "bg-amber-50 text-amber-700",
  DEAL_SIGNED: "bg-green-50 text-green-700",
  PAYMENT_CONFIRMATION: "bg-emerald-50 text-emerald-700",
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export default async function EmailHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const emails = await prisma.emailLog.findMany({
    where: { userId: session.user.id },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Email History</h1>
        <p className="text-gray-500">{emails.length} emails sent to brands</p>
      </div>

      {emails.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-16 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h3 className="font-bold text-lg mb-2">No emails sent yet</h3>
          <p className="text-gray-400 text-sm">
            When you send proposals, invoices, or reminders, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_100px_180px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            <span>Recipient & Subject</span>
            <span>Type</span>
            <span>Status</span>
            <span>Date & Time</span>
          </div>

          {emails.map((email) => (
            <div
              key={email.id}
              className="bg-white rounded-xl border border-black/[0.07] px-5 py-4 grid grid-cols-[1fr_120px_100px_180px] gap-4 items-center"
            >
              {/* Recipient & Subject */}
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{email.subject}</div>
                <div className="text-xs text-gray-400 truncate">To: {email.to}</div>
              </div>

              {/* Type */}
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold text-center ${
                  typeColors[email.type] || "bg-gray-50 text-gray-600"
                }`}
              >
                {typeLabels[email.type] || email.type}
              </span>

              {/* Status */}
              <span
                className={`text-xs font-bold ${
                  email.status === "SENT" ? "text-green-600" : "text-red-600"
                }`}
              >
                {email.status === "SENT" ? "Delivered" : "Failed"}
              </span>

              {/* Date & Time */}
              <span className="text-sm text-gray-500">
                {formatDateTime(email.sentAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
