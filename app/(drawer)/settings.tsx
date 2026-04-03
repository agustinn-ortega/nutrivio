import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, SettingsRow, Separator } from '../../src/components';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const toggleLiquidUnit = () => {
    updateSettings({ liquidUnit: settings.liquidUnit === 'L' ? 'oz' : 'L' });
  };

  const toggleWeightUnit = () => {
    updateSettings({ weightUnit: settings.weightUnit === 'kg' ? 'lb' : 'kg' });
  };

  const toggleFirstDay = () => {
    updateSettings({
      firstDayOfWeek:
        settings.firstDayOfWeek === 'Monday' ? 'Sunday' : 'Monday',
    });
  };

  const firstDayLabel =
    settings.firstDayOfWeek === 'Monday' ? 'Lunes' : 'Domingo';

  return (
    <View style={styles.screen}>
      <AppHeader title="Configuracion" onBackPress={() => router.back()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Subscription section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>SUSCRIPCION</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.subscriptionRow}>
            <View style={styles.subscriptionLeft}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Plan gratuito</Text>
              </View>
            </View>
          </View>
          <Separator />
          <SettingsRow
            icon="diamond-outline"
            label="Actualizar a Premium"
            value="Quedan 20 registros gratis"
            onPress={() => router.push('/(drawer)/premium')}
          />
        </View>

        {/* Units section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>UNIDADES Y PREFERENCIAS</Text>
        </View>
        <View style={styles.card}>
          <SettingsRow
            icon="water-outline"
            label="Unidad de liquidos"
            value={settings.liquidUnit === 'L' ? 'Litros (L)' : 'Onzas (oz)'}
            onPress={toggleLiquidUnit}
          />
          <Separator />
          <SettingsRow
            icon="fitness-outline"
            label="Unidad de peso"
            value={settings.weightUnit === 'kg' ? 'Kilogramos (kg)' : 'Libras (lb)'}
            onPress={toggleWeightUnit}
          />
          <Separator />
          <SettingsRow
            icon="calendar-outline"
            label="Primer dia de la semana"
            value={firstDayLabel}
            onPress={toggleFirstDay}
          />
        </View>

        {/* Notifications section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>GENERAL</Text>
        </View>
        <View style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            label="Notificaciones"
            onPress={() => router.push('/(drawer)/reminders')}
          />
        </View>
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
    paddingBottom: spacing.section,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  card: {
    backgroundColor: colors.surface.base,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  planBadge: {
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  planBadgeText: {
    ...typography.smallMedium,
    color: colors.text.secondary,
  },
});
