"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Project } from "@/lib/types";
import Link from "next/link";

export default function ProjectsPage() {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadProjects();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects");
      
      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects(projects.filter((p) => p.id !== projectId));
      toast({
        title: "Project deleted",
        description: "The project has been removed",
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your IoT projects</p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No projects found" : "No projects yet. Create your first project!"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {project.description || "No description"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(project.id)}
                    aria-label="Delete project"
                    suppressHydrationWarning
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Language: <span className="font-medium">{project.language}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href={`/dashboard?project=${project.id}`}>Open Project</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
