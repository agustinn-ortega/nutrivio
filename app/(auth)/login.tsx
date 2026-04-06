import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../src/theme';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../src/services/auth';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError('Ingresa tu nombre completo');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, fullName.trim());
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrio un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoRow}>
            <Ionicons name="leaf" size={36} color={colors.accent.primary} />
            <Text style={styles.logoText}>Nutrivio</Text>
          </View>
          <Text style={styles.subtitle}>Tu nutricion, simplificada</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => switchMode('login')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              Iniciar sesion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => switchMode('signup')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.text.tertiary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={colors.text.tertiary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electronico"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.text.tertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Contrasena"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.buttonText}>Continuar</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              signInWithGoogle().catch((err) => {
                setError(err.message || 'Error al iniciar con Google');
                setLoading(false);
              });
            }}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={20} color={colors.text.primary} />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.section,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  logoText: {
    ...typography.hero,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface.base,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginBottom: spacing.xxl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.surface.elevated,
  },
  tabText: {
    ...typography.captionMedium,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  form: {
    gap: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    height: '100%',
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.semantic.errorMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    flex: 1,
  },
  button: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.bodySemibold,
    color: colors.text.inverse,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: radius.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border.medium,
    gap: spacing.md,
  },
  googleButtonText: {
    ...typography.bodySemibold,
    color: colors.text.primary,
  },
});
