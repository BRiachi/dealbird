import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProposalActions } from "@/components/proposal-actions";

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.id, userId: session!.user.id },
    include: { items: { orderBy: { order: "asc" } }, invoice: true, views: { orderBy: { viewedAt: "desc" }, take: 10 } },
  });

  if (!proposal) notFound();

  const total = proposal.items.reduce((s, i) => s + i.price, 0);
  const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${proposal.slug}`;

  return (
    <div>
      <Link href="/dashboard/proposals" className="text-sm text-gray-400 hover:text-black mb-6 font-semibold transition-colors inline-block">
        ← Back to Proposals
      </Link>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Main */}
        <div className="bg-white rounded-2xl border border-black/[0.07] p-7">
          <div className="flex items-start justify-between mb-7">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight mb-1">{proposal.title}</h2>
              <p className="text-sm text-gray-400">Prepared for {proposal.brand}</p>
            </div>
            <StatusBadge status={proposal.status} />
          </div>

          {/* Items */}
          <div className="flex flex-col gap-2.5 mb-6">
            {proposal.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-black/[0.04]">
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  {item.detail && <div className="text-xs text-gray-400 mt-0.5">{item.detail}</div>}
                </div>
                <span className="font-mono font-bold">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-5 border-t-2 border-black">
            <span className="font-bold">Total</span>
            <span className="font-mono font-bold text-xl">{formatCurrency(total)}</span>
          </div>

          {/* Notes */}
          {proposal.notes && (
            <div className="mt-5 p-4 bg-[#FAFAFA] rounded-xl border border-black/[0.04]">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</div>
              <p className="text-sm text-gray-600 leading-relaxed">{proposal.notes}</p>
            </div>
          )}

          {/* Signature */}
          {proposal.signature && (
            <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-2">Signed By</div>
              <p className="font-mono text-lg font-bold text-green-700">{proposal.signature}</p>
              {proposal.signedAt && <p className="text-xs text-green-600 mt-1">Signed on {formatDate(proposal.signedAt)}</p>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
            <h4 className="font-bold text-sm mb-4">Actions</h4>
            <ProposalActions
              proposalId={proposal.id}
              proposalUrl={proposalUrl}
              status={proposal.status}
              invoiceId={proposal.invoice?.id || null}
            />
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
            <h4 className="font-bold text-sm mb-3">Details</h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Brand</span><span className="font-semibold">{proposal.brand}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Email</span><span className="font-semibold">{proposal.brandEmail}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Payment Terms</span><span className="font-semibold">{proposal.terms}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Created</span><span className="font-semibold">{formatDate(proposal.createdAt)}</span></div>
              {proposal.signedAt && <div className="flex justify-between text-sm"><span className="text-gray-400">Signed</span><span className="font-semibold">{formatDate(proposal.signedAt)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-400">Views</span><span className="font-semibold">{proposal.viewCount}</span></div>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
            <h4 className="font-bold text-sm mb-3">Share Link</h4>
            <div className="flex gap-2">
              <input readOnly value={proposalUrl} className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-black/[0.06] rounded-lg text-xs font-mono truncate" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Send this link to the brand. No login required.</p>
          </div>

          <div className="text-center py-3 text-xs text-gray-400">
            Powered by <strong className="text-black">DealBird</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
