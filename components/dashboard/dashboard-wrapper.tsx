"use client";

import { useState } from "react";
import { Sidebar, SidebarToggle } from "./sidebar";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start open by default

  return (
    <div className="flex h-screen">
      {!isSidebarOpen && <SidebarToggle onClick={() => setIsSidebarOpen(true)} />}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
