import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) {
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    styles[`textVariant_${variant}`],
    disabled && styles.textDisabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
  },
  variant_primary: {
    backgroundColor: colors.accent.primary,
  },
  variant_secondary: {
    backgroundColor: colors.surface.elevated,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    ...typography.bodySemibold,
  },
  text_sm: {
    ...typography.captionMedium,
  },
  text_md: {
    ...typography.bodySemibold,
  },
  text_lg: {
    ...typography.bodySemibold,
    fontSize: 17,
  },
  textVariant_primary: {
    color: colors.text.inverse,
  },
  textVariant_secondary: {
    color: colors.text.primary,
  },
  textVariant_outline: {
    color: colors.text.primary,
  },
  textVariant_ghost: {
    color: colors.accent.primary,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});
