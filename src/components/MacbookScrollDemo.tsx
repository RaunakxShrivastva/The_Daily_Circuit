import React from "react";
import { MacbookScroll } from "./ui/macbook-scroll";
import { AppleEndingPage } from "./AppleEndingPage";

export function MacbookScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-transparent">
      <MacbookScroll showGradient={false}>
        <AppleEndingPage />
      </MacbookScroll>
    </div>
  );
}
