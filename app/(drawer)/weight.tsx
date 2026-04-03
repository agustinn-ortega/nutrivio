import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, EmptyState, ModalSheet, Button } from '../../src/components';
import { formatDateLong } from '../../src/utils/dates';

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [inputTime, setInputTime] = useState(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );
  const [goalInput, setGoalInput] = useState('');

  const sortedEntries = useMemo(
    () =>
      [...weightEntries].sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      }),
    [weightEntries]
  );

  const unit = settings.weightUnit;

  const handleSaveEntry = () => {
    const w = parseFloat(inputWeight);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Error', 'Ingresa un peso valido.');
      return;
    }
    addWeightEntry(w, inputDate, inputTime);
    setShowAddModal(false);
    setInputWeight('');
    setInputDate(new Date().toISOString().split('T')[0]);
    setInputTime(
      `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    );
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
    Alert.alert('Eliminar entrada', 'Estas seguro de que deseas eliminar esta entrada?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteWeightEntry(id) },
    ]);
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
    <View style={styles.screen}>
      <AppHeader
        title="Seguimiento de peso"
        onBackPress={() => router.back()}
        rightIcon="add-outline"
        onRightPress={openAddModal}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Peso actual</Text>
            <Text style={styles.cardValue}>
              {weightGoal.current != null
                ? `${weightGoal.current} ${unit}`
                : '-'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.summaryCard}
            onPress={openGoalModal}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Peso objetivo</Text>
              <Ionicons
                name="pencil-outline"
                size={16}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.cardValue}>
              {weightGoal.target != null
                ? `${weightGoal.target} ${unit}`
                : '-'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Entries List */}
        {sortedEntries.length === 0 ? (
          <EmptyState
            icon="scale-outline"
            title="No has anadido ninguna entrada de peso"
            action={
              <TouchableOpacity onPress={openAddModal}>
                <Text style={styles.addLink}>Anadir</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={styles.entriesList}>
            {sortedEntries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryWeight}>
                    {entry.weight} {unit}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatDateLong(entry.date)} - {entry.time}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(entry.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.semantic.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Weight Modal */}
      <ModalSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Agregar peso"
      >
        <View style={styles.modalContent}>
          <Text style={styles.inputLabel}>Peso ({unit})</Text>
          <TextInput
            style={styles.textInput}
            value={inputWeight}
            onChangeText={setInputWeight}
            placeholder="0.0"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            autoFocus
          />

          <Text style={styles.inputLabel}>Fecha</Text>
          <TextInput
            style={styles.textInput}
            value={inputDate}
            onChangeText={setInputDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text.tertiary}
          />

          <Text style={styles.inputLabel}>Hora</Text>
          <TextInput
            style={styles.textInput}
            value={inputTime}
            onChangeText={setInputTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.text.tertiary}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setShowAddModal(false)}
              style={styles.modalBtn}
            />
            <Button
              title="Guardar"
              variant="primary"
              onPress={handleSaveEntry}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </ModalSheet>

      {/* Goal Modal */}
      <ModalSheet
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Peso objetivo"
      >
        <View style={styles.modalContent}>
          <Text style={styles.inputLabel}>Objetivo ({unit})</Text>
          <TextInput
            style={styles.textInput}
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder="0.0"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setShowGoalModal(false)}
              style={styles.modalBtn}
            />
            <Button
              title="Guardar"
              variant="primary"
              onPress={handleSaveGoal}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </ModalSheet>
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
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    ...typography.captionMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  cardValue: {
    ...typography.numberSmall,
    color: colors.text.primary,
  },
  addLink: {
    ...typography.bodySemibold,
    color: colors.accent.primary,
  },
  entriesList: {
    gap: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  entryInfo: {
    flex: 1,
  },
  entryWeight: {
    ...typography.bodySemibold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  entryDate: {
    ...typography.small,
    color: colors.text.secondary,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.errorMuted,
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  textInput: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  modalBtn: {
    flex: 1,
  },
});
