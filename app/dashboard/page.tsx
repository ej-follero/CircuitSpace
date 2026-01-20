"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { LoadingSkeleton, EditorSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { PresetSelector } from "@/components/editor/preset-selector";
import { CollabRoom } from "@/components/collaboration/collab-room";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Save, Share2, Download, FileDown, Plus, Code, Zap, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Project, SimulationResult } from "@/lib/types";
import type { Preset } from "@/lib/presets";
import { exportToPDF, exportToDocker, exportToArduino, exportToJSON, exportToCSV, exportToExcel } from "@/lib/export";
import { SimulationMetricsChart } from "@/components/charts/simulation-metrics-chart";
import { ProjectStatsChart } from "@/components/charts/project-stats-chart";
import { ActivityChart } from "@/components/charts/activity-chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const [code, setCode] = useState(`// RFID Attendance System Simulation
const RFID = {
  scan: () => {
    const cards = ['CARD001', 'CARD002', 'CARD003'];
    return cards[Math.floor(Math.random() * cards.length)];
  }
};

const attendance = new Set();

function checkIn(cardId) {
  if (attendance.has(cardId)) {
    console.log(\`Card \${cardId} already checked in\`);
    return false;
  }
  attendance.add(cardId);
  console.log(\`Card \${cardId} checked in successfully\`);
  return true;
}

// Simulate RFID scan
const cardId = RFID.scan();
checkIn(cardId);
`);
  const [language, setLanguage] = useState<"javascript" | "arduino">("javascript");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSimulations: 0,
    recentActivity: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  const [collabEnabled, setCollabEnabled] = useState(false);

  useEffect(() => {
    loadProjects();
    loadStats();
  }, []);

  useEffect(() => {
    // Enable collaboration if a project is selected
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get("project");
    if (projectParam) {
      setCurrentProjectId(projectParam);
      setCollabEnabled(true);
    } else if (projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects]);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalProjects: data.length,
          totalSimulations: 0, // TODO: Add simulations count API
          recentActivity: data.filter((p: Project) => {
            const daysSinceUpdate = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate < 7;
          }).length,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const projectId = projects.length > 0 ? projects[0].id : undefined;
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, projectId }),
      });

      if (!response.ok) {
        throw new Error("Simulation failed");
      }

      const result: SimulationResult = await response.json();
      setSimulationResult(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run simulation",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = async () => {
    try {
      const projectName = `Project ${projects.length + 1}`;
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          code,
          language,
          description: "Created from dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      toast({
        title: "Project saved",
        description: "Your project has been saved successfully",
      });
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    setCode(preset.code);
    setLanguage(preset.language);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Build, simulate, and visualize your IoT projects</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/projects">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground">Your IoT projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats.totalSimulations}
            </div>
            <p className="text-xs text-muted-foreground">Total runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats.recentActivity}
            </div>
            <p className="text-xs text-muted-foreground">Updated this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/projects">
                <Code className="mr-2 h-4 w-4" />
                View All Projects
              </Link>
            </Button>
            <Button onClick={handleSave} className="w-full justify-start" variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Current Project
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/settings">
                <FileDown className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest work</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet. Create your first one!</p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard?project=${project.id}`}
                    className="block p-2 rounded hover:bg-muted transition-colors"
                  >
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
                {projects.length > 3 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/dashboard/projects">View all projects →</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Editor Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Code Editor</CardTitle>
              <CardDescription>Write and test your IoT code</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <PresetSelector onSelectPreset={handlePresetSelect} currentLanguage={language} />
              <Tabs value={language} onValueChange={(v) => setLanguage(v as "javascript" | "arduino")}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="javascript" className="flex-1 sm:flex-none">JavaScript</TabsTrigger>
                  <TabsTrigger value="arduino" className="flex-1 sm:flex-none">Arduino</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<EditorSkeleton />}>
            <div className="border rounded-lg overflow-hidden mb-4" style={{ height: "min(400px, 50vh)" }}>
              <MonacoEditor
                value={code}
                onChange={(value) => setCode(value || "")}
                language={language}
                height="100%"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleRun} disabled={isRunning} className="flex-1 sm:flex-none">
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? "Running..." : "Run Simulation"}
              </Button>
              <Button onClick={handleSave} variant="outline" className="flex-1 sm:flex-none">
                <Save className="mr-2 h-4 w-4" />
                Save Project
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={async () => {
                    const tempProject: Project = {
                      id: 'temp',
                      name: 'Current Project',
                      code,
                      language,
                      description: undefined,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      userId: user?.id || '',
                    };
                    await exportToPDF(tempProject, simulationResult || undefined);
                  }}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const tempProject: Project = {
                      id: 'temp',
                      name: 'Current Project',
                      code,
                      language,
                      description: undefined,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      userId: user?.id || '',
                    };
                    exportToJSON(tempProject, simulationResult || undefined);
                  }}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const tempProject: Project = {
                      id: 'temp',
                      name: 'Current Project',
                      code,
                      language,
                      description: undefined,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      userId: user?.id || '',
                    };
                    exportToCSV(tempProject, simulationResult || undefined);
                  }}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    const tempProject: Project = {
                      id: 'temp',
                      name: 'Current Project',
                      code,
                      language,
                      description: undefined,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      userId: user?.id || '',
                    };
                    await exportToExcel(tempProject, simulationResult || undefined);
                  }}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const tempProject: Project = {
                      id: 'temp',
                      name: 'Current Project',
                      code,
                      language,
                      description: undefined,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      userId: user?.id || '',
                    };
                    exportToDocker(tempProject);
                  }}>
                    Export as Docker
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const tempProject: Project = {
                      id: 'temp',
                      name: 'Current Project',
                      code,
                      language,
                      description: undefined,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      userId: user?.id || '',
                    };
                    exportToArduino(tempProject);
                  }}>
                    Export as Arduino
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Suspense>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulationResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>Execution output and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulationResult.logs && simulationResult.logs.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Logs</h3>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-48 overflow-auto">
                      {simulationResult.logs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
                {simulationResult.metrics && (
                  <div>
                    <h3 className="font-semibold mb-2">Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">CPU Usage</p>
                        <p className="text-2xl font-bold">{simulationResult.metrics.cpu}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Memory</p>
                        <p className="text-2xl font-bold">{simulationResult.metrics.memory}MB</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Execution Time</p>
                        <p className="text-2xl font-bold">{simulationResult.metrics.executionTime}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data Transferred</p>
                        <p className="text-2xl font-bold">{simulationResult.metrics.dataTransferred}B</p>
                      </div>
                    </div>
                  </div>
                )}
                {simulationResult.errors && simulationResult.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-destructive">Errors</h3>
                    <div className="bg-destructive/10 p-4 rounded-lg">
                      {simulationResult.errors.map((error, i) => (
                        <div key={i} className="text-sm text-destructive">
                          Line {error.line}: {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Simulation Metrics Chart */}
          <SimulationMetricsChart
            data={[
              {
                time: "0s",
                cpu: 0,
                memory: 0,
                executionTime: 0,
              },
              {
                time: "1s",
                cpu: simulationResult.metrics.cpu * 0.5,
                memory: simulationResult.metrics.memory * 0.5,
                executionTime: simulationResult.metrics.executionTime * 0.5,
              },
              {
                time: "2s",
                cpu: simulationResult.metrics.cpu,
                memory: simulationResult.metrics.memory,
                executionTime: simulationResult.metrics.executionTime,
              },
            ]}
          />
        </>
      )}

      {/* Project Statistics Charts */}
      {projects.length > 0 && (
        <ProjectStatsChart
          projectsByLanguage={[
            {
              language: "JavaScript",
              count: projects.filter((p) => p.language === "javascript").length,
            },
            {
              language: "Arduino",
              count: projects.filter((p) => p.language === "arduino").length,
            },
          ]}
          projectsByMonth={(() => {
            const monthMap = new Map<string, number>();
            projects.forEach((project) => {
              const month = new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
              monthMap.set(month, (monthMap.get(month) || 0) + 1);
            });
            return Array.from(monthMap.entries())
              .map(([month, count]) => ({ month, count }))
              .slice(-6);
          })()}
        />
      )}

      {/* Collaboration Room */}
      {currentProjectId && collabEnabled && (
        <CollabRoom
          roomId={currentProjectId}
          projectId={currentProjectId}
          enabled={collabEnabled}
          onCodeChange={(newCode) => {
            setCode(newCode);
          }}
          onLanguageChange={(newLanguage) => {
            setLanguage(newLanguage);
          }}
        />
      )}
    </div>
  );
}
