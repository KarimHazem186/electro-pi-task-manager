/**
 * Proactive Token Refresh Strategy
 * 
 * This module provides automatic background token refresh
 * before the access token expires (15 minutes by default).
 * 
 * Strategy:
 * - Access token expires in 15 minutes
 * - We refresh it after 12 minutes (3 minutes before expiry)
 * - This ensures seamless user experience without interruptions
 */

import axios from 'axios';
import { API_BASE_URL } from './client';

const REFRESH_INTERVAL = 12 * 60 * 1000; // 12 minutes (3 min before token expires)
let refreshTimer: NodeJS.Timeout | null = null;
let isRefreshing = false;

/**
 * Start automatic token refresh in the background
 * Call this after successful login
 */
export function startTokenRefresh() {
  // Clear any existing timer
  stopTokenRefresh();

  console.log('🔄 Starting automatic token refresh (every 12 minutes)');

  // Refresh immediately after 12 minutes, then every 12 minutes
  refreshTimer = setInterval(async () => {
    await refreshTokenSilently();
  }, REFRESH_INTERVAL);

  // Also set up visibility change listener to refresh when tab becomes active
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
}

/**
 * Stop automatic token refresh
 * Call this on logout
 */
export function stopTokenRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('⏹️ Stopped automatic token refresh');
  }

  // Remove visibility change listener
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
}

/**
 * Refresh token silently in the background
 */
async function refreshTokenSilently() {
  // Prevent multiple simultaneous refresh requests
  if (isRefreshing) {
    console.log('⏳ Token refresh already in progress, skipping...');
    return;
  }

  try {
    isRefreshing = true;
    console.log('🔄 Refreshing access token silently...');

    // Emit refresh start event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('token-refresh-start'));
    }

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
      }
    );

    if (response.data?.success) {
      console.log('✅ Access token refreshed successfully (background)');
      lastRefreshTime = Date.now();
      
      // Emit refresh success event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('token-refresh-success'));
      }
    }
  } catch (error) {
    console.error('❌ Background token refresh failed:', error);
    
    // Emit refresh failed event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('token-refresh-failed'));
    }
    
    // If refresh fails, stop the timer
    // User will be logged out on next API call
    stopTokenRefresh();
  } finally {
    isRefreshing = false;
  }
}

/**
 * Handle browser tab visibility changes
 * Refresh token when user comes back to the app
 */
let lastRefreshTime = Date.now();

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    
    // If more than 10 minutes have passed since last refresh,
    // refresh the token immediately
    if (timeSinceLastRefresh > 10 * 60 * 1000) {
      console.log('👀 Tab became visible, refreshing token...');
      refreshTokenSilently();
    }
  }
}

/**
 * Manual token refresh
 * Can be called explicitly when needed
 */
export async function refreshToken() {
  try {
    console.log('🔄 Manual token refresh...');
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
      }
    );

    if (response.data?.success) {
      console.log('✅ Token refreshed successfully');
      lastRefreshTime = Date.now();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return false;
  }
}
