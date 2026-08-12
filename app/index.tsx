import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { useApp } from '../src/context/AppContext';
import { AppMode } from '../src/data/types';
import { useI18n } from '../src/i18n/I18nContext';
import { colors, radius, spacing } from '../src/theme/colors';

type Step = 'welcome' | 'profile';

export default function OnboardingScreen() {
  const { onboardingComplete, createProfile, needsPayment } = useApp();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('welcome');
  const [activeMode, setActiveMode] = useState<AppMode | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (onboardingComplete) {
    if (needsPayment) return <Redirect href="/payment" />;
    return <Redirect href="/(tabs)/profile" />;
  }

  function choosePath(mode: AppMode) {
    setActiveMode(mode);
    setStep('profile');
  }

  async function quickEnter(mode: AppMode) {
    setLoading(true);
    try {
      await createProfile({
        firstName: mode === 'worker' ? 'Mojster' : 'Janez',
        lastName: mode === 'worker' ? 'Demo' : 'Novak',
        email: mode === 'worker' ? 'mojster@demo.si' : 'stranka@demo.si',
        phone: '+386 40 000 000',
        activeMode: mode,
        city: 'Ljubljana',
      });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = t.errFirstName;
    if (!lastName.trim()) e.lastName = t.errLastName;
    if (!email.trim() || !email.includes('@')) e.email = t.errEmail;
    if (!phone.trim() || phone.trim().length < 8) e.phone = t.errPhone;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!activeMode || !validate()) return;
    setLoading(true);
    try {
      await createProfile({
        firstName,
        lastName,
        email,
        phone,
        activeMode,
        city: city || undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  if (step === 'welcome') {
    return (
      <View
        style={[
          styles.flex,
          styles.padded,
          {
            paddingTop: Math.max(insets.top, 48),
            paddingBottom: Math.max(insets.bottom, 28),
          },
        ]}
      >
        <View style={styles.welcomeTop}>
          <View style={styles.mark}>
            <View style={styles.markInner} />
          </View>
          <Text style={styles.brand}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.welcomeTagline}</Text>
        </View>

        <View style={styles.paths}>
          <Text style={styles.kicker}>{t.entryTitle}</Text>

          <Pressable
            onPress={() => choosePath('customer')}
            style={({ pressed }) => [styles.pathCard, pressed && styles.pathPressed]}
          >
            <Text style={styles.pathNumber}>01</Text>
            <Text style={styles.pathTitle}>{t.needWork}</Text>
            <Text style={styles.pathText}>{t.needWorkDesc}</Text>
            <Text style={styles.pathCta}>{t.needWorkCta}</Text>
          </Pressable>

          <View style={styles.pathDivider}>
            <View style={styles.pathLine} />
            <Text style={styles.pathOr}>{t.or}</Text>
            <View style={styles.pathLine} />
          </View>

          <Pressable
            onPress={() => choosePath('worker')}
            style={({ pressed }) => [styles.pathCardDark, pressed && styles.pathPressed]}
          >
            <Text style={styles.pathNumberDark}>02</Text>
            <Text style={styles.pathTitleDark}>{t.seekWork}</Text>
            <Text style={styles.pathTextDark}>{t.seekWorkDesc}</Text>
            <Text style={styles.pathCtaDark}>{t.seekWorkCta}</Text>
          </Pressable>

          <Pressable onPress={() => quickEnter('customer')} style={styles.quickLink}>
            <Text style={styles.quickLinkText}>{t.demoCustomer}</Text>
          </Pressable>
          <Pressable onPress={() => quickEnter('worker')} style={styles.quickLink}>
            <Text style={styles.quickLinkText}>{t.demoWorker}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isWorker = activeMode === 'worker';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.padded,
          {
            paddingTop: Math.max(insets.top, 48),
            paddingBottom: Math.max(insets.bottom, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => setStep('welcome')} style={styles.backLink}>
          <Text style={styles.backLinkText}>{t.changeProfileType}</Text>
        </Pressable>

        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeLabel}>{t.typeBadge}</Text>
          <Text style={styles.typeBadgeValue}>
            {isWorker ? t.profileTypeWorker : t.profileTypeCustomer}
          </Text>
        </View>

        <Text style={styles.stepTitle}>{t.createProfile}</Text>
        <Text style={styles.stepSub}>{t.createProfileSub}</Text>

        <Input
          label={t.firstName}
          placeholder="Janez"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          error={errors.firstName}
        />
        <Input
          label={t.lastName}
          placeholder="Novak"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          error={errors.lastName}
        />
        <Input
          label={t.email}
          placeholder="janez@email.si"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <Input
          label={t.phone}
          placeholder="+386 40 123 456"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <Input
          label={t.city}
          placeholder="Ljubljana"
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
        />

        <Button
          title={isWorker ? t.enterAsWorker : t.enterAsCustomer}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: spacing.lg },
  welcomeTop: { marginBottom: spacing.md, paddingRight: 48 },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  markInner: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.textOnPrimary,
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 4,
  },
  tagline: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 320,
  },
  paths: { flex: 1, justifyContent: 'center', paddingBottom: spacing.lg },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.accent,
    marginBottom: 14,
  },
  pathCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pathCardDark: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.ink,
    padding: spacing.lg,
  },
  pathPressed: { opacity: 0.9 },
  pathNumber: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
    marginBottom: 10,
  },
  pathNumberDark: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accentMuted,
    marginBottom: 10,
  },
  pathTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  pathTitleDark: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textOnPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  pathText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  pathTextDark: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 20,
    marginBottom: 16,
  },
  pathCta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  pathCtaDark: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textOnPrimary,
    letterSpacing: 0.2,
  },
  pathDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  pathLine: { flex: 1, height: 1, backgroundColor: colors.border },
  pathOr: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  backLink: { marginBottom: 16 },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  typeBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: spacing.lg,
  },
  typeBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
    marginBottom: 4,
  },
  typeBadgeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  stepSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  quickLink: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
});
