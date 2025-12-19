
import React, { useMemo } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  items: MediaItem[];
  onItemClick: (item: MediaItem, index: number) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, onItemClick }) => {
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: { items: MediaItem[], originalIndices: number[] } } = {};
    items.forEach((item, index) => {
      const date = new Date(item.date).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });
      if (!groups[date]) groups[date] = { items: [], originalIndices: [] };
      groups[date].items.push(item);
      groups[date].originalIndices.push(index);
    });
    return Object.entries(groups);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] opacity-60 p-12 text-center">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-4">
          <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium">No photos found</h3>
        <p className="mt-2 text-sm">Tap the plus icon to scan device storage.</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {groupedItems.map(([date, group], groupIdx) => (
        <div key={date} className="mb-4">
          <h4 className="px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md z-10">
            {date}
          </h4>
          <div className="grid grid-cols-3 gap-0.5">
            {group.items.map((item, idx) => (
              <div 
                key={item.id} 
                onClick={() => onItemClick(item, group.originalIndices[idx])}
                className="aspect-square relative cursor-pointer overflow-hidden bg-gray-200 dark:bg-stone-800 animate-item-entry press-effect"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {item.type === 'video' ? (
                  <>
                    <video src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-md rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                      </svg>
                      <span className="text-[10px] text-white font-medium">0:15</span>
                    </div>
                  </>
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
