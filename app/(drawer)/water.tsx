import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, ToggleRow, ProgressBar, Separator } from '../../src/components';

const QUICK_ADD_OPTIONS = [
  { label: '+100 ml', ml: 100 },
  { label: '+250 ml', ml: 250 },
  { label: '+500 ml', ml: 500 },
];

export default function WaterScreen() {
  const router = useRouter();
  const water = useStore((s) => s.water);
  const settings = useStore((s) => s.settings);
  const setWaterEnabled = useStore((s) => s.setWaterEnabled);
  const addWater = useStore((s) => s.addWater);
  const resetDailyWater = useStore((s) => s.resetDailyWater);

  const isLiters = settings.liquidUnit === 'L';
  const currentDisplay = isLiters
    ? (water.currentMl / 1000).toFixed(1)
    : (water.currentMl / 29.5735).toFixed(0);
  const goalDisplay = isLiters
    ? (water.dailyGoalMl / 1000).toFixed(1)
    : (water.dailyGoalMl / 29.5735).toFixed(0);
  const unitLabel = isLiters ? 'L' : 'oz';
  const progress = water.dailyGoalMl > 0 ? (water.currentMl / water.dailyGoalMl) * 100 : 0;
  const clampedProgress = Math.min(progress, 100);

  // Ring dimensions
  const RING_SIZE = 200;
  const STROKE_WIDTH = 12;
  const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (clampedProgress / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.screen}>
      <AppHeader title="Rastreador de agua" onBackPress={() => router.back()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <ToggleRow
            label="Rastrear consumo de agua"
            subtitle="Registra tu ingesta diaria de agua"
            value={water.enabled}
            onValueChange={setWaterEnabled}
          />
        </View>

        {water.enabled && (
          <>
            {/* Progress Ring */}
            <View style={styles.ringContainer}>
              <View style={styles.ringWrapper}>
                <View style={styles.svgRing}>
                  {/* Background ring */}
                  <View
                    style={[
                      styles.ringTrack,
                      {
                        width: RING_SIZE,
                        height: RING_SIZE,
                        borderRadius: RING_SIZE / 2,
                        borderWidth: STROKE_WIDTH,
                        borderColor: colors.surface.elevated,
                      },
                    ]}
                  />
                  {/* Progress ring using a rotated bordered view trick */}
                  <View
                    style={[
                      styles.ringProgressContainer,
                      { width: RING_SIZE, height: RING_SIZE },
                    ]}
                  >
                    {/* We use a simpler approach: overlapping half-circles */}
                    <View
                      style={[
                        styles.ringHalf,
                        {
                          width: RING_SIZE,
                          height: RING_SIZE,
                          borderRadius: RING_SIZE / 2,
                          borderWidth: STROKE_WIDTH,
                          borderColor: 'transparent',
                          borderTopColor: colors.accent.primary,
                          borderRightColor:
                            clampedProgress > 25 ? colors.accent.primary : 'transparent',
                          borderBottomColor:
                            clampedProgress > 50 ? colors.accent.primary : 'transparent',
                          borderLeftColor:
                            clampedProgress > 75 ? colors.accent.primary : 'transparent',
                          transform: [{ rotate: '-45deg' }],
                        },
                      ]}
                    />
                  </View>
                </View>
                {/* Center text */}
                <View style={styles.ringCenter}>
                  <Ionicons
                    name="water"
                    size={28}
                    color={colors.accent.primary}
                    style={{ marginBottom: spacing.xs }}
                  />
                  <Text style={styles.ringCurrentValue}>
                    {currentDisplay}
                  </Text>
                  <Text style={styles.ringDivider}>
                    de {goalDisplay} {unitLabel}
                  </Text>
                  <Text style={styles.ringPercent}>{Math.round(progress)}%</Text>
                </View>
              </View>
            </View>

            {/* Linear progress bar as secondary indicator */}
            <View style={styles.progressBarSection}>
              <View style={styles.progressBarLabels}>
                <Text style={styles.progressBarLabel}>Progreso diario</Text>
                <Text style={styles.progressBarValue}>
                  {currentDisplay} / {goalDisplay} {unitLabel}
                </Text>
              </View>
              <ProgressBar
                progress={clampedProgress}
                height={8}
                color={
                  progress >= 100 ? colors.semantic.success : colors.accent.primary
                }
              />
            </View>

            {/* Quick add buttons */}
            <View style={styles.quickAddSection}>
              <Text style={styles.sectionTitle}>Agregar agua</Text>
              <View style={styles.quickAddRow}>
                {QUICK_ADD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.ml}
                    style={styles.quickAddPill}
                    onPress={() => addWater(option.ml)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={colors.accent.primary}
                      style={{ marginRight: spacing.xxs }}
                    />
                    <Text style={styles.quickAddText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Daily goal info */}
            <View style={styles.card}>
              <View style={styles.goalRow}>
                <View style={styles.goalLeft}>
                  <View style={styles.goalIconWrap}>
                    <Ionicons name="flag" size={18} color={colors.accent.primary} />
                  </View>
                  <View>
                    <Text style={styles.goalLabel}>Meta diaria</Text>
                    <Text style={styles.goalValue}>
                      {goalDisplay} {unitLabel}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text
                    style={[
                      styles.statusText,
                      progress >= 100 && styles.statusComplete,
                    ]}
                  >
                    {progress >= 100 ? 'Completado' : 'En progreso'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Reset button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetDailyWater}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.semantic.error}
                style={{ marginRight: spacing.sm }}
              />
              <Text style={styles.resetText}>Reiniciar conteo del dia</Text>
            </TouchableOpacity>
          </>
        )}
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
  card: {
    backgroundColor: colors.surface.base,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  ringContainer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  ringWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
  },
  ringProgressContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringHalf: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCurrentValue: {
    ...typography.hero,
    color: colors.text.primary,
  },
  ringDivider: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  ringPercent: {
    ...typography.smallMedium,
    color: colors.accent.primary,
    marginTop: spacing.xs,
  },
  progressBarSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressBarLabel: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  progressBarValue: {
    ...typography.captionMedium,
    color: colors.text.primary,
  },
  quickAddSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAddPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.primaryMuted,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.25)',
  },
  quickAddText: {
    ...typography.captionMedium,
    color: colors.accent.primary,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  goalValue: {
    ...typography.bodySemibold,
    color: colors.text.primary,
    marginTop: spacing.xxs,
  },
  statusBadge: {
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {
    ...typography.smallMedium,
    color: colors.text.secondary,
  },
  statusComplete: {
    color: colors.semantic.success,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.semantic.errorMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  resetText: {
    ...typography.captionMedium,
    color: colors.semantic.error,
  },
});
