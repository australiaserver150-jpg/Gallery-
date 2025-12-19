
import React, { useState } from 'react';

interface PermissionsGuardProps {
  onGranted: () => void;
  status: 'undetermined' | 'denied';
  onRetry: () => void;
}

const PermissionsGuard: React.FC<PermissionsGuardProps> = ({ onGranted, status, onRetry }) => {
  if (status === 'denied') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-stone-900 z-[100] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Permission Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
          Lumina Gallery cannot show your photos without media permissions. Please enable access in settings.
        </p>
        <button 
          onClick={onRetry}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-stone-900 z-[100] flex flex-col p-8">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto animate-system-dialog">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-8">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Allow access to media?</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          To display your photos and videos, we need permission to read your media storage. This mimics Android 13+ READ_MEDIA_IMAGES and READ_MEDIA_VIDEO permissions.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={onGranted}
            className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
          >
            Allow access
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="w-full text-blue-600 py-4 rounded-full font-bold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsGuard;
