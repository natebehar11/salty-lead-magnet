'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import QuizResults from '@/components/quiz/QuizResults';

export default function QuizResultsPage() {
  const { results, isComplete } = useQuizStore();
  const router = useRouter();

  useEffect(() => {
    if (!isComplete || !results) {
      router.push('/quiz');
    }
  }, [isComplete, results, router]);

  if (!isComplete || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-salty-orange-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-salty-deep-teal/60">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return <QuizResults />;
}
