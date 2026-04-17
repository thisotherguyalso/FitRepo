import { renderHook, act, render } from '@testing-library/react-native';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native'
import { createProfile, getProfile } from '@/lib/api/profiles';
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn()
    }
}))

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn()
}))

jest.mock('expo-auth-session', () => ({
    makeRedirectUri: jest.fn()
}))

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            getUser: jest.fn(),
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signInWithOAuth: jest.fn(),
            exchangeCodeForSession: jest.fn(),
            signOut: jest.fn(),
        }
    }
}))

jest.mock('@/lib/api/profiles', () => ({
    createProfile: jest.fn(),
    getProfile: jest.fn()
}))

jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn()
    }
}))

describe('useAuth', () => {
    // clear the data before each test
    beforeEach(() => {
        jest.clearAllMocks()

        ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: null },
            error: null,
        })

        ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: '123' } },
            error: null,
        })

        ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
            error: null,
        })

        ;(AuthSession.makeRedirectUri as jest.Mock).mockReturnValue('fitrepo://auth/callback')
        ;(getProfile as jest.Mock).mockResolvedValue({
            username: 'testuser',
            goal: '',
            current_streak: 0,
            height_cm: null,
            body_weight_kg: null,
        })
    })

    it ('should initialize as not loading yet', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.loading).toBe(false);
    });

    it ('should call signInwithpassword with correct credentials', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            data: { user: { id: '123' } },
            error: null
        })

        await act(async () => {
            await result.current.signIn('test@test.com', 'test')
        })

        expect(supabase.auth.signInWithPassword as jest.Mock).toHaveBeenCalledWith({
            email: 'test@test.com',
            password: 'test'
        })
    });

    it ('should handle error messages gracefully', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            data: null,
            error: { message: "Invalid credentials" }
        })

        await act(async () => {
            await result.current.signIn('test@test.com', 'test')
        })

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials')
    });

    it ('should call signUp with correct credentials', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: { user: {id : 123} },
            error: null
        })

        await act(async () => {
            await result.current.signUp('test2@test.com', 'test')
        })

        expect(supabase.auth.signUp as jest.Mock).toHaveBeenCalledWith({
            email: 'test2@test.com', 
            password: 'test'
        })
    });

    it ('should call createProfile after successful signUp', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: { user: {id : 123} },
            error: null
        })

        await act(async () => {
            await result.current.signUp('test2@test.com', 'test')
        })

        expect(createProfile).toHaveBeenCalled()
    });

    it('should NOT call createProfile after failed signup', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: { user: null },
            error: { message: 'User already exists' }
        })

        await act(async () => {
            await result.current.signUp('test2@test.com', 'wrongpassword')
        })

        expect(createProfile).not.toHaveBeenCalled()
    });

    it('should stop loading after signIn', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            data: { user: { id: '123' } },
            error: null
        })

        await act(async () => {
            await result.current.signIn('test@test.com', 'test')
        })

        expect(result.current.loading).toBe(false);
    });

    it('should start loading after signup', async () => {
        const { result } = renderHook(() => useAuth());

        (supabase.auth.signInWithPassword as jest.Mock).mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 100))
        )

        act(() => {
            result.current.signIn('test@test.com', 'test')
        })

        expect(result.current.loading).toBe(true);
    });

    it('should sign in with Google and exchange the returned code', async () => {
        const { result } = renderHook(() => useAuth());

        ;(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
            data: { url: 'https://accounts.google.com/o/oauth2/v2/auth' },
            error: null,
        })

        ;(WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
            type: 'success',
            url: 'fitrepo://auth/callback?code=oauth-code-123',
        })

        ;(supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
            data: { session: { access_token: 'token' } },
            error: null,
        })

        await act(async () => {
            await result.current.googleSignIn()
        })

        expect(AuthSession.makeRedirectUri).toHaveBeenCalledWith({
            scheme: 'fitrepo',
            path: 'auth/callback',
        })
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
            provider: 'google',
            options: {
                redirectTo: 'fitrepo://auth/callback',
                skipBrowserRedirect: true,
            },
        })
        expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
            'https://accounts.google.com/o/oauth2/v2/auth',
            'fitrepo://auth/callback'
        )
        expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('oauth-code-123')
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/home')
    })

    it('should not exchange a code when Google sign-in is cancelled', async () => {
        const { result } = renderHook(() => useAuth());

        ;(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
            data: { url: 'https://accounts.google.com/o/oauth2/v2/auth' },
            error: null,
        })

        ;(WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
            type: 'cancel',
        })

        await act(async () => {
            await result.current.googleSignIn()
        })

        expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled()
        expect(router.replace).not.toHaveBeenCalled()
    })
});
