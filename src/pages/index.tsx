import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { dbQueries } from '../lib/db';
import { Giveaway } from '../types';
import GiveawayCard from '../components/GiveawayCards';

interface HomeProps {
  giveaways: Giveaway[];
}

export default function Home({ giveaways }: HomeProps) {
  return (
    <>
      <Head>
        <title>Anonymous Giveaways</title>
        <meta name="description" content="Enter anonymous giveaways and win prizes!" />
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Anonymous Giveaways</h1>
              <Link 
                href="/admin/login"
                className="text-purple-100 hover:text-white text-sm font-medium transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Giveaways</h2>
            {giveaways.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-100 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🎁</div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No active giveaways at the moment.</p>
                  <p className="text-gray-500 text-sm">Check back soon for new opportunities!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {giveaways.map((giveaway) => (
                  <GiveawayCard key={giveaway.id} giveaway={giveaway} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const giveaways = dbQueries.getActiveGiveaways.all() as Giveaway[];
    return {
      props: { giveaways }
    };
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    return {
      props: { giveaways: [] }
    };
  }
};
