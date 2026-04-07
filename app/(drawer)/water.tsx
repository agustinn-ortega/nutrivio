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

const ML_PER_CUP = 250;

function cupsToLiters(cups: number): string {
  return ((cups * ML_PER_CUP) / 1000).toFixed(1);
}

export default function WaterScreen() {
  const router = useRouter();
  const water = useStore((s) => s.water);
  const setWaterEnabled = useStore((s) => s.setWaterEnabled);
  const setWaterGoal = useStore((s) => s.setWaterGoal);

  const initialCups = Math.max(1, Math.round(water.dailyGoalMl / ML_PER_CUP));
  const [cupsText, setCupsText] = useState(String(initialCups));
  const [liters, setLiters] = useState(cupsToLiters(initialCups));

  const onChangeCups = (text: string) => {
    // Allow empty string while typing
    setCupsText(text);
    const n = parseInt(text, 10);
    if (!isNaN(n) && n >= 0) {
      setLiters(cupsToLiters(n));
      if (n > 0) {
        setWaterGoal(n * ML_PER_CUP);
      }
    } else {
      setLiters('0.0');
    }
  };

  const onBlurCups = () => {
    const n = parseInt(cupsText, 10);
    if (isNaN(n) || n <= 0) {
      // Reset to 1 cup minimum
      setCupsText('1');
      setLiters(cupsToLiters(1));
      setWaterGoal(ML_PER_CUP);
    }
  };

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
            <Text style={s.goalLabel}>
              {'Objetivo de agua (' + liters + 'L)'}
            </Text>
            <View style={s.goalInputRow}>
              <TextInput
                style={s.goalInput}
                value={cupsText}
                onChangeText={onChangeCups}
                onBlur={onBlurCups}
                keyboardType="numeric"
                editable={water.enabled}
                selectionColor="#00D4AA"
                maxLength={3}
              />
              <Text style={s.goalUnit}>Tazas</Text>
            </View>
            <View style={s.inputLine} />
            <Text style={s.litersHint}>{cupsText || '0'} tazas = {liters} litros</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0D12' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 12,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#F0F0F5' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 24 },

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
  checkboxActive: { backgroundColor: '#00D4AA', borderColor: '#00D4AA' },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#2A2D3A' },

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
  litersHint: { fontSize: 13, color: '#8B8FA3', marginTop: 10 },
});
