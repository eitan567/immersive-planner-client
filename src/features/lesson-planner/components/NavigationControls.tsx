import React from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

interface NavigationControlsProps {
  currentStep: number;
  onPrevious: () => Promise<void>;
  onNext: () => Promise<void>;
  onExport?: () => void;
  saving?: boolean;
}

export const NavigationControls = ({ 
  currentStep, 
  onPrevious, 
  onNext, 
  onExport,
  saving = false
}: NavigationControlsProps) => {
  return (
    <div className="flex justify-between rtl">
      {currentStep > 1 && (
        <Button 
          onClick={onPrevious}
          disabled={saving}
          className="flex items-center gap-2 border bg-[#f06094] border-[#f06094] hover:!bg-[#f06094]/90 text-white"
        >
          <ArrowRightIcon className="h-5 w-5  text-white" />
          {saving ? 'שומר...' : 'הקודם'}
        </Button>
      )}
      <div className="flex-grow" />
      {currentStep < 2 ? (
        <Button 
          onClick={onNext}
          disabled={saving}
          className="flex items-center gap-2 border bg-[#f06094] border-[#f06094] hover:!bg-[#f06094]/90 text-white"
        >
          {saving ? 'שומר...' : currentStep === 2 ? 'צפה בתוכנית' : 'הבא'}
          <ArrowLeftIcon className="h-5 w-5 text-white" />
        </Button>
      ) : onExport && (
        <Button 
          onClick={onExport}
          className="flex items-center gap-2 border bg-[#f06094] border-[#f06094] hover:!bg-[#f06094]/90 text-white"
        >
          <ArrowDownTrayIcon className="h-5 w-5  text-white" />
          ייצא לקובץ טקסט
        </Button>
      )}
    </div>
  );
};

export default NavigationControls;