"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SimulationMetricsChartProps {
  data: Array<{
    time: string;
    cpu: number;
    memory: number;
    executionTime: number;
  }>;
}

export function SimulationMetricsChart({ data }: SimulationMetricsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Metrics</CardTitle>
        <CardDescription>CPU, Memory, and Execution Time over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="hsl(var(--chart-1))" strokeWidth={2} />
            <Line type="monotone" dataKey="memory" stroke="hsl(var(--chart-2))" strokeWidth={2} />
            <Line type="monotone" dataKey="executionTime" stroke="hsl(var(--chart-3))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
