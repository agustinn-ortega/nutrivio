import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { AppHeader, Button } from '../../src/components';

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

function FeatureItem({ icon, title, subtitle }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon} size={22} color={colors.accent.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function GroupsScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <AppHeader title="Grupos" onBackPress={() => router.back()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <View style={styles.heroIconOuter}>
              <View style={styles.heroIconInner}>
                <Ionicons
                  name="people-outline"
                  size={56}
                  color={colors.accent.primary}
                />
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>Mejor juntos</Text>
          <Text style={styles.heroDescription}>
            Lleva tu nutricion al siguiente nivel compartiendo el progreso con
            amigos, familia o tu profesional de salud. Los grupos te permiten
            motivarte mutuamente y alcanzar tus metas mas rapido.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <FeatureItem
            icon="restaurant-outline"
            title="Registro compartido de comidas"
            subtitle="Comparte tus registros diarios con el grupo y ve lo que otros estan comiendo para inspirarte."
          />
          <View style={styles.featureDivider} />
          <FeatureItem
            icon="person-add-outline"
            title="Invita a amigos y profesionales"
            subtitle="Agrega a tu nutricionista, entrenador o amigos para un seguimiento colaborativo."
          />
          <View style={styles.featureDivider} />
          <FeatureItem
            icon="stats-chart-outline"
            title="Estadisticas del grupo"
            subtitle="Visualiza el progreso colectivo con graficos y tablas de liderazgo motivacionales."
          />
        </View>

        {/* CTAs */}
        <View style={styles.ctaSection}>
          <Button
            title="Crear un grupo"
            onPress={() => {}}
            variant="primary"
            size="lg"
            fullWidth
          />
          <View style={{ height: spacing.md }} />
          <Button
            title="Unirse a un grupo"
            onPress={() => {}}
            variant="outline"
            size="lg"
            fullWidth
          />
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
    paddingBottom: spacing.section,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxl,
  },
  heroIconContainer: {
    marginBottom: spacing.xxl,
  },
  heroIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    backgroundColor: colors.surface.base,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodySemibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginLeft: 60,
  },
  ctaSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxxl,
  },
});
