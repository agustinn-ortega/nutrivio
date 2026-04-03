import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlatformIonicons as Ionicons } from '../../src/components/PlatformIcon';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, ProgressBar } from '../../src/components';

interface NutrientRowData {
  label: string;
  value: string;
  indent?: boolean;
}

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useStore((s) => s.entries);
  const goals = useStore((s) => s.goals);

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Detalle" onBackPress={() => router.back()} />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.notFoundText}>Entrada no encontrada</Text>
        </View>
      </View>
    );
  }

  const totalMacrosG = entry.macros.carbs + entry.macros.protein + entry.macros.fat;
  const carbsPct = totalMacrosG > 0 ? (entry.macros.carbs / totalMacrosG) * 100 : 0;
  const proteinPct = totalMacrosG > 0 ? (entry.macros.protein / totalMacrosG) * 100 : 0;
  const fatPct = totalMacrosG > 0 ? (entry.macros.fat / totalMacrosG) * 100 : 0;

  const nd = entry.nutritionDetail;

  const nutrientRows: NutrientRowData[] = nd
    ? [
        { label: 'Carbohidratos Totales', value: `${nd.totalCarbs} g` },
        { label: 'Fibra Dietetica', value: `${nd.fiber} g`, indent: true },
        { label: 'Azucares', value: `${nd.sugars} g`, indent: true },
        { label: 'Azucares Anadidos', value: `${nd.addedSugars} g`, indent: true },
        { label: 'Alcoholes de Azucar', value: `${nd.sugarAlcohols} g`, indent: true },
        { label: 'Carbohidratos Netos', value: `${nd.netCarbs} g`, indent: true },
        { label: 'Proteina', value: `${nd.protein} g` },
        { label: 'Grasas Totales', value: `${nd.totalFat} g` },
        { label: 'Grasas Saturadas', value: `${nd.saturatedFat} g`, indent: true },
        { label: 'Grasas Trans', value: `${nd.transFat} g`, indent: true },
        { label: 'Grasas Poliinsaturadas', value: `${nd.polyunsaturatedFat} g`, indent: true },
        { label: 'Grasas Monoinsaturadas', value: `${nd.monounsaturatedFat} g`, indent: true },
        { label: 'Colesterol', value: `${nd.cholesterol} mg` },
        { label: 'Sodio', value: `${nd.sodium} mg` },
        { label: 'Calcio', value: `${nd.calcium} mg` },
        { label: 'Hierro', value: `${nd.iron} mg` },
        { label: 'Potasio', value: `${nd.potassium} mg` },
        { label: 'Vitamina A', value: `${nd.vitaminA} mcg` },
        { label: 'Vitamina C', value: `${nd.vitaminC} mg` },
        { label: 'Vitamina D', value: `${nd.vitaminD} mcg` },
      ]
    : [];

  return (
    <View style={styles.screen}>
      <AppHeader title="Detalle" onBackPress={() => router.back()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Entry Summary Card */}
        <View style={styles.card}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entrySubtitle}>
            {entry.amount} &middot; {entry.time}
          </Text>

          <View style={styles.calRow}>
            <Text style={styles.calValue}>{entry.calories}</Text>
            <Text style={styles.calLabel}>kcal</Text>
          </View>

          {/* Macros */}
          <View style={styles.macrosContainer}>
            <MacroBar
              label="Carbos"
              grams={entry.macros.carbs}
              percent={carbsPct}
              color={colors.macro.carbs}
            />
            <MacroBar
              label="Proteina"
              grams={entry.macros.protein}
              percent={proteinPct}
              color={colors.macro.protein}
            />
            <MacroBar
              label="Grasas"
              grams={entry.macros.fat}
              percent={fatPct}
              color={colors.macro.fat}
            />
          </View>
        </View>

        {/* Health Analysis Card */}
        {entry.healthAnalysis && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="heart-outline" size={18} color={colors.accent.primary} />
              <Text style={styles.cardSectionTitle}>Analisis de Salud</Text>
            </View>
            <Text style={styles.analysisText}>{entry.healthAnalysis}</Text>
          </View>
        )}

        {/* Nutrition Detail Table */}
        {nutrientRows.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="nutrition-outline" size={18} color={colors.accent.primary} />
              <Text style={styles.cardSectionTitle}>Detalle Nutricional</Text>
            </View>
            <View style={styles.nutrientTable}>
              {nutrientRows.map((row, idx) => (
                <View
                  key={row.label}
                  style={[
                    styles.nutrientRow,
                    idx % 2 === 0 && styles.nutrientRowAlt,
                  ]}
                >
                  <Text
                    style={[
                      styles.nutrientLabel,
                      row.indent && styles.nutrientIndent,
                    ]}
                  >
                    {row.label}
                  </Text>
                  <Text style={styles.nutrientValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MacroBar({
  label,
  grams,
  percent,
  color,
}: {
  label: string;
  grams: number;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={[styles.macroGrams, { color }]}>{grams} g</Text>
      </View>
      <ProgressBar progress={percent} color={color} height={6} />
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
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  entryTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  entrySubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  calRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  calValue: {
    ...typography.hero,
    color: colors.accent.primary,
  },
  calLabel: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  macrosContainer: {
    gap: spacing.lg,
  },
  macroItem: {
    gap: spacing.sm,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  macroGrams: {
    ...typography.captionMedium,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardSectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  analysisText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  nutrientTable: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  nutrientRowAlt: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.sm,
  },
  nutrientLabel: {
    ...typography.caption,
    color: colors.text.primary,
    flex: 1,
  },
  nutrientIndent: {
    paddingLeft: spacing.xl,
    color: colors.text.secondary,
  },
  nutrientValue: {
    ...typography.captionMedium,
    color: colors.text.primary,
    textAlign: 'right',
    minWidth: 70,
  },
});
