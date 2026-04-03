import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ModalSheet({ visible, onClose, title, children }: ModalSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface ActionSheetItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
}

export function ActionSheet({ visible, onClose, items }: ActionSheetProps) {
  const Ionicons = require('@expo/vector-icons').Ionicons;
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.actionItem}
          onPress={() => {
            item.onPress();
            onClose();
          }}
          activeOpacity={0.6}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={item.danger ? colors.semantic.error : colors.text.primary}
          />
          <Text style={[styles.actionLabel, item.danger && styles.dangerLabel]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: spacing.xxxxl,
    paddingTop: spacing.md,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.medium,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  actionLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  dangerLabel: {
    color: colors.semantic.error,
  },
});
