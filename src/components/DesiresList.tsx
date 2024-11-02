import React, { useState } from 'react';
import { Heart, Trash2, Plus, Flame, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Desire } from '../lib/db';

interface DesiresListProps {
  desires: Desire[];
  isEmmaMode: boolean;
  onDelete: (id: number) => void;
  onAdd?: (desire: Omit<Desire, 'id'>) => void;
  onSchedule?: (desire: Desire) => void;
  isHotMode: boolean;
}

const INTIMATE_CATEGORIES = [
  'Roleplay',
  'New Position',
  'Massage',
  'Toys',
  'Location',
  'Outfit',
  'Foreplay',
  'Fantasy',
  'Sensual',
  'Experiment',
  'Romantic',
  'Adventure',
] as const;

type IntimateCategory = typeof INTIMATE_CATEGORIES[number];

const DesiresList: React.FC<DesiresListProps> = ({ 
  desires, 
  isEmmaMode, 
  onDelete, 
  onAdd,
  onSchedule,
  isHotMode 
}) => {
  const [newDesire, setNewDesire] = useState<{
    title: string;
    description: string;
    category: IntimateCategory;
  }>({ 
    title: '', 
    description: '',
    category: INTIMATE_CATEGORIES[0]
  });

  // In Emma's mode, show Richard's desires. In Richard's mode, show his own desires
  const displayDesires = desires.filter(desire => 
    desire.isHot === isHotMode && desire.author === 'Richard'
  );

  return (
    <div className="space-y-6">
      {/* Only show the form in Richard's mode */}
      {!isEmmaMode && (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newDesire.title || !newDesire.description || !onAdd) return;

          const desireToAdd: Omit<Desire, 'id'> = {
            title: newDesire.title,
            description: newDesire.description,
            date: new Date(),
            author: 'Richard',
            priority: 1,
            isHot: isHotMode,
            category: isHotMode ? newDesire.category : undefined,
          };

          onAdd(desireToAdd);
          setNewDesire({ 
            title: '', 
            description: '', 
            category: INTIMATE_CATEGORIES[0] 
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newDesire.title}
              onChange={(e) => setNewDesire(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`What would you like to ${isHotMode ? 'experience intimately' : 'do'}?`}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>

          {isHotMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newDesire.category}
                onChange={(e) => setNewDesire(prev => ({ 
                  ...prev, 
                  category: e.target.value as IntimateCategory 
                }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              >
                {INTIMATE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newDesire.description}
              onChange={(e) => setNewDesire(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Describe your ${isHotMode ? 'intimate desire' : 'wish'}...`}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white font-medium transition-colors ${
              isHotMode
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            Share {isHotMode ? 'Intimate Desire' : 'Wish'}
          </button>
        </form>
      )}

      {displayDesires.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {isHotMode ? 'No intimate desires shared yet.' : 'No desires shared yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {displayDesires.map((desire) => (
            <div key={desire.id} className={`flex items-start justify-between p-4 rounded-lg ${
              desire.isHot ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              <div className="flex items-start gap-4">
                <Heart className={`w-5 h-5 ${
                  desire.isHot ? 'text-red-500' : 'text-pink-500'
                } flex-shrink-0`} />
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    {desire.title}
                    {desire.isHot && (
                      <Flame className="w-4 h-4 text-red-500" />
                    )}
                  </h3>
                  {desire.category && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-red-100 text-red-800">
                      {desire.category}
                    </span>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{desire.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Shared on {format(new Date(desire.date), 'MMM d, yyyy')}
                  </p>
                  {isEmmaMode && onSchedule && (
                    <button
                      onClick={() => onSchedule(desire)}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule This
                    </button>
                  )}
                </div>
              </div>
              {!isEmmaMode && (
                <button
                  onClick={() => desire.id && onDelete(desire.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesiresList;