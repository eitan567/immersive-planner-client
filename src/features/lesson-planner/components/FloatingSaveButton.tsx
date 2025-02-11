import React from 'react';
import { Button } from '../../../components/ui/button.tsx';
import { cn } from "../../../lib/utils.ts";

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
    <div className={cn("fixed bottom-24 left-6 z-50 max-w-[calc(100%-3rem)] max-h-[calc(100vh-6rem)]", className)}>
      <Button 
        data-save-button
        onClick={onClick}
        disabled={saving}
        className="bg-white text-[#681bc2] border border-[#681bc2] h-[50px] flex flex-col items-center gap-1 hover:!bg-[#681bc2] hover:!text-white"
      >
        {saving ? savingText : buttonText}
        {lastSaved && (
          <span className="text-xs">
            נשמר לאחרונה: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </Button>
    </div>
  );
}
