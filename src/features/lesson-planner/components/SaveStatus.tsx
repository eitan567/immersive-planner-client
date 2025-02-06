import React from 'react';
import { Button } from "../../../components/ui/button.tsx";

interface SaveStatusProps {
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
  className?: string;
  savingText?: string;
  buttonText?: string;
}

export const SaveStatus = ({ onSave, saving, lastSaved, className = '' ,savingText='שומר...',buttonText='שמור שינויים'}: SaveStatusProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        onClick={onSave}
        disabled={saving}
        className="text-[#681bc2] border border-[#681bc2] h-[50px] flex flex-col items-center gap-1 hover:!bg-[#681bc2] hover:!text-white"
      >
        {saving ? savingText : buttonText}
        <br/> 
        {lastSaved && (
        <span className="text-xs">
          נשמר לאחרונה: {lastSaved.toLocaleTimeString()}
        </span>
      )}
      </Button>
      
    </div>
  );
};