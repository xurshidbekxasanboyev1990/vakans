import { useState, useEffect, useCallback } from 'react';
import { Job } from '@/types';

interface OfflineStorageOptions {
  dbName?: string;
  storeName?: string;
}

/**
 * Offline Storage Hook - IndexedDB
 * Internetga ulanmay ishlarni saqlash
 */
export function useOfflineStorage({
  dbName = 'vakans-offline',
  storeName = 'saved-jobs',
}: OfflineStorageOptions = {}) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check IndexedDB support
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    initDB();
  }, []);

  const initDB = useCallback(async () => {
    try {
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        setIsReady(false);
      };

      request.onsuccess = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        setDb(database);
        setIsReady(true);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        
        if (!database.objectStoreNames.contains(storeName)) {
          const objectStore = database.createObjectStore(storeName, { keyPath: 'id' });
          objectStore.createIndex('savedAt', 'savedAt', { unique: false });
          objectStore.createIndex('categoryId', 'categoryId', { unique: false });
        }
      };
    } catch (error) {
      console.error('IndexedDB init error:', error);
      setIsReady(false);
    }
  }, [dbName, storeName]);

  const saveJob = useCallback(
    async (job: Job): Promise<boolean> => {
      if (!db || !isReady) return false;

      try {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        
        const jobWithMeta = {
          ...job,
          savedAt: new Date().toISOString(),
          offlineId: `offline-${Date.now()}`,
        };

        await objectStore.put(jobWithMeta);
        return true;
      } catch (error) {
        console.error('Save job error:', error);
        return false;
      }
    },
    [db, isReady, storeName]
  );

  const getJob = useCallback(
    async (id: string): Promise<Job | null> => {
      if (!db || !isReady) return null;

      try {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(id);

        return new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
      } catch (error) {
        console.error('Get job error:', error);
        return null;
      }
    },
    [db, isReady, storeName]
  );

  const getAllJobs = useCallback(
    async (): Promise<Job[]> => {
      if (!db || !isReady) return [];

      try {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();

        return new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });
      } catch (error) {
        console.error('Get all jobs error:', error);
        return [];
      }
    },
    [db, isReady, storeName]
  );

  const removeJob = useCallback(
    async (id: string): Promise<boolean> => {
      if (!db || !isReady) return false;

      try {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        await objectStore.delete(id);
        return true;
      } catch (error) {
        console.error('Remove job error:', error);
        return false;
      }
    },
    [db, isReady, storeName]
  );

  const clearAll = useCallback(
    async (): Promise<boolean> => {
      if (!db || !isReady) return false;

      try {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        await objectStore.clear();
        return true;
      } catch (error) {
        console.error('Clear all error:', error);
        return false;
      }
    },
    [db, isReady, storeName]
  );

  const getStorageSize = useCallback(
    async (): Promise<number> => {
      if (!db || !isReady) return 0;

      try {
        const jobs = await getAllJobs();
        const size = new Blob([JSON.stringify(jobs)]).size;
        return size;
      } catch (error) {
        console.error('Get storage size error:', error);
        return 0;
      }
    },
    [db, isReady, getAllJobs]
  );

  return {
    isSupported,
    isReady,
    saveJob,
    getJob,
    getAllJobs,
    removeJob,
    clearAll,
    getStorageSize,
  };
}

/**
 * Usage:
 * 
 * const offlineStorage = useOfflineStorage();
 * 
 * // Save job for offline viewing
 * await offlineStorage.saveJob(job);
 * 
 * // Get all saved jobs
 * const savedJobs = await offlineStorage.getAllJobs();
 * 
 * // Remove job
 * await offlineStorage.removeJob(jobId);
 * 
 * // Check storage size
 * const sizeInBytes = await offlineStorage.getStorageSize();
 */
