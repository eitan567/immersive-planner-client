import React, { useRef, useEffect } from 'react';
import { Button } from "../../../../components/ui/button.tsx";
import { Input } from "../../../../components/ui/input.tsx";
import { Card } from "../../../../components/ui/card.tsx";
import { cn } from "../../../../lib/utils.ts";
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ShortcutsMenu } from './ShortcutsMenu.tsx';
import { ChatMessage } from "../ChatMessage.tsx";
import { QuickActions } from "../QuickActions.tsx";
import { QUICK_ACTIONS, DROPDOWN_QUICK_ACTIONS, QuickAction } from './types.ts';
import { useChatLogic } from './useChatLogic.ts';
import type { LessonFieldChatBoxProps } from './types.ts';

export const ChatBox: React.FC<LessonFieldChatBoxProps> = ({
  onUpdateField,
  className,
  currentValues,
  sections,
  saveCurrentPlan,
  createAndAddSection
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  // Close shortcuts menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shortcutsRef.current && !shortcutsRef.current.contains(event.target as Node)) {
        setShortcutsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const {
    messages,
    currentMessage,
    setCurrentMessage,
    loading,
    mode,
    setMode,
    handleSendMessage
  } = useChatLogic({
    onUpdateField,
    currentValues,
    sections,
    saveCurrentPlan,
    createAndAddSection
  });

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
    handleSendMessage(text);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
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
            <div ref={chatContainerRef} className={cn("h-[calc(100vh-370px)] overflow-y-auto border rounded-lg p-3 mt-2 space-y-3 bg-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md", className)}>
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

            <QuickActions actions={QUICK_ACTIONS} onActionClick={handleQuickAction} />

            <div className="flex gap-2 items-center">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
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
                onClick={() => handleSendMessage()}
                disabled={loading || !currentMessage.trim()}
                size="icon"
                className="border-none outline-none shadow-none"
              >
                <PaperAirplaneIcon className="h-4 w-4 rotate-180 border-none outline-none shadow-none text-[#540ba9]" />
              </Button>
            </div>
            <div className="flex justify-between items-center relative">
              {/* כפתורי שיחה/פקודה */}
              <div className="flex text-xs border border-solid border-[#5b398b] w-fit rounded-lg h-5 bg-gray-100 gap-0">
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

              {/* קיצורי דרך */}
              <div className="relative" ref={shortcutsRef}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShortcutsOpen(prev => !prev);
                  }}
                  className="text-xs text-[#540ba9] hover:text-[#540ba9] hover:bg-[#fff4fc] py-0 h-5"
                  variant="ghost"
                >
                  קיצורי דרך
                </Button>
                {shortcutsOpen && (
                  <div className="absolute bottom-full p-1 -left-2 bg-[#f3f2f0] border border-gray-200 rounded-lg shadow-lg p-2 w-[26em] before:content-[''] before:absolute before:bottom-[-9px] before:left-[45px] before:w-4 before:h-4 before:bg-[#f3f2f0] before:border-b before:border-r before:border-gray-200 before:rotate-45 before:transform">
                    <div className='bg-[#f8f8f8] max-h-[400px] overflow-y-auto z-50 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#f2d8ff] hover:scrollbar-thumb-[#f2d8ff] scrollbar-thumb-rounded-md'>
                      <div className="grid gap-1" style={{ direction: 'rtl' }}>
                        {DROPDOWN_QUICK_ACTIONS.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleQuickAction(action.text);
                              setShortcutsOpen(false);
                            }}
                            className="text-right px-3 py-2 text-sm text-gray-800 hover:bg-[#edede8] rounded-md w-full transition-colors"
                          >
                            {action.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
