"use client";

import * as React from "react";
import { Monitor, Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Render the same structure on server and client to avoid hydration mismatch
  // The button structure must match exactly
  const buttonContent = (
    <>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </>
  );

  // Always render DropdownMenu structure to ensure consistent HTML
  // The menu content will only be interactive after mount
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Theme selector"
          suppressHydrationWarning
        >
          {buttonContent}
        </Button>
      </DropdownMenuTrigger>
      {mounted && (
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
            {theme === "light" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
            {theme === "dark" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>System</span>
            {theme === "system" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
