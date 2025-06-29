import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ErrorDisplayProps {
  error: string;
  setError: (error: string | null) => void;
  t: (key: string) => string;
}

export function ErrorDisplay({ error, setError, t }: ErrorDisplayProps) {
  return (
    <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-red-900 text-sm sm:text-base">
            {t('error.title')}
          </h3>
          <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-3 text-xs"
            onClick={() => setError(null)}
          >
            {t('error.tryAgain')}
          </Button>
        </div>
      </div>
    </div>
  );
}