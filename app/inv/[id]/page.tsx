import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function PublicInvoicePage({ params }: Props) {
  const invoice = await prisma.invoice.findUnique({
    where: { slug: params.id },
    include: {
      user: { select: { name: true, handle: true, email: true } },
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!invoice) notFound();

  const isPaid = invoice.status === "PAID";
  const isOverdue =
    invoice.status === "PENDING" && new Date(invoice.dueDate) < new Date();

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-[640px] mx-auto">
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div
            className={`h-1 ${isPaid ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-[#C8FF00]"}`}
          />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-[#C8FF00] rounded-lg flex items-center justify-center text-base -rotate-[5deg]">
                    🐦
                  </div>
                  <span className="font-extrabold text-lg">DealBird</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  Invoice
                </h1>
                <p className="font-mono text-sm text-gray-400">{invoice.number}</p>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  isPaid
                    ? "bg-green-50 text-green-700"
                    : isOverdue
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
              </span>
            </div>

            {/* Bill To / Details */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  From
                </p>
                <p className="font-bold text-sm">
                  {invoice.user?.name || "Creator"}
                </p>
                <p className="text-sm text-gray-500">{invoice.user?.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Bill To
                </p>
                <p className="font-bold text-sm">{invoice.brand}</p>
                <p className="text-sm text-gray-500">{invoice.brandEmail}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Issued
                </p>
                <p className="text-sm">{formatDate(invoice.issuedAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Due Date
                </p>
                <p className={`text-sm font-semibold ${isOverdue ? "text-red-600" : ""}`}>
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <div className="flex justify-between pb-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <span>Description</span>
                <span>Amount</span>
              </div>
              {invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-4 border-b border-black/[0.03] text-sm"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-5 border-t-2 border-black">
              <span className="font-extrabold text-base">Total Due</span>
              <span className="font-mono font-extrabold text-2xl">
                {formatCurrency(invoice.total)}
              </span>
            </div>

            {/* Status Banner */}
            {isPaid && (
              <div className="mt-8 p-5 bg-green-50 rounded-2xl border border-green-200 text-center flex items-center justify-center gap-3">
                <span className="text-xl">✓</span>
                <span className="font-bold text-green-700">
                  Payment Received
                  {invoice.paidAt && ` — ${formatDate(invoice.paidAt)}`}
                </span>
              </div>
            )}

            {isOverdue && (
              <div className="mt-8 p-5 bg-red-50 rounded-2xl border border-red-200 text-center">
                <p className="font-bold text-red-700">
                  This invoice is overdue. Please arrange payment at your earliest
                  convenience.
                </p>
              </div>
            )}

            {/* Powered by */}
            <div className="text-center mt-8 text-xs text-gray-400">
              Powered by{" "}
              <a href="/" className="font-bold text-black hover:underline">
                🐦 DealBird
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
