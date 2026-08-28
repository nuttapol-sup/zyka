"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't send heartbeat on login page
    if (pathname === "/login") return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/user/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPath: pathname }),
        });
      } catch {
        // Silent catch for background heartbeat
      }
    };

    // Send heartbeat immediately on route change
    sendHeartbeat();

    // Send heartbeat every 10 seconds
    const interval = setInterval(sendHeartbeat, 10000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
