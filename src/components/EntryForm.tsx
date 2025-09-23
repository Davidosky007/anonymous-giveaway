import { useState } from 'react';
import { Giveaway } from '../types';

interface EntryFormProps {
  giveaway: Giveaway;
  onSuccess: (anonymousId: string) => void;
}

export default function EntryForm({ giveaway, onSuccess }: EntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/public/enter/${giveaway.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data.anonymousId);
      } else {
        setError(result.error || 'Failed to enter giveaway');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (giveaway.status !== 'active') {
    return (
      <div className="bg-gray-100 p-6 rounded-xl text-center border border-gray-200">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-gray-600 font-medium">This giveaway is no longer accepting entries.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-3">🎭 Anonymous Entry</h3>
        <p className="text-sm text-purple-700 leading-relaxed">
          Your entry will be completely anonymous. You will receive a unique ID to track your entry.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          '🎲 Enter Giveaway'
        )}
      </button>
    </form>
  );
}
