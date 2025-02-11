import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Card } from "../../../components/ui/card.tsx";
import { useMcpTool } from '../../../hooks//useMcp.ts';
import { cn } from "../../..//lib/utils.ts"
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { LessonPlanSections } from '../types.ts';
import { ChatMessage, Message } from "./ChatMessage.tsx";
import { QuickActions } from "./QuickActions.tsx";

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
  'opening.0.screen1Description': 'פתיחה - תיאור מסך 1',
  'opening.0.screen2Description': 'פתיחה - תיאור מסך 2',
  'opening.0.screen3Description': 'פתיחה - תיאור מסך 3',
  'main.0.content': 'גוף השיעור - תוכן/פעילות',
  'main.0.spaceUsage': 'גוף השיעור - שימוש במרחב הפיזי',
  'main.0.screen1Description': 'גוף השיעור - תיאור מסך 1',
  'main.0.screen2Description': 'גוף השיעור - תיאור מסך 2',
  'main.0.screen3Description': 'גוף השיעור - תיאור מסך 3',
  'summary.0.content': 'סיכום - תוכן/פעילות',
  'summary.0.spaceUsage': 'סיכום - שימוש במרחב הפיזי',
  'summary.0.screen1Description': 'סיכום - תיאור מסך 1',
  'summary.0.screen2Description': 'סיכום - תיאור מסך 2',
  'summary.0.screen3Description': 'סיכום - תיאור מסך 3'
};

const QUICK_ACTIONS = [
  {text:'הצע שם חדש לנושא היחידה',maxWidth:'max-w-[86px]'},
  {text:'נסח מחדש מטרות ברמת התוכן',maxWidth:'max-w-[92px]'},
  {text:'שפר מטרות ברמת המיומנויות',maxWidth:'max-w-[90px]'},
  {text:'הצע רעיונות לפתיחת השיעור',maxWidth:'max-w-[86px]'},
  {text:'שפר פעילות בגוף השיעור',maxWidth:'max-w-[86px] mt-[5px]'},
  {text:'הצע זמן כולל',maxWidth:'min-w-[92px] mt-[5px] leading-7'},
  {text:'שפר ידע קודם נדרש',maxWidth:'max-w-[90px] mt-[5px]'},
  {text:'הצע שכבת גיל',maxWidth:'min-w-[86px] mt-[5px] leading-7'},
];

const VALID_SPACE_USAGE = ['whole', 'groups', 'individual', 'mixed'];
const VALID_SCREEN_TYPES = ['video', 'image', 'padlet', 'website', 'genially', 'presentation'];

const SPACE_USAGE_MAP = {
  'מליאה': 'whole',
  'עבודה בקבוצות': 'groups',
  'עבודה אישית': 'individual',
  'משולב': 'mixed'
} as const;

const SCREEN_TYPE_MAP = {
  'סרטון': 'video',
  'תמונה': 'image',
  'פדלט': 'padlet',
  'אתר': 'website',
  'ג\'ניאלי': 'genially',
  'מצגת': 'presentation'
} as const;

interface LessonFieldChatBoxProps {
  onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  sections: LessonPlanSections;
  saveCurrentPlan: () => Promise<void>;
  createAndAddSection: (    
     phase: keyof LessonPlanSections, 
     content: string, 
     spaceUsage?: string,
     screen1?: string,
     screen2?: string,
     screen3?: string,
     screen1Description?: string,
     screen2Description?: string,
     screen3Description?: string
    ) => Promise<void>;
  className?: string;
}

interface FieldUpdate {
  fieldToUpdate: string;
  userResponse: string;
  newValue: string;
}

interface ChatResponse {
  response: string;
}

type AIResponse = FieldUpdate | FieldUpdate[] | ChatResponse;

const extractScreenType = (text: string): string => {
  // Look for Hebrew screen type mentions in the text
  if (text.includes('סרטון')) return 'video';
  if (text.includes('תמונה') || text.includes('תמונות')) return 'image';
  if (text.includes('פדלט')) return 'padlet';
  if (text.includes('אתר')) return 'website';
  if (text.includes('ג\'ניאלי')) return 'genially';
  if (text.includes('מצגת')) return 'presentation';
  return 'image'; // default value
};

export function mapScreenTypeToEnglish(hebrewValue: string): string {
  return SCREEN_TYPE_MAP[hebrewValue as keyof typeof SCREEN_TYPE_MAP] || hebrewValue;
}

export const LessonFieldChatBox: React.FC<LessonFieldChatBoxProps> = ({
  onUpdateField,
  className,
  currentValues,
  sections,
  saveCurrentPlan,
  createAndAddSection
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState<'command' | 'chat'>('command');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldSend, setShouldSend] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior
      });
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

  // Add a mutation observer to handle dynamic content changes
  useEffect(() => {
    const observer = new MutationObserver(() => scrollToBottom());
    if (chatContainerRef.current) {
      observer.observe(chatContainerRef.current, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, []);

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
        value:'',
        timestamp: new Date()
      }]);

      let response;
      if (mode === 'command') {
        response = await useMcpTool({
          serverName: 'ai-server',
          toolName: 'update_lesson_field',
          arguments: {
            message: currentMessage,
            fieldLabels: FIELD_LABELS,
            currentValues: allValues,
            rephrase: currentMessage.includes('נסח') || currentMessage.includes('שפר')
         } 
        });

      } else {
        response = await useMcpTool({
          serverName: 'ai-server',
          toolName: 'chat_with_context',
          arguments: {
          message: currentMessage,
          currentValues: allValues,
          history: messages,
          fieldLabels: FIELD_LABELS
          }
        });
      }


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

      let parsed: AIResponse, updates: FieldUpdate[];
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('התקבל מידע לא תקין מהשרת. אנא נסה שוב.');
      }
      
      if (mode === 'command') {
        updates = Array.isArray(parsed) ? parsed as FieldUpdate[] : [parsed as FieldUpdate];
      
  
        for (const update of updates) {
          if (!update.fieldToUpdate || !update.userResponse || !update.newValue) {
            throw new Error('תשובת המערכת חסרה שדות נדרשים');
          }
        }

        setMessages(prev => [
          ...prev,
          ...updates.map(update => ({
            text: update.userResponse,
            value: update.newValue,
            sender: 'ai' as const,
            timestamp: new Date()
          }))
        ]);

        // Handle activity creation for commands containing "הוסף פעילות" or similar phrases
        if (currentMessage.includes('פעילות')) {          
          const activityUpdates = updates.filter(update => 
            update.fieldToUpdate.includes('.content') || 
            update.fieldToUpdate.includes('.spaceUsage') ||
            update.fieldToUpdate.includes('.screen1') ||
            update.fieldToUpdate.includes('.screen2') ||
            update.fieldToUpdate.includes('.screen3') ||
            update.fieldToUpdate.includes('.screen1Description') ||
            update.fieldToUpdate.includes('.screen2Description') ||
            update.fieldToUpdate.includes('.screen3Description')
          );
      
          if (activityUpdates.length > 0) {
            const [phase] = activityUpdates[0].fieldToUpdate.split('.');
            if (['opening', 'main', 'summary'].includes(phase)) {
              const content = activityUpdates.find(u => u.fieldToUpdate.includes('.content'))?.newValue || '';
              
              // Get spaceUsage and convert from Hebrew to English
              const hebrewSpaceUsage = activityUpdates.find(u => u.fieldToUpdate.includes('.spaceUsage'))?.newValue || '';
              console.log('Hebrew spaceUsage:', hebrewSpaceUsage);
              const spaceUsage = SPACE_USAGE_MAP[hebrewSpaceUsage as keyof typeof SPACE_USAGE_MAP] || undefined;
              console.log('Converted spaceUsage:', spaceUsage);
              
              // Extract screen values and descriptions from updates
              const screen1Update = activityUpdates.find(u => u.fieldToUpdate.includes('.screen1') && !u.fieldToUpdate.includes('Description'));
              const screen2Update = activityUpdates.find(u => u.fieldToUpdate.includes('.screen2') && !u.fieldToUpdate.includes('Description'));
              const screen3Update = activityUpdates.find(u => u.fieldToUpdate.includes('.screen3') && !u.fieldToUpdate.includes('Description'));

              const screen1Description = activityUpdates.find(u => u.fieldToUpdate.includes('.screen1Description'))?.newValue;
              const screen2Description = activityUpdates.find(u => u.fieldToUpdate.includes('.screen2Description'))?.newValue;
              const screen3Description = activityUpdates.find(u => u.fieldToUpdate.includes('.screen3Description'))?.newValue;

              const screen1 = screen1Update ? mapScreenTypeToEnglish(screen1Update.newValue) : undefined;
              const screen2 = screen2Update ? mapScreenTypeToEnglish(screen2Update.newValue) : undefined;
              const screen3 = screen3Update ? mapScreenTypeToEnglish(screen3Update.newValue) : undefined;

              console.log('Creating activity with:', {
                phase,
                content,
                spaceUsage,
                screen1,
                screen2,
                screen3,
                screen1Description,
                screen2Description,
                screen3Description
              });

              try {
                await createAndAddSection(
                  phase as keyof LessonPlanSections,
                  content,
                  spaceUsage,
                  screen1,
                  screen2,
                  screen3,
                  screen1Description,
                  screen2Description,
                  screen3Description
                );
                console.log('Activity created successfully');
                return;
              } catch (error) {
                console.error('Failed to create activity:', error);
                throw error;
              }
            }
          }
        }

        const batchUpdates = updates.map(update => {
          const fieldName = update.fieldToUpdate;
          const newValue = update.newValue;
        
  
          // Check if this is a section field update
          if (fieldName.includes('.')) {
            const [phase, index, field] = fieldName.split('.');
          
  
            // Validate this is a valid section update
            if (phase && field && ['opening', 'main', 'summary'].includes(phase) &&
                ['content', 'spaceUsage', 'screen1', 'screen2', 'screen3', 
                 'screen1Description', 'screen2Description', 'screen3Description'].includes(field)) {
              console.log(`Processing section update: ${phase}.${index}.${field} = ${newValue}`);
              return [fieldName, newValue] as [string, string];
            }
            console.log(`Invalid section update field: ${fieldName}`);
            return null;
          }
          
          // Handle non-section fields
          console.log(`Processing regular field update: ${fieldName} = ${newValue}`);      
          return [fieldName, newValue] as [string, string];
        });

        const validUpdates = batchUpdates.filter((update): update is [string, string] => {
          if (!update) return false;
          const [fieldName] = update;
          
          // Allow both regular fields from FIELD_LABELS and section fields
          return FIELD_LABELS[fieldName] !== undefined || 
                 /^(opening|main|summary)\.\d+\.(content|spaceUsage|screen[1-3])$/.test(fieldName);
        });

        if (validUpdates.length > 0) {
          await onUpdateField(validUpdates);
          await saveCurrentPlan();
        }
      } else {
        setMessages(prev => [...prev, {
          text: (parsed as ChatResponse).response,
          sender: 'ai' as const,
          value:'',
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error(`Failed to process ${mode} request:`, error);
      setMessages(prev => [...prev, {
        text: error instanceof Error ? error.message : 'מצטער, נתקלתי בבעיה בעיבוד הבקשה. אנא נסה שנית.',
        sender: 'ai',
        value:'',
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
      console.log('Copying text:', text);
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleResendMessage = (text: string) => {
    setCurrentMessage(text);
    setShouldSend(true);
  };

  const handleQuickAction = (action: string) => {
    setCurrentMessage(action);
    setShouldSend(true);
  };

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
            <div ref={chatContainerRef} className={cn("h-[calc(100vh-425px)] overflow-y-auto border rounded-lg p-3 mt-2 space-y-3 bg-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md",className)}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  אפשר לבקש עזרה בניסוח, שיפור או שינוי של פרטי השיעור ומבנה השיעור.
                  <br />
                  לדוגמה:
                  <br />
                  דוגמאות לפרטי השיעור:
                  <br />
                  <button
                    onClick={() => handleQuickAction("שנה את נושא היחידה ל'אנרגיה מתחדשת'")}
                    className="text-[#540ba9] hover:underline cursor-pointer"
                  >"שנה את נושא היחידה ל'אנרגיה מתחדשת'"</button>
                  <br />
                  <button
                    onClick={() => handleQuickAction("תעזור לי לנסח טוב יותר את מטרות התוכן")}
                    className="text-[#540ba9] hover:underline cursor-pointer"
                  >"תעזור לי לנסח טוב יותר את מטרות התוכן"</button>
                  <br />
                  דוגמאות לבניית השיעור:
                  <br />
                  <button
                    onClick={() => handleQuickAction("הצע פעילות מעניינת לפתיחת השיעור")}
                    className="text-[#540ba9] hover:underline cursor-pointer"
                  >"הצע פעילות מעניינת לפתיחת השיעור"</button>
                  <br />
                  <button
                    onClick={() => handleQuickAction("תשפר את השימוש במרחב בגוף השיעור")}
                    className="text-[#540ba9] hover:underline cursor-pointer"
                  >"תשפר את השימוש במרחב בגוף השיעור"</button>
                  <br />
                  <button
                    onClick={() => handleQuickAction("הצע פעילות סיכום אינטראקטיבית")}
                    className="text-[#540ba9] hover:underline cursor-pointer"
                  >"הצע פעילות סיכום אינטראקטיבית"</button>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    onCopy={handleCopyMessage}
                    onResend={message.sender === 'user' ? handleResendMessage : undefined}
                  />
                ))
              )}
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            

            {/* {mode === 'chat' && (
              <div className="text-xs text-gray-500 text-center">
                מצב שיחה מאפשר לך לנהל דיאלוג עם הבינה בהקשר השיעור,
                <br />ללא שינוי אוטומטי של השדות
              </div>
            )} */}

            <QuickActions actions={QUICK_ACTIONS} onActionClick={handleQuickAction} />

            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'command' 
                  ? "בקש עזרה בניסוח, שיפור או שינוי פרטי השיעור..."
                  : "שאל שאלה או התייעץ על תכנון השיעור..."
                }
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
            <div className="flex justify-end text-xs border border-solid border-[#5b398b] w-fit rounded-lg h-5 bg-gray-100 gap-0">
              <button
                onClick={() => setMode('command')}
                className={`text-[10px] transition-colors outline-none px-[7px] pb-[3px] pt-0 ${
                  mode === 'command'
                    ? 'bg-[#540ba9] text-white rounded-r-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-r-md'
                }`}
              >
                פקודה
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`text-[10px] transition-colors outline-none px-[7px] pb-[3px] pt-0 ${
                  mode === 'chat'
                    ? 'bg-[#540ba9] text-white rounded-l-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-l-md'
                }`}
              >
                שיחה
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};