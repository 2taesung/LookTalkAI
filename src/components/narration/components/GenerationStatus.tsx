import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';

interface GenerationStatusProps {
  t: (key: string, args?: any) => string;
  generationStep: string;
  characterName: string;
  narratorGender?: string;
}

export function GenerationStatus({ t, generationStep, characterName, narratorGender }: GenerationStatusProps) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold">
          {t('result.playerTitle')}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">{generationStep}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t('generatingStatus.title', characterName, narratorGender || 'Female')}
          </p>
          <div className="mt-3 sm:mt-4 text-xs text-gray-400 space-y-1">
            {(t('generatingStatus.steps', null) as unknown as string[]).map((step: string, index: number) => (
                <p key={index}>• {step}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}