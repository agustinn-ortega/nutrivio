import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store';

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, setGoals } = useStore();

  const [calories, setCalories] = useState(String(goals.calories));
  const [carbsPct, setCarbsPct] = useState(String(goals.carbsPercent));
  const [proteinPct, setProteinPct] = useState(String(goals.proteinPercent));
  const [fatPct, setFatPct] = useState(String(goals.fatPercent));
  const [changed, setChanged] = useState(false);

  const cal = parseInt(calories, 10) || 0;
  const cp = parseInt(carbsPct, 10) || 0;
  const pp = parseInt(proteinPct, 10) || 0;
  const fp = parseInt(fatPct, 10) || 0;

  const carbsG = Math.round((cal * cp) / 400);
  const proteinG = Math.round((cal * pp) / 400);
  const fatG = Math.round((cal * fp) / 900);

  const save = useCallback(() => {
    setGoals({
      calories: parseInt(calories, 10) || 2000,
      carbsPercent: parseInt(carbsPct, 10) || 50,
      proteinPercent: parseInt(proteinPct, 10) || 25,
      fatPercent: parseInt(fatPct, 10) || 25,
    });
    setChanged(false);
    router.back();
  }, [calories, carbsPct, proteinPct, fatPct]);

  const update = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setChanged(true);
  };

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Objetivos diarios</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Calorías */}
        <Text style={s.label}>Calorías</Text>
        <TextInput
          style={s.valueInput}
          value={calories}
          onChangeText={update(setCalories)}
          keyboardType="numeric"
          placeholder="2000"
          placeholderTextColor="#bbb"
          selectionColor="#333"
        />
        <View style={s.divider} />

        {/* Link calculadora */}
        <TouchableOpacity style={s.calcLink} activeOpacity={0.6}>
          <Ionicons name="calculator-outline" size={18} color="#2563EB" />
          <Text style={s.calcLinkText}>Usa la calculadora de objetivo diario de calorías</Text>
        </TouchableOpacity>

        {/* Carbohidratos */}
        <Text style={s.macroLabel}>Carbohidratos {carbsG}g</Text>
        <View style={s.pctRow}>
          <TextInput
            style={s.pctInput}
            value={carbsPct}
            onChangeText={update(setCarbsPct)}
            keyboardType="numeric"
            selectionColor="#333"
            maxLength={3}
          />
          <Text style={s.pctSign}>%</Text>
        </View>
        <View style={s.divider} />

        {/* Proteína */}
        <Text style={s.macroLabel}>Proteína {proteinG}g</Text>
        <View style={s.pctRow}>
          <TextInput
            style={s.pctInput}
            value={proteinPct}
            onChangeText={update(setProteinPct)}
            keyboardType="numeric"
            selectionColor="#333"
            maxLength={3}
          />
          <Text style={s.pctSign}>%</Text>
        </View>
        <View style={s.divider} />

        {/* Grasa */}
        <Text style={s.macroLabel}>Grasa {fatG}g</Text>
        <View style={s.pctRow}>
          <TextInput
            style={s.pctInput}
            value={fatPct}
            onChangeText={update(setFatPct)}
            keyboardType="numeric"
            selectionColor="#333"
            maxLength={3}
          />
          <Text style={s.pctSign}>%</Text>
        </View>
        <View style={s.divider} />

        {/* Total warning */}
        {cp + pp + fp !== 100 && (
          <Text style={s.totalWarn}>Los porcentajes suman {cp + pp + fp}% (deben sumar 100%)</Text>
        )}

        {/* Save */}
        {changed && (
          <TouchableOpacity style={s.saveBtn} onPress={save} activeOpacity={0.7}>
            <Text style={s.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },

  // Content
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },

  // Labels
  label: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888',
    marginTop: 28,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888',
    marginTop: 24,
    marginBottom: 4,
  },

  // Value input (calories)
  valueInput: {
    fontSize: 22,
    fontWeight: '400',
    color: '#111',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },

  // Percentage row
  pctRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pctInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '400',
    color: '#111',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  pctSign: {
    fontSize: 18,
    fontWeight: '400',
    color: '#888',
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D1D6',
    marginTop: 4,
  },

  // Calculator link
  calcLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  calcLinkText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2563EB',
  },

  // Total warning
  totalWarn: {
    fontSize: 13,
    fontWeight: '400',
    color: '#E53E3E',
    marginTop: 20,
  },

  // Save button
  saveBtn: {
    marginTop: 32,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
