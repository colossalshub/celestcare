"use client";

import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" className="border-b border-line bg-caution-bg px-4 py-2 text-sm text-caution lg:px-8">
      You are offline. Saved routines stay available. Live weather cannot refresh until the connection returns.
    </div>
  );
}
