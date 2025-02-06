import React from 'react';

interface SaveProgressAlertProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
}

export const SaveProgressAlert = ({ saveInProgress, lastSaved }: SaveProgressAlertProps) => (
  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
    {saveInProgress ? (
      <span className="block sm:inline">שומר שינויים...</span>
    ) : (
      <span className="block sm:inline">
        נשמר לאחרונה: {lastSaved ? lastSaved.toLocaleTimeString('he-IL') : 'לא נשמר'}
      </span>
    )}
  </div>
);