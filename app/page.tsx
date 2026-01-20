import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Zap, Users, Eye } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="container relative z-10 flex max-w-4xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            CircuitSpace
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Build, simulate, and visualize IoT projects with augmented reality. Real-time
            collaboration, powerful code editor, and immersive 3D visualization.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Features</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to build amazing IoT projects
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Code className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Live Code Editor</CardTitle>
              <CardDescription>
                Monaco Editor with syntax highlighting for JavaScript and Arduino C++
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Simulation Engine</CardTitle>
              <CardDescription>
                Real-time code simulation with mock IoT hardware and sensors
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Real-time Collaboration</CardTitle>
              <CardDescription>
                Share projects and collaborate with live cursor positions and code sync
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Eye className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>AR Visualization</CardTitle>
              <CardDescription>
                WebGL and AR.js integration for immersive 3D device visualization
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to start building?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of developers creating amazing IoT projects
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
