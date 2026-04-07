import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { AppHeader, ToggleRow } from '../../src/components';

// ---------------------------------------------------------------------------
// Generate hours list (00:00 to 23:00)
// ---------------------------------------------------------------------------

const HOURS: string[] = [];
for (let h = 0; h < 24; h++) {
  HOURS.push(`${String(h).padStart(2, '0')}:00`);
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// ---------------------------------------------------------------------------
// Time Picker Modal
// ---------------------------------------------------------------------------

function TimePickerModal({
  visible,
  currentTime,
  onSelect,
  onCancel,
}: {
  visible: boolean;
  currentTime: string;
  onSelect: (time: string) => void;
  onCancel: () => void;
}) {
  const [selectedTime, setSelectedTime] = useState(currentTime);
  const scrollRef = useRef<FlatList>(null);

  // Find the closest hour
  const currentHour = parseInt(currentTime.split(':')[0], 10) || 0;

  useEffect(() => {
    if (visible && scrollRef.current) {
      // Scroll to current hour (center it)
      const offset = currentHour * ITEM_HEIGHT;
      setTimeout(() => {
        scrollRef.current?.scrollToOffset({ offset, animated: false });
      }, 100);
    }
    if (visible) {
      setSelectedTime(HOURS[currentHour]);
    }
  }, [visible, currentHour]);

  const handleScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(HOURS.length - 1, index));
    setSelectedTime(HOURS[clamped]);
  };

  const getItemStyle = (item: string) => {
    const isSelected = item === selectedTime;
    return {
      fontSize: isSelected ? 28 : 16,
      fontWeight: isSelected ? '600' as const : '400' as const,
      color: isSelected ? colors.text.primary : colors.text.tertiary,
    };
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={pk.overlay} onPress={onCancel}>
        <Pressable style={pk.container} onPress={(e) => e.stopPropagation()}>
          <Text style={pk.title}>Selecciona la hora</Text>

          <View style={pk.pickerWrap}>
            {/* Highlight band */}
            <View style={pk.highlight} pointerEvents="none" />

            <FlatList
              ref={scrollRef}
              data={HOURS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEnd}
              contentContainerStyle={{
                paddingTop: ITEM_HEIGHT * 2,
                paddingBottom: ITEM_HEIGHT * 2,
              }}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={pk.item}
                  activeOpacity={0.7}
                  onPress={() => {
                    const idx = HOURS.indexOf(item);
                    setSelectedTime(item);
                    scrollRef.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: true });
                  }}
                >
                  <Text style={getItemStyle(item)}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={pk.buttons}>
            <TouchableOpacity onPress={onCancel} style={pk.btn} activeOpacity={0.7}>
              <Text style={pk.btnCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelect(selectedTime)} style={pk.btn} activeOpacity={0.7}>
              <Text style={pk.btnSelect}>Seleccionar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pk = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface.elevated,
    borderRadius: 20,
    width: 300,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  pickerWrap: {
    height: PICKER_HEIGHT,
    width: 200,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.accent.primaryMuted,
    borderRadius: 10,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  btnCancel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  btnSelect: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
  },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, toggleReminder, updateReminderTime } = useStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState('09:00');

  const openTimePicker = (id: string, currentTime: string) => {
    setEditingId(id);
    setEditingTime(currentTime);
    setPickerVisible(true);
  };

  const handleTimeSelect = (time: string) => {
    if (editingId) {
      updateReminderTime(editingId, time);
    }
    setPickerVisible(false);
    setEditingId(null);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'morning': return 'sunny-outline';
      case 'afternoon': return 'partly-sunny-outline';
      default: return 'moon-outline';
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Recordatorios"
        onBackPress={() => router.push('/(drawer)/home')}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {reminders.map((reminder, index) => (
            <View key={reminder.id}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.reminderRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getIcon(reminder.id) as any}
                    size={20}
                    color={colors.accent.primary}
                  />
                </View>
                <TouchableOpacity
                  style={styles.labelContainer}
                  onPress={() => openTimePicker(reminder.id, reminder.time)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.label}>{reminder.label}</Text>
                  <Text style={styles.time}>{reminder.time}</Text>
                </TouchableOpacity>
                <ToggleRow
                  label=""
                  value={reminder.enabled}
                  onValueChange={() => toggleReminder(reminder.id)}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          Recibe notificaciones para recordarte registrar tus comidas durante el dia.
          {'\n'}Toca la hora para cambiarla.
        </Text>
      </ScrollView>

      <TimePickerModal
        visible={pickerVisible}
        currentTime={editingTime}
        onSelect={handleTimeSelect}
        onCancel={() => setPickerVisible(false)}
      />
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
  card: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.lg,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  time: {
    ...typography.small,
    color: colors.accent.primary,
    marginTop: spacing.xxs,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
});
