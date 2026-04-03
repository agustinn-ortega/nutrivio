import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '../../src/theme';
import { useStore } from '../../src/store';
import { Button } from '../../src/components';

const BENEFITS = [
  'Registros ilimitados',
  'Sin anuncios',
  'Analisis de salud con IA',
  'Exportar datos',
  'Estadisticas avanzadas',
  'Soporte prioritario',
];

type Plan = 'annual' | 'monthly';

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateSettings = useStore((s) => s.updateSettings);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.premiumIconWrap}>
            <Ionicons name="diamond" size={36} color={colors.accent.secondary} />
          </View>
          <Text style={styles.headline}>
            Suscribete a{'\n'}Nutrivio Premium
          </Text>
          <Text style={styles.subtitle}>
            Desbloquea registros ilimitados, analisis con inteligencia artificial
            y todas las funciones avanzadas.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          {BENEFITS.map((benefit, index) => (
            <View
              key={benefit}
              style={[
                styles.benefitRow,
                index < BENEFITS.length - 1 && styles.benefitRowBorder,
              ]}
            >
              <View style={styles.checkWrap}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.accent.primary}
                />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={colors.semantic.warning}
              />
            ))}
          </View>
          <Text style={styles.testimonialQuote}>
            "Nutrivio Premium cambio mi forma de alimentarme. El analisis con IA
            es increiblemente util."
          </Text>
          <Text style={styles.testimonialAuthor}>- Maria G., usuario Premium</Text>
        </View>

        {/* Pricing cards */}
        <View style={styles.pricingSection}>
          {/* Annual plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'annual' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.8}
          >
            <View style={styles.pricingCardInner}>
              <View style={styles.pricingHeader}>
                <View style={styles.pricingLeft}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedPlan === 'annual' && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedPlan === 'annual' && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.planName}>Anual</Text>
                    <Text style={styles.planPrice}>
                      US$ 1.08<Text style={styles.planPeriod}>/mes</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>67% de descuento</Text>
                </View>
              </View>
              <Text style={styles.planTotal}>US$ 12.99/ano</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === 'monthly' && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.pricingCardInner}>
              <View style={styles.pricingHeader}>
                <View style={styles.pricingLeft}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedPlan === 'monthly' && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedPlan === 'monthly' && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.planName}>Mensual</Text>
                    <Text style={styles.planPrice}>
                      US$ 3.29<Text style={styles.planPeriod}>/mes</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Button
            title="Continuar"
            onPress={() => {
              updateSettings({ isPremium: true });
              router.back();
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreText}>Restaurar compras</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  premiumIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  headline: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  benefitsCard: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  benefitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  checkWrap: {
    marginRight: spacing.md,
  },
  benefitText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  testimonialCard: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  testimonialQuote: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  testimonialAuthor: {
    ...typography.smallMedium,
    color: colors.text.tertiary,
  },
  pricingSection: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  pricingCard: {
    backgroundColor: colors.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  pricingCardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryMuted,
  },
  pricingCardInner: {
    padding: spacing.lg,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.accent.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.primary,
  },
  planName: {
    ...typography.bodySemibold,
    color: colors.text.primary,
  },
  planPrice: {
    ...typography.numberSmall,
    color: colors.text.primary,
    marginTop: spacing.xxs,
  },
  planPeriod: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  planTotal: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginLeft: 36,
  },
  discountBadge: {
    backgroundColor: colors.accent.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.25)',
  },
  discountText: {
    ...typography.smallMedium,
    color: colors.accent.primary,
  },
  ctaSection: {
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  restoreText: {
    ...typography.captionMedium,
    color: colors.text.tertiary,
  },
});
