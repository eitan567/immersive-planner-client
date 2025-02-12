import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from "../../../../components/ui/button.tsx";
import { QUICK_ACTIONS } from './types.ts';

interface ShortcutsMenuProps {
  onActionClick: (action: string) => void;
}

export const ShortcutsMenu: React.FC<ShortcutsMenuProps> = ({ onActionClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="p-2"
      >
        <SparklesIcon className="h-5 w-5 text-[#540ba9]" />
      </Button>

      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 w-[300px] max-h-[400px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
          style={{ direction: 'rtl' }}
        >
          <div className="grid gap-1">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  onActionClick(action.text);
                  setIsOpen(false);
                }}
                className="text-right px-3 py-2 text-sm text-gray-700 hover:bg-[#fff4fc] rounded-md w-full transition-colors"
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
