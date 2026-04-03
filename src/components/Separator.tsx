import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export function Separator() {
  return <View style={styles.line} />;
}

export function SectionSeparator() {
  return <View style={styles.section} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.lg,
  },
  section: {
    height: 8,
    backgroundColor: colors.bg.primary,
  },
});
