/**
 * Utility functions for safe localStorage caching.
 * Adds prefixing and error handling to prevent quota errors and cross-user leaks.
 */

// Safe getter
export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn(`Failed to read cache for ${key}`, err);
    return null;
  }
};

// Safe setter (handles QuotaExceeded errors)
export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to set cache for ${key}. Clearing old caches to free space.`, err);
    // If quota exceeded, clear some old caches (basic cleanup)
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cache_')) {
          keysToRemove.push(k);
        }
      }
      // Remove all custom caches if we hit the limit
      keysToRemove.forEach(k => localStorage.removeItem(k));
      // Try setting again
      localStorage.setItem(key, JSON.stringify(data));
    } catch (retryErr) {
      console.error('LocalStorage is completely full or unavailable.', retryErr);
    }
  }
};

// Clear caches specific to a user ID on logout
export const clearUserCache = (userId) => {
  if (!userId) return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.includes(`_${userId}_`)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear user cache', err);
  }
};
