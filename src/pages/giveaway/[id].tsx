import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { dbQueries } from '../../lib/db';
import { Giveaway } from '../../types';
import EntryForm from '../../components/EntryForm';
import { formatDate } from '../../lib/utils';

interface GiveawayPageProps {
  giveaway: Giveaway | null;
}

export default function GiveawayPage({ giveaway }: GiveawayPageProps) {
  const [entrySuccess, setEntrySuccess] = useState<string | null>(null);

  if (!giveaway) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <div className="text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-100 max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giveaway Not Found</h1>
            <Link href="/" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{giveaway.title} - Anonymous Giveaways</title>
        <meta name="description" content={giveaway.description || 'Enter this anonymous giveaway!'} />
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/" className="text-purple-100 hover:text-white text-sm mb-4 inline-block transition-colors font-medium">
              ← Back to Giveaways
            </Link>
            <h1 className="text-3xl font-bold text-white">{giveaway.title}</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h2 className="text-xl font-bold mb-4 text-gray-900">About This Giveaway</h2>
                {giveaway.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{giveaway.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description provided.</p>
                )}
              </div>

              {giveaway.status === 'completed' && giveaway.winner_id && (
                <div className="bg-gradient-to-r from-green-50 to-purple-50 border border-green-200 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-bold text-green-900 mb-3">🎉 Winner Selected!</h3>
                  <p className="text-green-700 font-medium">
                    Winner ID: <code className="bg-white px-3 py-2 rounded border border-green-200 text-purple-700 font-mono">{giveaway.winner_id}</code>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Giveaway Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      giveaway.status === 'active' ? 'bg-green-100 text-green-700' : 
                      giveaway.status === 'completed' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Entries:</span>
                    <span className="font-bold text-purple-600 text-lg">{giveaway.entry_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Created:</span>
                    <span className="font-medium text-gray-900">{formatDate(giveaway.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                {entrySuccess ? (
                  <div className="text-center">
                    <div className="text-green-600 text-5xl mb-4">✓</div>
                    <h3 className="text-lg font-bold text-green-900 mb-3">Entry Submitted!</h3>
                    <p className="text-sm text-gray-600 mb-4 font-medium">Your anonymous entry ID:</p>
                    <code className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-lg block text-sm break-all text-purple-700 font-mono">
                      {entrySuccess}
                    </code>
                    <p className="text-xs text-gray-500 mt-4 font-medium">
                      💾 Save this ID to verify if you win!
                    </p>
                  </div>
                ) : (
                  <EntryForm giveaway={giveaway} onSuccess={setEntrySuccess} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  try {
    const giveaway = dbQueries.getGiveawayById.get(id as string) as Giveaway | undefined;
    return {
      props: {
        giveaway: giveaway || null
      }
    };
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    return {
      props: {
        giveaway: null
      }
    };
  }
};
