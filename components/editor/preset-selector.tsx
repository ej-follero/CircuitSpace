"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileCode, Loader2 } from "lucide-react";
import { listPresets, getPresetsByCategory, type Preset } from "@/lib/presets";
import { toast } from "@/hooks/use-toast";

interface PresetSelectorProps {
  onSelectPreset: (preset: Preset) => void;
  currentLanguage?: "javascript" | "arduino";
}

export function PresetSelector({ onSelectPreset, currentLanguage }: PresetSelectorProps) {
  const [presets, setPresets] = useState<Array<{ filename: string; preset: Preset }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setIsLoading(true);
      const loadedPresets = await listPresets();
      setPresets(loadedPresets);
    } catch (error) {
      console.error("Failed to load presets:", error);
      toast({
        title: "Error",
        description: "Failed to load presets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: Preset) => {
    if (currentLanguage && preset.language !== currentLanguage) {
      toast({
        title: "Language Mismatch",
        description: `This preset is for ${preset.language}, but you're using ${currentLanguage}. Switch language first.`,
        variant: "destructive",
      });
      return;
    }
    onSelectPreset(preset);
    toast({
      title: "Preset Loaded",
      description: `${preset.name} has been loaded into the editor`,
    });
  };

  const categories = getPresetsByCategory(presets);
  const filteredPresets = currentLanguage
    ? presets.filter((item) => item.preset.language === currentLanguage)
    : presets;

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading Presets...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileCode className="mr-2 h-4 w-4" />
          Load Preset
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>IoT Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {filteredPresets.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No presets available
          </div>
        ) : (
          <>
            {categories.sensors.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Sensors</DropdownMenuLabel>
                {categories.sensors
                  .filter((item) => !currentLanguage || item.preset.language === currentLanguage)
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.filename}
                      onClick={() => handleSelectPreset(item.preset)}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium">{item.preset.name}</span>
                      <span className="text-xs text-muted-foreground">{item.preset.description}</span>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
              </>
            )}

            {categories.actuators.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Actuators</DropdownMenuLabel>
                {categories.actuators
                  .filter((item) => !currentLanguage || item.preset.language === currentLanguage)
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.filename}
                      onClick={() => handleSelectPreset(item.preset)}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium">{item.preset.name}</span>
                      <span className="text-xs text-muted-foreground">{item.preset.description}</span>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
              </>
            )}

            {categories.arduino.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Arduino</DropdownMenuLabel>
                {categories.arduino.map((item) => (
                  <DropdownMenuItem
                    key={item.filename}
                    onClick={() => handleSelectPreset(item.preset)}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">{item.preset.name}</span>
                    <span className="text-xs text-muted-foreground">{item.preset.description}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {categories.automation.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Automation</DropdownMenuLabel>
                {categories.automation
                  .filter((item) => !currentLanguage || item.preset.language === currentLanguage)
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.filename}
                      onClick={() => handleSelectPreset(item.preset)}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium">{item.preset.name}</span>
                      <span className="text-xs text-muted-foreground">{item.preset.description}</span>
                    </DropdownMenuItem>
                  ))}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
