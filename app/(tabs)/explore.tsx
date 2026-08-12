import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { JobCard } from '../../src/components/JobCard';
import { useApp } from '../../src/context/AppContext';
import { CATEGORIES } from '../../src/data/categories';
import { useI18n } from '../../src/i18n/I18nContext';
import { colors, radius, spacing } from '../../src/theme/colors';

/**
 * Worker: full open-job market.
 * Customer: only their own posts (never other clients' jobs).
 */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const {
    isWorkerMode,
    getOpenJobs,
    getJobsMatchingWorker,
    getMyJobs,
    getOffersForJob,
  } = useApp();
  const [filter, setFilter] = useState<string | 'all' | 'match'>('all');

  const jobs = useMemo(() => {
    // Customers only ever see their own jobs
    if (!isWorkerMode) {
      let list = getMyJobs();
      if (filter !== 'all' && filter !== 'match') {
        list = list.filter((j) => j.categoryId === filter);
      }
      return list;
    }
    if (filter === 'match') return getJobsMatchingWorker();
    if (filter !== 'all' && filter !== 'match') return getOpenJobs(filter);
    return getOpenJobs();
  }, [filter, isWorkerMode, getOpenJobs, getJobsMatchingWorker, getMyJobs]);

  return (
    <View style={[styles.flex, { paddingTop: Math.max(insets.top, 44) }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>
          {isWorkerMode ? t.jobMarket : t.portfolio}
        </Text>
        <Text style={styles.title}>
          {isWorkerMode ? t.openJobsTitle : t.myJobs}
        </Text>
        <Text style={styles.sub}>
          {isWorkerMode ? t.exploreWorkerSub : t.emptyPostsSub}
        </Text>
      </View>

      <FlatList
        horizontal
        data={[
          { id: 'all', label: t.all },
          ...(isWorkerMode ? [{ id: 'match', label: t.forMe }] : []),
          ...CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
        ]}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item.id)}
            style={[styles.chip, filter === item.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === item.id && styles.chipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={isWorkerMode ? 'search-outline' : 'briefcase-outline'}
            title={isWorkerMode ? t.noOpenJobs : t.noPosts}
            subtitle={isWorkerMode ? t.emptyCategory : t.emptyPostsSub}
            actionLabel={!isWorkerMode ? t.postJob : undefined}
            onAction={() => router.push('/post-job')}
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
  sub: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  chipList: { maxHeight: 44, marginBottom: 8 },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    letterSpacing: 0.2,
  },
  chipTextActive: { color: colors.textOnPrimary },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: 4,
  },
});
