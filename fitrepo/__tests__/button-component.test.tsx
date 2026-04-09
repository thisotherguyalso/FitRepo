import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ButtonComponent } from '@/components/button-component';

describe('ButtonComponent', () => {

  {/* Test if button has the right title */}
  it('renders the correct title', () => {
    const { getByText } = 
      render(<ButtonComponent text="Click Me" onPress={() => {}} />)
    expect(getByText('Click Me')).toBeTruthy();
  })

  {/* Test if button is pressed */}
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = 
      render(<ButtonComponent text="Click Me" onPress={onPressMock} />)
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalled();
  })

  {/* Test if button is not pressed */}
  it('does not call onPress when not pressed', () => {
    const onPressMock = jest.fn();
    render(<ButtonComponent text="Click Me" onPress={onPressMock} />)
    expect(onPressMock).not.toHaveBeenCalled();
  })

});