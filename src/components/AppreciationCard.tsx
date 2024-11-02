import React from 'react';
import { Heart, Trash2, Brain } from 'lucide-react';
import type { Appreciation } from '../lib/db';
import { format } from 'date-fns';

interface Props {
  appreciation: Appreciation;
  onDelete: (id: number) => void;
  currentUser: 'Emma' | 'Richard';
}

export function AppreciationCard({ appreciation, onDelete, currentUser }: Props) {
  const isOwnMessage = appreciation.author === currentUser;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
      isOwnMessage ? 'ml-8' : 'mr-8'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {appreciation.author === 'Emma' ? (
            <Brain className="w-5 h-5 text-purple-500" />
          ) : (
            <Heart className="w-5 h-5 text-pink-500" />
          )}
          <p className="text-sm text-gray-500">
            {format(new Date(appreciation.date), 'MMM d, yyyy')}
          </p>
        </div>
        {isOwnMessage && (
          <button
            onClick={() => appreciation.id && onDelete(appreciation.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="mt-3 text-gray-700">{appreciation.text}</p>
      <p className="mt-2 text-sm text-gray-500">
        From {appreciation.author}
      </p>
    </div>
  );
}