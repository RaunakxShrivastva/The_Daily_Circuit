import React, { useState } from "react";
import { MacbookScroll } from "./ui/macbook-scroll";
import { LiquidGlassScreen } from "./LiquidGlassScreen";

export function MacbookScrollDemo() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(() => {
    return typeof window !== "undefined" ? !!localStorage.getItem("tdc_subscribed_email") : false;
  });

  return (
    <div className="w-full overflow-hidden bg-transparent">
      <MacbookScroll showGradient={false}>
        <LiquidGlassScreen
          email={email}
          setEmail={setEmail}
          subscribed={subscribed}
          setSubscribed={setSubscribed}
        />
      </MacbookScroll>
    </div>
  );
}
