'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Function to interpolate between two colors
function interpolateColor(color1: [number, number, number], color2: [number, number, number], factor: number) {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// Function to convert RGB string to HSL string
function rgbToHsl(rgbStr: string): string {
  const [r, g, b] = rgbStr.match(/\d+/g)!.map(Number);
  
  const r_norm = r / 255;
  const g_norm = g / 255;
  const b_norm = b / 255;

  const max = Math.max(r_norm, g_norm, b_norm);
  const min = Math.min(r_norm, g_norm, b_norm);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
      case g_norm: h = (b_norm - r_norm) / d + 2; break;
      case b_norm: h = (r_norm - g_norm) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}


export function SettingsPopover() {
  const [intensity, setIntensity] = useState([0.9]);

  useEffect(() => {
    const applyThemeColor = (color: string) => {
      const hslColor = rgbToHsl(color);
      document.documentElement.style.setProperty('--primary', hslColor);
      document.documentElement.style.setProperty('--destructive', hslColor);
      document.documentElement.style.setProperty('--ring', hslColor);
    };

    const baseRed: [number, number, number] = [225, 29, 46]; // #E11D2E
    // Use a neutral dark grey as the "zero" color for interpolation
    const neutralColor: [number, number, number] = [40, 40, 40]; 
    
    const newColor = interpolateColor(neutralColor, baseRed, intensity[0]);
    applyThemeColor(newColor);
    
  }, [intensity]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Paramètres</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Paramètres</h4>
            <p className="text-sm text-muted-foreground">
              Ajustez les paramètres de l'application.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="intensity">Intensité du thème</Label>
            <Slider
              id="intensity"
              defaultValue={intensity}
              max={1}
              step={0.1}
              onValueChange={setIntensity}
            />
            <p className="text-xs text-muted-foreground text-center">{Math.round(intensity[0] * 100)}%</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
