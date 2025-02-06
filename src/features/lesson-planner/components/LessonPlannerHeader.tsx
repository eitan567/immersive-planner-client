import React from 'react';
import { CardTitle } from '../../../components/ui/card.tsx';
import { useAuth } from '../../auth/AuthContext.tsx';

export const LessonPlannerHeader = () => {
  const auth = useAuth();
  
  return (
    <div className="flex justify-between items-center">
      <CardTitle>מתכנן שיעורים לחדר אימרסיבי</CardTitle>
      <button
        onClick={() => auth.signOut()}
        className="text-gray-600 hover:text-gray-900"
      >
        התנתק
      </button>
    </div>
  );
};