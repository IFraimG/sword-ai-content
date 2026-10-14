import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCookie, setCookie, deleteCookie, JWT_COOKIE_NAME } from '@/shared/lib/cookie';
import { getApiBaseUrl } from '@/shared/api/reelsApi';

export interface AuthUser {
  id: string;
  login: string;
  email: string;
  created_at_formatted: string;
  created_at?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // User is considered authenticated if we have user object OR a valid JWT cookie
  const isAuthenticated = computed(() => {
    return !!user.value || !!getCookie(JWT_COOKIE_NAME);
  });

  /**
   * Initializes authentication state from 7-day JWT cookie
   */
  async function initAuth(): Promise<boolean> {
    if (isInitialized.value) {
      return !!user.value;
    }

    const token = getCookie(JWT_COOKIE_NAME);
    if (!token) {
      user.value = null;
      isInitialized.value = true;
      return false;
    }

    try {
      isLoading.value = true;
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        user.value = data.user;
        isInitialized.value = true;
        return true;
      } else {
        // Token expired or invalid: remove cookie
        deleteCookie(JWT_COOKIE_NAME);
        user.value = null;
        isInitialized.value = true;
        return false;
      }
    } catch {
      // In case server is offline or unreachable, if we have cookie we allow offline session
      isInitialized.value = true;
      return !!token;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Registers a new user
   */
  async function register(email: string, login: string, password: string): Promise<AuthUser> {
    isLoading.value = true;
    error.value = null;

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      // Store JWT strictly in Cookie for 7 days (NEVER in localStorage)
      if (data.token) {
        setCookie(JWT_COOKIE_NAME, data.token, 7);
      }

      user.value = data.user;
      return data.user;
    } catch (err: any) {
      error.value = err.message || 'Ошибка при регистрации';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logs in an existing user
   */
  async function login(loginOrEmail: string, password: string): Promise<AuthUser> {
    isLoading.value = true;
    error.value = null;

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ loginOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при входе');
      }

      // Store JWT strictly in Cookie for 7 days (NEVER in localStorage)
      if (data.token) {
        setCookie(JWT_COOKIE_NAME, data.token, 7);
      }

      user.value = data.user;
      return data.user;
    } catch (err: any) {
      error.value = err.message || 'Ошибка при входе';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logs out the user and clears cookie
   */
  async function logout(): Promise<void> {
    try {
      const apiBase = getApiBaseUrl();
      await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      deleteCookie(JWT_COOKIE_NAME);
      user.value = null;
    }
  }

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated,
    initAuth,
    register,
    login,
    logout,
  };
});
