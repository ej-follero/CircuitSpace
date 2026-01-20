export interface IoTDevice {
  type: string;
  model: string;
  position: { x: number; y: number; z: number };
}

export interface Preset {
  name: string;
  description: string;
  code: string;
  language: "javascript" | "arduino";
  devices: IoTDevice[];
  category: "sensors" | "actuators" | "arduino" | "automation";
}

export async function loadPreset(filename: string): Promise<Preset> {
  try {
    const response = await fetch(`/presets/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load preset: ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading preset ${filename}:`, error);
    throw error;
  }
}

export async function listPresets(): Promise<Array<{ filename: string; preset: Preset }>> {
  const presetFiles = [
    "RFID.json",
    "TemperatureSensor.json",
    "MotionDetector.json",
    "SmartLight.json",
    "SoilMoisture.json",
    "ArduinoBlink.json",
    "ArduinoServo.json",
  ];

  const presets = await Promise.allSettled(
    presetFiles.map(async (filename) => {
      const preset = await loadPreset(filename);
      return { filename, preset };
    })
  );

  return presets
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<{ filename: string; preset: Preset }>).value);
}

export function getPresetsByCategory(presets: Array<{ filename: string; preset: Preset }>) {
  const categories: Record<string, Array<{ filename: string; preset: Preset }>> = {
    sensors: [],
    actuators: [],
    arduino: [],
    automation: [],
  };

  presets.forEach((item) => {
    const category = item.preset.category || "automation";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(item);
  });

  return categories;
}
