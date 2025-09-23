import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { dbQueries } from '../../../lib/db';
import { validateSession } from '../../../lib/auth';
import { Giveaway, Entry } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface AdminGiveawayPageProps {
  giveaway: Giveaway | null;
  entries: Entry[];
}

export default function AdminGiveawayPage({ giveaway, entries }: AdminGiveawayPageProps) {
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [winner, setWinner] = useState(giveaway?.winner_id || null);
  const [error, setError] = useState<string | null>(null);

  const handlePickWinner = async () => {
    if (!giveaway) return;
    
    setIsPickingWinner(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pick-winner/${giveaway.id}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        if (result.data.winner) {
          setWinner(result.data.winner.id);
        } else {
          setError('No entries to pick from');
        }
      } else {
        setError(result.error || 'Failed to pick winner');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsPickingWinner(false);
    }
  };

  if (!giveaway) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <div className="text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-100 max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giveaway Not Found</h1>
            <Link href="/admin" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manage {giveaway.title} - Admin</title>
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Link href="/admin" className="text-purple-100 hover:text-white text-sm mb-4 inline-block transition-colors font-medium">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Manage: {giveaway.title}</h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Giveaway Details</h2>
                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-700">Title:</strong> 
                    <span className="ml-2 text-gray-900">{giveaway.title}</span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Description:</strong> 
                    <span className="ml-2 text-gray-900">{giveaway.description || 'None'}</span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      giveaway.status === 'active' ? 'bg-green-100 text-green-800' : 
                      giveaway.status === 'completed' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {giveaway.status}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Created:</strong> 
                    <span className="ml-2 text-gray-900">{formatDate(giveaway.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Entries ({entries.length})</h2>
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-gray-600 font-medium">No entries yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {entries.map((entry, index) => (
                      <div key={entry.id} className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                        <span className="text-sm font-semibold text-gray-700">Entry #{index + 1}</span>
                        <code className="text-sm bg-white px-3 py-1 rounded border border-purple-200 text-purple-700 font-mono">{entry.anonymous_id}</code>
                        <span className="text-xs text-gray-500 font-medium">{formatDate(entry.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-bold mb-6 text-gray-900">Actions</h3>
                
                {giveaway.status === 'active' && entries.length > 0 && !winner && (
                  <button
                    onClick={handlePickWinner}
                    disabled={isPickingWinner}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                  >
                    {isPickingWinner ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Picking Winner...
                      </>
                    ) : (
                      '🎲 Pick Random Winner'
                    )}
                  </button>
                )}

                {winner && (
                  <div className="bg-gradient-to-r from-green-50 to-purple-50 border border-green-200 p-6 rounded-xl">
                    <h4 className="font-bold text-green-900 mb-3 text-lg">🎉 Winner Selected!</h4>
                    <p className="text-sm text-green-700 mb-3 font-medium">Winner ID:</p>
                    <code className="bg-white px-4 py-2 rounded-lg text-sm break-all border border-green-200 block text-purple-700 font-mono">{winner}</code>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link 
                    href={`/giveaway/${giveaway.id}`}
                    className="text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors"
                  >
                    View Public Page →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionId = context.req.cookies.admin_session;
  if (!validateSession(sessionId || '')) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  const { id } = context.params!;
  
  try {
    const giveaway = dbQueries.getGiveawayById.get(id as string) as Giveaway | undefined;
    const entries = giveaway ? dbQueries.getEntriesByGiveaway.all(giveaway.id) as Entry[] : [];
    
    return {
      props: {
        giveaway: giveaway || null,
        entries
      }
    };
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    return {
      props: {
        giveaway: null,
        entries: []
      }
    };
  }
};
