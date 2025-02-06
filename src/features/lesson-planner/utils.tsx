/** @jsxImportSource react */
import React from 'react';
import { Badge } from "../../components/ui/badge.tsx";

export const renderMessageText = (text: string): React.ReactNode => {
  const parts = text.split(/(<שדה:\s*[^>]+>)/);
  return parts.map((part, index) => {
    const fieldMatch = part.match(/<שדה:\s*([^>]+)>/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1].trim();
      return (
        <React.Fragment key={`field-${index}`}>
          <br />
          <Badge className="mx-1 float-right mt-[10px]">
            {fieldName}
          </Badge>
        </React.Fragment>
      );
    }
    return part;
  });
};