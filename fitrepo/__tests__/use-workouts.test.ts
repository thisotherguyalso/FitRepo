import { renderHook, act } from '@testing-library/react-native';
import { useWorkouts } from '@/hooks/use-workouts';
import { createWorkout, getWorkouts } from '@/lib/api/workouts';

jest.mock('@/lib/api/workouts', () => ({
    getWorkouts: jest.fn(),
    createWorkout: jest.fn()
}))

describe('useWorkouts', () => {
    // clear the data before each test
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it ('should start with loading as false', () => {
        const { result } = renderHook(() => useWorkouts());
        expect(result.current.loading).toBe(false);
    });

    it ('should call planWorkout with createWorkout api call', async () => {
        const { result } = renderHook(() => useWorkouts());

        (createWorkout as jest.Mock).mockResolvedValue({
            id: '123',
            user_id: '456',
            name: 'Test Workout',
            performed_at: '2026-03-12',
            is_finished: false,
            created_at: '2026-03-12'
        })

        await act(async () => {
            await result.current.planWorkout({
                name: 'Test Workout',
                performed_at: '2026-03-12',
                is_finished: false
            })
        })

        expect(createWorkout).toHaveBeenCalledWith({
            name: 'Test Workout',
            performed_at: '2026-03-12',
            is_finished: false
        })
    });

    it ('should NOT call createWorkout if call is invalid', async () => {
        const { result } = renderHook(() => useWorkouts());

        (createWorkout as jest.Mock).mockRejectedValue(
            new Error('You already have a workout for today!')
        )

        await act(async () => {
            await result.current.planWorkout({
                name: 'Test Workout',
                performed_at: '2026-03-12',
                is_finished: false
            })
        })

        expect(result.current.loading).toBe(false)
    })

    it('should call loadWorkouts on start', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([
            { id: '123', user_id: '456', name: 'Test Workout', performed_at: '2026-03-12', is_finished: false, created_at: '2026-03-12' }
        ])

        const { result } = renderHook(() => useWorkouts())

        await act(async () => {})

        expect(result.current.workouts).toHaveLength(1)
    })

    it('should not crash if loadWorkouts loads an empty list', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([])

        const { result } = renderHook(() => useWorkouts())
        await act(async () => {})
        expect(result.current.workouts).toHaveLength(0)
    })

});
