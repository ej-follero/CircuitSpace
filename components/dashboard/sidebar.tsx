"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Code, Settings, LogOut, Menu, X } from "lucide-react";
import { SignOutButton, useUser, UserButton } from "@clerk/nextjs";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: Code },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen: controlledIsOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  // Only render UserButton on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };
  
  const handleClose = () => {
    if (onToggle) {
      // If controlled, toggle will handle closing
      onToggle();
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay - only on mobile, desktop doesn't need overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={handleClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r bg-card transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-64"
      )}>
        {/* Header with close button */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">CircuitSpace</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="h-8 w-8"
            title="Close sidebar"
            suppressHydrationWarning
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar when navigating (optional - remove if you want sidebar to stay open)
                  // handleClose();
                }}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary font-medium"
                  )}
                  suppressHydrationWarning
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-2 flex items-center gap-2" suppressHydrationWarning>
            {mounted ? (
              <UserButton />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.fullName || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <SignOutButton>
            <Button variant="ghost" className="w-full justify-start" suppressHydrationWarning>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </SignOutButton>
        </div>
      </div>
    </>
  );
}

// Hamburger button component - visible on all screen sizes when sidebar is closed
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="fixed top-20 left-4 z-50 h-10 w-10 bg-card border shadow-sm"
      title="Open sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
