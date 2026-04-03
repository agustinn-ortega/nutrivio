import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlatformIonicons as Ionicons } from './PlatformIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';

interface AppHeaderProps {
  title: string;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightIcon2?: string;
  onRight2Press?: () => void;
}

export function AppHeader({
  title,
  onMenuPress,
  onBackPress,
  rightIcon,
  onRightPress,
  rightIcon2,
  onRight2Press,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.left}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={26} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {rightIcon2 && (
          <TouchableOpacity onPress={onRight2Press} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name={rightIcon2} size={22} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={22} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg.primary,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
