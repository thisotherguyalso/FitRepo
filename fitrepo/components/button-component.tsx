import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppColors, sharedStyles } from '@/constants/styles';
  
interface ButtonComponentProps {
  onPress: () => void;
  text: string;
  
  selected?: boolean;
  disabled?: boolean;

  style?: object;
  textStyle?: object;
}

export function ButtonComponent({onPress, text, selected, disabled, style, textStyle}: ButtonComponentProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={style ? [style] : [sharedStyles.button, styles.presetButton]}
      onPress={onPress}>
      <Text style={textStyle ?
        [textStyle, selected && styles.selectedButtonText] :
        [sharedStyles.buttonText, styles.buttonText, selected && styles.selectedButtonText]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 20,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: AppColors.primaryDark,
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: AppColors.secondary,
    marginBottom: 20,
  },
  selectedButton: {
    backgroundColor: 'rgb(0,184,255)',
  },
  selectedButtonText: {
    color: 'rgb(0,31,43)',
  },
  buttonText: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 36,
  },
  backButton: {
    backgroundColor: AppColors.danger,
    marginBottom: 24,
  },
});
