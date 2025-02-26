import React from 'react';
import { Button } from '../../../components/ui/button.tsx';

interface DashboardRightSidebarProps {
  onCreateEmpty: () => void;
  onCreateAI: () => void;
}

export const DashboardRightSidebar = ({ onCreateEmpty, onCreateAI }: DashboardRightSidebarProps) => {
  return (
    <div className="h-full bg-[#85003f05] p-6">
      <div className="space-y-4">
        <Button 
          onClick={onCreateAI}
          className="w-full bg-[#f06094] text-white hover:opacity-90"
        >
          צור שיעור בעזרת AI
        </Button>
        <Button 
          onClick={onCreateEmpty}
          variant="outline"
          className="w-full text-[#f06094] border border-[#f06094] hover:!bg-[#f06094] hover:!text-white"
        >
          צור שיעור ריק
        </Button>
      </div>
    </div>
  );
};
