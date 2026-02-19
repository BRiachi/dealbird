import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [proposals, invoices, user] = await Promise.all([
    prisma.proposal.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, name: true } }),
  ]);

  const totalEarned = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.total, 0);
  const totalPending = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((s, i) => s + i.total, 0);
  const activeSent = proposals.filter((p) => p.status === "SENT").length;
  const signed = proposals.filter((p) => p.status === "SIGNED").length;

  const stats = [
    { label: "Total Earned", value: formatCurrency(totalEarned), accent: "text-green-600" },
    { label: "Pending Payment", value: formatCurrency(totalPending), accent: "text-yellow-600" },
    { label: "Active Proposals", value: String(activeSent), accent: "text-black" },
    { label: "Signed Deals", value: String(signed), accent: "text-black" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-gray-500">Your brand deal overview at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-black/[0.07] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{s.label}</div>
            <div className={`text-2xl font-extrabold tracking-tight ${s.accent}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Proposals */}
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base">Recent Proposals</h3>
            <Link href="/dashboard/proposals" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">
              View All →
            </Link>
          </div>
          {proposals.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p className="mb-3 text-2xl">📝</p>
              <p>No proposals yet.</p>
              <Link href="/dashboard/proposals/new" className="text-[#9FCC00] font-semibold hover:underline">Create your first</Link>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {proposals.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/dashboard/proposals/${p.id}`} className="flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors">
                  <div>
                    <div className="font-semibold text-sm mb-0.5">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.brand}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm">
                      {formatCurrency(p.items.reduce((s, i) => s + i.price, 0))}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base">Recent Invoices</h3>
            <Link href="/dashboard/invoices" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">
              View All →
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p className="mb-3 text-2xl">💰</p>
              <p>No invoices yet. Sign a deal first!</p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {invoices.slice(0, 4).map((inv) => (
                <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors">
                  <div>
                    <div className="font-semibold text-sm mb-0.5">{inv.number}</div>
                    <div className="text-xs text-gray-400">{inv.brand} · {formatDate(inv.issuedAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm">{formatCurrency(inv.total)}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
