import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/settings-form";
import { PixelSettings } from "./PixelSettings";
import { PayoutSettings } from "./PayoutSettings";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, handle: true, bio: true, plan: true, stripeCustomerId: true, pixels: true, stripeConnectId: true, stripeConnectEnabled: true, theme: true, accentColor: true },
  });

  if (!user) return null;

  const pixels = (user.pixels as any) || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Settings</h1>
        <p className="text-gray-500">Manage your profile, billing, and integrations.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="flex flex-col gap-5">
          {/* Profile */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
            <h3 className="font-bold mb-4">Profile</h3>
            <SettingsForm
              initialName={user.name || ""}
              initialHandle={user.handle || ""}
              initialBio={user.bio || ""}
              initialTheme={user.theme || "simple"}
              initialAccent={user.accentColor || "#000000"}
            />
          </div>

          {/* Marketing Pixels */}
          <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold">Marketing Pixels</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">TRACKING</span>
            </div>
            <p className="text-sm text-gray-400 mb-5">Add tracking pixels to your public store for ad attribution and analytics.</p>
            <PixelSettings initialPixels={pixels} />
          </div>

          {/* Payouts */}
          <PayoutSettings user={user} />
        </div>

        {/* Billing sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
            <h4 className="font-bold text-sm mb-3">Current Plan</h4>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${user.plan === "pro" ? "bg-[#C8FF00] text-black" :
                user.plan === "agency" ? "bg-purple-100 text-purple-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                {user.plan === "free" ? "Free" : user.plan === "pro" ? "Pro" : "Agency"}
              </span>
            </div>
            {user.plan === "free" && (
              <a
                href="/api/stripe/checkout?plan=pro"
                className="w-full py-2.5 bg-[#C8FF00] text-black font-bold text-sm rounded-xl hover:bg-[#9FCC00] transition-all text-center block"
              >
                Upgrade to Pro — $19/mo
              </a>
            )}
            {user.plan !== "free" && user.stripeCustomerId && (
              <a
                href="/api/stripe/checkout?portal=true"
                className="w-full py-2.5 border-2 border-gray-200 font-bold text-sm rounded-xl hover:border-black transition-all text-center block"
              >
                Manage Billing
              </a>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
            <h4 className="font-bold text-sm mb-3">Account</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="font-semibold">{user.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="font-semibold capitalize">{user.plan}</span></div>
            </div>
          </div>

          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full py-2.5 border-2 border-red-200 text-red-500 font-bold text-sm rounded-xl hover:border-red-400 hover:bg-red-50 transition-all">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
