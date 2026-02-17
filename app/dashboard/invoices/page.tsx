import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  const invoices = await prisma.invoice.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Invoices</h1>
        <p className="text-gray-500">{invoices.length} total invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-16 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="font-bold text-lg mb-2">No invoices yet</h3>
          <p className="text-gray-400 text-sm mb-4">Invoices are created from signed proposals. Close a deal first!</p>
          <Link href="/dashboard/proposals" className="text-[#9FCC00] font-semibold hover:underline">View Proposals →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="bg-white rounded-2xl border border-black/[0.07] p-5 flex items-center justify-between hover:border-[#C8FF00] transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base ${inv.status === "PAID" ? "bg-green-50" : "bg-yellow-50"}`}>
                  {inv.status === "PAID" ? "✓" : "⏳"}
                </div>
                <div>
                  <div className="font-bold text-[0.95rem] mb-0.5">{inv.number}</div>
                  <div className="text-xs text-gray-400">{inv.brand} · Issued {formatDate(inv.issuedAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <span className="font-mono font-bold">{formatCurrency(inv.total)}</span>
                <StatusBadge status={inv.status} />
                <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
