import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { SessionCountdownScreen } from '@/components/session-countdown-screen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View, Pressable } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }: any) => <View>{children}</View>,
    GestureDetector: ({ children }: any) => <View>{children}</View>,
    Gesture: {
      Tap: () => ({
        numberOfTaps: () => ({
          onEnd: () => ({
            runOnJS: () => ({}),
          }),
        }),
        maxDuration: () => ({
          onEnd: () => ({
            runOnJS: () => ({}),
          }),
        }),
      }),
      Exclusive: () => ({}),
    },
  };
});

describe('SessionCountdownScreen', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rest mode', () => {
    it('renders "Breathe" as header', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
        />
      );
      expect(getByText('Breathe')).toBeTruthy();
    });

    it('renders exercise name in Up Next card', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
        />
      );
      expect(getByText('UP NEXT')).toBeTruthy();
      expect(getByText('Planks')).toBeTruthy();
    });
  });

  describe('exercise mode', () => {
    it('renders exercise name as header', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="exercise"
          title="Planks"
          onComplete={mockOnComplete}
        />
      );
      expect(getByText('Planks')).toBeTruthy();
    });

    it('does not render Up Next card', () => {
      const { queryByText } = render(
        <SessionCountdownScreen
          mode="exercise"
          title="Planks"
          onComplete={mockOnComplete}
        />
      );
      expect(queryByText('UP NEXT')).toBeNull();
    });
  });

  describe('common behavior', () => {
    it('renders skip label correctly', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
        />
      );
      expect(getByText('Tap to skip')).toBeTruthy();
    });

    it('renders duration as initial countdown', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
          duration={20}
        />
      );
      expect(getByText('20')).toBeTruthy();
    });

    it('shows "tap to start" initially', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
        />
      );
      expect(getByText('tap timer to start')).toBeTruthy();
    });

    it('does not count down when not started', () => {
      const { getByText } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
          duration={10}
        />
      );

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Timer should still show initial value since not started
      expect(getByText('10')).toBeTruthy();
    });

    it('clears timer on unmount when running', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = render(
        <SessionCountdownScreen
          mode="rest"
          title="Planks"
          onComplete={mockOnComplete}
          autoStart={true}
        />
      );

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});