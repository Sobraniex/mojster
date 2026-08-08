import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { JobCard } from '../../src/components/JobCard';
import { useApp } from '../../src/context/AppContext';
import { CATEGORIES } from '../../src/data/categories';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isWorkerMode,
    getOpenJobs,
    getJobsMatchingWorker,
    getOffersForJob,
  } = useApp();
  const [filter, setFilter] = useState<string | 'all' | 'match'>('all');

  const jobs = useMemo(() => {
    if (filter === 'match' && isWorkerMode) return getJobsMatchingWorker();
    if (filter !== 'all' && filter !== 'match') return getOpenJobs(filter);
    return getOpenJobs();
  }, [filter, isWorkerMode, getOpenJobs, getJobsMatchingWorker]);

  return (
    <View style={[styles.flex, { paddingTop: Math.max(insets.top, 44) }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>TRG DELOV</Text>
        <Text style={styles.title}>
          {isWorkerMode ? 'Odprta dela' : 'Vsa odprta dela'}
        </Text>
        <Text style={styles.sub}>
          {isWorkerMode
            ? 'Preglejte objave in pošljite ponudbo. Dogovor sklenete v app-u.'
            : 'Pregled trga. Objavite delo — mojstri pošljejo ponudbe v app-u.'}
        </Text>
      </View>

      <FlatList
        horizontal
        data={[
          { id: 'all', label: 'Vse' },
          ...(isWorkerMode ? [{ id: 'match', label: 'Zame' }] : []),
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
            icon="search-outline"
            title="Ni odprtih del"
            subtitle={
              isWorkerMode
                ? 'V tej kategoriji trenutno ni objav.'
                : 'Bodite prvi — objavite delo, ki ga potrebujete.'
            }
            actionLabel={!isWorkerMode ? 'Objavi delo' : undefined}
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
