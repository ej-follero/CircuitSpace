import type { Project, SimulationResult } from "./types";

export async function exportToPDF(project: Project, simulationResult?: SimulationResult) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text(project.name, 20, 20);

    // Project Info
    doc.setFontSize(12);
    let yPos = 35;
    doc.text(`Language: ${project.language}`, 20, yPos);
    yPos += 8;
    doc.text(`Created: ${project.createdAt.toLocaleDateString()}`, 20, yPos);
    yPos += 8;
    doc.text(`Updated: ${project.updatedAt.toLocaleDateString()}`, 20, yPos);

    if (project.description) {
      yPos += 10;
      doc.setFontSize(10);
      doc.text("Description:", 20, yPos);
      yPos += 6;
      const descLines = doc.splitTextToSize(project.description, 170);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 6;
    }

    // Code Section
    yPos += 10;
    doc.setFontSize(12);
    doc.text("Code:", 20, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont("courier");
    const codeLines = doc.splitTextToSize(project.code, 170);
    codeLines.forEach((line: string) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 20, yPos);
      yPos += 5;
    });

    // Simulation Results (if provided)
    if (simulationResult) {
      yPos += 10;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Simulation Results:", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Success: ${simulationResult.success ? "Yes" : "No"}`, 20, yPos);
      yPos += 6;
      doc.text(`Execution Time: ${simulationResult.metrics.executionTime}ms`, 20, yPos);
      yPos += 6;
      doc.text(`CPU Usage: ${simulationResult.metrics.cpu}%`, 20, yPos);
      yPos += 6;
      doc.text(`Memory: ${simulationResult.metrics.memory}MB`, 20, yPos);

      if (simulationResult.logs.length > 0) {
        yPos += 8;
        doc.text("Logs:", 20, yPos);
        yPos += 6;
        doc.setFontSize(8);
        simulationResult.logs.slice(0, 10).forEach((log: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(log.substring(0, 80), 20, yPos);
          yPos += 5;
        });
      }
    }

    doc.save(`${project.name}.pdf`);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    // Fallback to text export
    const content = `
Project: ${project.name}
Language: ${project.language}
Created: ${project.createdAt.toLocaleDateString()}
Updated: ${project.updatedAt.toLocaleDateString()}

Code:
${project.code}
    `;
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
}

export function exportToJSON(project: Project, simulationResult?: SimulationResult) {
  const data = {
    project: {
      name: project.name,
      description: project.description,
      code: project.code,
      language: project.language,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
    ...(simulationResult && { simulation: simulationResult }),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(project: Project, simulationResult?: SimulationResult) {
  let csv = `Project,${project.name}\n`;
  csv += `Language,${project.language}\n`;
  csv += `Created,${project.createdAt.toISOString()}\n`;
  csv += `Updated,${project.updatedAt.toISOString()}\n`;
  
  if (project.description) {
    csv += `Description,"${project.description.replace(/"/g, '""')}"\n`;
  }

  csv += `\nCode\n`;
  csv += `"${project.code.replace(/"/g, '""')}"\n`;

  if (simulationResult) {
    csv += `\nSimulation Results\n`;
    csv += `Success,${simulationResult.success}\n`;
    csv += `Execution Time,${simulationResult.metrics.executionTime}\n`;
    csv += `CPU Usage,${simulationResult.metrics.cpu}\n`;
    csv += `Memory,${simulationResult.metrics.memory}\n`;
    csv += `Data Transferred,${simulationResult.metrics.dataTransferred}\n`;
    
    if (simulationResult.logs.length > 0) {
      csv += `\nLogs\n`;
      simulationResult.logs.forEach((log) => {
        csv += `"${log.replace(/"/g, '""')}"\n`;
      });
    }
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToExcel(project: Project, simulationResult?: SimulationResult) {
  try {
    const XLSX = await import("xlsx");
    
    const workbook = XLSX.utils.book_new();
    
    // Project Sheet
    const projectData = [
      ["Project", project.name],
      ["Language", project.language],
      ["Created", project.createdAt.toISOString()],
      ["Updated", project.updatedAt.toISOString()],
      ["Description", project.description || ""],
      [""],
      ["Code"],
      [project.code],
    ];
    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, "Project");

    // Simulation Sheet (if provided)
    if (simulationResult) {
      const simData = [
        ["Simulation Results"],
        ["Success", simulationResult.success ? "Yes" : "No"],
        ["Execution Time (ms)", simulationResult.metrics.executionTime],
        ["CPU Usage (%)", simulationResult.metrics.cpu],
        ["Memory (MB)", simulationResult.metrics.memory],
        ["Data Transferred (B)", simulationResult.metrics.dataTransferred],
        [""],
        ["Logs"],
        ...simulationResult.logs.map((log) => [log]),
      ];
      const simSheet = XLSX.utils.aoa_to_sheet(simData);
      XLSX.utils.book_append_sheet(workbook, simSheet, "Simulation");
    }

    XLSX.writeFile(workbook, `${project.name}.xlsx`);
  } catch (error) {
    console.error("Failed to export Excel:", error);
    // Fallback to CSV
    exportToCSV(project, simulationResult);
  }
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
