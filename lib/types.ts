export interface IoTDevice {
  id: string;
  name: string;
  type: "sensor" | "actuator" | "controller";
  model: string;
  status: "online" | "offline" | "error";
  lastUpdate: Date;
  data?: Record<string, any>;
}

export interface SimulationResult {
  success: boolean;
  logs: string[];
  metrics: {
    cpu: number;
    memory: number;
    executionTime: number;
    dataTransferred: number;
  };
  errors: Array<{
    line: number;
    message: string;
    type: "error" | "warning";
  }>;
  output?: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  code: string;
  language: "javascript" | "arduino";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CollaborationRoom {
  id: string;
  projectId: string;
  participants: Array<{
    id: string;
    name: string;
    cursor: { line: number; column: number };
  }>;
}
