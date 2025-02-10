import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog.tsx';

interface SavePromptProps {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => Promise<void>;
}

export function SavePrompt({
  open,
  onClose,
  onDiscard,
  onSave,
}: SavePromptProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
      // Keep dialog open if save fails
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>שמירת שינויים</AlertDialogTitle>
          <AlertDialogDescription>
            האם תרצה לשמור את השינויים שביצעת?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            התעלם משינויים
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#681bc2] text-white hover:bg-[#681bc2]/90"
          >
            {isSaving ? 'שומר...' : 'שמור'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
