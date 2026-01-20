import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CircuitSpace - Build, Simulate & Visualize IoT Projects",
  description:
    "Create, simulate, and visualize IoT projects with AR integration. Real-time collaboration, code editor, and 3D visualization.",
  keywords: ["IoT", "AR", "Simulation", "WebGL", "Monaco Editor", "Collaboration"],
  authors: [{ name: "CircuitSpace" }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://circuit-space.vercel.app",
    title: "CircuitSpace",
    description: "Build, simulate & visualize IoT projects with AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "CircuitSpace",
    description: "Build, simulate & visualize IoT projects with AR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">CircuitSpace</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="text-sm font-medium hover:underline">Sign In</button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="text-sm font-medium hover:underline">Sign Up</button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </div>
                </div>
              </header>
              {children}
            </ErrorBoundary>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
