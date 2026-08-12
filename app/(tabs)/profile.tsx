import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { useApp } from '../../src/context/AppContext';
import { CATEGORIES } from '../../src/data/categories';
import { getPlanById } from '../../src/data/plans';
import { useI18n } from '../../src/i18n/I18nContext';
import { formatDate, initials } from '../../src/lib/format';
import { colors, radius, spacing } from '../../src/theme/colors';

function askConfirm(message: string): boolean {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.confirm(message) : true;
  }
  return true;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { currentUser, getMyJobs, offers, logout, resetDemo, isWorkerMode } = useApp();

  if (!currentUser) return null;

  const myJobs = getMyJobs();
  const myOffers = offers.filter((o) => o.workerId === currentUser.id);
  const specialties = CATEGORIES.filter((c) =>
    currentUser.specialties.includes(c.id)
  );
  const modeLabel =
    currentUser.activeMode === 'worker'
      ? t.profileLabelWorker
      : t.profileLabelCustomer;

  async function handleLogout() {
    if (!askConfirm(t.logoutConfirm)) return;
    await logout();
    router.replace('/');
  }

  async function handleReset() {
    if (!askConfirm(t.deleteConfirm)) return;
    await resetDemo();
    router.replace('/');
  }

  const planName = getPlanById(currentUser.subscriptionPlan)?.name;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 44) + spacing.sm,
        paddingBottom: Math.max(insets.bottom, 32) + spacing.lg,
        paddingHorizontal: spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.kicker, { paddingRight: 48 }]}>{t.account}</Text>
      <Text style={[styles.pageTitle, { paddingRight: 48 }]}>{t.profile}</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(currentUser.firstName, currentUser.lastName)}
          </Text>
        </View>
        <Text style={styles.name}>
          {currentUser.firstName} {currentUser.lastName}
        </Text>
        <Text style={styles.role}>{modeLabel}</Text>

        <View style={styles.divider} />

        <InfoRow icon="mail-outline" value={currentUser.email} />
        <InfoRow icon="call-outline" value={currentUser.phone} />
        {currentUser.city ? (
          <InfoRow icon="location-outline" value={currentUser.city} />
        ) : null}

        <Button
          title={t.editProfile}
          variant="outline"
          onPress={() => router.push('/edit-profile')}
          style={{ marginTop: spacing.md, width: '100%' }}
        />
      </View>

      <View style={styles.stats}>
        <Stat label={t.posts} value={String(myJobs.length)} />
        <Stat label={t.offersCount} value={String(myOffers.length)} />
        <Stat
          label={t.openCount}
          value={String(myJobs.filter((j) => j.status === 'open').length)}
        />
      </View>

      {isWorkerMode && currentUser.paymentStatus === 'active' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.subscription}</Text>
          <Text style={styles.subActive}>{t.active}</Text>
          <Text style={styles.muted}>
            {t.plan}: {planName ?? '—'}
            {currentUser.paidAt ? ` · ${t.from} ${formatDate(currentUser.paidAt)}` : ''}
          </Text>
          {currentUser.paymentCardLast4 ? (
            <Text style={[styles.muted, { marginTop: 6 }]}>
              {t.card} ···· {currentUser.paymentCardLast4}
            </Text>
          ) : null}
        </View>
      ) : null}

      {isWorkerMode ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.specialties}</Text>
          {specialties.length === 0 ? (
            <Text style={styles.muted}>{t.noSpecialties}</Text>
          ) : (
            <View style={styles.chips}>
              {specialties.map((s) => (
                <View key={s.id} style={styles.chip}>
                  <Text style={styles.chipText}>{s.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.howItWorks}</Text>
        <HowRow n="01" text={t.how1} />
        <HowRow n="02" text={t.how2} />
        <HowRow n="03" text={t.how3} />
        <HowRow n="04" text={t.how4} />
      </View>

      <Button
        title={t.logout}
        variant="outline"
        onPress={handleLogout}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
      <Button
        title={t.deleteProfile}
        variant="danger"
        onPress={handleReset}
        fullWidth
        style={{ marginTop: 10 }}
      />

      <Text style={styles.version}>{t.version}</Text>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HowRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.howRow}>
      <Text style={styles.howN}>{n}</Text>
      <Text style={styles.howText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.accent,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textOnPrimary,
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  role: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: colors.textMuted,
    textAlign: 'center',
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  infoText: { fontSize: 14, color: colors.textSecondary },
  stats: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 14,
  },
  muted: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  subActive: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 6,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceAlt,
  },
  chipText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  howN: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.accent,
    width: 24,
    marginTop: 2,
  },
  howText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  version: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
