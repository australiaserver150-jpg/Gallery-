
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, Album, NavigationTab } from './types';
import { MediaService } from './services/mediaService';
import { Icons } from './constants';
import MediaGrid from './components/MediaGrid';
import AlbumList from './components/AlbumList';
import MediaViewer from './components/MediaViewer';
import PermissionsGuard from './components/PermissionsGuard';
import LoadingShimmer from './components/LoadingShimmer';

const App: React.FC = () => {
  // Permission State (Mimicking Android's runtime checks)
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Media State (The "ViewModel" data)
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.PHOTOS);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 1. MediaStore Loader Logic
   * Mimics the loader that runs once permission is obtained.
   */
  const loadGalleryFromMediaStore = useCallback(async () => {
    setIsLoading(true);
    // Simulate real phone scanning delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In this web mock, we try to restore from "persisted storage" if any
    const saved = localStorage.getItem('gallery_mock_storage');
    if (saved) {
      setMediaItems(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  /**
   * 2. Permission Launcher (ActivityResult API style)
   */
  useEffect(() => {
    const stored = localStorage.getItem('gallery_permission_status');
    if (stored === 'granted') {
      setPermissionStatus('granted');
      loadGalleryFromMediaStore();
    }
  }, [loadGalleryFromMediaStore]);

  const handleGrantPermission = () => {
    // registerForActivityResult callback logic
    localStorage.setItem('gallery_permission_status', 'granted');
    setPermissionStatus('granted');
    // INSTANT AUTO-LOAD after permission granted
    loadGalleryFromMediaStore();
  };

  /**
   * 3. ContentObserver Logic
   * Mimics registerContentObserver to refresh UI when storage changes.
   */
  useEffect(() => {
    if (permissionStatus !== 'granted') return;

    const mediaObserver = setInterval(() => {
      // Simulate checking for external changes
      const latestFromStorage = localStorage.getItem('gallery_mock_storage');
      if (latestFromStorage) {
        const parsed = JSON.parse(latestFromStorage);
        if (parsed.length !== mediaItems.length) {
          console.log('ContentObserver: Change detected in MediaStore. Refreshing...');
          setMediaItems(parsed);
        }
      }
    }, 2000); // Check every 2s

    return () => clearInterval(mediaObserver);
  }, [permissionStatus, mediaItems.length]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      const newItems = await MediaService.processFiles(files);
      const updated = [...newItems, ...mediaItems];
      setMediaItems(updated);
      localStorage.setItem('gallery_mock_storage', JSON.stringify(updated));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setAlbums(MediaService.groupIntoAlbums(mediaItems));
  }, [mediaItems]);

  const handleDelete = (id: string) => {
    const updated = mediaItems.filter(item => item.id !== id);
    setMediaItems(updated);
    localStorage.setItem('gallery_mock_storage', JSON.stringify(updated));
    setSelectedIdx(null);
  };

  const filteredItems = mediaItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) return <LoadingShimmer />;

    switch (activeTab) {
      case NavigationTab.PHOTOS:
        return <MediaGrid items={filteredItems} onItemClick={(_, index) => setSelectedIdx(index)} />;
      case NavigationTab.ALBUMS:
        return <AlbumList albums={albums} onAlbumClick={(name) => {
          setSearchQuery(name);
          setActiveTab(NavigationTab.PHOTOS);
        }} />;
      case NavigationTab.SEARCH:
        return (
          <div className="p-4">
            <div className="relative mb-6">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search gallery..." 
                className="w-full bg-gray-100 dark:bg-stone-800 py-4 pl-12 pr-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            {searchQuery && <MediaGrid items={filteredItems} onItemClick={(_, index) => setSelectedIdx(index)} />}
            {!searchQuery && <div className="text-center py-20 opacity-50"><p>Search your media library</p></div>}
          </div>
        );
      default:
        return null;
    }
  };

  if (permissionStatus !== 'granted') {
    return (
      <PermissionsGuard 
        onGranted={handleGrantPermission} 
        status={permissionStatus === 'denied' ? 'denied' : 'undetermined'}
        onRetry={() => setPermissionStatus('undetermined')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 transition-colors duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        accept="image/*,video/*" 
        className="hidden" 
      />

      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
        <div className="flex gap-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all active:scale-90"
          >
            <svg className={`w-6 h-6 text-stone-700 dark:text-stone-300 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all active:scale-90">
            <Icons.More className="w-6 h-6 text-stone-700 dark:text-stone-300" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {renderContent()}
      </main>

      {activeTab === NavigationTab.PHOTOS && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:bg-blue-700 active:scale-90 transition-all z-30"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-stone-900/95 border-t border-stone-100 dark:border-stone-800 px-6 py-4 flex justify-between items-center z-40 backdrop-blur-xl">
        <NavButton active={activeTab === NavigationTab.PHOTOS} onClick={() => setActiveTab(NavigationTab.PHOTOS)} icon={<Icons.Photos className="w-6 h-6" />} label="Photos" />
        <NavButton active={activeTab === NavigationTab.ALBUMS} onClick={() => setActiveTab(NavigationTab.ALBUMS)} icon={<Icons.Albums className="w-6 h-6" />} label="Albums" />
        <NavButton active={activeTab === NavigationTab.SEARCH} onClick={() => setActiveTab(NavigationTab.SEARCH)} icon={<Icons.Search className="w-6 h-6" />} label="Search" />
      </nav>

      {selectedIdx !== null && (
        <MediaViewer 
          items={filteredItems} 
          currentIndex={selectedIdx}
          onNavigate={setSelectedIdx}
          onClose={() => setSelectedIdx(null)} 
          onDeleteRequest={handleDelete}
          onShare={(item) => console.log('Sharing', item.name)}
        />
      )}
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-1 max-w-[100px]">
    <div className={`px-6 py-1.5 rounded-full transition-all duration-300 ${active ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
      {icon}
    </div>
    <span className={`text-[11px] font-bold tracking-tight uppercase ${active ? 'text-blue-800 dark:text-blue-200' : 'text-stone-500'}`}>{label}</span>
  </button>
);

export default App;
