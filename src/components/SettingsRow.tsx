import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface SettingsRowProps {
  icon?: string; // Ionicons name
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={!onPress}
    >
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon as any}
              size={20}
              color={danger ? colors.semantic.error : colors.text.secondary}
            />
          </View>
        )}
        <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
      </View>
      <View style={styles.right}>
        {value && <Text style={styles.value}>{value}</Text>}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
        )}
      </View>
    </TouchableOpacity>
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  dangerLabel: {
    color: colors.semantic.error,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
