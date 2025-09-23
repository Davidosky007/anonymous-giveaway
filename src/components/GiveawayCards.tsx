import Link from 'next/link';
import { Giveaway } from '../types';
import { formatDate } from '../lib/utils';

interface GiveawayCardProps {
  giveaway: Giveaway;
  isAdmin?: boolean;
}

export default function GiveawayCard({ giveaway, isAdmin = false }: GiveawayCardProps) {
  const statusColor = {
    active: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{giveaway.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[giveaway.status]}`}>
          {giveaway.status}
        </span>
      </div>
      
      {giveaway.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">{giveaway.description}</p>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4 bg-purple-50 p-3 rounded-lg">
        <span className="font-medium">
          <span className="text-purple-600 font-semibold">{giveaway.entry_count}</span> entries
        </span>
        <span>Created {formatDate(giveaway.created_at)}</span>
      </div>
      
      <div className="flex gap-2">
        {!isAdmin && giveaway.status === 'active' && (
          <Link 
            href={`/giveaway/${giveaway.id}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Enter Giveaway
          </Link>
        )}
        
        {isAdmin && (
          <Link 
            href={`/admin/giveaway/${giveaway.id}`}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-center py-3 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Manage
          </Link>
        )}
      </div>
    </div>
  );
}
