import React from 'react';
import { MdFace } from "react-icons/md";
import { SiProbot } from "react-icons/si";
import { DocumentDuplicateIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { renderMessageText } from "../utils.tsx";

export interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCopy: (text: string) => void;
  onResend?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy, onResend }) => {
  return (
    <div className={`flex gap-2 ${message.sender === 'ai' ? 'flex-row-reverse' : ''}`}>
      <div className="shrink-0">
        {message.sender === 'user' ? (
          <MdFace className="h-6 w-6 text-[darkslateblue]" />
        ) : (
          <SiProbot className="h-5 w-5 text-[darkmagenta]" />
        )}
      </div>
      <div className={`relative p-2 text-sm rounded-lg max-w-[90%] whitespace-pre-wrap break-words font-['Assistant'] ${
        message.sender === 'user'
          ? 'bg-[darkslateblue] text-white px-[9px] pt-[3px] pb-[6px]'
          : 'bg-[honeydew] border rounded-md min-w-[210px]'
      }`}>
        {renderMessageText(message.text)}
        <div className="flex gap-2 mt-2 justify-end">
          {message.sender === 'user' ? (
            <>
              <button
                onClick={() => onResend && onResend(message.text)}
                className="hover:text-[pink] transition-colors text-white"
                title="שלח שוב"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onCopy(message.text)}
                className="hover:text-[pink] transition-colors text-white"
                title="העתק הודעה"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onCopy(message.text)}
              className="hover:text-[#540ba9] transition-colors text-gray-800"
              title="העתק הודעה"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
