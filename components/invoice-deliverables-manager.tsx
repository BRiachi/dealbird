"use client";

import { useState } from "react";
import { UploadDropzone } from "@/app/utils/uploadthing";

export function InvoiceDeliverablesManager({ invoiceId, initialDeliverables = [] }: { invoiceId: string, initialDeliverables?: any[] }) {
    const [deliverables, setDeliverables] = useState(initialDeliverables);
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadComplete = async (res: any[]) => {
        if (!res || res.length === 0) return;

        setIsUploading(true);
        try {
            const newDeliverables = res.map((file) => ({
                name: file.name,
                url: file.url,
                size: file.size,
                key: file.key
            }));

            const updatedList = [...deliverables, ...newDeliverables];

            // Save to database
            await fetch(`/api/invoices/${invoiceId}/deliverables`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliverables: updatedList })
            });

            setDeliverables(updatedList);
        } catch (error) {
            console.error("Failed to save deliverables:", error);
            alert("Upload successful, but failed to save to invoice. Please refresh and try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="mt-8 border-t border-black/[0.07] pt-8">
            <h3 className="font-extrabold text-lg mb-4">Locked Deliverables 🔒</h3>
            <p className="text-sm text-gray-500 mb-6">
                Upload the final MP4s, ZIPs, or images here. The brand will see they are attached, but the download links will remain locked until the invoice is paid.
            </p>

            {deliverables.length > 0 && (
                <div className="mb-6 space-y-3">
                    {deliverables.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-sm shrink-0 text-xl">
                                    {file.name.endsWith('.mp4') || file.name.endsWith('.mov') ? '🎥' : '📄'}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-sm truncate">{file.name}</div>
                                    <div className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border shadow-sm uppercase">Uploaded</span>
                        </div>
                    ))}
                </div>
            )}

            <UploadDropzone
                endpoint="invoiceDeliverable"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                }}
                appearance={{
                    container: "border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50",
                    label: "text-[#C8FF00] font-bold hover:text-[#b3e600] transition-colors",
                    allowedContent: "text-gray-400 text-xs",
                    button: "bg-black text-white font-bold px-4 py-2 rounded-lg text-sm w-full outline-none",
                }}
            />
        </div>
    );
}
