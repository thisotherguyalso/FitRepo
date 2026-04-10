import { renderHook, act, render } from '@testing-library/react-native';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native'
import { createProfile } from '@/lib/api/profiles';

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn()
    }
}))

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn()
}))

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        }
    }
}))

jest.mock('@/lib/api/profiles', () => ({
    createProfile: jest.fn()
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

        ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
            error: null,
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
});
