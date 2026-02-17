import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import ProposalSignForm from "./sign-form";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const proposal = await prisma.proposal.findUnique({
    where: { slug: params.id },
    include: { user: { select: { name: true } }, items: true },
  });

  if (!proposal) return { title: "Proposal Not Found" };

  const total = proposal.items.reduce((s, i) => s + i.price, 0);

  return {
    title: `Proposal from ${proposal.user?.name || "Creator"} — ${formatCurrency(total)}`,
    description: `${proposal.title} — Review and sign this proposal.`,
    openGraph: {
      title: `Proposal: ${proposal.title}`,
      description: `${formatCurrency(total)} — From ${proposal.user?.name || "Creator"} via DealBird`,
    },
  };
}

export default async function PublicProposalPage({ params }: Props) {
  const proposal = await prisma.proposal.findUnique({
    where: { slug: params.id },
    include: {
      user: { select: { name: true, handle: true, image: true } },
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!proposal) notFound();

  const total = proposal.items.reduce((s, i) => s + i.price, 0);
  const isSigned = proposal.status === "SIGNED";

  // Track view (fire and forget)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/proposals/sign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: params.id }),
  }).catch(() => {});

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-[640px] mx-auto">
        {/* Proposal Card */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-[#C8FF00]" />

          <div className="p-8 md:p-10">
            {/* Creator info */}
            <div className="flex items-center gap-3.5 mb-8">
              {proposal.user?.image ? (
                <img
                  src={proposal.user.image}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#C8FF00] to-[#A8E000] rounded-xl flex items-center justify-center font-bold">
                  {(proposal.user?.name || "C")[0]}
                </div>
              )}
              <div>
                <div className="font-bold">{proposal.user?.name || "Creator"}</div>
                {proposal.user?.handle && (
                  <div className="text-sm text-gray-400">@{proposal.user.handle}</div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">
              {proposal.title}
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              Prepared for {proposal.brand}
            </p>

            {/* Items */}
            <div className="space-y-2.5 mb-6">
              {proposal.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-[#FAFAFA] rounded-xl border border-black/[0.03]"
                >
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    {item.detail && (
                      <div className="text-xs text-gray-400 mt-1">{item.detail}</div>
                    )}
                  </div>
                  <span className="font-mono font-bold text-sm">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-5 border-t-2 border-black">
              <span className="font-bold text-base">Total</span>
              <span className="font-mono font-extrabold text-2xl">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Terms */}
            {proposal.terms && (
              <div className="text-sm text-gray-500 mt-4">
                <strong>Payment Terms:</strong> {proposal.terms}
              </div>
            )}

            {/* Notes */}
            {proposal.notes && (
              <div className="mt-5 p-4 bg-[#FAFAFA] rounded-xl border border-black/[0.03]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Notes
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {proposal.notes}
                </p>
              </div>
            )}

            {/* Signature Section */}
            {isSigned ? (
              <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 text-center">
                <div className="text-3xl mb-2">✓</div>
                <h3 className="font-bold text-green-700 text-lg mb-1">
                  Proposal Approved & Signed
                </h3>
                <p className="text-sm text-green-600">
                  Signed by {proposal.signature} on{" "}
                  {formatDate(proposal.signedAt!)}
                </p>
              </div>
            ) : (
              <ProposalSignForm slug={proposal.slug} />
            )}

            {/* Powered by */}
            <div className="text-center mt-8 text-xs text-gray-400">
              Powered by{" "}
              <a
                href={process.env.NEXT_PUBLIC_APP_URL}
                className="font-bold text-black hover:underline"
              >
                🐦 DealBird
              </a>{" "}
              —{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}
                className="hover:underline"
              >
                Create yours free
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
