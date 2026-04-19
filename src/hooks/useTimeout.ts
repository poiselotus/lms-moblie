import { useCallback } from 'react';

export function useTimeout(ms: number) {
  return useCallback((promise: Promise<any>) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), ms)
      )
    ]);
  }, [ms]);
}

