import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Zap, Users, Eye, Play, CheckCircle2, Sparkles, Cpu, Globe } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center gap-8 overflow-hidden px-4 py-24 md:py-32">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        {/* Floating orbs for visual interest */}
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        
        <div className="container relative z-10 flex max-w-5xl flex-col items-center gap-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Powered by AR & WebGL</span>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Build IoT Projects
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              in Augmented Reality
            </span>
          </h1>
          
          <p className="max-w-3xl text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Create, simulate, and visualize IoT projects with real-time collaboration. 
            Code in JavaScript or Arduino C++, test with virtual hardware, and see your devices come to life in 3D.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="group w-full gap-2 sm:w-auto">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="group w-full gap-2 sm:w-auto">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </SignedIn>
            <Button variant="outline" size="lg" className="group w-full gap-2 sm:w-auto" asChild>
              <Link href="#features">
                <Play className="h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Open source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto flex flex-col items-center py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Powerful tools to build amazing IoT projects from concept to visualization
          </p>
        </div>
        <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group transition-all hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Live Code Editor</CardTitle>
              <CardDescription className="mt-2 text-base">
                Monaco Editor with syntax highlighting, autocomplete, and error detection for JavaScript and Arduino C++
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="group transition-all hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Simulation Engine</CardTitle>
              <CardDescription className="mt-2 text-base">
                Real-time code simulation with mock IoT hardware, sensors, and virtual components
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="group transition-all hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Real-time Collaboration</CardTitle>
              <CardDescription className="mt-2 text-base">
                Share projects and collaborate with live cursor positions, code sync, and instant updates
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="group transition-all hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">AR Visualization</CardTitle>
              <CardDescription className="mt-2 text-base">
                WebGL and AR.js integration for immersive 3D device visualization in your environment
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Get started in minutes, not hours
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Write Your Code</h3>
              <p className="text-muted-foreground">
                Use our powerful Monaco editor to write JavaScript or Arduino C++ code with full syntax highlighting and autocomplete
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Simulate & Test</h3>
              <p className="text-muted-foreground">
                Run your code in real-time with our simulation engine. Test with virtual sensors and IoT hardware instantly
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visualize in AR</h3>
              <p className="text-muted-foreground">
                See your IoT devices come to life in 3D. Use AR mode on mobile to place devices in your physical space
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto flex flex-col items-center py-24">
        <Card className="w-full max-w-4xl border-primary/50 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 p-8 md:p-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">Ready to start building?</CardTitle>
            <CardDescription className="mt-4 text-lg md:text-xl">
              Start building amazing IoT projects with AR visualization today
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="group w-full gap-2 sm:w-auto">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="group w-full gap-2 sm:w-auto">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </SignedIn>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </CardContent>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span>ESP32, Arduino & More</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Works on All Devices</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Real-time Updates</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
