import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface StatCardProps {
  title: string;
  items: { label: string; value: string | number; total?: number; color?: string }[];
  accentColor?: string;
}

export function StatCard({ title, items, accentColor = colors.accent.primary }: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.items}>
        {items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={[styles.value, item.color ? { color: item.color } : null]}>
              {item.total !== undefined ? (
                <>
                  <Text style={styles.value}>{item.value}</Text>
                  <Text style={styles.total}>/{item.total}</Text>
                </>
              ) : (
                item.value
              )}
            </Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  items: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
  },
  value: {
    ...typography.numberSmall,
    color: colors.text.primary,
  },
  total: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  label: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
});
