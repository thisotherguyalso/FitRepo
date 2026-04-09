import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SessionCountdownScreen } from '@/components/session-countdown-screen';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
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
      }),
    },
  };
});

describe('SessionCountdownScreen', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders title correctly', () => {
    const { getByText } = render(
      <SessionCountdownScreen
        title="Get Ready"
        nextRoute="/session-screens/breathe"
        skipLabel="Double tap to skip"/>
    );
    expect(getByText('Get Ready')).toBeTruthy();
  });

  it('renders skip label correctly', () => {
    const { getByText } = render(
      <SessionCountdownScreen
        title="Get Ready"
        nextRoute="/session-screens/breathe"
        skipLabel="Double tap to skip"/>
    );
    expect(getByText('Double tap to skip')).toBeTruthy();
  });

  it('renders default duration as initial countdown', () => {
    const { getByText } = render(
      <SessionCountdownScreen
        title="Get Ready"
        nextRoute="/session-screens/breathe"
        skipLabel="Double tap to skip"
        duration={20}/>
    );
    expect(getByText('20')).toBeTruthy();
  });

  it('counts down over time', async () => {
    const { getByText } = render(
      <SessionCountdownScreen
        title="Get Ready"
        nextRoute="/session-screens/breathe"
        skipLabel="Double tap to skip"
        duration={10}/>
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
      jest.runOnlyPendingTimers();});
    expect(getByText('9')).toBeTruthy();
  });

  it('changes screen when countdown reaches zero', () => {
    render(
      <SessionCountdownScreen
        title="Get Ready"
        nextRoute="/session-screens/breathe"
        skipLabel="Double tap to skip"
        duration={3}/>
    );

    act(() => jest.advanceTimersByTime(3000));
    expect(mockReplace).toHaveBeenCalledWith('/session-screens/breathe');
  });

  it('clears timer on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(
      <SessionCountdownScreen
        title="Get Ready"
        nextRoute="/session-screens/breathe"
        skipLabel="Double tap to skip"/>
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

});

