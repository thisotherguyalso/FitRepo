import { renderHook, act } from '@testing-library/react-native';
import { useWorkouts } from '@/hooks/use-workouts';
import { createWorkout, getWorkouts } from '@/lib/api/workouts';
import { addExerciseToWorkout } from '@/lib/api/workoutExercises';
import { getCurrentUserBodyWeightKg, resolveEffectiveWeight } from '@/lib/bodyweight';

jest.mock('@/lib/api/workouts', () => ({
    getWorkouts: jest.fn(),
    createWorkout: jest.fn()
}))

jest.mock('@/lib/api/workoutExercises', () => ({
    addExerciseToWorkout: jest.fn(),
    getWorkoutSummaries: jest.fn().mockResolvedValue([]),
}))

jest.mock('@/lib/bodyweight', () => ({
    getCurrentUserBodyWeightKg: jest.fn(),
    resolveEffectiveWeight: jest.fn((weight: number | null) => weight ?? 0),
}))

const waitForNextTick = async () => {
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
    })
}

describe('useWorkouts', () => {
    let warnSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
        ;(getCurrentUserBodyWeightKg as jest.Mock).mockResolvedValue(null)
        ;(resolveEffectiveWeight as jest.Mock).mockImplementation((weight: number | null) => weight ?? 0)
    })

    afterEach(() => {
        warnSpy.mockRestore()
    })

    it('should initialize as not loading yet', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([])
        const { result } = renderHook(() => useWorkouts())
        
        await waitForNextTick()
        
        expect(result.current.loading).toBe(false)
    })

    it('should call planWorkout with createWorkout api call', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([])
        const { result } = renderHook(() => useWorkouts())
        await waitForNextTick();

        (createWorkout as jest.Mock).mockResolvedValue({
            id: '123',
            user_id: '456',
            name: 'Test Workout',
            performed_at: '2026-03-12',
            is_finished: false,
            created_at: '2026-03-12'
        })

        let createdWorkout: any = null

        await act(async () => {
            createdWorkout = await result.current.planWorkout({
                exercises: [],
                name: 'Test Workout',
                performed_at: '2026-03-12',
                is_finished: false
            })
        })

        expect(createdWorkout.id).toBe('123')
        expect(createWorkout).toHaveBeenCalledWith({
            name: 'Test Workout',
            performed_at: '2026-03-12',
            is_finished: false
        })
    })

    it('should surface createWorkout errors gracefully', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([])
        const { result } = renderHook(() => useWorkouts())
        await waitForNextTick();

        (createWorkout as jest.Mock).mockRejectedValue(
            new Error('Workout creation failed')
        )

        let thrownError: any = null
        
        await act(async () => {
            try {
                await result.current.planWorkout({
                    exercises: [],
                    name: 'Test Workout',
                    performed_at: '2026-03-12',
                    is_finished: false
                })
            } catch (error) {
                thrownError = error
            }
        })

        expect(thrownError).not.toBeNull()
        expect(thrownError.message).toBe('Workout creation failed')
        expect(result.current.loading).toBe(false)
    })

    it('should call loadWorkouts on mount', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([
            { id: '123', user_id: '456', name: 'Test Workout', performed_at: '2026-03-12', is_finished: false, created_at: '2026-03-12' }
        ])

        const { result } = renderHook(() => useWorkouts())
        await waitForNextTick()

        expect(getWorkouts).toHaveBeenCalled()
        expect(result.current.workouts).toHaveLength(1)
    })

    it('should handle empty workouts list on mount', async () => {
        (getWorkouts as jest.Mock).mockResolvedValue([])
        const { result } = renderHook(() => useWorkouts())
        await waitForNextTick()
        
        expect(result.current.workouts).toHaveLength(0)
    })
});
