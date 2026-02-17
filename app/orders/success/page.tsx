import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Calendar, ArrowRight } from "lucide-react";

interface Props {
    searchParams: { session_id?: string };
}

export default async function OrderSuccessPage({ searchParams }: Props) {
    const sessionId = searchParams.session_id;

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
                <Link href="/" className="text-blue-600 hover:underline">Go Home</Link>
            </div>
        );
    }

    // Fetch Orders specific to this session
    // Note: Webhook might take a second, so we might not find it immediately.
    // In a production app, we'd enable polling or real-time updates.
    const orders = await prisma.order.findMany({
        where: { stripeSessionId: sessionId },
        include: { product: true, user: true },
    });

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 animate-in fade-in">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
                <h1 className="text-2xl font-bold mb-2">Processing your order...</h1>
                <p className="text-gray-600 mb-6">Please wait a moment while we confirm your payment.</p>
                <a
                    href={`/orders/success?session_id=${sessionId}`}
                    className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 inline-block"
                >
                    Refresh Status
                </a>
                <meta httpEquiv="refresh" content="3" />
            </div>
        );
    }

    const mainOrder = orders[0];
    const seller = mainOrder.user;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-green-50 border-b border-green-100 p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-green-900 mb-2">Payment Successful!</h1>
                    <p className="text-green-700">
                        Thank you for your purchase from <span className="font-bold">{seller.name || seller.handle}</span>.
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    {orders.map((order) => {
                        const product = order.product;
                        const settings = product.settings as any || {};

                        return (
                            <div key={order.id} className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                        {product.type === "DIGITAL" ? "📂" : product.type === "COACHING" ? "📅" : "📦"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{product.title}</h3>
                                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold text-[10px]">
                                            {product.type}
                                        </p>
                                    </div>
                                </div>

                                {product.type === "DIGITAL" && settings.fileUrl ? (
                                    <a
                                        href={settings.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center py-3 bg-black text-white rounded-lg font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} />
                                        Download File
                                    </a>
                                ) : product.type === "COACHING" && settings.url ? (
                                    <a
                                        href={settings.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center py-3 bg-black text-white rounded-lg font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={18} />
                                        Book Your Call
                                    </a>
                                ) : (
                                    <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-500">
                                        Check your email for access instructions.
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <Link href={`/u/${seller.handle}`} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors gap-1">
                            Back to Store <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
