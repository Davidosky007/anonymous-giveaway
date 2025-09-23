import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { dbQueries } from '../../lib/db';
import { validateSession } from '../../lib/auth';
import { Giveaway } from '../../types';
import GiveawayCard from '../../components/GiveawayCards';

interface AdminDashboardProps {
  giveaways: Giveaway[];
}

export default function AdminDashboard({ giveaways }: AdminDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [localGiveaways, setLocalGiveaways] = useState(giveaways);

  const handleCreateGiveaway = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    try {
      const response = await fetch('/api/admin/giveaways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      const result = await response.json();

      if (result.success) {
        setLocalGiveaways([result.data, ...localGiveaways]);
        setShowCreateForm(false);
        form.reset();
      } else {
        setCreateError(result.error || 'Failed to create giveaway');
      }
    } catch {
      setCreateError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const stats = {
    total: localGiveaways.length,
    active: localGiveaways.filter(g => g.status === 'active').length,
    completed: localGiveaways.filter(g => g.status === 'completed').length,
    totalEntries: localGiveaways.reduce((sum, g) => sum + g.entry_count, 0)
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - Anonymous Giveaways</title>
      </Head>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
        <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <Link href="/" className="text-purple-100 hover:text-white text-sm transition-colors">
                  View Public Site
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="text-purple-100 hover:text-white text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Giveaways</h3>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</h3>
              <p className="mt-2 text-3xl font-extrabold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</h3>
              <p className="mt-2 text-3xl font-extrabold text-purple-600">{stats.completed}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Entries</h3>
              <p className="mt-2 text-3xl font-extrabold text-purple-600">{stats.totalEntries}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Giveaways</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {showCreateForm ? 'Cancel' : 'Create New'}
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-purple-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Create New Giveaway</h3>
                <form onSubmit={handleCreateGiveaway} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-black placeholder-gray-500 bg-white"
                      placeholder="Enter giveaway title"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-black placeholder-gray-500 bg-white"
                      placeholder="Describe your giveaway (optional)"
                    />
                  </div>
                  {createError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {createError}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      {isCreating ? 'Creating...' : 'Create Giveaway'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {localGiveaways.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-100 max-w-md mx-auto">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-gray-600 text-lg font-medium mb-4">No giveaways created yet.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold"
                >
                  Create your first giveaway
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localGiveaways.map((giveaway) => (
                <GiveawayCard key={giveaway.id} giveaway={giveaway} isAdmin={true} />
              ))}
            </div>
          )}
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

  try {
    const giveaways = dbQueries.getAllGiveaways.all() as Giveaway[];
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
