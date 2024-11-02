import React from 'react';
import { Flame } from 'lucide-react';

interface Props {
  isHotMode: boolean;
  onToggle: () => void;
}

export function ModeToggle({ isHotMode, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
        isHotMode
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
    >
      <Flame className={`w-4 h-4 ${isHotMode ? 'text-red-500' : 'text-blue-500'}`} />
      {isHotMode ? 'Hot Mode' : 'Normal Mode'}
    </button>
  );
}