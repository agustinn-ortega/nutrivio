import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../src/services/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(drawer)/home');
    }
  }, [session, segments, loading]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <Ionicons name="leaf" size={48} color="#00D4AA" />
        <Text style={styles.splashTitle}>Nutrivio</Text>
        <ActivityIndicator color="#00D4AA" style={styles.splashLoader} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    backgroundColor: '#0B0D12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#F0F0F5',
    marginTop: 12,
  },
  splashLoader: {
    marginTop: 24,
  },
});
