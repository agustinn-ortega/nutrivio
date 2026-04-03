import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface TabSwitcherProps {
  tabs: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

export function TabSwitcher({ tabs, activeIndex, onTabChange }: TabSwitcherProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.tab, activeIndex === i && styles.activeTab]}
          onPress={() => onTabChange(i)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeIndex === i && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface.base,
    borderRadius: radius.md,
    padding: spacing.xxs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  activeTab: {
    backgroundColor: colors.surface.elevated,
  },
  tabText: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.accent.primary,
  },
});
