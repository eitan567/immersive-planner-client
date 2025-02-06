import React from 'react';
import { Badge } from "../../../components/ui/badge.tsx";
import { cn } from "../../../lib/utils.ts";

interface QuickAction {
  text: string;
  maxWidth: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionClick }) => (
  <div className="flex flex-wrap gap-1 mb-3 text-center">
    {actions.map((action, index) => (
      <Badge
        key={index}
        onClick={() => onActionClick(action.text)}
        className={cn(
          "cursor-pointer hover:bg-[#c6a0f3] transition-colors border border-[#e6b8ff] text-black bg-[#f9d9ff] font-semibold text-[9px] px-[7px] pb-[1px]",
          action.maxWidth
        )}
      >
        {action.text}
      </Badge>
    ))}
  </div>
);
