import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Proposals</h1>
          <p className="text-gray-500">{proposals.length} total proposals</p>
        </div>
        <Link href="/dashboard/proposals/new" className="px-5 py-2.5 bg-[#C8FF00] text-black font-bold rounded-lg hover:bg-[#9FCC00] transition-all text-sm">
          + New Proposal
        </Link>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-16 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="font-bold text-lg mb-2">No proposals yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first proposal to start landing brand deals.</p>
          <Link href="/dashboard/proposals/new" className="inline-block px-6 py-3 bg-[#C8FF00] text-black font-bold rounded-lg hover:bg-[#9FCC00] transition-all">
            Create Your First Proposal
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {proposals.map((p) => {
            const total = p.items.reduce((s, i) => s + i.price, 0);
            return (
              <Link key={p.id} href={`/dashboard/proposals/${p.id}`} className="bg-white rounded-2xl border border-black/[0.07] p-5 flex items-center justify-between hover:border-[#C8FF00] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#C8FF00]/10 rounded-xl flex items-center justify-center text-base font-bold">
                    {p.brand.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[0.95rem] mb-0.5 group-hover:text-black">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.brand} · Created {formatDate(p.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="font-mono font-bold">{formatCurrency(total)}</span>
                  <StatusBadge status={p.status} />
                  <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
