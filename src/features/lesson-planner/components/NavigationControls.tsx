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
    <div className="flex justify-between mt-4 rtl">
      {currentStep > 1 && (
        <Button 
          onClick={onPrevious}
          disabled={saving}
          className="text-[#681bc2] border border-[#681bc2] flex items-center gap-2 hover:!bg-[#681bc2] hover:!text-white"
        >
          <ArrowRightIcon className="h-5 w-5" />
          {saving ? 'שומר...' : 'הקודם'}
        </Button>
      )}
      <div className="flex-grow" />
      {currentStep < 3 ? (
        <Button 
          onClick={onNext}
          disabled={saving}
          className="text-[#681bc2] border border-[#681bc2] flex items-center gap-2 hover:!bg-[#681bc2] hover:!text-white"
        >
          {saving ? 'שומר...' : currentStep === 2 ? 'צפה בתוכנית' : 'הבא'}
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
      ) : onExport && (
        <Button 
          onClick={onExport}
          className="text-[#681bc2] border border-[#681bc2] flex items-center gap-2 hover:!bg-[#681bc2] hover:!text-white"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          ייצא לקובץ טקסט
        </Button>
      )}
    </div>
  );
};

export default NavigationControls;