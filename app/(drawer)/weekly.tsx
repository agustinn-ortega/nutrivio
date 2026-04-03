import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, TabSwitcher } from '../../src/components';
import { getWeekRange, formatDate } from '../../src/utils/dates';
import { mockWeeklySummary } from '../../src/mock/data';

const TABS = ['Esta semana', 'Semana pasada', 'Hace 2 semanas'];
const DAY_NAMES = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const names = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  return names[day];
}

function formatRangeDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const dayNames = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const monthNames = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ];
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default function WeeklyScreen() {
  const router = useRouter();
  const { goals, weightEntries } = useStore();
  const [activeTab, setActiveTab] = useState(0);

  const weekOffset = -activeTab; // 0 = this week, -1 = last week, etc.
  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  // Use mock data for current week, generate empty for others
  const weekData = useMemo(() => {
    if (activeTab === 0) return mockWeeklySummary;
    return weekRange.days.map((date) => ({
      date,
      calories: { food: 0, exercise: 0 },
      macros: { carbs: 0, protein: 0, fat: 0 },
    }));
  }, [activeTab, weekRange]);

  const daysLogged = weekData.filter((d) => d.calories.food > 0).length;

  const totalFood = weekData.reduce((s, d) => s + d.calories.food, 0);
  const totalExercise = weekData.reduce((s, d) => s + d.calories.exercise, 0);
  const totalBudget = goals.calories * 7;
  const netCalories = totalFood - totalExercise;
  const budgetDiff = totalBudget - netCalories;

  const totalCarbs = weekData.reduce((s, d) => s + d.macros.carbs, 0);
  const totalProtein = weekData.reduce((s, d) => s + d.macros.protein, 0);
  const totalFat = weekData.reduce((s, d) => s + d.macros.fat, 0);

  const weekWeightEntries = weightEntries.filter((w) =>
    weekRange.days.includes(w.date)
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Resumen semanal"
        onBackPress={() => router.back()}
        rightIcon="share-outline"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TabSwitcher
            tabs={TABS}
            activeIndex={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        {/* Date Range */}
        <Text style={styles.dateRange}>
          {formatRangeDate(weekRange.start)} - {formatRangeDate(weekRange.end)}
        </Text>

        {/* Summary Highlights */}
        <View style={styles.highlightCard}>
          <Text style={styles.highlightText}>
            {budgetDiff >= 0 ? (
              <>
                <Text style={styles.highlightValue}>
                  {budgetDiff.toLocaleString()}
                </Text>{' '}
                calorias por debajo del presupuesto esta semana
              </>
            ) : (
              <>
                <Text style={[styles.highlightValue, { color: colors.semantic.error }]}>
                  {Math.abs(budgetDiff).toLocaleString()}
                </Text>{' '}
                calorias por encima del presupuesto esta semana
              </>
            )}
          </Text>
        </View>

        <Text style={styles.daysLogged}>
          {daysLogged} de 7 dias registrados esta semana
        </Text>

        {/* Calories Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>Calorias</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.dayCol]}>Dia</Text>
              <Text style={[styles.tableHeaderCell, styles.dateCol]}>Fecha</Text>
              <Text style={[styles.tableHeaderCell, styles.numCol]}>Comida</Text>
              <Text style={[styles.tableHeaderCell, styles.numCol]}>Ejercicio</Text>
              <Text style={[styles.tableHeaderCell, styles.numCol]}>Restante</Text>
            </View>

            {/* Rows */}
            {weekData.map((day, i) => {
              const remaining = goals.calories - day.calories.food + day.calories.exercise;
              const hasData = day.calories.food > 0;
              return (
                <View
                  key={day.date}
                  style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                >
                  <Text style={[styles.tableCell, styles.dayCol, styles.dayText]}>
                    {getDayName(day.date)}
                  </Text>
                  <Text style={[styles.tableCell, styles.dateCol]}>
                    {formatDate(day.date)}
                  </Text>
                  <Text style={[styles.tableCell, styles.numCol]}>
                    {hasData ? day.calories.food.toLocaleString() : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.numCol]}>
                    {hasData ? day.calories.exercise.toLocaleString() : '-'}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.numCol,
                      hasData && remaining >= 0 && styles.positiveValue,
                      hasData && remaining < 0 && styles.negativeValue,
                    ]}
                  >
                    {hasData ? remaining.toLocaleString() : '-'}
                  </Text>
                </View>
              );
            })}

            {/* Total Row */}
            <View style={styles.tableTotalRow}>
              <Text style={[styles.tableTotalCell, styles.dayCol]}>Total</Text>
              <Text style={[styles.tableTotalCell, styles.dateCol]} />
              <Text style={[styles.tableTotalCell, styles.numCol]}>
                {totalFood.toLocaleString()}
              </Text>
              <Text style={[styles.tableTotalCell, styles.numCol]}>
                {totalExercise.toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.tableTotalCell,
                  styles.numCol,
                  budgetDiff >= 0 ? styles.positiveValue : styles.negativeValue,
                ]}
              >
                {(totalBudget - totalFood + totalExercise).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Macronutrients Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>Macronutrientes</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.dayCol]}>Dia</Text>
              <Text style={[styles.tableHeaderCell, styles.dateCol]}>Fecha</Text>
              <Text style={[styles.tableHeaderCell, styles.numCol, { color: colors.macro.carbs }]}>
                Hidratos
              </Text>
              <Text style={[styles.tableHeaderCell, styles.numCol, { color: colors.macro.protein }]}>
                Proteina
              </Text>
              <Text style={[styles.tableHeaderCell, styles.numCol, { color: colors.macro.fat }]}>
                Grasa
              </Text>
            </View>

            {/* Rows */}
            {weekData.map((day, i) => {
              const hasData = day.calories.food > 0;
              return (
                <View
                  key={day.date}
                  style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                >
                  <Text style={[styles.tableCell, styles.dayCol, styles.dayText]}>
                    {getDayName(day.date)}
                  </Text>
                  <Text style={[styles.tableCell, styles.dateCol]}>
                    {formatDate(day.date)}
                  </Text>
                  <Text style={[styles.tableCell, styles.numCol]}>
                    {hasData ? `${day.macros.carbs}g` : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.numCol]}>
                    {hasData ? `${day.macros.protein}g` : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.numCol]}>
                    {hasData ? `${day.macros.fat}g` : '-'}
                  </Text>
                </View>
              );
            })}

            {/* Total Row */}
            <View style={styles.tableTotalRow}>
              <Text style={[styles.tableTotalCell, styles.dayCol]}>Total</Text>
              <Text style={[styles.tableTotalCell, styles.dateCol]} />
              <Text style={[styles.tableTotalCell, styles.numCol]}>
                {totalCarbs}g
              </Text>
              <Text style={[styles.tableTotalCell, styles.numCol]}>
                {totalProtein}g
              </Text>
              <Text style={[styles.tableTotalCell, styles.numCol]}>
                {totalFat}g
              </Text>
            </View>
          </View>
        </View>

        {/* Weight Section */}
        {weekWeightEntries.length > 0 && (
          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>Peso</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Fecha</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>
                  Peso
                </Text>
              </View>
              {weekWeightEntries.map((entry, i) => (
                <View
                  key={entry.id}
                  style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                >
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {getDayName(entry.date)} {formatDate(entry.date)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                    {entry.weight} kg
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.noteText}>
            * Basado en un objetivo diario de {goals.calories.toLocaleString()} calorias
          </Text>
          <Text style={styles.noteText}>
            * Basado en una distribucion diaria de macronutrientes de{' '}
            {goals.carbsPercent}% carbohidratos, {goals.proteinPercent}% proteinas y{' '}
            {goals.fatPercent}% grasas
          </Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.section,
  },
  tabContainer: {
    marginTop: spacing.md,
  },
  dateRange: {
    ...typography.captionMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  highlightCard: {
    backgroundColor: colors.semantic.successMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  highlightText: {
    ...typography.body,
    color: colors.semantic.success,
    textAlign: 'center',
  },
  highlightValue: {
    ...typography.bodySemibold,
    color: colors.semantic.success,
  },
  daysLogged: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  tableSection: {
    marginBottom: spacing.xxl,
  },
  tableTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  table: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    backgroundColor: colors.surface.elevated,
  },
  tableHeaderCell: {
    ...typography.smallMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tableRowAlt: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tableCell: {
    ...typography.small,
    color: colors.text.primary,
  },
  dayCol: {
    width: 36,
  },
  dateCol: {
    flex: 1,
    paddingLeft: spacing.xs,
  },
  numCol: {
    width: 68,
    textAlign: 'right',
  },
  dayText: {
    ...typography.smallMedium,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  positiveValue: {
    color: colors.semantic.success,
  },
  negativeValue: {
    color: colors.semantic.error,
  },
  tableTotalRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.surface.elevated,
  },
  tableTotalCell: {
    ...typography.smallMedium,
    color: colors.text.primary,
  },
  notesSection: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  noteText: {
    ...typography.small,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
