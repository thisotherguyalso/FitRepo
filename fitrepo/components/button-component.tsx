import React from 'react'
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native'

import { AppColors, sharedStyles } from '@/constants/styles'

interface ButtonComponentProps {
  onPress: () => void
  text: string
  selected?: boolean
  disabled?: boolean
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}

export function ButtonComponent({
  onPress,
  text,
  selected,
  disabled,
  style,
  textStyle,
}: ButtonComponentProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        sharedStyles.button,
        styles.buttonBase,
        selected && styles.selectedButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          sharedStyles.buttonText,
          styles.buttonText,
          selected && styles.selectedButtonText,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 6,
  },
  pressedButton: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  disabledButton: {
    opacity: 0.52,
    elevation: 0,
    shadowOpacity: 0,
  },
  selectedButton: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.borderStrong,
  },
  buttonText: {
    fontSize: 17,
  },
  selectedButtonText: {
    color: AppColors.background,
  },
  disabledText: {
    color: 'rgba(255, 248, 241, 0.76)',
  },
})
