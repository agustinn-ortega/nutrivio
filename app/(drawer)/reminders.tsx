import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PlatformIonicons as Ionicons } from '../../src/components/PlatformIcon';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, ToggleRow } from '../../src/components';

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, toggleReminder } = useStore();

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Recordatorios"
        onBackPress={() => router.back()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {reminders.map((reminder, index) => (
            <View key={reminder.id}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.reminderRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={
                      reminder.id === 'morning'
                        ? 'sunny-outline'
                        : reminder.id === 'afternoon'
                          ? 'partly-sunny-outline'
                          : 'moon-outline'
                    }
                    size={20}
                    color={colors.accent.primary}
                  />
                </View>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{reminder.label}</Text>
                  <Text style={styles.time}>{reminder.time}</Text>
                </View>
                <ToggleRow
                  label=""
                  value={reminder.enabled}
                  onValueChange={() => toggleReminder(reminder.id)}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          Recibe notificaciones para recordarte registrar tus comidas durante el dia.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  card: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.lg,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  time: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
});
