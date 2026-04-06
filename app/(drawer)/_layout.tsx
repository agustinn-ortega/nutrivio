import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../../src/services/auth';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DrawerItem {
  label: string;
  icon: string; // Ionicons name
  route: string;
}

/* ------------------------------------------------------------------ */
/*  Menu definitions                                                   */
/* ------------------------------------------------------------------ */

const mainItems: DrawerItem[] = [
  { label: 'Home', icon: 'home-outline', route: '/(drawer)/home' },
  { label: 'Objetivos diarios', icon: 'flag-outline', route: '/(drawer)/goals' },
  { label: 'Resumen semanal', icon: 'bar-chart-outline', route: '/(drawer)/weekly' },
  { label: 'Seguimiento de peso', icon: 'scale-outline', route: '/(drawer)/weight' },
  { label: 'Recordatorios', icon: 'alarm-outline', route: '/(drawer)/reminders' },
  { label: 'Rastreador de agua', icon: 'water-outline', route: '/(drawer)/water' },
  { label: 'Grupos', icon: 'people-outline', route: '/(drawer)/groups' },
  { label: 'Configuración', icon: 'settings-outline', route: '/(drawer)/settings' },
];

const secondaryItems: DrawerItem[] = [
  { label: 'Código de referencia', icon: 'gift-outline', route: '/(drawer)/referral' },
  { label: 'Términos y privacidad', icon: 'document-text-outline', route: '/(drawer)/terms' },
  { label: 'Soporte', icon: 'help-circle-outline', route: '/(drawer)/support' },
];

/* ------------------------------------------------------------------ */
/*  DrawerOverlay                                                      */
/* ------------------------------------------------------------------ */

function DrawerOverlay() {
  const drawerOpen = useStore((s) => s.drawerOpen);
  const setDrawerOpen = useStore((s) => s.setDrawerOpen);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (drawerOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [drawerOpen]);

  const navigate = (route: string) => {
    setDrawerOpen(false);
    // Small delay so the close animation can start before navigation
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  const isActive = (route: string): boolean => {
    // Compare the route path with the current pathname
    const routePath = route.replace('/(drawer)', '');
    return pathname === routePath || pathname === route;
  };

  const renderItem = (item: DrawerItem) => {
    const active = isActive(item.route);
    return (
      <TouchableOpacity
        key={item.route}
        style={[styles.menuItem, active && styles.menuItemActive]}
        onPress={() => navigate(item.route)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={(active ? item.icon.replace('-outline', '') : item.icon) as any}
          size={22}
          color={active ? colors.accent.primary : colors.text.secondary}
          style={styles.menuIcon}
        />
        <Text
          style={[
            styles.menuLabel,
            active && styles.menuLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={drawerOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => setDrawerOpen(false)}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerOpen(false)} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            transform: [{ translateX }],
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        {/* Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={22} color={colors.accent.primary} />
          </View>
          <Text style={styles.brandText}>Nutrivio</Text>
        </View>

        {/* Premium banner */}
        <TouchableOpacity
          style={styles.premiumBanner}
          activeOpacity={0.8}
          onPress={() => navigate('/(drawer)/premium')}
        >
          <Ionicons name="star" size={18} color={colors.accent.secondary} />
          <Text style={styles.premiumText}>Hazte Premium</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.tertiary}
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Main items */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            {mainItems.map(renderItem)}
          </View>

          <View style={styles.divider} />

          {/* Secondary items */}
          <View style={styles.section}>
            {secondaryItems.map(renderItem)}
          </View>
        </ScrollView>

        {/* Logout + Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              setDrawerOpen(false);
              signOut().catch(console.warn);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.semantic.error} />
            <Text style={styles.logoutText}>Cerrar sesion</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>Nutrivio v1.0</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function DrawerLayout() {
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
      <DrawerOverlay />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },

  /* Backdrop */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  /* Drawer */
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.bg.secondary,
    borderRightWidth: 1,
    borderRightColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
  },

  /* Brand */
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  brandText: {
    ...typography.h2,
    color: colors.text.primary,
  },

  /* Premium banner */
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.secondaryMuted,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  premiumText: {
    ...typography.captionMedium,
    color: colors.accent.secondary,
    marginLeft: spacing.sm,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
  },

  /* Scroll */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  /* Section */
  section: {
    gap: spacing.xxs,
  },

  /* Menu item */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  menuItemActive: {
    backgroundColor: colors.accent.primaryMuted,
  },
  menuIcon: {
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.md,
  },
  menuLabelActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },

  /* Footer */
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    alignItems: 'center',
    gap: spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  logoutText: {
    ...typography.captionMedium,
    color: colors.semantic.error,
  },
  footerText: {
    ...typography.small,
    color: colors.text.tertiary,
  },
});
