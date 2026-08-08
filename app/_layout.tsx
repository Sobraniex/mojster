import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneShell } from '../src/components/PhoneShell';
import { AppProvider, useApp } from '../src/context/AppContext';
import { colors } from '../src/theme/colors';

function RootNavigator() {
  const { ready } = useApp();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.ink} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: colors.text,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="post-job"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Nova objava',
          }}
        />
        <Stack.Screen
          name="job/[id]"
          options={{
            headerShown: true,
            title: 'Delo',
          }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{
            headerShown: true,
            title: 'Kategorija',
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Uredi profil',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <PhoneShell>
          <RootNavigator />
        </PhoneShell>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
