import "./globals.css";
import "@uploadthing/react/styles.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "DealBird — Proposals & Invoices for Creator Brand Deals",
  description:
    "Professional proposals, e-signatures, and invoices built for creators. Send a link. Get signed. Get paid.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
      <body className="bg-[#FAF9F7] text-[#2D2D2D] min-h-screen">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
