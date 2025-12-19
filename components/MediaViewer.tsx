
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem } from '../types';
import { Icons } from '../constants';
import { MediaService } from '../services/mediaService';

interface MediaViewerProps {
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onDeleteRequest: (id: string) => void;
  onShare: (item: MediaItem) => void;
  onNavigate: (index: number) => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  items, 
  currentIndex, 
  onClose, 
  onDeleteRequest, 
  onShare,
  onNavigate 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef(0);
  const item = items[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom > 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < items.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
      setZoom(1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newZoom = Math.max(1, Math.min(5, zoom - e.deltaY * 0.01));
      setZoom(newZoom);
    }
  };

  const processDelete = async () => {
    setIsDeleting(true);
    // Simulate Android MediaStore.createDeleteRequest delay
    await new Promise(r => setTimeout(r, 400));
    onDeleteRequest(item.id);
    setConfirmDelete(false);
    setIsDeleting(false);
  };

  if (!item) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex flex-col overflow-hidden animate-in fade-in duration-300`}
      onWheel={handleWheel}
    >
      {/* Top Bar - Material style */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 transition-opacity duration-300 ${zoom > 1 ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <Icons.Back className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm truncate max-w-[150px]">{item.name}</span>
            <span className="text-white/60 text-xs">{MediaService.formatDate(item.date).split(',')[0]}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onShare(item)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <Icons.Share className="w-5 h-5" />
          </button>
          <button onClick={() => setShowDetails(!showDetails)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <Icons.Info className="w-5 h-5" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <Icons.Delete className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Content - Swippable ViewPager Mock */}
      <div 
        className={`flex-1 flex items-center justify-center p-0 select-none ${isDeleting ? 'deleting' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {item.type === 'video' ? (
            <video 
              src={item.url} 
              controls 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <img 
              src={item.url} 
              alt={item.name} 
              draggable={false}
              className="max-w-full max-h-full object-contain pointer-events-none"
              style={{ touchAction: 'none' }}
            />
          )}
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 bg-black/20 backdrop-blur-sm rounded-full transition-opacity duration-300 ${zoom > 1 ? 'opacity-0' : 'opacity-100'}`}>
        {items.length <= 10 ? items.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/30'}`}
          />
        )) : (
          <span className="text-white/70 text-[10px] px-2 uppercase tracking-widest font-bold">
            {currentIndex + 1} / {items.length}
          </span>
        )}
      </div>

      {/* Details Sheet - Material 3 Bottom Sheet */}
      {showDetails && (
        <div className="absolute inset-0 bg-black/40 z-20" onClick={() => setShowDetails(false)}>
          <div 
            className="absolute inset-x-0 bottom-0 bg-white dark:bg-stone-900 rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-8" />
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-500">Date taken</p>
                    <p className="text-sm font-medium">{MediaService.formatDate(item.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Resolution</p>
                    <p className="text-sm font-medium">{item.width} x {item.height}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">File size</p>
                    <p className="text-sm font-medium">{MediaService.formatSize(item.size)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Album</p>
                    <p className="text-sm font-medium">{item.album}</p>
                  </div>
                </div>
              </section>
              <button 
                onClick={() => setShowDetails(false)}
                className="w-full bg-stone-100 dark:bg-stone-800 py-4 rounded-2xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System MediaStore.createDeleteRequest Simulation */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-8 z-[60] backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-system-dialog">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <Icons.Delete className="w-6 h-6" />
              <h3 className="text-xl font-bold">Allow deletion?</h3>
            </div>
            <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
              Lumina Gallery is requesting to delete this item from your device storage simulation. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={processDelete}
                disabled={isDeleting}
                className="w-full bg-red-600 text-white py-4 rounded-full font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Allow'}
              </button>
              <button 
                onClick={() => setConfirmDelete(false)}
                className="w-full py-4 rounded-full font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
