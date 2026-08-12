import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { JobCard } from '../../src/components/JobCard';
import { useApp } from '../../src/context/AppContext';
import { JobStatus } from '../../src/data/types';
import { useI18n } from '../../src/i18n/I18nContext';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function MyJobsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const {
    getMyJobs,
    getOffersForJob,
    offers,
    currentUser,
    jobs,
    isWorkerMode,
  } = useApp();
  const [status, setStatus] = useState<'all' | JobStatus>('all');

  const FILTERS: { id: 'all' | JobStatus; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'open', label: t.filterOpen },
    { id: 'in_progress', label: t.filterInProgress },
    { id: 'completed', label: t.filterDone },
  ];

  const posted = useMemo(() => {
    let list = getMyJobs();
    if (status !== 'all') list = list.filter((j) => j.status === status);
    return list;
  }, [getMyJobs, status]);

  const working = useMemo(() => {
    if (!currentUser) return [];
    const myOfferJobIds = offers
      .filter((o) => o.workerId === currentUser.id)
      .map((o) => o.jobId);
    let list = jobs.filter((j) => myOfferJobIds.includes(j.id));
    if (status !== 'all') list = list.filter((j) => j.status === status);
    return list;
  }, [currentUser, offers, jobs, status]);

  const data = isWorkerMode ? working : posted;

  return (
    <View style={[styles.flex, { paddingTop: Math.max(insets.top, 44) }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{t.portfolio}</Text>
          <Text style={styles.title}>
            {isWorkerMode ? t.myOffers : t.myJobs}
          </Text>
        </View>
        {!isWorkerMode ? (
          <Pressable style={styles.addBtn} onPress={() => router.push('/post-job')}>
            <Text style={styles.addBtnText}>{t.publish}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setStatus(f.id)}
            style={[styles.chip, status === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, status === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title={isWorkerMode ? t.noOffersYet : t.noPosts}
            subtitle={isWorkerMode ? t.emptyOffersSub : t.emptyPostsSub}
            actionLabel={isWorkerMode ? t.viewJobs : t.postJob}
            onAction={() =>
              isWorkerMode ? router.push('/(tabs)/explore') : router.push('/post-job')
            }
          />
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            offerCount={getOffersForJob(item.id).length}
            onPress={() => router.push(`/job/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingRight: 64,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.8,
  },
  addBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: 4,
  },
  addBtnText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: { color: colors.textOnPrimary },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: 4,
  },
});
