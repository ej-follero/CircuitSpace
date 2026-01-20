import type { Project } from "./types";

export function exportToPDF(project: Project) {
  // This would use react-pdf or jsPDF in a real implementation
  const content = `
Project: ${project.name}
Language: ${project.language}
Created: ${project.createdAt.toLocaleDateString()}
Updated: ${project.updatedAt.toLocaleDateString()}

Code:
${project.code}
  `;

  // For now, create a downloadable text file
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToDocker(project: Project) {
  const dockerfile = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
  `;

  const blob = new Blob([dockerfile], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Dockerfile";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToArduino(project: Project) {
  if (project.language !== "arduino") {
    throw new Error("Project is not an Arduino project");
  }

  const sketch = `// ${project.name}
// Generated from CircuitSpace

${project.code}
  `;

  const blob = new Blob([sketch], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.ino`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
