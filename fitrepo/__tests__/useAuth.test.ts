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
            signInWithPassword: jest.fn(),
            signUp: jest.fn()
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
    it ('should start with loading as false', () => {
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

        expect(supabase.auth.signUp as jest.Mock).toHaveBeenCalledWith({
            email: 'test2@test.com',
            password: 'test'
        })
    });

});
