import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { useI18n } from '../../src/i18n/I18nContext';
import { colors } from '../../src/theme/colors';

export default function TabsLayout() {
  const { currentUser, onboardingComplete, isWorkerMode, needsPayment } = useApp();
  const { t } = useI18n();

  if (!onboardingComplete || !currentUser) {
    return <Redirect href="/" />;
  }

  if (needsPayment) {
    return <Redirect href="/payment" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 72 : 84,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'web' ? 12 : 24,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isWorkerMode ? t.tabJobs : t.tabServices,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isWorkerMode ? 'search-outline' : 'grid-outline'}
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          // Market feed is for workers only; customers use "My jobs"
          href: isWorkerMode ? undefined : null,
          title: isWorkerMode ? t.tabAllJobs : t.tabExplore,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: isWorkerMode ? t.tabMyOffers : t.tabMyJobs,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabProfile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
