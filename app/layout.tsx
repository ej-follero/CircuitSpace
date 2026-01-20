import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSelector } from "@/components/theme/theme-selector";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ServiceWorkerRegistration } from "@/app/sw-register";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeaderUserName } from "@/components/header-user-name";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
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
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CircuitSpace',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const localization = {
  signIn: {
    start: {
      title: "Sign in to CircuitSpace",
    },
  },
  signUp: {
    start: {
      title: "Sign up for CircuitSpace",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={localization}>
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
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                  <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <Zap className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">CircuitSpace</h1>
                  </Link>
                  <nav className="flex items-center gap-3 sm:gap-4">
                    {/* Theme Selector */}
                    <div className="flex items-center">
                      <ThemeSelector />
                    </div>
                    
                    {/* Separator */}
                    <Separator orientation="vertical" className="h-6" />
                    
                    {/* Auth Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button variant="ghost" size="sm" className="hidden sm:flex">
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button size="sm" className="hidden sm:flex">
                            Sign Up
                          </Button>
                        </SignUpButton>
                        <div className="flex sm:hidden">
                          <SignInButton mode="modal">
                            <Button variant="ghost" size="icon" className="sm:hidden">
                              <span className="sr-only">Sign In</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </Button>
                          </SignInButton>
                        </div>
                      </SignedOut>
                      <SignedIn>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <UserButton 
                            appearance={{
                              elements: {
                                avatarBox: "h-8 w-8",
                                userButtonPopoverCard: "shadow-lg",
                              }
                            }}
                          />
                          <HeaderUserName />
                        </div>
                      </SignedIn>
                    </div>
                  </nav>
                </div>
              </header>
              {children}
            </ErrorBoundary>
            <Toaster />
            <ServiceWorkerRegistration />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
