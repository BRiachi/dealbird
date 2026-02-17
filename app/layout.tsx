import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DealBird — Proposals & Invoices for Creator Brand Deals",
  description:
    "Professional proposals, e-signatures, and invoices built for creators. Send a link. Get signed. Get paid.",
  openGraph: {
    title: "DealBird — Proposals & Invoices for Creator Brand Deals",
    description:
      "Professional proposals, e-signatures, and invoices built for creators.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAFA] text-[#0A0A0A] min-h-screen">
        {children}
      </body>
    </html>
  );
}
