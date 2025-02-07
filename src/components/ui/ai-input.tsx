import * as React from "react"
import { useState } from 'react';
import { Button } from "./button.tsx"
import { Input } from "./input.tsx"
import { cn } from "../../lib/utils.ts"
import { SiProbot } from "react-icons/si";
import { MdFace } from "react-icons/md";
import { useMcpTool } from '../../hooks/useMcp.ts';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Textarea } from "./textarea.tsx";

interface AIInputProps<T extends string = string> extends Omit<React.ComponentProps<"input">, "onChange"> {
  context: string;
  fieldType?: 'topic' | 'duration' | 'activity' | 'priorKnowledge' | 'gradeLevel' | 'contentGoals' | 'skillGoals' | 'position';
  aiOn?: boolean;
  onSave?: () => Promise<void>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> & { currentTarget: { value: string } }) => void;
  value?: string;
}

const AIInput = React.forwardRef<HTMLInputElement, AIInputProps>(
  ({ className, type, context, fieldType = 'content', aiOn = true , onSave, value, onChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isChatMode, setIsChatMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
    const [error, setError] = useState<string | null>(null);

    const generateSuggestion = async (message?: string): Promise<string> => {
      setLoading(true);
      setError(null);
      setIsOpen(true);
      
      try {
        const result = await useMcpTool({
          serverName: 'ai-server',
          toolName: 'generate_suggestion',
          arguments: {
            context,
            currentValue: value?.toString() || '',
            type: fieldType,
            ...(message && { message })
          }
        });
        
        if ('error' in result) {
          throw new Error(result.error);
        }

        const newSuggestion = result.content[0]?.text;
        if (!newSuggestion) {
          throw new Error('לא התקבלה הצעה מהמערכת');
        }
        
        setSuggestion(newSuggestion);
        return newSuggestion;
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'שגיאה בקבלת הצעה');
        console.error('Failed to generate suggestion:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    const handleApply = async () => {
      try {
        if (onChange) {
          const syntheticEvent = {
            currentTarget: { value: suggestion },
            target: { value: suggestion }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
        if (onSave) {
          await onSave();
        }
        setIsOpen(false);
        setIsChatMode(false);
        setSuggestion('');
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'שגיאה בשמירת השינויים');
        console.error('Failed to apply suggestion:', error);
      }
    };

    const handleSendMessage = async () => {
      if (!chatMessage.trim()) return;

      const userMessage = {
        text: chatMessage,
        sender: 'user' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setChatMessage('');
      
      try {
        const newSuggestion = await generateSuggestion(chatMessage);
        const aiMessage = {
          text: newSuggestion,
          sender: 'ai' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage = {
          text: error instanceof Error ? error.message : 'שגיאה בקבלת תשובה',
          sender: 'ai' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    };

    const handleChatKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const toggleChatMode = () => {
      setIsChatMode(!isChatMode);
      setIsOpen(true);
    };

    return (
      <div className="relative w-full">
        <div className="flex w-full">
          <Input
            type={type}
            className={cn("w-full pl-[70px]", className)}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
          />
          {aiOn && (
            <>
            <button
              onClick={() => generateSuggestion()}
              className="absolute left-8 top-0.5 p-1.5 text-gray-600 hover:text-blue-800 transition-colors outline-none focus:outline-none"
              title="בקש הצעה לשיפור"
            >
              <SparklesIcon className="h-5 w-5 text-blue-800 aibutton hover:!text-[#8b57c8]" />
            </button>
            <button
              onClick={toggleChatMode}
              className="absolute left-2 top-0.5 p-1.5 text-gray-600 hover:text-blue-800 transition-colors outline-none focus:outline-none"
              title="פתח שיחה"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-800 aibutton hover:!text-[#8b57c8]" />
            </button>
           </>           
          )}
        </div>
         
        {isOpen && (
          <div id="conversation" className={cn(
            "p-6 z-[9999] bg-[#f9f6ff] rounded-lg shadow-lg border border-gray-200",
            isChatMode
              ? "fixed inset-x-[15%] top-[10%] bottom-[10%] w-[70%]"
              : "p-4 left-[-8px] top-[45px] absolute w-[-webkit-fill-available] before:content-[''] before:absolute before:top-[-9px] before:left-[45px] before:w-4 before:h-4 before:bg-[#f9f6ff] before:border-t before:border-l before:border-gray-200 before:rotate-45 before:transform"
          )}>
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-[1.2rem] font-normal text-[#540ba9]">
                {isChatMode ? 'שיחה' : 'הצעה לשיפור'}
              </h1>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsChatMode(false);
                }}
                className="p-1 rounded-full border border-solid border-[#ead9ff]"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 h-full">
             {isChatMode ? (
               <div className="flex h-full gap-4 pb-[40px]">
                 {/* Right side - Chat */}
                 <div className="w-1/2 flex flex-col h-full">
                   <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md border rounded-lg p-3 space-y-3 bg-gray-50 min-h-[calc(100vh-350px)] max-h-[calc(100vh-100px)]">
                     {messages.length === 0 ? (
                       <div className="text-center text-gray-500 text-sm p-4">
                         אפשר לשאול שאלות או לבקש שיפורים בתוכן
                       </div>
                     ) : (
                       messages.map((message, index) => (
                         <div
                           key={index}
                           className={`flex gap-2 ${
                             message.sender === 'user' ? 'flex-row-reverse' : ''
                           }`}
                         >
                           <div className="shrink-0">
                             {message.sender === 'user' ? (
                                <MdFace className="h-6 w-6 text-[darkslateblue]" />
                             ) : (
                               <SiProbot className="h-5 w-5 text-[darkmagenta]" />
                             )}
                           </div>
                           <div
                             className={`p-2 rounded-lg max-w-[90%] text-sm whitespace-pre-wrap break-words font-mono font-['Assistant'] ${
                               message.sender === 'user'
                                 ? 'bg-[darkslateblue] text-white px-[9px] pt-[3px] pb-[6px]'
                                 : 'bg-[honeydew] border rounded-md '
                             }`}
                           >
                             {message.text}
                           </div>
                         </div>
                       ))
                     )}
                     {loading && (
                       <div className="flex justify-center">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                       </div>
                     )}
                   </div>
                   <div className="flex gap-2 mt-3">
                     <Input
                       value={chatMessage}
                       onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setChatMessage(e.target.value)}
                       onKeyDown={handleChatKeyPress}
                       placeholder="כתוב הודעה..."
                       className="flex-1"
                       dir="rtl"
                       disabled={loading}
                     />
                     <Button
                       onClick={handleSendMessage}
                       disabled={loading || !chatMessage.trim()}                       
                       size="icon"
                       className="outline-none focus:outline-none border-none shadow-none"
                     >
                       <PaperAirplaneIcon className="rotate-180 h-6 w-6" />
                     </Button>
                   </div>
                 </div>
                 
                 {/* Left side - Suggestion */}
                 <div className="w-1/2 flex flex-col">
                   {loading ? (
                     <div className="text-center py-4">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                       <p className="mt-2 text-sm text-gray-600">מייצר הצעה...</p>
                     </div>
                   ) : error ? (
                     <div className="text-center py-4">
                       <p className="text-sm text-red-600">{error}</p>
                       <Button onClick={() => generateSuggestion()} className="mt-2">
                         נסה שוב
                       </Button>
                     </div>
                   ) : (
                     <>
                       <Textarea
                         value={suggestion}
                         onChange={(e) => setSuggestion(e.target.value)}
                         className="flex-1 min-h-[calc(100vh-350px)]"
                         placeholder="ההצעה תופיע כאן..."
                         dir="rtl"
                       />
                       <div className="flex justify-end mt-4">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={handleApply}
                           className="text-[#681bc2] border border-[#681bc2] hover:!bg-[#681bc2] hover:!text-white"
                         >
                           אישור
                         </Button>
                       </div>
                     </>
                   )}
                 </div>
               </div>
             ) : (
               <div className="space-y-2">
                 {loading ? (
                   <div className="text-center py-4">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                     <p className="mt-2 text-sm text-gray-600">מייצר הצעה...</p>
                   </div>
                 ) : error ? (
                   <div className="text-center py-4">
                     <p className="text-sm text-red-600">{error}</p>
                     <Button
                       onClick={() => generateSuggestion()}
                       className="mt-2"
                     >
                       נסה שוב
                     </Button>
                   </div>
                 ) : suggestion ? (
                   <div className="space-y-2">
                     <Textarea
                       value={suggestion}
                       onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuggestion(e.currentTarget.value)}
                    className={cn(
                      "w-full",
                      isChatMode ? "h-[calc(100vh-120px)]" : "min-h-[200px]"
                    )}
                       dir="rtl"
                     />
                     <div className="flex justify-end gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={toggleChatMode}
                         className="hover:!bg-[#681bc2] hover:!text-white text-[#681bc2] border border-[#681bc2]"
                       >
                         פתח שיחה
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleApply}
                         className="text-[#681bc2] border border-[#681bc2] hover:!bg-[#681bc2] hover:!text-white"
                       >
                         אישור
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-4">
                     <p className="text-sm text-gray-600">מייצר הצעה...</p>
                   </div>
                 )}
               </div>
             )}
           </div>
          </div>
        )}
      </div>
    );
  }
);

AIInput.displayName = "AIInput";

export { AIInput };