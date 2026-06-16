import { useState, useEffect, useRef, useCallback } from 'react';

type SyncState = 'synced' | 'syncing' | 'offline' | 'conflict' | 'error';

interface UseNoteSyncProps {
  workspaceName: string;
}

export function useNoteSync({ workspaceName }: UseNoteSyncProps) {
  const [content, setContent] = useState('');
  const [syncState, setSyncState] = useState<SyncState>('synced');
  
  const contentRef = useRef(content);
  const localVersionRef = useRef(1);
  const isDirtyRef = useRef(false);
  const lastSyncedAtRef = useRef(0);
  const offlineQueueRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Initial fetch
  useEffect(() => {
    let isMounted = true;
    
    const fetchNote = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/notes/${encodeURIComponent(workspaceName)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setContent(data.content);
            lastSyncedAtRef.current = data.updatedAt;
            localVersionRef.current = data.version;
            isDirtyRef.current = false;
            setSyncState('synced');
          }
        }
      } catch {
        if (isMounted) setSyncState('offline');
      }
    };

    fetchNote();
    return () => { isMounted = false; };
  }, [workspaceName]);

  const sync = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncState('offline');
      offlineQueueRef.current = contentRef.current;
      return;
    }

    if (!isDirtyRef.current && !offlineQueueRef.current) return;

    setSyncState('syncing');
    const contentToSync = offlineQueueRef.current ?? contentRef.current;
    const updatedAt = Date.now() / 1000;

    try {
      const res = await fetch(`http://localhost:8000/api/notes/${encodeURIComponent(workspaceName)}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToSync,
          updatedAt,
          localVersion: localVersionRef.current
        })
      });

      if (!res.ok) throw new Error('Sync failed');

      const data = await res.json();
      
      if (data.conflict) {
        setSyncState('conflict');
        // Simple LWW resolution: server had a newer timestamp
        // we overwrite local with server's content
        setContent(data.content);
        localVersionRef.current = data.version;
        lastSyncedAtRef.current = data.updatedAt;
        isDirtyRef.current = false;
        offlineQueueRef.current = null;
        setTimeout(() => setSyncState('synced'), 2000);
      } else {
        setSyncState('synced');
        localVersionRef.current = data.version;
        lastSyncedAtRef.current = data.updatedAt;
        isDirtyRef.current = false;
        offlineQueueRef.current = null;
      }
    } catch {
      setSyncState('offline');
      offlineQueueRef.current = contentToSync;
    }
  }, [workspaceName]);

  // Periodic sync
  useEffect(() => {
    const interval = setInterval(sync, 3000);
    return () => clearInterval(interval);
  }, [sync]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setSyncState('syncing');
      sync();
    };
    const handleOffline = () => setSyncState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sync]);

  const updateContent = (newContent: string) => {
    setContent(newContent);
    isDirtyRef.current = true;
    if (syncState !== 'offline') {
      setSyncState('syncing');
    }
  };

  return {
    content,
    updateContent,
    syncState
  };
}
