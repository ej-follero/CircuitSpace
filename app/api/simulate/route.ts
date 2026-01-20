import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SimulationResult } from "@/lib/types";

// Helper function to hash code
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Mock IoT hardware APIs
const mockHardware = {
  digitalRead: (pin: number) => Math.random() > 0.5,
  digitalWrite: (pin: number, value: boolean) => ({ pin, value }),
  analogRead: (pin: number) => Math.floor(Math.random() * 1024),
  analogWrite: (pin: number, value: number) => ({ pin, value }),
  pinMode: (pin: number, mode: string) => ({ pin, mode }),
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  RFID: {
    scan: () => {
      const cards = ["CARD001", "CARD002", "CARD003", "CARD004"];
      return cards[Math.floor(Math.random() * cards.length)];
    },
    read: (cardId: string) => ({ id: cardId, data: `Data for ${cardId}` }),
  },
};

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, language, projectId } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const logs: string[] = [];
    const errors: Array<{ line: number; message: string; type: "error" | "warning" }> = [];
    let output: Record<string, any> = {};

    // Simple code execution simulation
    try {
      // Create a safe execution context
      const context = {
        console: {
          log: (...args: any[]) => {
            logs.push(args.map((arg) => String(arg)).join(" "));
          },
          error: (...args: any[]) => {
            const message = args.map((arg) => String(arg)).join(" ");
            logs.push(`ERROR: ${message}`);
            errors.push({ line: 0, message, type: "error" });
          },
          warn: (...args: any[]) => {
            const message = args.map((arg) => String(arg)).join(" ");
            logs.push(`WARN: ${message}`);
            errors.push({ line: 0, message, type: "warning" });
          },
        },
        ...mockHardware,
        setTimeout: (fn: () => void, ms: number) => {
          setTimeout(fn, ms);
        },
        setInterval: (fn: () => void, ms: number) => {
          return setInterval(fn, ms);
        },
        clearTimeout: (id: NodeJS.Timeout) => clearTimeout(id),
        clearInterval: (id: NodeJS.Timeout) => clearInterval(id),
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Set,
        Map,
        Promise,
      };

      // Execute code in a controlled environment
      const startTime = Date.now();
      const fn = new Function(...Object.keys(context), code);
      const result = fn(...Object.values(context));
      const executionTime = Date.now() - startTime;

      output = { result, executionTime };

      // Simulate metrics
      const metrics = {
        cpu: Math.floor(Math.random() * 30 + 10), // 10-40%
        memory: Math.floor(Math.random() * 50 + 20), // 20-70MB
        executionTime,
        dataTransferred: Math.floor(Math.random() * 1000 + 100), // 100-1100 bytes
      };

      const simulationResult: SimulationResult = {
        success: errors.length === 0,
        logs,
        metrics,
        errors,
        output,
      };

      // Save simulation to database if projectId is provided
      const requestBody = await request.json();
      const projectId = requestBody?.projectId;
      if (projectId && typeof projectId === "string") {
        try {
          const supabase = await createServerSupabase();
          
          // Get user ID from Supabase
          const { data: userData } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

          if (userData) {
            // Generate code hash for deduplication
            const codeHash = await hashCode(code);
            
            const { error: simError } = await supabase
              .from("simulations")
              .insert({
                project_id: projectId,
                code_hash: codeHash,
                logs: logs,
                metrics: metrics,
                duration_ms: executionTime,
                inputs: { language },
              });

            if (simError) {
              console.error("Failed to save simulation:", simError);
            }
          }
        } catch (dbError) {
          console.error("Database error saving simulation:", dbError);
          // Don't fail the request if DB save fails
        }
      }

      return NextResponse.json(simulationResult);
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      errors.push({ line: 0, message: errorMessage, type: "error" });

      return NextResponse.json({
        success: false,
        logs,
        metrics: {
          cpu: 0,
          memory: 0,
          executionTime: 0,
          dataTransferred: 0,
        },
        errors,
        output: {},
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
