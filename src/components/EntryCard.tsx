import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import { FoodEntry } from '../types';
import { ProgressBar } from './ProgressBar';

interface EntryCardProps {
  entry: FoodEntry;
  dailyGoalCalories: number;
  onPress?: () => void;
  onMenuPress?: () => void;
}

export function EntryCard({ entry, dailyGoalCalories, onPress, onMenuPress }: EntryCardProps) {
  const calPercent = dailyGoalCalories > 0 ? (entry.calories / dailyGoalCalories) * 100 : 0;
  const isExercise = entry.type === 'exercise';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.description} numberOfLines={1}>
          {entry.description}
        </Text>
        <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{entry.title} ({entry.amount})</Text>

      <View style={styles.macroRow}>
        <MacroItem
          label="Calorias"
          value={entry.calories}
          unit=""
          color={isExercise ? colors.semantic.success : colors.macro.calories}
          percent={calPercent}
        />
        {!isExercise && (
          <>
            <MacroItem
              label="Hidratos"
              value={`${entry.macros.carbs}g`}
              color={colors.macro.carbs}
              percent={entry.macros.carbs > 0 ? (entry.macros.carbs / 250) * 100 : 0}
            />
            <MacroItem
              label="Proteina"
              value={`${entry.macros.protein}g`}
              color={colors.macro.protein}
              percent={entry.macros.protein > 0 ? (entry.macros.protein / 125) * 100 : 0}
            />
            <MacroItem
              label="Grasa"
              value={`${entry.macros.fat}g`}
              color={colors.macro.fat}
              percent={entry.macros.fat > 0 ? (entry.macros.fat / 56) * 100 : 0}
            />
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.time}>{entry.time}</Text>
        {isExercise && (
          <View style={styles.exerciseBadge}>
            <Ionicons name="flash-outline" size={12} color={colors.semantic.success} />
            <Text style={styles.exerciseLabel}>Ejercicio</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function MacroItem({
  label,
  value,
  color,
  percent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  percent: number;
}) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
      <ProgressBar progress={Math.min(percent, 100)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.small,
    color: colors.text.tertiary,
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  macroItem: {
    flex: 1,
  },
  macroLabel: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  macroValue: {
    ...typography.bodySemibold,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    ...typography.small,
    color: colors.text.tertiary,
  },
  exerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.semantic.successMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  exerciseLabel: {
    ...typography.small,
    color: colors.semantic.success,
  },
});
