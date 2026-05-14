import { useAuthContext } from '../contexts/AuthContext';

/**
 * Convenience hook for accessing auth state and functions.
 * Re-exports useAuthContext for a cleaner import path.
 *
 * Provides:
 * - admin: The currently authenticated admin or null
 * - isAuthenticated: Whether an admin is logged in
 * - login: Function to authenticate with email/password
 * - logout: Function to clear session and redirect to login
 */
export function useAuth() {
    return useAuthContext();
}
