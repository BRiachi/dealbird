import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { InvoiceActions } from "@/components/invoice-actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!invoice) notFound();

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/inv/${invoice.slug}`;

  return (
    <div>
      <Link href="/dashboard/invoices" className="text-sm text-gray-400 hover:text-black mb-6 font-semibold transition-colors inline-block">
        ← Back to Invoices
      </Link>

      <div className="max-w-[680px] mx-auto">
        <div className={`bg-white rounded-2xl border border-black/[0.07] p-8 border-t-4 ${invoice.status === "PAID" ? "border-t-green-500" : "border-t-[#C8FF00]"}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="DealBird" className="w-9 h-9 rounded-lg -rotate-[5deg]" />
                <span className="font-extrabold text-lg">DealBird</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-1">Invoice</h2>
              <p className="font-mono text-sm text-gray-400">{invoice.number}</p>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          {/* Bill To / Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Bill To</div>
              <div className="font-bold">{invoice.brand}</div>
              <div className="text-sm text-gray-500">{invoice.brandEmail}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Details</div>
              <div className="text-sm text-gray-500">Issued: {formatDate(invoice.issuedAt)}</div>
              <div className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</div>
            </div>
          </div>

          {/* Line items */}
          <div className="mb-6">
            <div className="flex justify-between py-2.5 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <span>Description</span>
              <span>Amount</span>
            </div>
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3.5 border-b border-black/[0.04] text-sm">
                <span className="font-semibold">{item.name}</span>
                <span className="font-mono font-bold">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-5 border-t-2 border-black">
            <span className="font-extrabold">Total Due</span>
            <span className="font-mono font-extrabold text-2xl">{formatCurrency(invoice.total)}</span>
          </div>

          {/* Actions */}
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} invoiceUrl={invoiceUrl} />

          {invoice.status === "PAID" && (
            <div className="mt-6 p-5 bg-green-50 rounded-xl text-center flex items-center justify-center gap-2.5">
              <span className="text-xl">✓</span>
              <span className="font-bold text-green-700">Payment Received</span>
            </div>
          )}

          <div className="text-center mt-7 text-xs text-gray-400">Powered by <strong className="text-black"><img src="/logo.png" alt="" style={{ width: '14px', height: '14px', borderRadius: '3px', display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />DealBird</strong></div>
        </div>
      </div>
    </div>
  );
}
