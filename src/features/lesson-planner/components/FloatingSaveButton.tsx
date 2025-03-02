import React from 'react';
import { Button } from '../../../components/ui/button.tsx';
import { cn } from "../../../lib/utils";

interface FloatingSaveButtonProps {
  onClick: () => void;
  saving: boolean;
  lastSaved: Date | null;
  savingText?: string;
  buttonText?: string;
  className?: string;
}

export function FloatingSaveButton({ 
  onClick, 
  saving, 
  lastSaved,
  savingText = 'שומר...',
  buttonText = 'שמור שינויים',
  className
}: FloatingSaveButtonProps) {
  return (
    <div className={cn("absolute bottom-0 left-0 z-50", className)}>
      <Button 
        data-save-button
        onClick={onClick}
        disabled={saving}
        className="leading-tight h-9 flex flex-col items-center border bg-[#f06094] border-[#f06094] hover:!bg-[#f06094]/90 text-white"
      >
        {saving ? savingText : buttonText}
        {lastSaved && (
          <span className="text-[0.7rem]">
            נשמר לאחרונה: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </Button>
    </div>
  );
}
