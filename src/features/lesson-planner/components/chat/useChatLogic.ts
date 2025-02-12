import { useState } from 'react';
import { useMcpTool } from '../../../../hooks/useMcp.ts';
import { Message } from '../ChatMessage.tsx';
import { AIResponse, FieldUpdate, FIELD_LABELS, SPACE_USAGE_MAP, SCREEN_TYPE_MAP, ChatResponse } from './types.ts';
import type { LessonPlanSections } from '../../types.ts';

export function mapScreenTypeToEnglish(hebrewValue: string): string {
  return SCREEN_TYPE_MAP[hebrewValue as keyof typeof SCREEN_TYPE_MAP] || hebrewValue;
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
              
              const hebrewSpaceUsage = activityUpdates.find(u => u.fieldToUpdate.includes('.spaceUsage'))?.newValue || '';
              const spaceUsage = SPACE_USAGE_MAP[hebrewSpaceUsage as keyof typeof SPACE_USAGE_MAP] || undefined;
              
              const screen1Update = activityUpdates.find(u => u.fieldToUpdate.includes('.screen1') && !u.fieldToUpdate.includes('Description'));
              const screen2Update = activityUpdates.find(u => u.fieldToUpdate.includes('.screen2') && !u.fieldToUpdate.includes('Description'));
              const screen3Update = activityUpdates.find(u => u.fieldToUpdate.includes('.screen3') && !u.fieldToUpdate.includes('Description'));

              const screen1Description = activityUpdates.find(u => u.fieldToUpdate.includes('.screen1Description'))?.newValue;
              const screen2Description = activityUpdates.find(u => u.fieldToUpdate.includes('.screen2Description'))?.newValue;
              const screen3Description = activityUpdates.find(u => u.fieldToUpdate.includes('.screen3Description'))?.newValue;

              const screen1 = screen1Update ? mapScreenTypeToEnglish(screen1Update.newValue) : undefined;
              const screen2 = screen2Update ? mapScreenTypeToEnglish(screen2Update.newValue) : undefined;
              const screen3 = screen3Update ? mapScreenTypeToEnglish(screen3Update.newValue) : undefined;

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

          if (fieldName.includes('.')) {
            const [phase, field] = fieldName.split('.');
            
            if (phase && field && ['opening', 'main', 'summary'].includes(phase) &&
                ['content', 'spaceUsage', 'screen1', 'screen2', 'screen3', 
                 'screen1Description', 'screen2Description', 'screen3Description'].includes(field)) {
              return [fieldName, newValue] as [string, string];
            }
            return null;
          }
          
          return [fieldName, newValue] as [string, string];
        });

        const validUpdates = batchUpdates.filter((update): update is [string, string] => {
          if (!update) return false;
          const [fieldName] = update;
          
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
