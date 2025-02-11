/** @jsxImportSource react */
import React from 'react';
import { Badge } from "../../components/ui/badge.tsx";
import { Message } from './components/ChatMessage.tsx';

export const renderMessageText = (message: Message): React.ReactNode => {
  const parts = message.text.split(/(<שדה:\s*[^>]+>)/);
  console.log(parts);
  return parts.map((part, index) => {
    const fieldMatch = part.match(/<שדה:\s*([^>]+)>/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1].trim();
      return (
        <React.Fragment key={`field-${index}`}>
          <br />
          <Badge className="float-right mt-[10px] h-3.5">
            {fieldName}
          </Badge>
        </React.Fragment>
      );
    }
    return (
      <>
        {part}
        {index === 0 ? (
          <div className="text-[11px] text-gray-600">
            {message.value}
          </div>
        ) : null}
      </>
    );
  });
};