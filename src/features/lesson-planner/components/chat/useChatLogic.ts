import { useState } from 'react';
import { useMcpTool } from '../../../../hooks/useMcp.ts';
import { Message } from '../ChatMessage.tsx';
import { AIResponse, FieldUpdate, FIELD_LABELS, SPACE_USAGE_MAP, SCREEN_TYPE_MAP, ChatResponse } from './types.ts';
import type { LessonPlanSections } from '../../types.ts';

export function mapScreenTypeToEnglish(hebrewValue: string): string {
  return SCREEN_TYPE_MAP[hebrewValue as keyof typeof SCREEN_TYPE_MAP] || hebrewValue;
}

function getHebrewFieldLabel(fieldName: string): string {
  // אם זה שדה רגיל שקיים ב-FIELD_LABELS
  if (fieldName in FIELD_LABELS) {
    return FIELD_LABELS[fieldName];
  }

  // טיפול בשדות של פעילויות (פתיחה, גוף, סיכום)
  const parts = fieldName.split('.');
  if (parts.length >= 3) {
    const [phase, index, ...rest] = parts;
    const fieldType = rest.join('.');
    
    // מיפוי שמות השלבים בעברית
    const phaseNames: Record<string, string> = {
      'opening': 'פתיחה',
      'main': 'גוף השיעור',
      'summary': 'סיכום'
    };
    
    // מיפוי סוגי השדות בעברית
    const fieldTypes: Record<string, string> = {
      'content': 'תוכן/פעילות',
      'spaceUsage': 'שימוש במרחב הפיזי',
      'screen1': 'מסך 1',
      'screen2': 'מסך 2',
      'screen3': 'מסך 3',
      'screen1Description': 'תיאור מסך 1',
      'screen2Description': 'תיאור מסך 2',
      'screen3Description': 'תיאור מסך 3'
    };
    
    const phaseName = phaseNames[phase] || phase;
    const fieldTypeName = fieldTypes[fieldType] || fieldType;
    
    return `${phaseName} ${Number(index) + 1} - ${fieldTypeName}`;
  }
  
  // אם לא מצאנו תרגום מתאים, נחזיר את השם המקורי
  return fieldName;
}

interface UseChatLogicProps {
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
}

export function useChatLogic({
  onUpdateField,
  currentValues,
  sections,
  saveCurrentPlan,
  createAndAddSection
}: UseChatLogicProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'command' | 'chat'>('command');

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || currentMessage;
    if (!messageToSend.trim()) return;

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
      
      setMessages(prev => [...prev, {
        text: messageToSend,
        sender: 'user',
        value: '',
        timestamp: new Date()
      }]);

      let response;
      if (mode === 'command') {
        response = await useMcpTool({
          serverName: 'ai-server',
          toolName: 'update_lesson_field',
          arguments: {
            message: messageToSend,
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
            message: messageToSend,
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

      let parsed: AIResponse;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('התקבל מידע לא תקין מהשרת. אנא נסה שוב.');
      }

      if (mode === 'command') {
        const updates = Array.isArray(parsed) ? parsed as FieldUpdate[] : [parsed as FieldUpdate];

        for (const update of updates) {
          if (!update.field || !update.value) {
            throw new Error('תשובת המערכת חסרה שדות נדרשים');
          }

          // שימוש בערך ברירת מחדל אם chat חסר
          update.chat = update.chat || `עדכנתי את הערך בשדה ${getHebrewFieldLabel(update.field)}`;
        }

        setMessages(prev => [
          ...prev,
          ...updates.map(update => ({
            text: update.chat || '',
            value: update.value,
            sender: 'ai' as const,
            timestamp: new Date()
          }))
        ]);

        // ארגון העדכונים לפי סוג הפעילות
        const activities: Record<string, Record<string, string>> = {};
        const otherUpdates: [string, string][] = [];
        
        for (const update of updates) {
          const parts = update.field.split('.');
          
          if (['opening', 'main', 'summary'].includes(parts[0]) && parts.length > 2) {
            const activityType = parts[0];
            const activityIndex = parts[1];
            const fieldName = parts.slice(2).join('.');
            
            const activityKey = `${activityType}.${activityIndex}`;
            
            if (!activities[activityKey]) {
              activities[activityKey] = {
                type: activityType,
                index: activityIndex
              };
            }
            
            activities[activityKey][fieldName] = update.value;
          } else {
            otherUpdates.push([update.field, update.value]);
          }
        }

        // יצירת פעילויות חדשות
        for (const activityKey of Object.keys(activities)) {
          const activity = activities[activityKey];
          
          if (activity.content || activity.spaceUsage) {
            const hebrewSpaceUsage = activity.spaceUsage || '';
            const spaceUsage = SPACE_USAGE_MAP[hebrewSpaceUsage as keyof typeof SPACE_USAGE_MAP] || undefined;
            
            const screen1 = activity.screen1 ? mapScreenTypeToEnglish(activity.screen1) : undefined;
            const screen2 = activity.screen2 ? mapScreenTypeToEnglish(activity.screen2) : undefined;
            const screen3 = activity.screen3 ? mapScreenTypeToEnglish(activity.screen3) : undefined;

            try {
              await createAndAddSection(
                activity.type as keyof LessonPlanSections,
                activity.content || '',
                spaceUsage,
                screen1,
                screen2,
                screen3,
                activity.screen1Description,
                activity.screen2Description,
                activity.screen3Description
              );
            } catch (error) {
              console.error('Failed to create activity:', error);
              throw error;
            }
          }
        }

        // עדכון שדות אחרים
        if (otherUpdates.length > 0) {
          await onUpdateField(otherUpdates);
          await saveCurrentPlan();
        }
      } else {
        setMessages(prev => [...prev, {
          text: (parsed as ChatResponse).response,
          sender: 'ai' as const,
          value: '',
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error(`Failed to process ${mode} request:`, error);
      setMessages(prev => [...prev, {
        text: error instanceof Error ? error.message : 'מצטער, נתקלתי בבעיה בעיבוד הבקשה. אנא נסה שנית.',
        sender: 'ai',
        value: '',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      if (!message) {
        setCurrentMessage('');
      }
    }
  };

  return {
    messages,
    setMessages,
    currentMessage,
    setCurrentMessage,
    loading,
    mode,
    setMode,
    handleSendMessage
  };
}
