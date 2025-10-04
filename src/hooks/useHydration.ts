'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useQueueStore } from '@/store/useQueueStore';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for stores to rehydrate
    Promise.all([
      useUIStore.persist.rehydrate(),
      useQueueStore.persist.rehydrate()
    ]).then(() => {
      // Small delay to ensure everything is ready
      setTimeout(() => {
        setIsHydrated(true);
      }, 100);
    }).catch((error) => {
      console.error('Error rehydrating stores:', error);
      // Still set as hydrated to prevent infinite loading
      setIsHydrated(true);
    });
  }, []);

  return isHydrated;
}
