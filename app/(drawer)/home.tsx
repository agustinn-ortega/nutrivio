import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import {
  AppHeader,
  EntryCard,
  EmptyState,
  StatCard,
  ActionSheet,
} from '../../src/components';
import { getWeekDays, isToday } from '../../src/utils/dates';
import { quickSuggestions } from '../../src/mock/data';
import { FoodEntry } from '../../src/types';
import { analyzeText, isAIConfigured } from '../../src/services/ai';

/* ------------------------------------------------------------------ */
/*  HomeScreen                                                         */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    selectedDate,
    setSelectedDate,
    getEntriesForDate,
    getDayTotals,
    goals,
    addEntry,
    deleteEntry,
    setDrawerOpen,
    settings,
  } = useStore();

  const [chatText, setChatText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const inputRef = React.useRef<TextInput>(null);

  const weekDays = useMemo(
    () => getWeekDays(selectedDate, settings.firstDayOfWeek),
    [selectedDate, settings.firstDayOfWeek]
  );

  const entries = getEntriesForDate(selectedDate);
  const totals = getDayTotals(selectedDate);

  // Compute macro goals in grams from percentages
  const carbsGoalG = Math.round((goals.calories * goals.carbsPercent) / 100 / 4);
  const proteinGoalG = Math.round((goals.calories * goals.proteinPercent) / 100 / 4);
  const fatGoalG = Math.round((goals.calories * goals.fatPercent) / 100 / 9);

  const titleLabel = isToday(selectedDate) ? 'Hoy' : selectedDate;

  const handleEntryMenu = useCallback((entryId: string) => {
    setSelectedEntryId(entryId);
    setActionSheetVisible(true);
  }, []);

  const handleDeleteEntry = useCallback(() => {
    if (selectedEntryId) {
      deleteEntry(selectedEntryId);
      setSelectedEntryId(null);
    }
  }, [selectedEntryId, deleteEntry]);

  const actionSheetItems = useMemo(
    () => [
      {
        icon: 'create-outline',
        label: 'Editar Entrada',
        onPress: () => setSelectedEntryId(null),
      },
      {
        icon: 'flame-outline',
        label: 'Ajustar Calorias y Macros',
        onPress: () => setSelectedEntryId(null),
      },
      {
        icon: 'calendar-outline',
        label: 'Cambiar Fecha y Hora',
        onPress: () => setSelectedEntryId(null),
      },
      {
        icon: 'bookmark-outline',
        label: 'Guardar entrada',
        onPress: () => setSelectedEntryId(null),
      },
      {
        icon: 'trash-outline',
        label: 'Eliminar',
        onPress: handleDeleteEntry,
        danger: true,
      },
    ],
    [handleDeleteEntry]
  );

  const handleSend = useCallback(
    async (text: string) => {
      const input = text.trim();
      if (!input || isProcessing) return;

      setIsProcessing(true);
      setChatText('');

      try {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const results = await analyzeText(input);

        for (const result of results) {
          addEntry({
            title: result.title,
            description: result.description || input,
            amount: result.amount,
            calories: result.calories,
            macros: result.macros,
            time: timeStr,
            date: selectedDate,
            type: result.type,
            healthAnalysis: result.healthAnalysis,
            nutritionDetail: result.nutritionDetail,
          });
        }
      } catch (error) {
        console.warn('Error analyzing:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [addEntry, selectedDate, isProcessing]
  );

  const handleSuggestionPress = useCallback(
    (label: string) => {
      handleSend(label);
    },
    [handleSend]
  );

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <AppHeader
        title={titleLabel}
        onMenuPress={() => setDrawerOpen(true)}
        rightIcon="share-social-outline"
        onRightPress={() => {}}
        rightIcon2="people-outline"
        onRight2Press={() => {}}
      />

      {/* Week Day Selector */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={styles.dayItem}
            onPress={() => setSelectedDate(day.date)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayName,
                day.isSelected && styles.dayNameSelected,
              ]}
            >
              {day.dayName}
            </Text>
            <View
              style={[
                styles.dayCircle,
                day.isSelected && styles.dayCircleSelected,
                day.isToday && !day.isSelected && styles.dayCircleToday,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  day.isSelected && styles.dayNumberSelected,
                ]}
              >
                {day.dayNumber}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calories Card */}
        <StatCard
          title="Calorias"
          accentColor={colors.accent.primary}
          items={[
            { label: 'Comida', value: totals.foodCalories },
            { label: 'Ejercicio', value: totals.exerciseCalories },
            {
              label: 'Restante',
              value: totals.remaining,
              color: colors.accent.primary,
            },
          ]}
        />

        {/* Macros Card */}
        <View style={styles.macrosCard}>
          <View style={styles.macrosHeader}>
            <View style={[styles.macroDot, { backgroundColor: colors.macro.carbs }]} />
            <Text style={styles.macrosTitle}>Macronutrientes</Text>
          </View>
          <View style={styles.macrosRow}>
            <MacroColumn
              label="Hidratos"
              current={totals.macros.carbs}
              goal={carbsGoalG}
              color={colors.macro.carbs}
              bgColor={colors.macro.carbsMuted}
            />
            <MacroColumn
              label="Proteina"
              current={totals.macros.protein}
              goal={proteinGoalG}
              color={colors.macro.protein}
              bgColor={colors.macro.proteinMuted}
            />
            <MacroColumn
              label="Grasa"
              current={totals.macros.fat}
              goal={fatGoalG}
              color={colors.macro.fat}
              bgColor={colors.macro.fatMuted}
            />
          </View>
        </View>

        {/* Entries or Empty State */}
        {entries.length > 0 ? (
          <View style={styles.entriesSection}>
            <Text style={styles.sectionTitle}>Registro</Text>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.entryWrapper}>
                <EntryCard
                  entry={entry}
                  dailyGoalCalories={goals.calories}
                  onPress={() => {}}
                  onMenuPress={() => handleEntryMenu(entry.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="nutrition-outline"
            title="Registra tu primera comida"
            subtitle="Toca el campo de abajo para comenzar a registrar lo que comes y tu actividad fisica."
            action={
              <View style={styles.chipRow}>
                {quickSuggestions.slice(0, 3).map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(s.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipEmoji}>{s.icon}</Text>
                    <Text style={styles.chipLabel} numberOfLines={1}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        )}

        {/* Quick Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionTitle}>Sugerencias</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {quickSuggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionCard}
                onPress={() => handleSuggestionPress(s.label)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionEmoji}>{s.icon}</Text>
                <Text style={styles.suggestionLabel} numberOfLines={2}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Spacer for bottom bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={styles.bottomBarWrapper}
      >
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.inputBar}>
            <TextInput
              ref={inputRef}
              style={styles.chatInput}
              value={chatText}
              onChangeText={setChatText}
              placeholder={isProcessing ? 'Analizando...' : 'Que comiste o ejercitaste?'}
              placeholderTextColor={colors.text.tertiary}
              editable={!isProcessing}
              returnKeyType="send"
              onSubmitEditing={() => handleSend(chatText)}
              blurOnSubmit={false}
            />
            <View style={styles.inputIcons}>
              <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="image-outline" size={22} color={colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="camera-outline" size={22} color={colors.text.tertiary} />
              </TouchableOpacity>
              {chatText.trim().length > 0 ? (
                <TouchableOpacity
                  onPress={() => handleSend(chatText)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View style={styles.sendBtn}>
                    <Ionicons name="arrow-up" size={18} color={colors.text.inverse} />
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          {isProcessing && (
            <View style={styles.processingRow}>
              <View style={styles.processingDot} />
              <Text style={styles.processingText}>{isAIConfigured() ? 'Nutrivio IA esta analizando...' : 'Estimando con datos locales...'}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Action Sheet */}
      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => {
          setActionSheetVisible(false);
          setSelectedEntryId(null);
        }}
        items={actionSheetItems}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  MacroColumn helper                                                 */
/* ------------------------------------------------------------------ */

function MacroColumn({
  label,
  current,
  goal,
  color,
  bgColor,
}: {
  label: string;
  current: number;
  goal: number;
  color: string;
  bgColor: string;
}) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <View style={styles.macroCol}>
      <Text style={[styles.macroCurrent, { color }]}>{current}</Text>
      <Text style={styles.macroGoal}>/{goal} g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      {/* Mini progress bar */}
      <View style={[styles.macroBarBg, { backgroundColor: bgColor }]}>
        <View
          style={[
            styles.macroBarFill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },

  /* Week selector */
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bg.primary,
  },
  dayItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayName: {
    ...typography.small,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  dayNameSelected: {
    color: colors.accent.primary,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.accent.primary,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
  },
  dayNumber: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  dayNumberSelected: {
    color: colors.text.inverse,
    fontWeight: '700',
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  /* Macros card */
  macrosCard: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginTop: spacing.md,
  },
  macrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macrosTitle: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroCurrent: {
    ...typography.numberSmall,
  },
  macroGoal: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  macroLabel: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  macroBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* Entries */
  entriesSection: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  entryWrapper: {
    marginBottom: spacing.md,
  },

  /* Chips / Empty state suggestions */
  chipRow: {
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.base,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },

  /* Quick suggestions */
  suggestionsSection: {
    marginTop: spacing.xxl,
  },
  suggestionsScroll: {
    gap: spacing.md,
  },
  suggestionCard: {
    width: 140,
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  suggestionEmoji: {
    fontSize: 28,
  },
  suggestionLabel: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 16,
  },

  /* Bottom bar */
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chatInput: {
    flex: 1,
    ...typography.caption,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  inputIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  processingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
  processingText: {
    ...typography.small,
    color: colors.text.secondary,
  },
});
