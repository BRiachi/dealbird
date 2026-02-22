"use client";

import { useState } from "react";

const TABS = [
  { key: "profile", label: "Profile & Design" },
  { key: "pixels", label: "Pixels" },
  { key: "payouts", label: "Payouts" },
];

export function SettingsTabs({ children }: { children: [React.ReactNode, React.ReactNode, React.ReactNode] }) {
  const [active, setActive] = useState("profile");

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              active === tab.key
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "profile" && children[0]}
      {active === "pixels" && children[1]}
      {active === "payouts" && children[2]}
    </div>
  );
}
