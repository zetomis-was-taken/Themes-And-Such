"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChromePicker, ColorResult } from "react-color";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[220px] justify-start text-left font-normal",
            !color && "text-muted-foreground",
            className
          )}
        >
          <div className="w-4 h-4 rounded-full mr-2 border shadow-sm" style={{ backgroundColor: color }} />
          {color ? color : "Pick a color"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <ChromePicker
          color={color}
          onChange={handleChange}
          disableAlpha={true}
        />
      </PopoverContent>
    </Popover>
  );
}
