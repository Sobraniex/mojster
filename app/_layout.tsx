import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneShell } from '../src/components/PhoneShell';
import { SettingsGear } from '../src/components/SettingsGear';
import { AppProvider, useApp } from '../src/context/AppContext';
import { I18nProvider, useI18n } from '../src/i18n/I18nContext';
import { colors } from '../src/theme/colors';

function RootNavigator() {
  const { ready } = useApp();
  const { t } = useI18n();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
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
            title: t.newPost,
          }}
        />
        <Stack.Screen
          name="job/[id]"
          options={{
            headerShown: true,
            title: t.job,
          }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{
            headerShown: true,
            title: t.category,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: t.editProfile,
          }}
        />
      </Stack>
      {/* Global settings — language for entire app */}
      <SettingsGear />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AppProvider>
          <PhoneShell>
            <RootNavigator />
          </PhoneShell>
        </AppProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
