import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ToggleRowProps {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export function ToggleRow({ label, subtitle, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.surface.elevated,
          true: colors.accent.primaryMuted,
        }}
        thumbColor={value ? colors.accent.primary : colors.text.tertiary}
        ios_backgroundColor={colors.surface.elevated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  labelContainer: {
    flex: 1,
    marginRight: spacing.lg,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
});
