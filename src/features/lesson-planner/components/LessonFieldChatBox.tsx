import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Card } from "../../../components/ui/card.tsx";
import { useMcpTool } from '../../../hooks//useMcp.ts';
import { Badge } from "../../../components/ui/badge.tsx";
import { SiProbot } from "react-icons/si";
import { MdFace } from "react-icons/md";
import { cn } from "../../..//lib/utils.ts"
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon,
         DocumentDuplicateIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

import { LessonPlanSections } from '../types.ts';

interface LessonFieldChatBoxProps {
  onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  sections: LessonPlanSections;
  saveCurrentPlan: () => Promise<void>;
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  // Basic info fields
  topic: 'נושא היחידה',
  duration: 'זמן כולל',
  gradeLevel: 'שכבת גיל',
  priorKnowledge: 'ידע קודם נדרש',
  position: 'מיקום בתוכן',
  contentGoals: 'מטרות ברמת התוכן',
  skillGoals: 'מטרות ברמת המיומנויות',
  
  // Lesson section fields
  'opening.0.content': 'פתיחה - תוכן/פעילות',
  'opening.0.spaceUsage': 'פתיחה - שימוש במרחב הפיזי',
  'main.0.content': 'גוף השיעור - תוכן/פעילות',
  'main.0.spaceUsage': 'גוף השיעור - שימוש במרחב הפיזי',
  'summary.0.content': 'סיכום - תוכן/פעילות',
  'summary.0.spaceUsage': 'סיכום - שימוש במרחב הפיזי'
};

const QUICK_ACTIONS = [
  {text:'שפר את תוכן נושא היחידה',maxWidth:'max-w-[86px]'},
  {text:'נסח מחדש מטרות ברמת התוכן',maxWidth:'max-w-[92px]'},
  {text:'שפר מטרות ברמת המיומנויות',maxWidth:'max-w-[90px]'},
  {text:'הצע רעיונות לפתיחת השיעור',maxWidth:'max-w-[86px]'},
  {text:'שפר פעילות בגוף השיעור',maxWidth:'max-w-[86px] mt-[5px]'},
  {text:'הצע זמן כולל',maxWidth:'min-w-[92px] mt-[5px] leading-7'},
  {text:'שפר ידע קודם נדרש',maxWidth:'max-w-[90px] mt-[5px]'},
  {text:'הצע שכבת גיל',maxWidth:'min-w-[86px] mt-[5px] leading-7'},
];

export const LessonFieldChatBox: React.FC<LessonFieldChatBoxProps> = ({
  onUpdateField,
  className,
  currentValues,
  sections,
  saveCurrentPlan
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldSend, setShouldSend] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll to bottom when chat is opened
  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen]);

  useEffect(() => {
    console.log('LessonFieldChatBox mounted with currentValues:', currentValues);
  }, []);

  useEffect(() => {
    if (shouldSend && currentMessage) {
      handleSendMessage();
      setShouldSend(false);
    }
  }, [currentMessage, shouldSend]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    try {
      setLoading(true);

      const allValues = {
        ...currentValues,
        'opening.0.content': sections?.opening?.[0]?.content || '',
        'opening.0.spaceUsage': sections?.opening?.[0]?.spaceUsage || '',
        'main.0.content': sections?.main?.[0]?.content || '',
        'main.0.spaceUsage': sections?.main?.[0]?.spaceUsage || '',
        'summary.0.content': sections?.summary?.[0]?.content || '',
        'summary.0.spaceUsage': sections?.summary?.[0]?.spaceUsage || ''
      };

      console.log('Sending request with currentValues:', allValues);
      
      setMessages(prev => [...prev, {
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      }]);

      const response = await useMcpTool({
        serverName: 'ai-server',
        toolName: 'update_lesson_field',
        arguments: {
          message: currentMessage,
          fieldLabels: FIELD_LABELS,
          currentValues: allValues,
          rephrase: currentMessage.includes('נסח') || currentMessage.includes('שפר')
        }
      });

      if ('error' in response) {
        let errorMessage = response.error;
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('Resource has been exhausted') ||
              errorMessage.includes('quota')) {
            errorMessage = 'מצטער, המערכת לא זמינה כרגע. אנא נסה שוב מאוחר יותר או פנה למנהל המערכת.';
          } else if (errorMessage.includes('Invalid response format')) {
            errorMessage = 'מצטער, התקבלה תשובה לא תקינה מהשרת. אנא נסה שוב.';
          }
        }
        throw new Error(errorMessage);
      }

      const responseText = response.content?.[0]?.text;
      if (!responseText) {
        throw new Error('לא התקבלה תשובה מהשרת. אנא נסה שוב.');
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('התקבל מידע לא תקין מהשרת. אנא נסה שוב.');
      }
      
      const updates = Array.isArray(parsed) ? parsed : [parsed];
      
      for (const update of updates) {
        if (!update.fieldToUpdate || !update.userResponse || !update.newValue) {
          throw new Error('תשובת המערכת חסרה שדות נדרשים');
        }
      }

      setMessages(prev => [
        ...prev,
        ...updates.map(update => ({
          text: update.userResponse,
          sender: 'ai' as const,
          timestamp: new Date()
        }))
      ]);

      const batchUpdates = updates.map(update => {
        const fieldName = update.fieldToUpdate;
        const newValue = update.newValue;
        
        if (fieldName.includes('.')) {
          const [phase, index, field] = fieldName.split('.');
          
          if (phase && field && ['opening', 'main', 'summary'].includes(phase) &&
              ['content', 'spaceUsage'].includes(field)) {
            return [fieldName, newValue] as [string, string];
          }
        }
        
        return [fieldName, newValue] as [string, string];
      });

      const validUpdates = batchUpdates.filter(update =>
        update && FIELD_LABELS[update[0]] !== undefined
      );

      if (validUpdates.length > 0) {
        await onUpdateField(validUpdates);
        await saveCurrentPlan();
      }

    } catch (error) {
      console.error('Failed to process request:', error);
      setMessages(prev => [...prev, {
        text: error instanceof Error ? error.message : 'מצטער, נתקלתי בבעיה בעיבוד הבקשה. אנא נסה שנית.',
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleResendMessage = (text: string) => {
    setCurrentMessage(text);
    setShouldSend(true);
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(<שדה:\s*[^>]+>)/);
    return parts.map((part, index) => {
      const fieldMatch = part.match(/<שדה:\s*([^>]+)>/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1].trim();
        return (
          <>
          <br/>
          <Badge key={index} className="mx-1 float-right mt-[10px]">
            {fieldName}
          </Badge>
          </>
        );
      }
      return part;
    });
  };

  const handleQuickAction = (action: string) => {
    setCurrentMessage(action);
    setShouldSend(true);
  };

  const renderQuickActions = () => (
    <div className="flex flex-wrap gap-1 mb-3 text-center">
      {QUICK_ACTIONS.map((action, index) => (
        <Badge key={index} onClick={() => handleQuickAction(action.text)} className={cn("cursor-pointer hover:bg-[#c6a0f3] transition-colors border border-[#e6b8ff] text-black bg-[#f9d9ff] font-semibold text-[9px] px-[7px] pb-[1px]",action.maxWidth)}>
          {action.text}
        </Badge>
      ))}
    </div>
  );

  return (
    <Card className="mt-0 border border-[#eadfff] rounded-[9px] shadow-none">
      <div className="p-4 bg-[#fff4fc] rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-slate-800 mb-1">שיחה על פרטי השיעור</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-700"
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <div ref={chatContainerRef} className={cn("h-[calc(100vh-330px)] overflow-y-auto border rounded-lg p-3 mt-2 space-y-3 bg-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md",className)}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  אפשר לבקש עזרה בניסוח, שיפור או שינוי של פרטי השיעור ומבנה השיעור.
                  <br />
                  לדוגמה:
                  <br />
                  דוגמאות לפרטי השיעור:
                  <br />
                  "שנה את נושא היחידה ל'אנרגיה מתחדשת'"
                  <br />
                  "תעזור לי לנסח טוב יותר את מטרות התוכן"
                  <br />
                  דוגמאות לבניית השיעור:
                  <br />
                  "תציע פעילות מעניינת לפתיחת השיעור"
                  <br />
                  "תשפר את השימוש במרחב בגוף השיעור"
                  <br />
                  "תציע פעילות סיכום אינטראקטיבית"
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
                    <div className={`relative p-2 text-sm rounded-lg max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-[darkslateblue] text-white px-[9px] pt-[3px] pb-[6px]'
                        : 'bg-[honeydew] border rounded-md min-w-[194px]'
                    }`}>
                      {renderMessageText(message.text)}
                      <div className="flex gap-2 mt-2 justify-end">
                        {message.sender === 'user' ? (
                          <>
                            <button
                              onClick={() => handleResendMessage(message.text)}
                              className="hover:text-[pink] transition-colors text-white"
                              title="שלח שוב"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCopyMessage(message.text)}
                              className="hover:text-[pink] transition-colors text-white"
                              title="העתק הודעה"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCopyMessage(message.text)}
                            className="hover:text-[#540ba9] transition-colors text-gray-800"
                            title="העתק הודעה"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

            {renderQuickActions()}

            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="בקש עזרה בניסוח, שיפור או שינוי פרטי השיעור..."
                className="flex-1 shadow-none"
                dir="rtl"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !currentMessage.trim()}
                size="icon"
                className="border-none outline-none shadow-none"
              >
                <PaperAirplaneIcon className="h-4 w-4 rotate-180 border-none outline-none shadow-none text-[#540ba9]" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};