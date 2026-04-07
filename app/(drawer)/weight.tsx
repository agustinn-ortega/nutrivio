import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { EmptyState, ModalSheet, Button } from '../../src/components';
import { formatDateLong } from '../../src/utils/dates';

// ---------------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------------

type Range = 'week' | 'month' | 'year' | 'all';

const RANGE_LABELS: Record<Range, string> = {
  week: 'Semana',
  month: 'Mes',
  year: 'Año',
  all: 'Todo',
};

function getStartDate(range: Range): Date | null {
  const now = new Date();
  switch (range) {
    case 'week': return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case 'all': return null;
  }
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// ---------------------------------------------------------------------------
// Chart component (inline SVG on web, simple text on native)
// ---------------------------------------------------------------------------

function WeightChart({
  entries,
  goalWeight,
}: {
  entries: Array<{ weight: number; date: string }>;
  goalWeight: number | null;
}) {
  if (entries.length === 0) {
    return (
      <View style={ch.empty}>
        <Text style={ch.emptyText}>Sin datos para mostrar</Text>
      </View>
    );
  }

  const W = 320;
  const H = 180;
  const PAD_L = 38;
  const PAD_R = 30;
  const PAD_T = 14;
  const PAD_B = 26;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const weights = entries.map((e) => e.weight);
  if (goalWeight != null) weights.push(goalWeight);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);
  const rangeW = maxW - minW || 1;

  // X positions
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const toX = (i: number) => PAD_L + (sorted.length === 1 ? plotW / 2 : (i / (sorted.length - 1)) * plotW);
  const toY = (w: number) => PAD_T + plotH - ((w - minW) / rangeW) * plotH;

  // Y axis labels (5 steps)
  const ySteps = 5;
  const yLabels: number[] = [];
  for (let i = 0; i <= ySteps; i++) {
    yLabels.push(Math.round(minW + (rangeW * i) / ySteps));
  }

  // Build SVG
  const gridLines = yLabels
    .map((v) => {
      const y = toY(v);
      return `<line x1="${PAD_L}" y1="${y}" x2="${W - PAD_R}" y2="${y}" stroke="${colors.border.subtle}" stroke-width="0.5"/>`;
    })
    .join('');

  const yLabelsSvg = yLabels
    .map((v) => {
      const y = toY(v);
      return `<text x="${PAD_L - 6}" y="${y + 4}" text-anchor="end" fill="${colors.text.tertiary}" font-size="10">${v}</text>`;
    })
    .join('');

  // X labels (first, middle, last)
  const xIdxs = sorted.length <= 3
    ? sorted.map((_, i) => i)
    : [0, Math.floor(sorted.length / 2), sorted.length - 1];
  const xLabelsSvg = xIdxs
    .map((i) => `<text x="${toX(i)}" y="${H - 4}" text-anchor="middle" fill="${colors.text.tertiary}" font-size="10">${formatShortDate(sorted[i].date)}</text>`)
    .join('');

  // Data points & line
  const points = sorted.map((e, i) => `${toX(i)},${toY(e.weight)}`).join(' ');
  const polyline = sorted.length > 1
    ? `<polyline points="${points}" fill="none" stroke="${colors.accent.primary}" stroke-width="2" stroke-linejoin="round"/>`
    : '';
  const dots = sorted
    .map((e, i) => `<circle cx="${toX(i)}" cy="${toY(e.weight)}" r="5" fill="${colors.accent.primary}" stroke="${colors.bg.primary}" stroke-width="2"/>`)
    .join('');

  // Goal line
  const goalLine = goalWeight != null
    ? `<line x1="${PAD_L}" y1="${toY(goalWeight)}" x2="${W - PAD_R}" y2="${toY(goalWeight)}" stroke="${colors.semantic.success}" stroke-width="1.5" stroke-dasharray="6,4"/>
       <text x="${W - PAD_R + 2}" y="${toY(goalWeight) + 3}" fill="${colors.semantic.success}" font-size="9">Meta</text>`
    : '';

  const svg = `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    ${gridLines}${yLabelsSvg}${xLabelsSvg}${goalLine}${polyline}${dots}
  </svg>`;

  if (Platform.OS === 'web') {
    // Use a raw div because RN Web View doesn't support dangerouslySetInnerHTML
    const DivComponent = 'div' as any;
    return (
      <View style={ch.container}>
        <DivComponent
          style={{ width: '100%', height: H }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </View>
    );
  }

  // Native fallback: simple text list
  return (
    <View style={ch.nativeFallback}>
      {sorted.map((e, i) => (
        <Text key={i} style={ch.nativeItem}>
          {formatShortDate(e.date)}: {e.weight} kg
        </Text>
      ))}
    </View>
  );
}

const ch = StyleSheet.create({
  container: { width: '100%', paddingVertical: 8 },
  svgWrap: { width: '100%', height: 180 },
  empty: { height: 140, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: colors.text.tertiary },
  nativeFallback: { paddingVertical: 12, paddingHorizontal: 8 },
  nativeItem: { fontSize: 14, color: colors.text.secondary, marginBottom: 4 },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function WeightScreen() {
  const router = useRouter();
  const {
    weightEntries,
    weightGoal,
    settings,
    addWeightEntry,
    deleteWeightEntry,
    setWeightGoal,
  } = useStore();

  const [range, setRange] = useState<Range>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputTime, setInputTime] = useState(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );
  const [goalInput, setGoalInput] = useState('');

  const unit = settings.weightUnit;

  // Sort all entries newest first
  const sortedAll = useMemo(
    () =>
      [...weightEntries].sort((a, b) => {
        const dc = b.date.localeCompare(a.date);
        return dc !== 0 ? dc : b.time.localeCompare(a.time);
      }),
    [weightEntries]
  );

  // Filter by range
  const filteredEntries = useMemo(() => {
    const start = getStartDate(range);
    if (!start) return sortedAll;
    const startStr = start.toISOString().split('T')[0];
    return sortedAll.filter((e) => e.date >= startStr);
  }, [sortedAll, range]);

  // Current weight = most recent
  const currentWeight = sortedAll.length > 0 ? sortedAll[0].weight : null;

  // Handlers
  const handleSaveEntry = () => {
    const w = parseFloat(inputWeight);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Error', 'Ingresa un peso valido.');
      return;
    }
    addWeightEntry(w, inputDate, inputTime);
    setShowAddModal(false);
    setInputWeight('');
  };

  const handleSaveGoal = () => {
    const t = parseFloat(goalInput);
    if (isNaN(t) || t <= 0) {
      Alert.alert('Error', 'Ingresa un peso objetivo valido.');
      return;
    }
    setWeightGoal(t);
    setShowGoalModal(false);
    setGoalInput('');
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Eliminar esta entrada?')) deleteWeightEntry(id);
    } else {
      Alert.alert('Eliminar entrada', 'Estas seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteWeightEntry(id) },
      ]);
    }
  };

  const openAddModal = () => {
    setInputWeight('');
    setInputDate(new Date().toISOString().split('T')[0]);
    setInputTime(
      `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    );
    setShowAddModal(true);
  };

  const openGoalModal = () => {
    setGoalInput(weightGoal.target ? String(weightGoal.target) : '');
    setShowGoalModal(true);
  };

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push('/(drawer)/home')} style={s.headerBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Seguimiento de peso</Text>
        <TouchableOpacity onPress={openAddModal} style={s.headerBtn} activeOpacity={0.6}>
          <Ionicons name="add" size={28} color={colors.accent.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={s.cardsRow}>
          <View style={s.card}>
            <Text style={s.cardLabel}>Peso actual</Text>
            <Text style={s.cardValue}>
              {currentWeight != null ? `${currentWeight} ${unit}` : '—'}
            </Text>
          </View>
          <TouchableOpacity style={s.card} onPress={openGoalModal} activeOpacity={0.7}>
            <View style={s.cardTopRow}>
              <Text style={s.cardLabel}>Peso objetivo</Text>
              <Ionicons name="create-outline" size={14} color={colors.text.tertiary} />
            </View>
            <Text style={s.cardValue}>
              {weightGoal.target != null ? `${weightGoal.target} ${unit}` : '—'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Range selector */}
        <View style={s.rangeRow}>
          {(['week', 'month', 'year', 'all'] as Range[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[s.rangeTab, range === r && s.rangeTabActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.7}
            >
              <Text style={[s.rangeText, range === r && s.rangeTextActive]}>
                {RANGE_LABELS[r]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={s.chartBox}>
          <WeightChart
            entries={filteredEntries.map((e) => ({ weight: e.weight, date: e.date }))}
            goalWeight={weightGoal.target}
          />
        </View>

        {/* Entries list */}
        <Text style={s.sectionTitle}>Entradas de peso</Text>

        {filteredEntries.length === 0 ? (
          <EmptyState
            icon="scale-outline"
            title="Sin entradas en este periodo"
            action={
              <TouchableOpacity onPress={openAddModal}>
                <Text style={s.addLink}>Agregar peso</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={s.entries}>
            {filteredEntries.map((entry) => (
              <View key={entry.id} style={s.entryRow}>
                <View style={s.entryInfo}>
                  <Text style={s.entryWeight}>{entry.weight} {unit}</Text>
                  <Text style={s.entryDate}>{formatDateLong(entry.date)}{entry.time ? ` ${entry.time}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(entry.id)} style={s.deleteBtn} activeOpacity={0.6}>
                  <Ionicons name="trash-outline" size={16} color={colors.semantic.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Weight Modal */}
      <ModalSheet visible={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar peso">
        <View style={s.modalContent}>
          <Text style={s.inputLabel}>Peso ({unit})</Text>
          <TextInput
            style={s.textInput}
            value={inputWeight}
            onChangeText={setInputWeight}
            placeholder="0.0"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            autoFocus
          />
          <Text style={s.inputLabel}>Fecha</Text>
          <TextInput
            style={s.textInput}
            value={inputDate}
            onChangeText={setInputDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text.tertiary}
          />
          <Text style={s.inputLabel}>Hora</Text>
          <TextInput
            style={s.textInput}
            value={inputTime}
            onChangeText={setInputTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.text.tertiary}
          />
          <View style={s.modalBtns}>
            <Button title="Cancelar" variant="outline" onPress={() => setShowAddModal(false)} style={s.modalBtn} />
            <Button title="Guardar" variant="primary" onPress={handleSaveEntry} style={s.modalBtn} />
          </View>
        </View>
      </ModalSheet>

      {/* Goal Modal */}
      <ModalSheet visible={showGoalModal} onClose={() => setShowGoalModal(false)} title="Peso objetivo">
        <View style={s.modalContent}>
          <Text style={s.inputLabel}>Objetivo ({unit})</Text>
          <TextInput
            style={s.textInput}
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder="0.0"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            autoFocus
          />
          <View style={s.modalBtns}>
            <Button title="Cancelar" variant="outline" onPress={() => setShowGoalModal(false)} style={s.modalBtn} />
            <Button title="Guardar" variant="primary" onPress={handleSaveGoal} style={s.modalBtn} />
          </View>
        </View>
      </ModalSheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.primary },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 12,
    backgroundColor: colors.bg.primary,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary },

  // Scroll
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },

  // Summary cards
  cardsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  card: {
    flex: 1, backgroundColor: colors.surface.base, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border.subtle,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel: { fontSize: 13, fontWeight: '500', color: colors.text.secondary, marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: '700', color: colors.text.primary },

  // Range selector
  rangeRow: {
    flexDirection: 'row', backgroundColor: colors.surface.base,
    borderRadius: radius.md, padding: 3, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  rangeTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm,
  },
  rangeTabActive: { backgroundColor: colors.accent.primaryMuted },
  rangeText: { fontSize: 13, fontWeight: '500', color: colors.text.tertiary },
  rangeTextActive: { color: colors.accent.primary, fontWeight: '600' },

  // Chart
  chartBox: {
    backgroundColor: colors.surface.base, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.subtle,
    padding: spacing.md, marginBottom: spacing.xxl, alignItems: 'center',
  },

  // Section title
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md },

  // Entries
  entries: { gap: spacing.sm },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface.base, borderRadius: radius.md,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  entryInfo: { flex: 1 },
  entryWeight: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
  entryDate: { fontSize: 13, color: colors.text.secondary },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.semantic.errorMuted,
  },
  addLink: { fontSize: 16, fontWeight: '600', color: colors.accent.primary },

  // Modal
  modalContent: { paddingHorizontal: spacing.xl },
  inputLabel: { fontSize: 14, fontWeight: '500', color: colors.text.secondary, marginBottom: 8, marginTop: 12 },
  textInput: {
    backgroundColor: colors.surface.elevated, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    fontSize: 16, color: colors.text.primary,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
  modalBtn: { flex: 1 },
});
