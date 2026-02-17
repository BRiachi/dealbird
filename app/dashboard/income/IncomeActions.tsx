"use client";

interface Transaction {
    id: string;
    type: "sale" | "invoice";
    description: string;
    from: string;
    amount: number;
    status: string;
    date: Date;
}

export function IncomeActions({ transactions }: { transactions: Transaction[] }) {
    const exportCSV = () => {
        const headers = ["Date", "Type", "Description", "From", "Amount", "Status"];
        const rows = transactions.map((t) => [
            new Date(t.date).toLocaleDateString(),
            t.type === "sale" ? "Product Sale" : "Invoice",
            t.description,
            t.from,
            `$${(t.amount / 100).toFixed(2)}`,
            t.status,
        ]);

        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dealbird-income-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={exportCSV}
            className="px-4 py-2.5 border-2 border-black/[0.07] font-bold text-sm rounded-xl hover:border-black/20 transition-all flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
        </button>
    );
}
