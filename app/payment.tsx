import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { WORKER_PLANS } from '../src/data/plans';
import { PlanId } from '../src/data/types';
import { useI18n } from '../src/i18n/I18nContext';
import { colors, radius, spacing } from '../src/theme/colors';

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { currentUser, needsPayment, completePayment, logout, onboardingComplete } =
    useApp();

  const [planId, setPlanId] = useState<PlanId>('quarterly');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const plan = useMemo(
    () => WORKER_PLANS.find((p) => p.id === planId)!,
    [planId]
  );

  // Not logged in
  if (!onboardingComplete || !currentUser) {
    return <Redirect href="/" />;
  }

  // Already paid — go to app
  if (!needsPayment || done) {
    return <Redirect href="/(tabs)" />;
  }

  function formatCardNumber(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  function formatExpiry(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!cardName.trim()) e.cardName = t.errCardName;
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) e.cardNumber = t.errCardNumber;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = t.errExpiry;
    if (cvc.replace(/\D/g, '').length < 3) e.cvc = t.errCvc;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePay() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Simulated payment processing (demo — ready for Stripe later)
      await new Promise((r) => setTimeout(r, 1400));
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);
      await completePayment({ planId, cardLast4: last4 });
      setDone(true);
      router.replace('/(tabs)');
    } catch {
      setErrors({ cardNumber: t.errPayment });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    await logout();
    router.replace('/');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 48),
            paddingBottom: Math.max(insets.bottom, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>{t.paymentKicker}</Text>
        <Text style={styles.title}>{t.paymentTitle}</Text>
        <Text style={styles.sub}>
          {t.paymentSub}
        </Text>

        <View style={styles.userBox}>
          <Text style={styles.userLabel}>{t.profileSection}</Text>
          <Text style={styles.userName}>
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text style={styles.userMeta}>{currentUser.email}</Text>
        </View>

        <Text style={styles.section}>{t.choosePlan}</Text>
        {WORKER_PLANS.map((p) => {
          const on = planId === p.id;
          const planName =
            p.id === 'monthly'
              ? t.planMonthly
              : p.id === 'quarterly'
                ? t.planQuarterly
                : t.planYearly;
          const badge =
            p.id === 'quarterly'
              ? t.badgePopular
              : p.id === 'yearly'
                ? t.badgeBest
                : undefined;
          const features =
            p.id === 'monthly'
              ? [t.feat1, t.feat2, t.feat3, t.feat4]
              : p.id === 'quarterly'
                ? [t.feat5, t.feat6, t.feat7]
                : [t.feat8, t.feat9, t.feat10];
          return (
            <Pressable
              key={p.id}
              onPress={() => setPlanId(p.id)}
              style={[styles.planCard, on && styles.planCardOn]}
            >
              <View style={styles.planTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.planNameRow}>
                    <Text style={[styles.planName, on && styles.planNameOn]}>
                      {planName}
                    </Text>
                    {badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.planPeriod, on && styles.planPeriodOn]}>
                    {t.perMonth.trim()} · ~{p.monthlyEquivalent.toFixed(0)} €
                  </Text>
                </View>
                <Text style={[styles.planPrice, on && styles.planPriceOn]}>
                  {p.priceEur} €
                </Text>
              </View>
              {features.map((f) => (
                <Text key={f} style={[styles.feature, on && styles.featureOn]}>
                  · {f}
                </Text>
              ))}
            </Pressable>
          );
        })}

        <Text style={[styles.section, { marginTop: spacing.lg }]}>
          {t.paymentCard}
        </Text>
        <Text style={styles.secureNote}>
          {t.secureNote}
        </Text>

        <Input
          label={t.cardName}
          placeholder="JANEZ NOVAK"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="characters"
          error={errors.cardName}
        />
        <Input
          label={t.cardNumber}
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChangeText={(v) => setCardNumber(formatCardNumber(v))}
          keyboardType="number-pad"
          error={errors.cardNumber}
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input
              label={t.expiry}
              placeholder="MM/LL"
              value={expiry}
              onChangeText={(v) => setExpiry(formatExpiry(v))}
              keyboardType="number-pad"
              error={errors.expiry}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Input
              label={t.cvc}
              placeholder="123"
              value={cvc}
              onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              error={errors.cvc}
            />
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>{t.totalPay}</Text>
          <Text style={styles.summaryPrice}>
            {plan.priceEur},00 €
          </Text>
          <Text style={styles.summaryPlan}>
            {plan.name} {plan.periodLabel}
          </Text>
        </View>

        <Button
          title={loading ? t.processing : `${t.pay} ${plan.priceEur} €`}
          onPress={handlePay}
          loading={loading}
          fullWidth
        />

        {loading ? (
          <View style={styles.processing}>
            <ActivityIndicator color={colors.ink} />
            <Text style={styles.processingText}>{t.checkingPayment}</Text>
          </View>
        ) : null}

        <Button
          title={t.cancelLogout}
          variant="ghost"
          onPress={handleCancel}
          fullWidth
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.accent,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  userBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: spacing.lg,
  },
  userLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.accent,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  userMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  planCardOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  planNameOn: { color: colors.textOnPrimary },
  planPeriod: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  planPeriodOn: { color: 'rgba(255,255,255,0.65)' },
  planPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  planPriceOn: { color: colors.textOnPrimary },
  badge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  feature: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  featureOn: {
    color: 'rgba(255,255,255,0.78)',
  },
  secureNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 6,
  },
  summaryPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -1,
  },
  summaryPlan: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  processing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  processingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
