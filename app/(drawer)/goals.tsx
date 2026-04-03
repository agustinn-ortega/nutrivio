import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader } from '../../src/components';

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, setGoals } = useStore();

  const [calories, setCalories] = useState(String(goals.calories));
  const [carbsPct, setCarbsPct] = useState(String(goals.carbsPercent));
  const [proteinPct, setProteinPct] = useState(String(goals.proteinPercent));
  const [fatPct, setFatPct] = useState(String(goals.fatPercent));

  const cal = parseInt(calories, 10) || 0;
  const cp = parseInt(carbsPct, 10) || 0;
  const pp = parseInt(proteinPct, 10) || 0;
  const fp = parseInt(fatPct, 10) || 0;

  const carbsGrams = Math.round((cal * cp) / 400);
  const proteinGrams = Math.round((cal * pp) / 400);
  const fatGrams = Math.round((cal * fp) / 900);

  useEffect(() => {
    const c = parseInt(calories, 10);
    const cb = parseInt(carbsPct, 10);
    const p = parseInt(proteinPct, 10);
    const f = parseInt(fatPct, 10);
    if (c > 0) setGoals({ calories: c });
    if (cb >= 0 && cb <= 100) setGoals({ carbsPercent: cb });
    if (p >= 0 && p <= 100) setGoals({ proteinPercent: p });
    if (f >= 0 && f <= 100) setGoals({ fatPercent: f });
  }, [calories, carbsPct, proteinPct, fatPct]);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Objetivos diarios"
        onBackPress={() => router.back()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Calorie Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivo de calorias</Text>
          <View style={styles.calorieRow}>
            <TextInput
              style={styles.calorieInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor={colors.text.tertiary}
              selectionColor={colors.accent.primary}
            />
            <Text style={styles.calorieUnit}>cal</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Usa la calculadora de objetivo diario de calorias
            </Text>
          </TouchableOpacity>
        </View>

        {/* Macro Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribucion de macronutrientes</Text>
          <Text style={styles.sectionSubtitle}>
            Ajusta los porcentajes para distribuir tus calorias diarias
          </Text>

          <MacroRow
            label="Carbohidratos"
            color={colors.macro.carbs}
            bgColor={colors.macro.carbsMuted}
            percentage={carbsPct}
            grams={carbsGrams}
            onChangePercentage={setCarbsPct}
          />
          <MacroRow
            label="Proteina"
            color={colors.macro.protein}
            bgColor={colors.macro.proteinMuted}
            percentage={proteinPct}
            grams={proteinGrams}
            onChangePercentage={setProteinPct}
          />
          <MacroRow
            label="Grasa"
            color={colors.macro.fat}
            bgColor={colors.macro.fatMuted}
            percentage={fatPct}
            grams={fatGrams}
            onChangePercentage={setFatPct}
          />

          {/* Total percentage indicator */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text
              style={[
                styles.totalValue,
                cp + pp + fp !== 100 && styles.totalWarning,
              ]}
            >
              {cp + pp + fp}%
            </Text>
            {cp + pp + fp !== 100 && (
              <Text style={styles.totalHint}>
                (debe sumar 100%)
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MacroRow({
  label,
  color,
  bgColor,
  percentage,
  grams,
  onChangePercentage,
}: {
  label: string;
  color: string;
  bgColor: string;
  percentage: string;
  grams: number;
  onChangePercentage: (v: string) => void;
}) {
  return (
    <View style={styles.macroRow}>
      <View style={[styles.macroIndicator, { backgroundColor: color }]} />
      <View style={styles.macroInfo}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={[styles.macroGrams, { color }]}>{grams} g</Text>
      </View>
      <View style={[styles.macroInputContainer, { backgroundColor: bgColor }]}>
        <TextInput
          style={[styles.macroInput, { color }]}
          value={percentage}
          onChangeText={onChangePercentage}
          keyboardType="numeric"
          selectionColor={color}
          maxLength={3}
        />
        <Text style={[styles.macroPercent, { color }]}>%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.section,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  calorieInput: {
    ...typography.number,
    color: colors.accent.primary,
    flex: 1,
    padding: 0,
  },
  calorieUnit: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  linkContainer: {
    marginTop: spacing.md,
  },
  linkText: {
    ...typography.caption,
    color: colors.accent.primary,
    textDecorationLine: 'underline',
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  macroIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  macroInfo: {
    flex: 1,
  },
  macroLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  macroGrams: {
    ...typography.small,
    marginTop: spacing.xxs,
  },
  macroInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
    justifyContent: 'center',
  },
  macroInput: {
    ...typography.numberSmall,
    padding: 0,
    minWidth: 36,
    textAlign: 'right',
  },
  macroPercent: {
    ...typography.bodyMedium,
    marginLeft: spacing.xxs,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  totalLabel: {
    ...typography.bodySemibold,
    color: colors.text.secondary,
  },
  totalValue: {
    ...typography.bodySemibold,
    color: colors.semantic.success,
    marginLeft: spacing.sm,
  },
  totalWarning: {
    color: colors.semantic.warning,
  },
  totalHint: {
    ...typography.small,
    color: colors.semantic.warning,
    marginLeft: spacing.sm,
  },
});
