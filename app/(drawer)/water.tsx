import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';

// Cups to ml conversion (1 cup ≈ 250ml)
const ML_PER_CUP = 250;

export default function WaterScreen() {
  const router = useRouter();
  const water = useStore((s) => s.water);
  const settings = useStore((s) => s.settings);
  const setWaterEnabled = useStore((s) => s.setWaterEnabled);
  const setWaterGoal = useStore((s) => s.setWaterGoal);
  const addWater = useStore((s) => s.addWater);
  const resetDailyWater = useStore((s) => s.resetDailyWater);

  const goalCups = Math.round(water.dailyGoalMl / ML_PER_CUP);
  const [cupsInput, setCupsInput] = useState(String(goalCups));
  const goalLiters = (water.dailyGoalMl / 1000).toFixed(1);

  const handleCupsChange = (v: string) => {
    setCupsInput(v);
    const cups = parseInt(v, 10);
    if (!isNaN(cups) && cups > 0) {
      setWaterGoal(cups * ML_PER_CUP);
    }
  };

  const isLiters = settings.liquidUnit === 'L';
  const currentDisplay = isLiters
    ? (water.currentMl / 1000).toFixed(1)
    : (water.currentMl / 29.5735).toFixed(0);
  const goalDisplay = isLiters
    ? (water.dailyGoalMl / 1000).toFixed(1)
    : (water.dailyGoalMl / 29.5735).toFixed(0);
  const unitLabel = isLiters ? 'L' : 'oz';
  const progress = water.dailyGoalMl > 0 ? Math.min(100, (water.currentMl / water.dailyGoalMl) * 100) : 0;

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push('/(drawer)/home')} style={s.headerBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={28} color="#F0F0F5" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Rastreador de agua</Text>
        <View style={s.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Toggle */}
          <TouchableOpacity
            style={s.toggleRow}
            onPress={() => setWaterEnabled(!water.enabled)}
            activeOpacity={0.7}
          >
            <Text style={s.toggleText}>Habilitar el rastreador de agua</Text>
            <View style={[s.checkbox, water.enabled && s.checkboxActive]}>
              {water.enabled && <Ionicons name="checkmark" size={16} color="#0B0D12" />}
            </View>
          </TouchableOpacity>

          <View style={s.divider} />

          {/* Goal input */}
          <View style={[s.goalSection, !water.enabled && s.disabled]}>
            <Text style={s.goalLabel}>Objetivo de agua ({goalLiters}L)</Text>
            <View style={s.goalInputRow}>
              <TextInput
                style={s.goalInput}
                value={cupsInput}
                onChangeText={handleCupsChange}
                keyboardType="numeric"
                editable={water.enabled}
                selectionColor="#00D4AA"
                maxLength={3}
              />
              <Text style={s.goalUnit}>Tazas</Text>
            </View>
            <View style={s.inputLine} />
          </View>

          {/* Progress section - only when enabled and has water */}
          {water.enabled && (
            <>
              {/* Progress display */}
              <View style={s.progressSection}>
                <View style={s.progressHeader}>
                  <Text style={s.progressLabel}>Progreso de hoy</Text>
                  <Text style={s.progressValue}>
                    {currentDisplay} / {goalDisplay} {unitLabel}
                  </Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={s.progressPercent}>{Math.round(progress)}%</Text>
              </View>

              {/* Quick add */}
              <Text style={s.addLabel}>Agregar agua</Text>
              <View style={s.addRow}>
                {[100, 250, 500].map((ml) => (
                  <TouchableOpacity
                    key={ml}
                    style={s.addBtn}
                    onPress={() => addWater(ml)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.addBtnText}>+{ml} ml</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reset */}
              <TouchableOpacity style={s.resetBtn} onPress={resetDailyWater} activeOpacity={0.7}>
                <Text style={s.resetText}>Reiniciar conteo del dia</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0D12' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 12,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#F0F0F5' },

  // Scroll
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24 },

  // Toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 20,
  },
  toggleText: { fontSize: 16, fontWeight: '400', color: '#F0F0F5', flex: 1, marginRight: 16 },
  checkbox: {
    width: 26, height: 26, borderRadius: 6,
    borderWidth: 2, borderColor: '#5D6175',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00D4AA', borderColor: '#00D4AA',
  },

  // Divider
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#2A2D3A' },

  // Goal
  goalSection: { marginTop: 24 },
  disabled: { opacity: 0.4 },
  goalLabel: { fontSize: 14, fontWeight: '400', color: '#00D4AA', marginBottom: 8 },
  goalInputRow: { flexDirection: 'row', alignItems: 'center' },
  goalInput: {
    flex: 1, fontSize: 22, fontWeight: '400', color: '#F0F0F5',
    paddingVertical: 8, paddingHorizontal: 0,
  },
  goalUnit: { fontSize: 16, fontWeight: '400', color: '#8B8FA3' },
  inputLine: { height: 2, backgroundColor: '#00D4AA', marginTop: 4 },

  // Progress
  progressSection: {
    marginTop: 36, backgroundColor: '#1A1D28', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: '#2A2D3A',
  },
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: { fontSize: 14, fontWeight: '500', color: '#8B8FA3' },
  progressValue: { fontSize: 14, fontWeight: '600', color: '#F0F0F5' },
  progressTrack: {
    height: 8, backgroundColor: '#252938', borderRadius: 4, overflow: 'hidden' as const,
  },
  progressFill: {
    height: 8, backgroundColor: '#00D4AA', borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13, fontWeight: '500', color: '#00D4AA', marginTop: 8, textAlign: 'right',
  },

  // Quick add
  addLabel: {
    fontSize: 12, fontWeight: '500', color: '#8B8FA3', textTransform: 'uppercase' as const,
    letterSpacing: 0.3, marginTop: 28, marginBottom: 12,
  },
  addRow: { flexDirection: 'row', gap: 10 },
  addBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 20,
    backgroundColor: 'rgba(0,212,170,0.15)', borderWidth: 1, borderColor: 'rgba(0,212,170,0.25)',
  },
  addBtnText: { fontSize: 14, fontWeight: '500', color: '#00D4AA' },

  // Reset
  resetBtn: {
    alignItems: 'center', marginTop: 24, paddingVertical: 14,
    backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
  },
  resetText: { fontSize: 14, fontWeight: '500', color: '#F87171' },
});
