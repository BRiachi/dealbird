"use client";

import { useState, useEffect } from "react";

export default function CountdownBanner({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(expiresAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes}m remaining`);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (expired) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
        <span className="text-red-600 font-bold text-sm">This proposal has expired</span>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
      <span className="text-amber-700 font-bold text-sm">Expires: {timeLeft}</span>
    </div>
  );
}
